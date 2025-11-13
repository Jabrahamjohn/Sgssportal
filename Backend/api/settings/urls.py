# Backend/api/settings/urls.py
from rest_framework.routers import DefaultRouter
from medical.views import SettingViewSet, ReimbursementScaleViewSet

router = DefaultRouter()
router.register(r"", SettingViewSet, basename="settings")
router.register(r"reimbursements", ReimbursementScaleViewSet, basename="reimbursements")

urlpatterns = router.urls
