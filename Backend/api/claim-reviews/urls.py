# Backend/api/claim-reviews/urls.py
from rest_framework.routers import DefaultRouter
from medical.views import ClaimReviewViewSet

router = DefaultRouter()
router.register(r"", ClaimReviewViewSet, basename="claim-reviews")

urlpatterns = router.urls
