# medical/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SettingViewSet, MembershipTypeViewSet, MemberViewSet, ReimbursementScaleViewSet,
    ClaimViewSet, ClaimItemViewSet, ClaimReviewViewSet, NotificationViewSet
)

router = DefaultRouter()
router.register('settings', SettingViewSet, basename='settings')
router.register('membership-types', MembershipTypeViewSet, basename='membership-types')
router.register('members', MemberViewSet, basename='members')
router.register('reimbursement-scales', ReimbursementScaleViewSet, basename='reimbursement-scales')
router.register('claims', ClaimViewSet, basename='claims')
router.register('claim-items', ClaimItemViewSet, basename='claim-items')
router.register('claim-reviews', ClaimReviewViewSet, basename='claim-reviews')
router.register('notifications', NotificationViewSet, basename='notifications')

urlpatterns = [path('', include(router.urls))]
