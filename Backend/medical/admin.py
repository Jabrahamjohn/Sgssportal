from django.contrib import admin
from .models import MembershipType, Member, Claim


@admin.register(MembershipType)
class MembershipTypeAdmin(admin.ModelAdmin):
    list_display = ('key', 'name', 'annual_limit', 'fund_share_percent')


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'membership_type', 'nhif_number', 'valid_from', 'valid_to')
    search_fields = ('user__email', 'nhif_number')


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ('member', 'claim_type', 'status', 'total_claimed', 'total_payable', 'created_at')
    list_filter = ('status', 'claim_type')
    search_fields = ('member__user__email',)
