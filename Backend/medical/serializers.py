# Backend/medical/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, date
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

    # -----------------------
    # SAFE DATE PARSER
    # -----------------------
    def _parse_date(self, val):
        if not val:
            return None
        if isinstance(val, date):
            return val
        try:
            return datetime.fromisoformat(val).date()
        except Exception:
            return None

    # -----------------------
    # CREATE CLAIM
    # -----------------------
    def create(self, validated_data):
        request = self.context["request"]
        member = Member.objects.get(user=request.user)
        validated_data["member"] = member

        details = validated_data.pop("details", {}) or {}
        claim_type = validated_data.get("claim_type")

        if claim_type == "outpatient":
            validated_data["date_of_first_visit"] = self._parse_date(
                details.get("date_of_first_visit")
            )
            validated_data["notes"] = details.get("diagnosis") or "Outpatient treatment"

        elif claim_type == "inpatient":
            validated_data["date_of_discharge"] = self._parse_date(
                details.get("date_of_discharge")
            )
            validated_data["notes"] = details.get("hospital_name") or "Inpatient treatment"

        elif claim_type == "chronic":
            validated_data["notes"] = "Chronic medication request"

        # Auto-submission timestamp
        if validated_data.get("status") == "submitted":
            validated_data["submitted_at"] = timezone.now()

        return super().create(validated_data)

    # -----------------------
    # VALIDATION (BYELAWS)
    # -----------------------
    def validate(self, attrs):
        from django.core.exceptions import ValidationError as DjangoValidationError

        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return attrs

        try:
            member = Member.objects.get(user=request.user)
        except Member.DoesNotExist:
            raise serializers.ValidationError({"detail": "Member profile not found."})

        details = attrs.get("details") or {}
        claim_type = attrs.get("claim_type") or getattr(self.instance, "claim_type", None)
        status = attrs.get("status") or getattr(self.instance, "status", "draft")

        # Build temporary claim
        candidate = self.instance or Claim(member=member)
        candidate.claim_type = claim_type

        # Set dates safely
        if claim_type == "outpatient":
            candidate.date_of_first_visit = self._parse_date(
                details.get("date_of_first_visit")
            ) or candidate.date_of_first_visit

        elif claim_type == "inpatient":
            candidate.date_of_discharge = self._parse_date(
                details.get("date_of_discharge")
            ) or candidate.date_of_discharge

        # Submitted timestamp
        if status == "submitted" and not candidate.submitted_at:
            candidate.submitted_at = timezone.now()

        candidate.status = status

        # Run model clean()
        try:
            candidate.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(
                e.message_dict if hasattr(e, "message_dict") else e.messages
            )

        return attrs



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
