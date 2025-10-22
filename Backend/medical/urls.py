# medical/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MemberViewSet, MembershipTypeViewSet,
    ClaimViewSet, ClaimItemViewSet, ClaimReviewViewSet,
    ClaimAttachmentViewSet, ChronicRequestViewSet,
    NotificationViewSet, SettingViewSet, ReimbursementScaleViewSet, me
)

router = DefaultRouter()
router.register(r'memberships', MembershipTypeViewSet, basename='membership-types')
router.register(r'members', MemberViewSet, basename='members')
router.register(r'claims', ClaimViewSet, basename='claims')
router.register(r'claim-items', ClaimItemViewSet, basename='claim-items')
router.register(r'claim-reviews', ClaimReviewViewSet, basename='claim-reviews')
router.register(r'claim-attachments', ClaimAttachmentViewSet, basename='claim-attachments')
router.register(r'chronic-requests', ChronicRequestViewSet, basename='chronic-requests')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'settings', SettingViewSet, basename='settings')
router.register(r'reimbursement-scales', ReimbursementScaleViewSet, basename='reimbursement-scales')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', me, name='me'),
]
