from django.core.exceptions import ValidationError
from django.utils import timezone

def validate_claim_before_submit(claim):
    member = claim.member
    today = timezone.now().date()

    # Active check
    if member.status != "active":
        raise ValidationError("Your membership is not active.")

    # Validity dates
    if member.valid_from and member.valid_from > today:
        raise ValidationError("Your membership has not started yet.")

    if member.valid_to and member.valid_to < today:
        raise ValidationError("Your membership has expired.")

    # Waiting period
    if member.benefits_from and member.benefits_from > today:
        raise ValidationError("Your waiting period has not ended.")

    return True
