# medical/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MemberViewSet, ClaimViewSet, MembershipTypeViewSet

router = DefaultRouter()
router.register(r'members', MemberViewSet)
router.register(r'claims', ClaimViewSet)
router.register(r'membership-types', MembershipTypeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
