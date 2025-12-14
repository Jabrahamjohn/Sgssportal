# medical/services/membership.py

from django.utils import timezone
from django.contrib.auth.models import Group
from medical.models import Member
from medical.views import notify

def approve_member(member: Member):
    """Centralized approval logic for Committee/Admin."""
    today = timezone.now().date()

    term_years = member.membership_type.term_years or 2

    member.status = "active"
    member.valid_from = today
    member.valid_to = today.replace(year=today.year + term_years)

    if not member.benefits_from:
        member.benefits_from = today + timezone.timedelta(days=60)

    member.save(update_fields=["status", "valid_from", "valid_to", "benefits_from"])

    member_group, _ = Group.objects.get_or_create(name="Member")
    member.user.groups.add(member_group)

    notify(
        member.user,
        "Membership Approved",
        f"Your {member.membership_type.name} membership has been approved.",
        link="/dashboard/member",
    )
    
    # Send approval email
    try:
        from medical.email_notifications import send_member_approved_email
        send_member_approved_email(member)
    except Exception as e:
        print(f"Failed to send approval email: {e}")

    return member


def reject_member(member: Member, reason=""):
    """Unified rejection logic."""
    member.status = "inactive"
    member.save(update_fields=["status"])

    notify(
        member.user,
        "Membership Application Updated",
        f"Your application has been marked inactive. {reason}",
        link="/dashboard/member",
    )
    return member
