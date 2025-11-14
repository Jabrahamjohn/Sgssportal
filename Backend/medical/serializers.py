# Backend/medical/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import (
    Member, MembershipType, Claim, ClaimItem, ClaimReview, AuditLog,
    Notification, ReimbursementScale, Setting, ChronicRequest, ClaimAttachment
)

User = get_user_model()


class MembershipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipType
        fields = ["id", "key", "name", "annual_limit", "fund_share_percent"]


class MemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.get_full_name", read_only=True)
    membership_type = serializers.PrimaryKeyRelatedField(queryset=MembershipType.objects.all(), allow_null=True)

    class Meta:
        model = Member
        fields = [
            "id", "user", "user_email", "user_full_name",
            "membership_type", "nhif_number", "valid_from", "valid_to"
        ]
        read_only_fields = ["id", "user_email", "user_full_name"]


class ClaimItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClaimItem
        fields = ["id", "claim", "category", "description", "amount", "quantity"]
        read_only_fields = ["id"]


# medical/serializers.py
class ClaimReviewSerializer(serializers.ModelSerializer):
    reviewer = serializers.SerializerMethodField()
    role = serializers.CharField(source="reviewer.groups.first.name", read_only=True)

    def get_reviewer(self, obj):
        if not obj.reviewer:
            return None
        return {
            "id": obj.reviewer.id,
            "username": obj.reviewer.username,
            "name": f"{obj.reviewer.first_name} {obj.reviewer.last_name}".strip() or obj.reviewer.username,
        }

    class Meta:
        model = ClaimReview
        fields = ["id", "role", "action", "note", "created_at", "reviewer"]


class ClaimAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_email = serializers.EmailField(source="uploaded_by.email", read_only=True)

    class Meta:
        model = ClaimAttachment
        fields = ["id", "claim", "uploaded_by", "uploaded_by_email", "file", "content_type", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at", "uploaded_by_email"]


# -------------------------------
# CLEAN + LAW-COMPLIANT CLAIM SERIALIZER
# -------------------------------

class ClaimSerializer(serializers.ModelSerializer):
    items = ClaimItemSerializer(many=True, read_only=True)
    attachments = ClaimAttachmentSerializer(many=True, read_only=True)
    member_user_email = serializers.EmailField(source="member.user.email", read_only=True)

    # frontend will send:
    # {
    #   claim_type: "outpatient",
    #   details: {...},
    #   status: "submitted"
    # }

    details = serializers.DictField(write_only=True, required=False)

    class Meta:
        model = Claim
        fields = [
            "id", "member", "member_user_email",
            "claim_type", "details",
            "date_of_first_visit", "date_of_discharge",
            "total_claimed", "total_payable", "member_payable",
            "status", "submitted_at", "notes",
            "excluded", "override_amount", "nhif_number", "other_insurance",
            "created_at", "items", "attachments"
        ]
        read_only_fields = [
            "id", "member", "member_user_email",
            "total_claimed", "total_payable", "member_payable",
            "created_at", "submitted_at"
        ]

    # ---------------------------
    # CREATE CLAIM (MAIN LOGIC)
    # ---------------------------
    def create(self, validated_data):
        request = self.context["request"]

        # attach logged-in member
        member = Member.objects.get(user=request.user)
        validated_data["member"] = member

        # extract "details"
        details = validated_data.pop("details", {}) or {}

        claim_type = validated_data.get("claim_type")

        # Map fields based on claim type
        if claim_type == "outpatient":
            validated_data["date_of_first_visit"] = details.get("date_of_first_visit")
            validated_data["notes"] = details.get("diagnosis") or "Outpatient treatment"

        elif claim_type == "inpatient":
            validated_data["date_of_discharge"] = details.get("date_of_discharge")
            validated_data["notes"] = details.get("hospital_name") or "Inpatient treatment"

        elif claim_type == "chronic":
            validated_data["notes"] = "Chronic medication request"

        # Set submitted_at automatically
        if validated_data.get("status") == "submitted":
            validated_data["submitted_at"] = timezone.now()

        # Create the claim
        claim = super().create(validated_data)

        return claim
    
    def validate(self, attrs):
        """
        Run full byelaw validation by constructing a temporary Claim instance
        and calling its .clean() before saving.
        This enforces:
          - 60 day waiting period (Member.is_active_for_claims)
          - 90 day submission window (Outpatient/Inpatient)
        """
        from django.core.exceptions import ValidationError as DjangoValidationError

        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return attrs

        # Logged in member (required for any claim)
        try:
            member = Member.objects.get(user=request.user)
        except Member.DoesNotExist:
            raise serializers.ValidationError({"detail": "Member profile not found for this user."})

        details = attrs.get("details") or {}
        claim_type = attrs.get("claim_type") or getattr(self.instance, "claim_type", None)
        status = attrs.get("status") or getattr(self.instance, "status", "draft")

        # Build a temporary Claim instance with the values that will be used
        if self.instance is not None:
            # updating
            candidate = self.instance
        else:
            candidate = Claim(member=member)

        candidate.claim_type = claim_type

        # Dates (mirror create() logic)
        if claim_type == "outpatient":
            candidate.date_of_first_visit = (
                details.get("date_of_first_visit")
                or candidate.date_of_first_visit
            )
        elif claim_type == "inpatient":
            candidate.date_of_discharge = (
                details.get("date_of_discharge")
                or candidate.date_of_discharge
            )

        # Submitted_at: if status will be submitted, we assume it is submitted now
        if status == "submitted":
            candidate.submitted_at = candidate.submitted_at or timezone.now()
        else:
            candidate.submitted_at = candidate.submitted_at  # leave as is

        candidate.status = status

        # 🔍 Now run model-level validation
        try:
            candidate.clean()
        except DjangoValidationError as e:
            # Convert Django ValidationError to DRF ValidationError
            raise serializers.ValidationError(e.message_dict if hasattr(e, "message_dict") else e.messages)

        return attrs

    def clean(self):
        from django.core.exceptions import ValidationError
        today = timezone.now().date()
        claim_t = (self.claim_type or '').lower()

        # Ensure submitted_at exists if status is submitted/approved/etc
        if self.status in ["submitted", "reviewed", "approved", "rejected", "paid"] and not self.submitted_at:
            self.submitted_at = timezone.now()

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

    # ---------------------------
    # UPDATE (rarely used by members)
    # ---------------------------
    def update(self, instance, validated_data):
        return super().update(instance, validated_data)


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "recipient", "title", "message", "link", "type", "read", "actor", "metadata", "created_at"]
        read_only_fields = ["id", "created_at"]


class ReimbursementScaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReimbursementScale
        fields = ["id", "category", "fund_share", "member_share", "ceiling", "updated_at"]
        read_only_fields = ["id", "updated_at"]


class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = ["id", "key", "value", "updated_at"]
        read_only_fields = ["id", "updated_at"]


class ChronicRequestSerializer(serializers.ModelSerializer):
    member_user_email = serializers.EmailField(source="member.user.email", read_only=True)

    class Meta:
        model = ChronicRequest
        fields = [
            "id", "member", "member_user_email",
            "doctor_name", "medicines",
            "total_amount", "member_payable",
            "status", "created_at"
        ]
        read_only_fields = ["id", "created_at", "member_user_email"]


class AuditLogSerializer(serializers.ModelSerializer):
    reviewer = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ["id", "action", "meta", "created_at", "reviewer", "role"]

    def get_reviewer(self, obj):
        if not obj.actor:
            return None
        return {
            "id": obj.actor.id,
            "username": obj.actor.username,
            "email": obj.actor.email,
            "name": f"{obj.actor.first_name} {obj.actor.last_name}".strip() or obj.actor.username,
        }

    def get_role(self, obj):
        if not obj.actor:
            return obj.meta.get("role")
        # First group name or fallback
        try:
            return obj.actor.groups.values_list("name", flat=True).first() or ("admin" if obj.actor.is_superuser else "member")
        except Exception:
            return "member"
