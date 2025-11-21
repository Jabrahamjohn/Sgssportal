# Backend/sgss_medical_fund/urls.py

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from medical import views as medical_views
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="SGSS Medical Fund API",
        default_version='v1',
        description="SGSS Medical Fund API",
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # --- AUTH ---
    path("api/auth/login/", medical_views.login_view),
    path("api/auth/logout/", medical_views.logout_view),
    path("api/auth/me/", medical_views.me),
    path("api/auth/csrf/", medical_views.csrf_cookie),
    

    # --- MEDICAL API ROOT ---
    path("api/", include("medical.urls")),

    # --- DOCS ---
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0)),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0)),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0)),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
