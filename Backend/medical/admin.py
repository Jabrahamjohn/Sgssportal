# medical/admin.py
from django.contrib import admin
from .models import (
    Member, MembershipType, Claim, ClaimItem, ClaimReview,
    Notification, ReimbursementScale, Setting, ChronicRequest, ClaimAttachment
)

@admin.register(MembershipType)
class MembershipTypeAdmin(admin.ModelAdmin):
    list_display = ("key", "name", "annual_limit", "fund_share_percent")
    search_fields = ("key", "name")

@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "membership_type", "nhif_number", "valid_from", "valid_to")
    search_fields = ("user__email", "nhif_number")

class ClaimItemInline(admin.TabularInline):
    model = ClaimItem
    extra = 0

class ClaimAttachmentInline(admin.TabularInline):
    model = ClaimAttachment
    extra = 0

@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    inlines = [ClaimItemInline, ClaimAttachmentInline]
    list_display = ("id", "member", "claim_type", "status", "total_claimed", "total_payable", "created_at")
    list_filter = ("status", "claim_type")
    search_fields = ("id", "member__user__email", "notes")

@admin.register(ClaimReview)
class ClaimReviewAdmin(admin.ModelAdmin):
    list_display = ("id", "claim", "reviewer", "action", "created_at")
    list_filter = ("action",)
    search_fields = ("claim__id", "reviewer__email")

@admin.register(ClaimAttachment)
class ClaimAttachmentAdmin(admin.ModelAdmin):
    list_display = ("id", "claim", "uploaded_by", "file", "uploaded_at")
    search_fields = ("claim__id", "uploaded_by__email")

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "recipient", "title", "type", "read", "created_at")
    list_filter = ("type", "read")
    search_fields = ("recipient__email", "title")

@admin.register(ReimbursementScale)
class ReimbursementScaleAdmin(admin.ModelAdmin):
    list_display = ("category", "fund_share", "member_share", "ceiling", "updated_at")
    search_fields = ("category",)

@admin.register(Setting)
class SettingAdmin(admin.ModelAdmin):
    list_display = ("key", "updated_at")
    search_fields = ("key",)

@admin.register(ChronicRequest)
class ChronicRequestAdmin(admin.ModelAdmin):
    list_display = ("id", "member", "doctor_name", "total_amount", "member_payable", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("member__user__email", "doctor_name")
