# medical/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class MembershipType(models.Model):
    key = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    annual_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    fund_share_percent = models.DecimalField(max_digits=5, decimal_places=2, default=80)

    def __str__(self):
        return self.name


class Member(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    membership_type = models.ForeignKey(MembershipType, on_delete=models.SET_NULL, null=True)
    nhif_number = models.CharField(max_length=100, blank=True, null=True)
    valid_from = models.DateField(blank=True, null=True)
    valid_to = models.DateField(blank=True, null=True)

    def is_active_for_claims(self):
        if not self.valid_from:
            return False
        days = (timezone.now().date() - self.valid_from).days
        return days >= 60 and (self.valid_to is None or timezone.now().date() <= self.valid_to)

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.membership_type})"


class Claim(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='claims')
    claim_type = models.CharField(max_length=50)
    date_of_first_visit = models.DateField(blank=True, null=True)
    date_of_discharge = models.DateField(blank=True, null=True)
    total_claimed = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_payable = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    member_payable = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    notes = models.TextField(blank=True, null=True)
    excluded = models.BooleanField(default=False)
    nhif_number = models.CharField(max_length=100, blank=True, null=True)
    other_insurance = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def recalc_total(self):
        total = (
            self.items.aggregate(
                sum=models.Sum(models.F('amount') * models.F('quantity'))
            )['sum']
            or 0
        )
        self.total_claimed = total
        self.save(update_fields=['total_claimed'])

    def compute_payable(self, reimbursement_scales, settings):
        # Simplified port of compute_claim_payable logic
        if self.excluded:
            self.total_payable = 0
            self.member_payable = self.total_claimed
            self.save(update_fields=['total_payable', 'member_payable'])
            return

        # Find reimbursement scale
        scale = None
        for s in reimbursement_scales:
            if s['category'].lower() == self.claim_type.lower():
                scale = s
                break

        fund_share_percent = (
            scale.get('fund_share', 80) if scale else settings.get('fund_share_percent', 80)
        )
        ceiling = (
            scale.get('ceiling') if scale else settings.get('annual_limit', 50000)
        )

        fund_share_amount = float(self.total_claimed) * (fund_share_percent / 100.0)

        # Apply NHIF or other deductions
        nhif_amount = float(self.other_insurance.get('nhif', 0)) if self.other_insurance and 'nhif' in self.other_insurance else 0
        other_ins = float(self.other_insurance.get('other', 0)) if self.other_insurance and 'other' in self.other_insurance else 0

        fund_share_amount = max(0, fund_share_amount - nhif_amount - other_ins)
        member_share_amount = float(self.total_claimed) - fund_share_amount - nhif_amount - other_ins

        # Apply ceiling
        if fund_share_amount > ceiling:
            fund_share_amount = ceiling
            member_share_amount = float(self.total_claimed) - fund_share_amount - nhif_amount - other_ins

        self.total_payable = fund_share_amount
        self.member_payable = member_share_amount
        self.save(update_fields=['total_payable', 'member_payable'])

    def __str__(self):
        return f"Claim {self.id} - {self.member.user.email} ({self.status})"
