from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

# Swagger imports
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="SGSS Medical Fund API",
        default_version='v1',
        description=(
            "Full REST API for the SGSS Medical Fund System.\n\n"
            "Includes membership, claims, reimbursements, notifications, and chronic illness management "
            "as defined in the 2024 Bylaws and 2015 Constitution."
        ),
        terms_of_service="https://sgss-mombasa.org/terms/",
        contact=openapi.Contact(email="support@sgss-mombasa.org"),
        license=openapi.License(name="Private Internal Use Only"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('medical.auth_urls')),
    path('api/', include('medical.urls')),

    # --- Swagger / ReDoc documentation ---
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
