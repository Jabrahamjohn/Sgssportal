# Backend/api/members/urls.py
from rest_framework.routers import DefaultRouter
from django.urls import path
from medical.views import (
    MemberViewSet,
    my_member,
    benefit_balance,
)

router = DefaultRouter()
router.register(r"", MemberViewSet, basename="members")

urlpatterns = [
    path("me/", my_member, name="my-member"),
    path("me/benefit_balance/", benefit_balance, name="benefit-balance"),
]

urlpatterns += router.urls
