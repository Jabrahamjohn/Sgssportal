# Backend/api/reports/urls.py
from rest_framework.routers import DefaultRouter
from medical.views import ReportViewSet

router = DefaultRouter()
router.register(r"", ReportViewSet, basename="reports")

urlpatterns = router.urls
