# medical/management/commands/seed_sgss.py
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.utils import timezone
from django.db import transaction
from faker import Faker
import random
import uuid

from medical.models import (
    MembershipType,
    Member,
    MemberDependent,
    ReimbursementScale,
    Setting,
    Claim,
    ClaimItem,
    ChronicRequest,
)

User = get_user_model()
fake = Faker()


class Command(BaseCommand):
    help = "Fully seed the SGSS Medical Fund system based on Constitution + Byelaws."

    @transaction.atomic
    def handle(self, *args, **options):

        # ===============================================================
        # 1️⃣ SYSTEM ROLES
        # ===============================================================
        self.stdout.write(self.style.WARNING("Seeding roles..."))

        roles = ["Admin", "Committee", "Member"]
        role_objs = {}

        for r in roles:
            obj, _ = Group.objects.get_or_create(name=r)
            role_objs[r] = obj
            self.stdout.write(f" - role: {r}")

        # ===============================================================
        # 2️⃣ MEMBERSHIP TYPES — From Constitution & Byelaws
        # ===============================================================
        self.stdout.write(self.style.WARNING("Seeding membership types..."))

        membership_types = [
            ("single", "Single", 250000, 80, 2, 2000),
            ("family", "Family", 500000, 80, 2, 3000),
            ("joint", "Joint", 400000, 80, 2, 3000),
            ("senior", "Senior Citizen", 300000, 75, 1, 2000),
            ("life", "Life Member", 0, 100, None, 50000),
            ("patron", "Patron", 0, 100, None, 100000),
            ("vice_patron", "Vice Patron", 0, 100, None, 75000),
        ]

        mt_objects = {}

        for key, name, limit, fund_share, term, entry_fee in membership_types:
            mt, _ = MembershipType.objects.update_or_create(
                key=key,
                defaults={
                    "name": name,
                    "annual_limit": limit,
                    "fund_share_percent": fund_share,
                    "term_years": term,
                    "entry_fee": entry_fee,
                },
            )
            mt_objects[key] = mt
            self.stdout.write(f" - membership type: {name} ({key})")

        # ===============================================================
        # 3️⃣ ADMIN & COMMITTEE USERS
        # ===============================================================
        self.stdout.write(self.style.WARNING("Seeding users..."))

        admin_user, created = User.objects.get_or_create(
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
            admin_user.set_password("admin123")
            admin_user.save()
        admin_user.groups.add(role_objs["Admin"])

        committee_user, created = User.objects.get_or_create(
            username="committee",
            defaults={
                "email": "committee@sgss.org",
                "first_name": "Medical",
                "last_name": "Committee",
            },
        )
        if created:
            committee_user.set_password("committee123")
            committee_user.save()
        committee_user.groups.add(role_objs["Committee"])

        # ===============================================================
        # 4️⃣ MAIN DEMO MEMBER (Fully Valid)
        # ===============================================================
        self.stdout.write(self.style.WARNING("Seeding main member..."))

        main_user, created = User.objects.get_or_create(
            username="member",
            defaults={
                "email": "member@sgss.org",
                "first_name": "John",
                "last_name": "Doe",
            },
        )
        if created:
            main_user.set_password("member123")
            main_user.save()
        main_user.groups.add(role_objs["Member"])

        main_member = Member.objects.create(
            user=main_user,
            membership_type=mt_objects["single"],
            nhif_number="NHIF123",
            mailing_address="Mombasa",
            valid_from=timezone.now().date() - timezone.timedelta(days=180),
            valid_to=timezone.now().date() + timezone.timedelta(days=365),
            benefits_from=timezone.now().date() - timezone.timedelta(days=120),
            status="active",
        )

        # Dependants
        MemberDependent.objects.create(
            member=main_member,
            full_name="Jane Doe",
            date_of_birth="2010-06-21",
            blood_group="O+",
            id_number="CHILD01",
        )

        self.stdout.write(self.style.SUCCESS(" - main member seeded."))

        # ===============================================================
        # 5️⃣ SETTINGS
        # ===============================================================
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
        self.stdout.write(self.style.SUCCESS(" - settings seeded."))

        # ===============================================================
        # 6️⃣ REIMBURSEMENT SCALES
        # ===============================================================
        scales = [
            ("Outpatient", 80, 20, 50000),
            ("Inpatient", 85, 15, 200000),
            ("Chronic", 60, 40, 120000),
        ]

        for cat, fshare, mshare, ceil in scales:
            ReimbursementScale.objects.update_or_create(
                category=cat,
                defaults={
                    "fund_share": fshare,
                    "member_share": mshare,
                    "ceiling": ceil,
                },
            )

        self.stdout.write(self.style.SUCCESS(" - reimbursement scales seeded."))

        # ===============================================================
        # 7️⃣ ONE SAMPLE OUTPATIENT CLAIM
        # ===============================================================
        self.stdout.write(self.style.WARNING("Seeding sample claims..."))

        outpatient = Claim.objects.create(
            member=main_member,
            claim_type="outpatient",
            status="submitted",
            date_of_first_visit=timezone.now().date() - timezone.timedelta(days=3),
            notes="Consulted at Siri Guru Nanak Clinic",
        )

        ClaimItem.objects.create(
            claim=outpatient,
            category="consultation",
            description="Doctor Consultation",
            amount=1500,
            quantity=1,
        )

        ClaimItem.objects.create(
            claim=outpatient,
            category="medicine",
            description="Medication",
            amount=2000,
            quantity=1,
        )

        outpatient.recalc_total()
        outpatient.compute_payable()

        # ===============================================================
        # 8️⃣ ONE SAMPLE INPATIENT CLAIM
        # ===============================================================
        inpatient = Claim.objects.create(
            member=main_member,
            claim_type="inpatient",
            status="submitted",
            date_of_discharge=timezone.now().date() - timezone.timedelta(days=5),
            notes="Admitted for observation",
        )

        ClaimItem.objects.create(
            claim=inpatient,
            category="bed_charges",
            description="Bed charges",
            amount=3000,
            quantity=3,
        )

        ClaimItem.objects.create(
            claim=inpatient,
            category="doctor_fee",
            description="Doctor review",
            amount=5000,
            quantity=1,
        )

        inpatient.recalc_total()
        inpatient.compute_payable()

        # ===============================================================
        # 9️⃣ CHRONIC REQUEST
        # ===============================================================
        ChronicRequest.objects.create(
            member=main_member,
            doctor_name="Dr. Patel",
            medicines=[
                {"name": "Metformin", "strength": "500mg", "dosage": "2x", "duration": "30 days", "cost": 1500},
                {"name": "Atorvastatin", "strength": "20mg", "dosage": "1x", "duration": "30 days", "cost": 1200},
            ],
            total_amount=2700,
            member_payable=540,  # 20%
            status="pending",
        )

        # ===============================================================
        # 🔟 FAKE RANDOM MEMBERS (5)
        # ===============================================================
        self.stdout.write(self.style.WARNING("Creating test members..."))

        for i in range(5):
            first = fake.first_name()
            last = fake.last_name()
            username = f"{first.lower()}{i}"

            user = User.objects.create_user(
                username=username,
                email=f"{username}@sgss.org",
                password="member123",
                first_name=first,
                last_name=last,
            )
            user.groups.add(role_objs["Member"])

            mt = random.choice(list(mt_objects.values()))

            mem = Member.objects.create(
                user=user,
                membership_type=mt,
                nhif_number=f"NHIF-{random.randint(1000,9999)}",
                valid_from=timezone.now().date() - timezone.timedelta(days=random.randint(60, 300)),
                valid_to=timezone.now().date() + timezone.timedelta(days=365),
                benefits_from=timezone.now().date() - timezone.timedelta(days=60),
                status="active",
            )

            # One claim each
            c = Claim.objects.create(
                member=mem,
                claim_type=random.choice(["outpatient", "inpatient"]),
                status=random.choice(["submitted", "approved", "rejected"]),
                notes=f"Visit to {fake.company()}",
                date_of_first_visit=timezone.now().date() - timezone.timedelta(days=random.randint(1, 10)),
            )

            ClaimItem.objects.create(
                claim=c,
                category="consultation",
                description="Routine check-up",
                amount=random.randint(1000, 3000),
                quantity=1,
            )

            c.recalc_total()
            c.compute_payable()

        # ===============================================================
        # COMPLETED
        # ===============================================================
        self.stdout.write(self.style.SUCCESS("🎉 SGSS FULL SEED COMPLETED SUCCESSFULLY"))
