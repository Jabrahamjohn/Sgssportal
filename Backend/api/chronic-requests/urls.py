# Backend/api/chronic-requests/urls.py
from rest_framework.routers import DefaultRouter
from medical.views import ChronicRequestViewSet

router = DefaultRouter()
router.register(r"", ChronicRequestViewSet, basename="chronic-requests")

urlpatterns = router.urls
