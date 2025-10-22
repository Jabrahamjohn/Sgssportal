# medical/signals.py
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Claim, ClaimItem, ClaimReview, Notification, AuditLog, Member
from django.contrib.auth.models import Group

User = get_user_model()


def _notify(recipient: User, title: str, message: str, link: str = '', type_: str = 'system', actor: User | None = None):
    if recipient:
        Notification.objects.create(
            recipient=recipient, title=title, message=message, link=link, type=type_, actor=actor
        )


def _audit(actor: User | None, action: str, meta: dict | None):
    AuditLog.objects.create(actor=actor, action=action, meta=meta or {})


# --- Claim items change -> recompute totals & payable
@receiver(post_save, sender=ClaimItem)
@receiver(post_delete, sender=ClaimItem)
def item_changed(sender, instance, **kwargs):
    claim = instance.claim
    claim.recalc_total()
    claim.compute_payable()
    _audit(None, 'claim_items:UPSERT/DELETE', {'claim_id': str(claim.id)})


# --- Claim save: auto-submitted_at + payable recompute + notifications ---
from django.db.models.signals import post_save
from django.db import connection

@receiver(post_save, sender=Claim)
def claim_saved(sender, instance: Claim, created, **kwargs):
    """
    Handles recalculation and notifications safely, avoiding recursion.
    """
    # Prevent recursion by temporarily disabling this signal
    post_save.disconnect(claim_saved, sender=Claim)
    try:
        # Compute totals without re-triggering the signal
        instance.compute_payable()

        # Notify member on creation/status change
        member_user = instance.member.user if instance.member else None
        if created and instance.status == 'submitted' and member_user:
            _notify(
                member_user,
                'Claim Submitted',
                f'Your claim {instance.id} has been submitted.',
                f'/claims/{instance.id}',
                'claim'
            )
        elif not created and member_user:
            _notify(
                member_user,
                'Claim Update',
                f'Your claim {instance.id} is now {instance.status}.',
                f'/claims/{instance.id}',
                'claim'
            )

        _audit(None, 'claims:UPSERT', {'id': str(instance.id), 'status': instance.status})
    finally:
        # Always reconnect after execution
        post_save.connect(claim_saved, sender=Claim)


# --- Claim reviews -> update claim status + notifications + audit
@receiver(post_save, sender=ClaimReview)
def review_saved(sender, instance: ClaimReview, created, **kwargs):
    claim = instance.claim
    # Update status based on action
    if instance.action == 'approved':
        claim.status = 'approved'
    elif instance.action == 'rejected':
        claim.status = 'rejected'
    elif instance.action == 'paid':
        claim.status = 'paid'
    elif instance.action == 'reviewed':
        claim.status = 'reviewed'
    elif instance.action == 'override' and claim.override_amount is not None:
        claim.status = 'approved'  # override implies approval
    claim.save(update_fields=['status'])

    # Notify member
    member_user = claim.member.user if claim.member else None
    if member_user:
        _notify(member_user, 'Claim Reviewed', f'Your claim {claim.id} was {instance.action}.', f'/claims/{claim.id}', 'claim', instance.reviewer)

    _audit(instance.reviewer, 'claim_reviews:INSERT', {'claim_id': str(claim.id), 'action': instance.action})


@receiver(post_save, sender=User)
def ensure_user_groups(sender, instance, created, **kwargs):
    if not created:
        return
    if instance.is_superuser:
        instance.groups.add(Group.objects.get_or_create(name='Admin')[0])
    else:
        instance.groups.add(Group.objects.get_or_create(name='Member')[0])