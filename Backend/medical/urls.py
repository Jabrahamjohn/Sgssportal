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

    # manual committee endpoints
    path("claims/committee/", views.committee_claims),
    path("claims/committee/<uuid:pk>/", views.committee_claim_detail),

    # include router
    path("", include(router.urls)),
]
