# admin.py

from django.contrib import admin
from .models import Member, MembershipType, Claim, ClaimItem, ClaimReview


@admin.register(MembershipType)
class MembershipTypeAdmin(admin.ModelAdmin):
list_display = ('key','name','annual_limit')


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
list_display = ('id','user','membership_type','valid_from','valid_to')


class ClaimItemInline(admin.TabularInline):
model = ClaimItem
extra = 0


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
list_display = ('id','member','claim_type','total_claimed','total_payable','status','created_at')
inlines = [ClaimItemInline]


@admin.register(ClaimReview)
class ClaimReviewAdmin(admin.ModelAdmin):
list_display = ('id','claim','reviewer','action','created_at')