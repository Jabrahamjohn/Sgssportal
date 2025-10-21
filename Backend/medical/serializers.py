# medical/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Setting, MembershipType, Member, ReimbursementScale,
    Claim, ClaimItem, ClaimReview, Notification
)

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_superuser']


class SettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Setting
        fields = ['id', 'key', 'value', 'updated_at']


class MembershipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipType
        fields = ['id', 'key', 'name', 'annual_limit', 'fund_share_percent']


class MemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    membership_type = MembershipTypeSerializer(read_only=True)
    membership_type_id = serializers.PrimaryKeyRelatedField(
        source='membership_type', queryset=MembershipType.objects.all(), write_only=True, required=False
    )

    class Meta:
        model = Member
        fields = [
            'id', 'user', 'membership_type', 'membership_type_id',
            'nhif_number', 'valid_from', 'valid_to'
        ]


class ReimbursementScaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReimbursementScale
        fields = ['id', 'category', 'fund_share', 'member_share', 'ceiling', 'updated_at']


class ClaimItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClaimItem
        fields = ['id', 'claim', 'category', 'description', 'amount', 'quantity']


class ClaimSerializer(serializers.ModelSerializer):
    items = ClaimItemSerializer(many=True, read_only=True)

    class Meta:
        model = Claim
        fields = [
            'id', 'member', 'claim_type', 'date_of_first_visit', 'date_of_discharge',
            'total_claimed', 'total_payable', 'member_payable', 'status',
            'submitted_at', 'notes', 'excluded', 'override_amount',
            'nhif_number', 'other_insurance', 'created_at', 'items'
        ]


class ClaimReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClaimReview
        fields = ['id', 'claim', 'reviewer', 'role', 'action', 'note', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    recipient = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'title', 'message', 'link', 'type', 'read', 'actor', 'metadata', 'created_at']
