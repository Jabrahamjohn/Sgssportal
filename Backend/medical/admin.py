# medical/admin.py
from django.contrib import admin
from .models import (
    Setting, MembershipType, Member, ReimbursementScale,
    Claim, ClaimItem, ClaimReview, Notification, AuditLog
)

@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ('key', 'updated_at')
    search_fields = ('key',)

@admin.register(MembershipType)
class MembershipTypeAdmin(admin.ModelAdmin):
    list_display = ('key', 'name', 'annual_limit', 'fund_share_percent')

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ('user', 'membership_type', 'nhif_number', 'valid_from', 'valid_to')
    search_fields = ('user__email', 'nhif_number')

class ClaimItemInline(admin.TabularInline):
    model = ClaimItem
    extra = 0

@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = ('id', 'member', 'claim_type', 'status', 'total_claimed', 'total_payable', 'created_at')
    list_filter = ('status', 'claim_type')
    search_fields = ('member__user__email',)
    inlines = [ClaimItemInline]

@admin.register(ClaimReview)
class ClaimReviewAdmin(admin.ModelAdmin):
    list_display = ('claim', 'reviewer', 'action', 'created_at')
    list_filter = ('action',)

@admin.register(ReimbursementScale)
class ReimbursementScaleAdmin(admin.ModelAdmin):
    list_display = ('category', 'fund_share', 'member_share', 'ceiling', 'updated_at')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('recipient', 'title', 'type', 'read', 'created_at')
    list_filter = ('type', 'read')

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'actor', 'created_at')
    search_fields = ('action',)
