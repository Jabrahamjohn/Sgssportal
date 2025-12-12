import os
import django
import sys

sys.path.append(r'c:\Users\lenovo\Desktop\Sgssportal\Backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sgss_medical_fund.settings')
django.setup()

from django.contrib.auth.models import User, Group
from medical.models import Member

with open('debug_result.txt', 'w', encoding='utf-8') as f:
    f.write("--- SUMMARY ---\n")
    f.write(f"Total Users: {User.objects.count()}\n")
    f.write(f"Total Members: {Member.objects.count()}\n\n")

    f.write("--- USERS ---\n")
    for u in User.objects.all():
        groups = [g.name for g in u.groups.all()]
        f.write(f"User: {u.username} | ID: {u.id} | Superuser: {u.is_superuser} | Groups: {groups}\n")
        try:
            m = Member.objects.get(user=u)
            f.write(f"  -> Member Profile: Found (Status: {m.status})\n")
        except Member.DoesNotExist:
            f.write(f"  -> Member Profile: MISSING\n")
        f.write("\n")

    f.write("--- GROUPS ---\n")
    for g in Group.objects.all():
        f.write(f"Group: {g.name}\n")
