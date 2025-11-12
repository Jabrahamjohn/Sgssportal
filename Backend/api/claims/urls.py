# Backend/api/claims/urls.py
from rest_framework.routers import DefaultRouter
from medical.views import ClaimViewSet

router = DefaultRouter()
router.register(r'', ClaimViewSet, basename='claims')

urlpatterns = router.urls
