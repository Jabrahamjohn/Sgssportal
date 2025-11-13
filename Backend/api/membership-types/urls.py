# Backend/api/membership-types/urls.py
from rest_framework.routers import DefaultRouter
from medical.views import MembershipTypeViewSet

router = DefaultRouter()
router.register(r"", MembershipTypeViewSet, basename="membership-types")

urlpatterns = router.urls
