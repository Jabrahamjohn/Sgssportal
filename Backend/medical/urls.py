# medical/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MemberViewSet, ClaimViewSet, ClaimItemViewSet, ClaimReviewViewSet, MembershipTypeViewSet


router = DefaultRouter()
router.register('members', MemberViewSet)
router.register('claims', ClaimViewSet)
router.register('claim-items', ClaimItemViewSet)
router.register('claim-reviews', ClaimReviewViewSet)
router.register('membership-types', MembershipTypeViewSet)


urlpatterns = [path('', include(router.urls))]
