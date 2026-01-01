# --- imports ---
# signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import transaction
from .models import Claim, ClaimItem, Notification, AuditLog

User = get_user_model()

# --- helper notifiers/audit ---
def _notify(recipient, title, message, link=None, type_="system", actor=None, metadata=None):
    if not recipient:
        return
    Notification.objects.create(
        recipient=recipient, title=title, message=message, link=link,
        type=type_, actor=actor, metadata=metadata or {}
    )

def _audit(actor, action, meta=None):
    AuditLog.objects.create(actor=actor, action=action, meta=meta or {})


# --- groups on user create ---
@receiver(post_save, sender=User)
def ensure_user_groups(sender, instance, created, **kwargs):
    if not created:
        return
    # Default everyone to "Member". Admins/superusers can be assigned to Committee/Admin in admin.
    grp, _ = Group.objects.get_or_create(name="Member")
    instance.groups.add(grp)


# --- Claim save: compute payable & notify (no recursion) ---
@receiver(post_save, sender=Claim)
def claim_saved(sender, instance: Claim, created, **kwargs):
    # Avoid recursion: disconnect then reconnect
    post_save.disconnect(claim_saved, sender=Claim)
    try:
        with transaction.atomic():
            # compute payable on every save
            instance.compute_payable()

            member_user = getattr(getattr(instance.member, "user", None), "pk", None)
            
            # 1. Notify Member used to be here.
            # 2. Notify Committee
            committee_group = Group.objects.filter(name="Committee").first()
            committee_users = list(committee_group.user_set.all()) if committee_group else []

            if created and instance.status == "submitted":
                # Notify Applier
                if member_user:
                    _notify(
                        instance.member.user,
                        "Claim Submitted",
                        f"Your SHIF/SHA-linked claim {instance.id} has been received.",
                        f"/dashboard/member/claims/{instance.id}",
                        "claim"
                    )
                    # Send email notification
                    try:
                        from .email_notifications import send_claim_submitted_email
                        send_claim_submitted_email(instance)
                    except Exception as e:
                        print(f"Failed to send claim submission email: {e}")
                
                # Notify Committee
                for c_user in committee_users:
                    _notify(
                        c_user,
                        "New Claim Submitted",
                        f"New {instance.claim_type} claim (SHIF-linked) from {instance.member.user.get_full_name() or instance.member.user.username}.",
                        f"/dashboard/committee/claims/{instance.id}/",
                        "claim"
                    )
                
                # Send committee email
                try:
                    from .email_notifications import send_committee_notification_email
                    send_committee_notification_email(instance, 'new_claim')
                except Exception as e:
                    print(f"Failed to send committee notification email: {e}")
                    
            elif not created:
                # Notify Member on status change
                if member_user:
                    msg = f"Your claim {instance.id} status has been updated to {instance.status.upper()}."
                    note = getattr(instance, 'status_note', None)
                    if note:
                        msg += f" Note: {note}"
                        
                    _notify(
                        instance.member.user,
                        "Claim Update",
                        msg,
                        f"/dashboard/member/claims/{instance.id}",
                        "claim"
                    )
                    # Send email for status changes
                    if instance.status in ['approved', 'rejected', 'paid']:
                        try:
                            from .email_notifications import send_claim_status_email
                            send_claim_status_email(instance)
                        except Exception as e:
                            print(f"Failed to send claim status email: {e}")
            
            _audit(None, "claims:UPSERT", {"id": str(instance.id), "status": instance.status})
    finally:
        post_save.connect(claim_saved, sender=Claim)


# --- Member save: notify Committee on newly registered, Member on active ---
from .models import Member

@receiver(post_save, sender=Member)
def member_saved(sender, instance: Member, created, **kwargs):
    if created:
        # Send welcome email to new member
        try:
            from .email_notifications import send_member_registration_email
            send_member_registration_email(instance)
        except Exception as e:
            print(f"Failed to send registration email: {e}")
        
        # Notify Committee of new registration (if not already handled by view)
        # It's safer to have it here to catch all creations
        committee_group = Group.objects.filter(name="Committee").first()
        if committee_group:
            for c_user in committee_group.user_set.all():
                _notify(
                    c_user,
                    "New Membership Application",
                    f"New SHIF/SHA member registration: {instance.user.get_full_name() or instance.user.username}.",
                    f"/dashboard/committee/members/{instance.id}/",
                    "member"
                )
        
        # Send committee email alert
        try:
            from .email_notifications import send_new_member_committee_email
            send_new_member_committee_email(instance)
        except Exception as e:
            print(f"Failed to send new member committee email: {e}")
    else:
        # Status changes handled here or in services? 
        # Services `approve_member` handles it manually with custom message.
        # We can leave it there to avoid duplicate "Active" messages if service is used.
        pass

# --- ClaimItem save: recompute claim totals ---
@receiver(post_save, sender=ClaimItem)
def item_saved(sender, instance: ClaimItem, created, **kwargs):
    claim = instance.claim
    claim.recalc_total()
    claim.compute_payable()
