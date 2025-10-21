# medical/serializers.py
from rest_framework import serializers
from .models import MembershipType, Member, Claim
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class MembershipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipType
        fields = ['id', 'key', 'name', 'annual_limit', 'fund_share_percent']


class MemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    membership_type = MembershipTypeSerializer(read_only=True)

    class Meta:
        model = Member
        fields = [
            'id',
            'user',
            'membership_type',
            'nhif_number',
            'valid_from',
            'valid_to',
        ]


class ClaimSerializer(serializers.ModelSerializer):
    member = MemberSerializer(read_only=True)

    class Meta:
        model = Claim
        fields = [
            'id',
            'member',
            'claim_type',
            'date_of_first_visit',
            'date_of_discharge',
            'total_claimed',
            'total_payable',
            'member_payable',
            'status',
            'notes',
            'excluded',
            'nhif_number',
            'other_insurance',
            'created_at',
        ]
