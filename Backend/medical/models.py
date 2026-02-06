# Backend/medical/models.py
from __future__ import annotations
from django.db import models, transaction
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
    """
    Generalised membership type – can represent:
    - single / family / joint
    - life / patron / vice_patron
    etc., as per Constitution & Byelaws.
    """
    key = models.CharField(max_length=50, unique=True)  # "single", "family", "life", "patron", etc.
    name = models.CharField(max_length=100)
    entry_fee = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    term_years = models.PositiveIntegerField(null=True, blank=True)  # e.g. 2 years for ordinary membership
    annual_limit = models.DecimalField(max_digits=12, decimal_places=2, default=250000)
    fund_share_percent = models.PositiveIntegerField(default=80)
    notes = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Member(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending Approval"),
        ("active", "Active"),
        ("suspended", "Suspended"),
        ("lapsed", "Lapsed"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    membership_type = models.ForeignKey(MembershipType, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Constitution / form fields
    mailing_address = models.CharField(max_length=255, blank=True)
    phone_office = models.CharField(max_length=50, blank=True)
    phone_home = models.CharField(max_length=50, blank=True)
    phone_fax = models.CharField(max_length=50, blank=True)
    phone_mobile = models.CharField(max_length=50, blank=True)

    family_doctor_name = models.CharField(max_length=255, blank=True)
    family_doctor_phone_office = models.CharField(max_length=50, blank=True)
    family_doctor_phone_home = models.CharField(max_length=50, blank=True)
    family_doctor_phone_fax = models.CharField(max_length=50, blank=True)
    family_doctor_phone_mobile = models.CharField(max_length=50, blank=True)

    shif_number = models.CharField(max_length=100, blank=True, null=True)
    other_medical_scheme = models.CharField(max_length=255, blank=True)

    # Membership lifecycle
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )
    valid_from = models.DateField(blank=True, null=True)
    valid_to = models.DateField(blank=True, null=True)

    # Date from which benefits are claimable (60-day waiting rule, etc.)
    benefits_from = models.DateField(blank=True, null=True)

    def is_active_for_claims(self) -> bool:
        """
        Constitution / Byelaws:
        - Member must be active
        - Benefits start after waiting period (benefits_from)
        - Membership must not be expired
        """
        if self.status != "active":
            return False

        today = timezone.now().date()

        if self.valid_to and today > self.valid_to:
            return False

        if self.benefits_from and today < self.benefits_from:
            return False

        return True

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username}"


# ---------------------------
# Member Dependants
# ---------------------------
class MemberDependent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="dependants")
    full_name = models.CharField(max_length=150)
    date_of_birth = models.DateField(blank=True, null=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True)
    id_number = models.CharField(max_length=50, blank=True, null=True)
    relationship = models.CharField(max_length=50, blank=True, null=True)

    # ✔ FIXED
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["full_name"]

    def __str__(self):
        return f"{self.full_name} ({self.relationship})"


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

    # Store structured form payload (outpatient / inpatient / chronic)
    details = models.JSONField(default=dict, blank=True)

    is_trustee_ratified = models.BooleanField(default=False)
    
    # Bylaws extras
    excluded = models.BooleanField(default=False)
    override_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    shif_number = models.CharField(max_length=100, blank=True, null=True)
    other_insurance = models.JSONField(blank=True, null=True)  # {"shif": 0, "other": 0}

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    # ------- validation according to bylaws -------
    def clean(self):
        # 1) Submission within 90 days
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

        # 2) Membership active (waiting period + expiry + status)
        if self.member and not self.member.is_active_for_claims():
            raise ValidationError("Membership not eligible for claims (waiting period / status / expiry).")

        # 3) Constitutional Limit Gate (150k Committee Cap)
        if self.status in ['approved', 'paid'] and float(self.total_payable or 0) > 150000:
            if not self.is_trustee_ratified:
                raise ValidationError("Claims exceeding KSh 150,000 require Board of Trustees ratification before approval/payment.")

        # 4) Appeal Freeze
        if self.appeals.filter(status='pending').exists():
            if self.status not in ['draft', 'submitted', 'rejected']:
                raise ValidationError("Claim is currently under appeal and cannot be modified or processed by the committee.")

    # -------------------------------------------------------------------
    # SGSS BYELAW RULE ENGINE HELPERS
    # -------------------------------------------------------------------
    def calculate_total_claimed(self):
        """Compute the raw total based on claim type + details."""
        total = 0
        d = self.details or {}
        ctype = (self.claim_type or "").lower()

        if ctype == "outpatient":
            total = (
                (d.get("consultation_fee") or 0)
                + (d.get("house_visit_cost") or 0)
                + (d.get("medicine_cost") or 0)
                + (d.get("investigation_cost") or 0)
                + (d.get("procedure_cost") or 0)
            )

        elif ctype == "inpatient":
            stay_days = d.get("stay_days") or 1
            accommodation = (d.get("bed_charge_per_day") or 0) * stay_days
            shif = d.get("shif_total") or d.get("nhif_total") or 0
            accommodation = max(accommodation - shif, 0)

            total = (
                accommodation
                + (d.get("inpatient_total") or 0)
                + (d.get("doctor_total") or 0)
                + (d.get("claimable_total") or 0)
                - (d.get("discounts_total") or 0)
            )

        elif ctype == "chronic":
            meds = d.get("medicines", [])
            total = sum(m.get("cost") or 0 for m in meds)

        return max(total, 0)

    def compute_fund_distribution(self):
        """Compute fund liability (80%) and member liability (20%)."""
        total = self.calculate_total_claimed()
        self.total_claimed = total
        self.total_payable = total * 0.8
        self.member_payable = total * 0.2

    def enforce_annual_limit(self):
        """Enforce annual limit (250k + 200k critical top-up)."""
        from django.db.models import Sum
        year = timezone.now().year

        previous = (
            Claim.objects.filter(
                member=self.member,
                status__in=["approved", "paid"],
                submitted_at__year=year
            ).aggregate(Sum("total_payable"))["total_payable__sum"]
            or 0
        )

        base_limit = 250000
        critical_boost = 200000 if (
            self.claim_type == "inpatient" and
            (self.details or {}).get("critical_illness")
        ) else 0

        limit = base_limit + critical_boost

        if float(previous) + float(self.total_payable or 0) > limit:
            raise ValidationError("Annual limit exceeded.")

    @transaction.atomic
    def recalc_total(self):
        """Safely recompute claim total from items OR details (fallback)."""
        items_total = (
            self.items.aggregate(sum=models.Sum(models.F('amount') * models.F('quantity')))['sum']
            or 0
        )
        
        # If items exist, they are authoritative.
        # If no items, we check if there's data in 'details' (legacy or simplified forms)
        if items_total == 0:
            details_total = self.calculate_total_claimed()
            self.total_claimed = details_total
        else:
            self.total_claimed = items_total

        super().save(update_fields=['total_claimed'])

    @transaction.atomic
    def compute_payable(self, skip_save=False):
        """Fully transaction-safe computation for claims."""
        from .models import ReimbursementScale, Setting  # safe local import

        # If override exists
        if self.override_amount is not None:
            self.total_payable = self.override_amount
            self.member_payable = max(0, float(self.total_claimed) - float(self.override_amount))
            if not skip_save:
                super().save(update_fields=['total_payable', 'member_payable'])
            return

        # Exclusions — full amount to member
        if self.excluded:
            self.total_payable = 0
            self.member_payable = self.total_claimed
            if not skip_save:
                super().save(update_fields=['total_payable', 'member_payable'])
            return

        general = Setting.get('general_limits', {
            "annual_limit": 250000,
            "critical_addon": 200000,
            "fund_share_percent": 80,
            "clinic_outpatient_percent": 100
        })

        scale = ReimbursementScale.objects.filter(category__iexact=self.claim_type).first()
        fund_share_percent = float(scale.fund_share) if scale else float(general.get('fund_share_percent', 80))
        ceiling = float(scale.ceiling) if scale else float(general.get('annual_limit', 50000))

        # 100% outpatient rule for SGN clinic
        clinic_percent = float(general.get('clinic_outpatient_percent', 100))
        if self.claim_type.lower() == 'outpatient' and 'siri guru nanak clinic' in (self.notes or '').lower():
            fund_share_amount = float(self.total_claimed) * (clinic_percent / 100)
        else:
            fund_share_amount = float(self.total_claimed) * (fund_share_percent / 100.0)

        shif_amount = float((self.other_insurance or {}).get('shif', (self.other_insurance or {}).get('nhif', 0)))
        other_ins = float((self.other_insurance or {}).get('other', 0))
 
        fund_share_amount = max(0, fund_share_amount - shif_amount - other_ins)
        member_share_amount = float(self.total_claimed) - fund_share_amount - shif_amount - other_ins

        # Apply ceilings
        if fund_share_amount > ceiling:
            fund_share_amount = ceiling
            member_share_amount = float(self.total_claimed) - fund_share_amount - shif_amount - other_ins

        # Annual membership limit (per membership type limit)
        membership_limit = float(self.member.membership_type.annual_limit or 0)
        year = timezone.now().year
        spent = (
            Claim.objects.filter(member=self.member, created_at__year=year)
            .exclude(pk=self.pk)
            .aggregate(sum=models.Sum('total_payable'))['sum'] or 0
        )
        spent = float(spent)
        if spent + fund_share_amount > membership_limit:
            fund_share_amount = max(0, membership_limit - spent)
            member_share_amount = float(self.total_claimed) - fund_share_amount - shif_amount - other_ins

        self.total_payable = fund_share_amount
        self.member_payable = member_share_amount

        if not skip_save:
            super().save(update_fields=['total_payable', 'member_payable'])

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
    byelaw_reference = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. Byelaw §9.1.a")
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # 1. Discretionary limit guard (<= 150,000)
        amount = self.claim.override_amount or self.claim.total_payable
        if amount and float(amount) > 150000:
            # Check for linked locked meeting type
            latest_link = self.claim.meeting_links.filter(meeting__status="locked").last()
            if latest_link and latest_link.meeting.meeting_type != 'emergency':
                raise ValidationError("Claims exceeding Ksh 150,000 require ratification in an EMERGENCY meeting.")
            
            # If no link at all, it's already blocked by the view, but let's be safe
            if not latest_link and self.action in ['approved', 'paid']:
                 raise ValidationError("High-value claims must be linked to a locked Emergency Meeting.")

    def save(self, *args, **kwargs):
        # We don't call full_clean() here yet to avoid recursive issues if not careful, 
        # but the roadmap says "Enforce model.full_clean() in Serializer"
        super().save(*args, **kwargs)

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
    
    # Phase 2B: Deep Audit
    previous_state = models.JSONField(blank=True, null=True)
    new_state = models.JSONField(blank=True, null=True)
    meeting = models.ForeignKey('CommitteeMeeting', on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    
    created_at = models.DateTimeField(auto_now_add=True)


class DataAccessLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, related_name='access_logs')
    attachment = models.ForeignKey('ClaimAttachment', on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.CharField(max_length=255, default="Claim Review")
    accessed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-accessed_at']


# ---------------------------
# Governance & Meetings
# ---------------------------
class CommitteeMeeting(models.Model):
    MEETING_TYPES = [
        ('monthly', 'Monthly'),
        ('emergency', 'Emergency'),
        ('appeal', 'Appeal'),
    ]
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('ratified', 'Ratified'),
        ('locked', 'Locked'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateTimeField()
    meeting_type = models.CharField(max_length=20, choices=MEETING_TYPES, default='monthly')
    quorum_confirmed = models.BooleanField(default=False)
    minutes_upload = models.FileField(upload_to='minutes/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='meetings_created')

    def __str__(self):
        return f"{self.get_meeting_type_display()} meeting on {self.date}"


class MeetingAttendance(models.Model):
    meeting = models.ForeignKey(CommitteeMeeting, on_delete=models.CASCADE, related_name='attendance')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    present = models.BooleanField(default=True)
    role = models.CharField(max_length=100, blank=True, null=True) # Chair, Secretary, Member

    class Meta:
        unique_together = ('meeting', 'user')

    def __str__(self):
        return f"{self.user.username} at {self.meeting}"


class ClaimMeetingLink(models.Model):
    DECISION_CHOICES = [
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('deferred', 'Deferred'),
    ]
    meeting = models.ForeignKey(CommitteeMeeting, on_delete=models.CASCADE, related_name='claim_links')
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, related_name='meeting_links')
    decision = models.CharField(max_length=20, choices=DECISION_CHOICES)
    decision_notes = models.TextField(blank=True, null=True)
    byelaw_reference = models.CharField(max_length=100, blank=True, null=True, help_text="Mandatory for rejections or limit caps")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('meeting', 'claim')

    def __str__(self):
        return f"Decision for {self.claim.id} in {self.meeting}"


class ClaimAppeal(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('under_review', 'Under Trustee Review'),
        ('resolved', 'Resolved'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, related_name='appeals')
    appealed_by = models.ForeignKey(Member, on_delete=models.CASCADE)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    trustee_decision = models.TextField(blank=True, null=True)
    trustee_notes = models.TextField(blank=True, null=True)
    decided_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appeal for {self.claim.id}"


class ClaimFingerprint(models.Model):
    claim = models.OneToOneField(Claim, on_delete=models.CASCADE, related_name='fingerprint')
    hash_value = models.CharField(max_length=64, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Fingerprint for {self.claim_id}"


class ChronicRequest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='chronic_requests')
    doctor_name = models.CharField(max_length=150)
    medicines = models.JSONField(default=list)  # [{"name":"Metformin", ...}]
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    member_payable = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')
    ])
    created_at = models.DateTimeField(auto_now_add=True)


class ClaimAttachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    claim = models.ForeignKey(Claim, on_delete=models.CASCADE, related_name='attachments')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    file = models.FileField(upload_to='claim_attachments/')
    content_type = models.CharField(max_length=100, blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class PaymentRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    claim = models.OneToOneField(Claim, on_delete=models.CASCADE, related_name='payment_record')
    payment_method = models.CharField(max_length=50, choices=[('mpesa', 'M-Pesa'), ('eft', 'EFT'), ('cheque', 'Cheque')])
    reference_number = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_date = models.DateTimeField(default=timezone.now)
    reconciled = models.BooleanField(default=False)
    reconciled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='payments_reconciled')
    reconciled_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"Payment for {self.claim_id} ({self.reference_number})"

    def clean(self):
        # Segregation of Duties: Reconciler cannot be the final approver
        if self.reconciled and self.reconciled_by:
            # Findwho approved this claim
            approver = self.claim.reviews.filter(action='approved').values_list('reviewer', flat=True).first()
            if approver and str(approver) == str(self.reconciled_by.id):
                 raise ValidationError("Segregation of Duties Violation: The user who approved this claim cannot be the one who reconciles its payment.")
            
            # Reconciler cannot be the claim owner
            if self.claim.member.user == self.reconciled_by:
                raise ValidationError("Segregation of Duties Violation: You cannot reconcile a payment for your own claim.")


