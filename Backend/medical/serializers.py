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


class ClaimSerializer(serializers.ModelSerializer):
    items = ClaimItemSerializer(many=True, read_only=True)
    attachments = ClaimAttachmentSerializer(many=True, read_only=True)
    member_user_email = serializers.EmailField(source="member.user.email", read_only=True)

    class Meta:
        model = Claim
        fields = [
            "id", "member", "member_user_email",
            "claim_type", "date_of_first_visit", "date_of_discharge",
            "total_claimed", "total_payable", "member_payable",
            "status", "submitted_at", "notes",
            "excluded", "override_amount", "nhif_number", "other_insurance",
            "created_at", "items", "attachments"
        ]
        read_only_fields = ["id", "total_claimed", "total_payable", "member_payable", "created_at"]

    def create(self, validated_data):
        """Map frontend 'details' JSON into real model fields automatically."""
        request = self.context["request"]

        # attach logged-in member
        validated_data["member"] = Member.objects.get(user=request.user)

        details = self.initial_data.get("details", {})
        claim_type = validated_data.get("claim_type")

        # OUTPATIENT
        if claim_type == "outpatient":
            validated_data["notes"] = details.get("diagnosis")
            validated_data["date_of_first_visit"] = details.get(
                "date_of_first_visit"
            ) or timezone.now().date()

        # INPATIENT
        elif claim_type == "inpatient":
            validated_data["notes"] = details.get("hospital_name")
            validated_data["date_of_discharge"] = details.get(
                "date_of_discharge"
            ) or timezone.now().date()

        # CHRONIC
        elif claim_type == "chronic":
            validated_data["notes"] = "Chronic illness claim"
            validated_data["date_of_first_visit"] = timezone.now().date()

        # all new claims start as submitted
        validated_data["status"] = "submitted"
        validated_data["submitted_at"] = timezone.now()

        return super().create(validated_data)



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
