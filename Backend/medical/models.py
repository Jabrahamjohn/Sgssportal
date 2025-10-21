# medical/models.py
from __future__ import annotations
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.exceptions import ValidationError
import uuid

User = get_user_model()


# ---------------------------
# Settings as Key/Value store
# ---------------------------
class Setting(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key

    @staticmethod
    def get(key: str, default=None):
        try:
            return Setting.objects.get(key=key).value
        except Setting.DoesNotExist:
            return default or {}


# ---------------------------
# Membership
# ---------------------------
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

    def is_active_for_claims(self) -> bool:
        """Constitution: benefits start after 60 days from valid_from; must also be unexpired."""
        if not self.valid_from:
            return False
        today = timezone.now().date()
        if self.valid_to and today > self.valid_to:
            return False
        return (today - self.valid_from).days >= 60

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}"


# ---------------------------
# Reimbursement Scale
# ---------------------------
class ReimbursementScale(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.CharField(max_length=80, unique=True)  # Outpatient / Inpatient / Chronic
    fund_share = models.DecimalField(max_digits=5, decimal_places=2)   # percent
    member_share = models.DecimalField(max_digits=5, decimal_places=2) # percent
    ceiling = models.DecimalField(max_digits=12, decimal_places=2)     # absolute cap
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.category} ({self.fund_share}/{self.member_share} up to {self.ceiling})"


# ---------------------------
# Claims & Items
# ---------------------------
class Claim(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('paid', 'Paid'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='claims')
    claim_type = models.CharField(max_length=50)  # outpatient/inpatient/chronic
    date_of_first_visit = models.DateField(blank=True, null=True)
    date_of_discharge = models.DateField(blank=True, null=True)
    total_claimed = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_payable = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    member_payable = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    submitted_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    # Bylaws extras
    excluded = models.BooleanField(default=False)
    override_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    nhif_number = models.CharField(max_length=100, blank=True, null=True)
    other_insurance = models.JSONField(blank=True, null=True)  # {"nhif": 0, "other": 0}

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    # ------- validation according to bylaws -------
    def clean(self):
        # 1) Submission within 90 days
        today = timezone.now().date()
        claim_t = (self.claim_type or '').lower()

        if claim_t == 'outpatient':
            if not self.date_of_first_visit:
                raise ValidationError("Outpatient claims require date_of_first_visit.")
            if self.submitted_at and (self.submitted_at.date() - self.date_of_first_visit).days > 90:
                raise ValidationError("Outpatient claims must be submitted within 90 days of first visit.")
        elif claim_t == 'inpatient':
            if not self.date_of_discharge:
                raise ValidationError("Inpatient claims require date_of_discharge.")
            if self.submitted_at and (self.submitted_at.date() - self.date_of_discharge).days > 90:
                raise ValidationError("Inpatient claims must be submitted within 90 days of discharge.")

        # 2) Membership active (60 days waiting, not expired)
        if self.member and not self.member.is_active_for_claims():
            raise ValidationError("Membership waiting period (60 days) not satisfied or membership expired.")

    def recalc_total(self):
        total = (
            self.items.aggregate(sum=models.Sum(models.F('amount') * models.F('quantity')))['sum']
            or 0
        )
        self.total_claimed = total
        self.save(update_fields=['total_claimed'])

    def compute_payable(self):
        """
        Python port of your SQL compute_claim_payable with:
        - reimbursement scale detection
        - clinic outpatient 100% rule for 'Siri Guru Nanak Clinic'
        - NHIF/other insurance deductions
        - ceiling & annual membership limit enforcement
        - discretionary override
        """
        # Discretionary override wins
        if self.override_amount is not None:
            self.total_payable = self.override_amount
            self.member_payable = max(0, float(self.total_claimed) - float(self.override_amount))
            self.save(update_fields=['total_payable', 'member_payable'])
            return

        # Exclusions — full amount to member
        if self.excluded:
            self.total_payable = 0
            self.member_payable = self.total_claimed
            self.save(update_fields=['total_payable', 'member_payable'])
            return

        # Settings and scales
        general = Setting.get('general_limits', {
            "annual_limit": 250000,
            "critical_addon": 200000,
            "fund_share_percent": 80,
            "clinic_outpatient_percent": 100
        })
        scales_qs = ReimbursementScale.objects.all()
        scale = None
        for s in scales_qs:
            if s.category.lower() == (self.claim_type or '').lower():
                scale = s
                break

        fund_share_percent = float(scale.fund_share) if scale else float(general.get('fund_share_percent', 80))
        ceiling = float(scale.ceiling) if scale else float(general.get('annual_limit', 50000))

        # 100% clinic rule
        clinic_percent = float(general.get('clinic_outpatient_percent', 100))
        notes_lower = (self.notes or '').lower()
        if (self.claim_type or '').lower() == 'outpatient' and clinic_percent == 100 and 'siri guru nanak clinic' in notes_lower:
            fund_share_amount = float(self.total_claimed)
        else:
            fund_share_amount = float(self.total_claimed) * (fund_share_percent / 100.0)

        nhif_amount = 0.0
        other_ins = 0.0
        if self.nhif_number:
            nhif_amount = float((self.other_insurance or {}).get('nhif', 0))
        other_ins = float((self.other_insurance or {}).get('other', 0))

        fund_share_amount = max(0.0, fund_share_amount - nhif_amount - other_ins)
        member_share_amount = float(self.total_claimed) - fund_share_amount - nhif_amount - other_ins

        # ceiling enforcement
        if fund_share_amount > ceiling:
            fund_share_amount = ceiling
            member_share_amount = float(self.total_claimed) - fund_share_amount - nhif_amount - other_ins

        # annual membership limit enforcement
        membership_limit = None
        if self.member and self.member.membership_type:
            membership_limit = float(self.member.membership_type.annual_limit or 0)

        if membership_limit and membership_limit > 0:
            year = timezone.now().year
            spent = (Claim.objects
                     .filter(member=self.member, created_at__year=year)
                     .aggregate(sum=models.Sum('total_payable'))['sum'] or 0.0)
            spent = float(spent)
            if spent + fund_share_amount > membership_limit:
                fund_share_amount = max(0.0, membership_limit - spent)
                member_share_amount = float(self.total_claimed) - fund_share_amount - nhif_amount - other_ins

        self.total_payable = fund_share_amount
        self.member_payable = member_share_amount
        self.save(update_fields=['total_payable', 'member_payable'])

    def __str__(self):
        return f"Claim {self.id} ({self.status})"


class ClaimItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, related_name='items')
    category = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.category} x{self.quantity}"


class ClaimReview(models.Model):
    ACTIONS = [
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('override', 'Override'),
        ('paid', 'Paid'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, related_name='reviews')
    reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    role = models.CharField(max_length=50, blank=True, null=True)
    action = models.CharField(max_length=50, choices=ACTIONS)
    note = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # discretionary override guard (<= 150,000)
        if self.action == 'override' and self.claim.override_amount and float(self.claim.override_amount) > 150000:
            raise ValidationError("Discretionary override cannot exceed Ksh 150,000.")

    def __str__(self):
        return f"{self.claim_id} - {self.action}"


# ---------------------------
# Notifications & Audit
# ---------------------------
class Notification(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.CharField(max_length=255, blank=True, null=True)
    type = models.CharField(max_length=50, default='system')
    read = models.BooleanField(default=False)
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='acted_notifications')
    metadata = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100)  # e.g. "claims:INSERT"
    meta = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
