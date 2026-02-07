import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sgss_medical_fund.settings')
django.setup()

from django.contrib.auth.models import Group
from medical.models import MembershipType

def bootstrap():
    print("🚀 Starting Production Bootstrap...")

    # 1. Create Authorization Groups
    groups = ['Committee', 'Trustee', 'Treasurer']
    for group_name in groups:
        group, created = Group.objects.get_or_create(name=group_name)
        if created:
            print(f"✅ Created Group: {group_name}")
        else:
            print(f"ℹ️ Group already exists: {group_name}")

    # 2. Create Membership Types (Tiers)
    tiers = [
        {
            "key": "ordinary",
            "name": "Ordinary Member",
            "annual_limit": 250000,
            "fund_share_percent": 80
        },
        {
            "key": "premium",
            "name": "Premium Member",
            "annual_limit": 500000,
            "fund_share_percent": 80
        },
        {
            "key": "joint",
            "name": "Joint Membership",
            "annual_limit": 350000,
            "fund_share_percent": 80
        }
    ]

    for tier_data in tiers:
        tier, created = MembershipType.objects.get_or_create(
            key=tier_data['key'],
            defaults={
                "name": tier_data['name'],
                "annual_limit": tier_data['annual_limit'],
                "fund_share_percent": tier_data['fund_share_percent']
            }
        )
        if created:
            print(f"✅ Created Membership Tier: {tier_data['name']}")
        else:
            print(f"ℹ️ Tier already exists: {tier_data['name']}")

    print("\n🎉 Bootstrap Complete! The system is ready for initial users.")
    print("Next step: Create a Superuser via 'python manage.py createsuperuser'")

if __name__ == "__main__":
    bootstrap()
