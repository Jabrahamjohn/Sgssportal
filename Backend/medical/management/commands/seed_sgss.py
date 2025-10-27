# medical/management/commands/seed_sgss.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.utils import timezone
from medical.models import MembershipType, Member, ReimbursementScale, Setting, Claim, ClaimItem
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = "Seed SGSS Medical Fund core data (roles, users, memberships, settings, reimbursement scales, sample claim)"

    @transaction.atomic
    def handle(self, *args, **options):
        # -------------------------------
        # 1️⃣ Create Groups / Roles
        # -------------------------------
        groups = ["Admin", "Committee", "Member"]
        for name in groups:
            group, created = Group.objects.get_or_create(name=name)
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created group: {name}"))
            else:
                self.stdout.write(f"Group already exists: {name}")

        admin_group = Group.objects.get(name="Admin")
        committee_group = Group.objects.get(name="Committee")
        member_group = Group.objects.get(name="Member")

        # -------------------------------
        # 2️⃣ Create Users
        # -------------------------------
        admin, created = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@sgss.org",
                "first_name": "System",
                "last_name": "Admin",
                "is_superuser": True,
                "is_staff": True,
            },
        )
        if created:
            admin.set_password("admin123")
            admin.save()
            self.stdout.write(self.style.SUCCESS("Created superuser: admin / admin123"))
        admin.groups.add(admin_group)

        committee, created = User.objects.get_or_create(
            username="committee",
            defaults={
                "email": "committee@sgss.org",
                "first_name": "Medical",
                "last_name": "Committee",
            },
        )
        if created:
            committee.set_password("committee123")
            committee.save()
            self.stdout.write(self.style.SUCCESS("Created committee: committee / committee123"))
        committee.groups.add(committee_group)

        member_user, created = User.objects.get_or_create(
            username="member",
            defaults={
                "email": "member@sgss.org",
                "first_name": "John",
                "last_name": "Doe",
            },
        )
        if created:
            member_user.set_password("member123")
            member_user.save()
            self.stdout.write(self.style.SUCCESS("Created member: member / member123"))
        member_user.groups.add(member_group)

        # -------------------------------
        # 3️⃣ Membership Types
        # -------------------------------
        single, _ = MembershipType.objects.get_or_create(
            key="single",
            defaults={"name": "Single", "annual_limit": 250000, "fund_share_percent": 80},
        )
        family, _ = MembershipType.objects.get_or_create(
            key="family",
            defaults={"name": "Family", "annual_limit": 500000, "fund_share_percent": 80},
        )
        self.stdout.write(self.style.SUCCESS("Created membership types: Single, Family"))

        # -------------------------------
        # 4️⃣ Create Member Record
        # -------------------------------
        member, _ = Member.objects.get_or_create(
            user=member_user,
            defaults={
                "membership_type": single,
                "nhif_number": "NHIF123",
                "valid_from": timezone.now().date() - timezone.timedelta(days=90),
                "valid_to": timezone.now().date() + timezone.timedelta(days=365 * 2),
            },
        )
        self.stdout.write(self.style.SUCCESS("Created member record for 'member' user."))

        # -------------------------------
        # 5️⃣ Settings
        # -------------------------------
        Setting.objects.update_or_create(
            key="general_limits",
            defaults={
                "value": {
                    "annual_limit": 250000,
                    "critical_addon": 200000,
                    "fund_share_percent": 80,
                    "clinic_outpatient_percent": 100,
                }
            },
        )
        self.stdout.write(self.style.SUCCESS("Updated settings for general_limits."))

        # -------------------------------
        # 6️⃣ Reimbursement Scales
        # -------------------------------
        scales = [
            ("Outpatient", 80, 20, 50000),
            ("Inpatient", 85, 15, 200000),
            ("Chronic", 60, 40, 120000),
        ]
        for category, fund_share, member_share, ceiling in scales:
            ReimbursementScale.objects.update_or_create(
                category=category,
                defaults={
                    "fund_share": fund_share,
                    "member_share": member_share,
                    "ceiling": ceiling,
                },
            )
        self.stdout.write(self.style.SUCCESS("Seeded reimbursement scales."))

        # -------------------------------
        # 7️⃣ Sample Claim
        # -------------------------------
        claim, _ = Claim.objects.get_or_create(
            member=member,
            claim_type="outpatient",
            defaults={
                "status": "submitted",
                "notes": "Consulted at Siri Guru Nanak Clinic",
                "date_of_first_visit": timezone.now().date() - timezone.timedelta(days=3),
            },
        )
        ClaimItem.objects.get_or_create(
            claim=claim,
            category="consultation",
            defaults={"description": "Doctor visit", "amount": 2000, "quantity": 1},
        )
        ClaimItem.objects.get_or_create(
            claim=claim,
            category="medicine",
            defaults={"description": "Tablets", "amount": 2000, "quantity": 1},
        )
        self.stdout.write(self.style.SUCCESS("Created sample claim with items."))

        # -------------------------------
        # ✅ Summary
        # -------------------------------
        self.stdout.write(self.style.SUCCESS("✅ SGSS seed data created successfully!"))
