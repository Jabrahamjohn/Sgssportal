# medical/signals.py
from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Claim, ClaimItem, ClaimReview, Notification, AuditLog, Member

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


# --- Claim save: auto-submitted_at + payable recompute + exclusions from notes/categories
@receiver(pre_save, sender=Claim)
def claim_pre_save(sender, instance: Claim, **kwargs):
    # If moving to submitted, set submitted_at
    if instance.status == 'submitted' and instance.submitted_at is None:
        from django.utils import timezone
        instance.submitted_at = timezone.now()

    # Autoflag exclusions from notes/items
    notes = (instance.notes or '').lower()
    exclusion_terms = ['cosmetic', 'infertility', 'nature cure']
    excluded = any(term in notes for term in exclusion_terms)

    # Also check items (after save signal we recompute again, but pre-save flag is fine)
    if instance.pk:
        for it in instance.items.all():
            if (it.category or '').lower() in ('cosmetic', 'transport', 'mortuary', 'infertility'):
                excluded = True
                break
    instance.excluded = excluded


@receiver(post_save, sender=Claim)
def claim_saved(sender, instance: Claim, created, **kwargs):
    # Recompute payable
    instance.compute_payable()

    # Notify member on submit/status change
    member_user = instance.member.user if instance.member else None
    if created and instance.status == 'submitted' and member_user:
        _notify(member_user, 'Claim Submitted', f'Your claim {instance.id} has been submitted.', f'/claims/{instance.id}', 'claim')
    elif not created and member_user:
        _notify(member_user, 'Claim Update', f'Your claim {instance.id} is now {instance.status}.', f'/claims/{instance.id}', 'claim')

    _audit(None, 'claims:UPSERT', {'id': str(instance.id), 'status': instance.status})


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
