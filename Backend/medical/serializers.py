# medical/serializers.py

from rest_framework import serializers
from .models import Member, Claim, ClaimItem, ClaimReview, MembershipType
from django.forms.models import model_to_dict
from .models import Claim


class MembershipTypeSerializer(serializers.ModelSerializer):
class Meta:
model = MembershipType
fields = '__all__'


class MemberSerializer(serializers.ModelSerializer):
class Meta:
model = Member
fields = ['id','user','membership_type','nhif_number','valid_from','valid_to']


class ClaimItemSerializer(serializers.ModelSerializer):
class Meta:
model = ClaimItem
fields = ['id','claim','category','description','amount','quantity']


class ClaimSerializer(serializers.ModelSerializer):
items = ClaimItemSerializer(many=True, read_only=True)
class Meta:
model = Claim
fields = ['id','member','claim_type','date_of_first_visit','date_of_discharge','total_claimed','total_payable','member_payable','status','notes','items']


class ClaimReviewSerializer(serializers.ModelSerializer):
class Meta:
model = ClaimReview
fields = ['id','claim','reviewer','role','action','note','created_at']


# helper to read scales/settings
from .models import MembershipType
from django.db import connection
from .models import Claim


def get_reimbursement_scales_and_settings():
from django.apps import apps
ReimbursementScale = apps.get_model('medical','ReimbursementScale') if apps.is_installed('medical') else None
# fallback to settings table model; for now we return defaults
scales = [
{'category':'Outpatient','fund_share':80,'member_share':20,'ceiling':50000},
{'category':'Inpatient','fund_share':85,'member_share':15,'ceiling':200000},
{'category':'Chronic','fund_share':60,'member_share':40,'ceiling':120000},
]
settings = {'annual_limit':250000,'fund_share_percent':80,'clinic_outpatient_percent':100}
return scales, settings