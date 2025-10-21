# medical/management/commands/seed_sgss.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from medical.models import Setting, MembershipType, Member, ReimbursementScale, Claim, ClaimItem
from datetime import timedelta

User = get_user_model()

class Command(BaseCommand):
    help = "Seed SGSS baseline data"

    def handle(self, *args, **options):
        # Users
        member_user, _ = User.objects.get_or_create(username='member', defaults={'email':'member@sgss.com'})
        admin_user, _ = User.objects.get_or_create(username='admin', defaults={'email':'admin@sgss.com', 'is_superuser': True, 'is_staff': True})
        committee_user, _ = User.objects.get_or_create(username='committee', defaults={'email':'committee@sgss.com', 'is_staff': True})

        # Settings
        Setting.objects.update_or_create(
            key='general_limits',
            defaults={'value': {
                "annual_limit": 250000,
                "critical_addon": 200000,
                "fund_share_percent": 80,
                "clinic_outpatient_percent": 100
            }}
        )

        # Membership types
        single, _ = MembershipType.objects.get_or_create(key='single', defaults={'name':'Single','annual_limit':250000,'fund_share_percent':80})
        family, _ = MembershipType.objects.get_or_create(key='family', defaults={'name':'Family','annual_limit':500000,'fund_share_percent':85})

        # Member
        m, _ = Member.objects.get_or_create(
            user=member_user,
            defaults={
                'membership_type': single,
                'nhif_number': 'NHIF123',
                'valid_from': timezone.now().date() - timedelta(days=90),
                'valid_to': timezone.now().date() + timedelta(days=365*2)
            }
        )

        # Reimbursement scales
        ReimbursementScale.objects.update_or_create(category='Outpatient', defaults={'fund_share':80,'member_share':20,'ceiling':50000})
        ReimbursementScale.objects.update_or_create(category='Inpatient', defaults={'fund_share':85,'member_share':15,'ceiling':200000})
        ReimbursementScale.objects.update_or_create(category='Chronic', defaults={'fund_share':60,'member_share':40,'ceiling':120000})

        # Sample claim
        c, _ = Claim.objects.get_or_create(
            member=m,
            claim_type='outpatient',
            defaults={
                'date_of_first_visit': timezone.now().date() - timedelta(days=3),
                'status': 'submitted',
                'notes': 'Consulted at Siri Guru Nanak Clinic'
            }
        )
        ClaimItem.objects.get_or_create(claim=c, category='consultation', defaults={'description':'Doctor consultation','amount':2000,'quantity':1})
        ClaimItem.objects.get_or_create(claim=c, category='medicine', defaults={'description':'Pain relief tablets','amount':2000,'quantity':1})

        self.stdout.write(self.style.SUCCESS("Seeded SGSS data successfully."))
