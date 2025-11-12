# Backend/api/members/urls.py
from rest_framework.routers import DefaultRouter
from medical.views import MemberViewSet

router = DefaultRouter()
router.register(r'', MemberViewSet, basename='members')

urlpatterns = router.urls
