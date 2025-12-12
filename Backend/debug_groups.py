import os
import django
import sys

# Setup Django environment
sys.path.append(r'c:\Users\lenovo\Desktop\Sgssportal\Backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sgss_medical_fund.settings')
django.setup()

from django.contrib.auth.models import User, Group
from medical.models import Member

print("--- Users and Groups ---")
for u in User.objects.all():
    print(f"User: {u.username} (ID: {u.id})")
    print(f"  Superuser: {u.is_superuser}")
    print(f"  Groups: {[g.name for g in u.groups.all()]}")
    try:
        m = Member.objects.get(user=u)
        print(f"  Member Profile: Yes (Status: {m.status}, Type: {m.membership_type})")
    except Member.DoesNotExist:
        print(f"  Member Profile: No")
    print("-" * 20)

print("\n--- All Groups ---")
for g in Group.objects.all():
    print(f"Group: {g.name}")
