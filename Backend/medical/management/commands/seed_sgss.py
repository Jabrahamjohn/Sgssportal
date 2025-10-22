# medical/management/commands/seed_sgss.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.utils import timezone
from medical.models import MembershipType, Member, ReimbursementScale, Setting, Claim, ClaimItem

User = get_user_model()

class Command(BaseCommand):
    help = "Seed SGSS core data (roles, membership types, settings, sample claim)"

    def handle(self, *args, **options):
        # groups
        for g in ["Admin", "Committee", "Member"]:
            Group.objects.get_or_create(name=g)

        # users
        admin, _ = User.objects.get_or_create(username="admin@sgss.com", defaults={"email":"admin@sgss.com"})
        committee, _ = User.objects.get_or_create(username="committee@sgss.com", defaults={"email":"committee@sgss.com"})
        member_user, _ = User.objects.get_or_create(username="member@sgss.com", defaults={"email":"member@sgss.com"})

        admin_group = Group.objects.get(name="Admin")
        committee_group = Group.objects.get(name="Committee")
        member_group = Group.objects.get(name="Member")

        admin.groups.add(admin_group)
        committee.groups.add(committee_group)
        member_user.groups.add(member_group)

        # membership types
        single, _ = MembershipType.objects.get_or_create(key="single", defaults={"name":"Single","annual_limit":250000, "fund_share_percent":80})
        family, _ = MembershipType.objects.get_or_create(key="family", defaults={"name":"Family","annual_limit":500000, "fund_share_percent":80})

        # member
        m, _ = Member.objects.get_or_create(user=member_user, defaults={
            "membership_type": single,
            "nhif_number": "NHIF123",
            "valid_from": timezone.now().date() - timezone.timedelta(days=90),
            "valid_to": timezone.now().date() + timezone.timedelta(days=365*2)
        })

        # settings
        Setting.objects.update_or_create(key="general_limits", defaults={
            "value": {
                "annual_limit": 250000,
                "critical_addon": 200000,
                "fund_share_percent": 80,
                "clinic_outpatient_percent": 100
            }
        })

        # scales
        for cat, fs, ms, ceiling in [
            ("Outpatient", 80, 20, 50000),
            ("Inpatient", 85, 15, 200000),
            ("Chronic", 60, 40, 120000),
        ]:
            ReimbursementScale.objects.update_or_create(
                category=cat,
                defaults={"fund_share": fs, "member_share": ms, "ceiling": ceiling}
            )

        # sample claim
        c, _ = Claim.objects.get_or_create(
            member=m,
            claim_type="outpatient",
            notes="Consulted at Siri Guru Nanak Clinic",
            defaults={"status":"submitted", "date_of_first_visit": timezone.now().date() - timezone.timedelta(days=3)}
        )
        ClaimItem.objects.get_or_create(claim=c, category="consultation", defaults={"description":"Doctor visit", "amount":2000, "quantity":1})
        ClaimItem.objects.get_or_create(claim=c, category="medicine", defaults={"description":"Tablets", "amount":2000, "quantity":1})

        self.stdout.write(self.style.SUCCESS("Seeded SGSS data successfully."))
