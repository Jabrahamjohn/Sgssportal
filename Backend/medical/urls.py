from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
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
    path('auth/me/', views.me),
    path('members/me/', views.my_member),  # ✅ fixed name
    path('', include(router.urls)),
]
