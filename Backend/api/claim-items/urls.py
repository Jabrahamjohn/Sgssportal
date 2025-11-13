# Backend/api/claim-items/urls.py
from rest_framework.routers import DefaultRouter
from medical.views import ClaimItemViewSet

router = DefaultRouter()
router.register(r"", ClaimItemViewSet, basename="claim-items")

urlpatterns = router.urls
