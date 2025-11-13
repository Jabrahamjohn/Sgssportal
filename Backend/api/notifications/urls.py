# Backend/api/notifications/urls.py
from rest_framework.routers import DefaultRouter
from medical.views import NotificationViewSet

router = DefaultRouter()
router.register(r"", NotificationViewSet, basename="notifications")

urlpatterns = router.urls
