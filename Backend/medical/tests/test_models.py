from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta, date
from medical.models import Member, MembershipType, Claim, ReimbursementScale, Setting

User = get_user_model()

class MemberTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testmember', password='password')
        self.membership_type = MembershipType.objects.create(
            key='single', name='Single', annual_limit=250000, fund_share_percent=80
        )
        self.member = Member.objects.create(
            user=self.user,
            membership_type=self.membership_type,
            status='active',
            valid_to=timezone.now().date() + timedelta(days=365),
            benefits_from=timezone.now().date() - timedelta(days=1)
        )

    def test_active_member_is_eligible(self):
        """Active member with valid dates should be eligible."""
        self.assertTrue(self.member.is_active_for_claims())

    def test_waiting_period_enforced(self):
        """Member inside waiting period (benefits_from in future) should not be eligible."""
        self.member.benefits_from = timezone.now().date() + timedelta(days=30)
        self.member.save()
        self.assertFalse(self.member.is_active_for_claims())

    def test_expired_membership(self):
        """Member with expired validity should not be eligible."""
        self.member.valid_to = timezone.now().date() - timedelta(days=1)
        self.member.save()
        self.assertFalse(self.member.is_active_for_claims())


class ClaimCalculationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='claimuser', password='password')
        self.membership_type = MembershipType.objects.create(
            key='family', name='Family', annual_limit=250000, fund_share_percent=80
        )
        self.member = Member.objects.create(
            user=self.user,
            membership_type=self.membership_type,
            status='active',
            valid_to=timezone.now().date() + timedelta(days=365),
            benefits_from=timezone.now().date() - timedelta(days=60)
        )
        
        # Setup Reimbursement Scale
        ReimbursementScale.objects.create(
            category='Outpatient',
            fund_share=50.00,  # 50% split for test
            member_share=50.00,
            ceiling=50000.00
        )
        
        # Setup General Settings
        Setting.objects.create(key='general_limits', value={
            "annual_limit": 250000,
            "critical_addon": 200000,
            "fund_share_percent": 80,
            "clinic_outpatient_percent": 100
        })

    def test_outpatient_calculation_basic(self):
        """Test basic 50/50 split based on ReimbursementScale."""
        claim = Claim.objects.create(
            member=self.member,
            claim_type='Outpatient',
            date_of_first_visit=timezone.now().date(),
            details={
                "consultation_fee": 2000,
                "medicine_cost": 3000
            } # Total 5000
        )
        claim.compute_fund_distribution() # Should set total_claimed
        claim.save()
        
        # Manually trigger compute_payable which does the real heavy lifting
        claim.compute_payable()
        claim.refresh_from_db()

        self.assertEqual(claim.total_claimed, 5000)
        # ReimbursementScale for Outpatient is 50%
        self.assertEqual(claim.total_payable, 2500) 
        self.assertEqual(claim.member_payable, 2500)

    def test_outpatient_ceiling_cap(self):
        """Test that ceiling caps the fund share."""
        # Update scale to have low ceiling
        scale = ReimbursementScale.objects.get(category='Outpatient')
        scale.ceiling = 1000
        scale.save()

        claim = Claim.objects.create(
            member=self.member,
            claim_type='Outpatient',
            date_of_first_visit=timezone.now().date(),
            details={"consultation_fee": 5000}
        )
        claim.compute_fund_distribution()
        claim.save()
        claim.compute_payable()
        
        self.assertEqual(claim.total_payable, 1000) # Capped at ceiling
        self.assertEqual(claim.member_payable, 4000) # Rest to member

    def test_annual_limit_enforced(self):
        """Test that annual limit reduces payable amount."""
        # Create a previous claim that used up most of the limit
        previous_claim = Claim.objects.create(
            member=self.member,
            claim_type='Outpatient',
            status='paid',
            total_payable=249000, # Only 1000 remaining
            submitted_at=timezone.now()
        )
        
        # New claim for 5000 (Fund share 2500 @ 50%)
        claim = Claim.objects.create(
            member=self.member,
            claim_type='Outpatient',
            date_of_first_visit=timezone.now().date(),
            details={"consultation_fee": 5000}
        )
        claim.compute_fund_distribution()
        claim.save()
        claim.compute_payable()
        
        # Should be capped at remaining 1000
        self.assertEqual(claim.total_payable, 1000)
        self.assertEqual(claim.member_payable, 4000)

