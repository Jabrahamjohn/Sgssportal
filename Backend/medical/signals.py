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
            if created and instance.status == "submitted" and member_user:
                _notify(
                    instance.member.user,
                    "Claim Submitted",
                    f"Your claim {instance.id} has been submitted.",
                    f"/claims/{instance.id}",
                    "claim"
                )
            elif not created and member_user:
                _notify(
                    instance.member.user,
                    "Claim Update",
                    f"Your claim {instance.id} is now {instance.status}.",
                    f"/claims/{instance.id}",
                    "claim"
                )
            _audit(None, "claims:UPSERT", {"id": str(instance.id), "status": instance.status})
    finally:
        post_save.connect(claim_saved, sender=Claim)


# --- ClaimItem save: recompute claim totals ---
@receiver(post_save, sender=ClaimItem)
def item_saved(sender, instance: ClaimItem, created, **kwargs):
    claim = instance.claim
    claim.recalc_total()
    claim.compute_payable()
