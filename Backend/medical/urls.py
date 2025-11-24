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
    # AUTH + USER INFO
    path("auth/me/", views.me, name="me"),
    path("members/me/", views.my_member, name="my-member"),
    path("members/me/benefit_balance/", views.benefit_balance, name="benefit-balance"),

    # DASHBOARD INFO ENDPOINTS
    path("dashboard/member/info/", views.member_dashboard_info, name="member-dashboard-info"),
    path("dashboard/committee/info/", views.committee_dashboard_info, name="committee-dashboard-info"),

    # COMMITTEE CLAIMS
    path("claims/committee/", views.committee_claims),
    path("claims/committee/<uuid:pk>/", views.committee_claim_detail),

    # CLAIM UTILS
    path("claims/bulk_status/", views.bulk_change_status),

    # REPORTS
    path("reports/export/", views.export_claims_csv),

    # ADMIN
    path("dashboard/admin/summary/", views.admin_dashboard_summary, name="admin-dashboard-summary"),
    path("dashboard/admin/audit/", views.audit_all_logs, name="admin-dashboard-audit"),

    # ROUTER ROUTES
    path("", include(router.urls)),
]
