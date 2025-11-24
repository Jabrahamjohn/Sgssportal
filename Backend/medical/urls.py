# Backend/medical/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# --- AUTO REST ROUTES ---
router.register(r'memberships', views.MembershipTypeViewSet, basename='membership-types')
router.register(r'members', views.MemberViewSet, basename='members')
router.register(r'claims', views.ClaimViewSet, basename='claims')
router.register(r'claim-items', views.ClaimItemViewSet, basename='claim-items')
router.register(r'claim-reviews', views.ClaimReviewViewSet, basename='claim-reviews')
router.register(r'claim-attachments', views.ClaimAttachmentViewSet, basename='claim-attachments')
router.register(r'chronic-requests', views.ChronicRequestViewSet, basename='chronic-requests')
router.register(r'notifications', views.NotificationViewSet, basename='notifications')
router.register(r'settings', views.SettingViewSet, basename='settings')
router.register(r'reimbursement-scales', views.ReimbursementScaleViewSet, basename='reimbursement-scales')

urlpatterns = [
    # user/member info  
    path("auth/me/", views.me, name="me"),
    path("members/me/", views.my_member, name="my-member"),
    path("members/me/benefit_balance/", views.benefit_balance, name="benefit-balance"),

    # ✅ fixed typos
    path("dashboard/member/info/", views.member_dashboard_info, name="member-dashboard-info"),
    path("dashboard/committee/info/", views.committee_dashboard_info, name="committee-dashboard-info"),

    # committee endpoints
    path("claims/committee/", views.committee_claims),
    path("claims/committee/<uuid:pk>/", views.committee_claim_detail),
    path("committee/claims/", views.committee_claims),

    path("notifications/mark-read/", views.mark_notifications_read),
    path("claims/<uuid:claim_id>/upload_summary/", views.upload_summary_pdf),

    path("reports/export/", views.export_claims_csv),
    path("claims/bulk_status/", views.bulk_change_status),

    # ✅ new admin summary endpoint
    path("dashboard/admin/summary/", views.admin_dashboard_summary, name="admin-dashboard-summary"),
    path("dashboard/admin/audit/", views.audit_all_logs, name="admin-dashboard-audit"),

    # include router
    path("", include(router.urls)),
]
