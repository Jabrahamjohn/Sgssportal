# medical/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Member, MembershipType, Claim, ClaimItem, ClaimReview,
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


class ClaimReviewSerializer(serializers.ModelSerializer):
    reviewer_email = serializers.EmailField(source="reviewer.email", read_only=True)

    class Meta:
        model = ClaimReview
        fields = ["id", "claim", "reviewer", "reviewer_email", "role", "action", "note", "created_at"]
        read_only_fields = ["id", "created_at", "reviewer_email"]


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

    def validate(self, data):
        # Let model.clean() raise detailed ValidationError as needed
        instance = Claim(**{**getattr(self, "initial_data", {}), **data})
        instance.member = data.get("member", getattr(self.instance, "member", None))
        instance.claim_type = data.get("claim_type", getattr(self.instance, "claim_type", None))
        instance.date_of_first_visit = data.get("date_of_first_visit", getattr(self.instance, "date_of_first_visit", None))
        instance.date_of_discharge = data.get("date_of_discharge", getattr(self.instance, "date_of_discharge", None))
        instance.submitted_at = data.get("submitted_at", getattr(self.instance, "submitted_at", None))
        instance.clean()
        return data


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
