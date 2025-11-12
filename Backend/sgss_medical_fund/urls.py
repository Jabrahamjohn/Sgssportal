# Backend/sgss_medical_fund/urls.py
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from medical import views as medical_views
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
import importlib, pkgutil

# ============================================
# Auto-discovery for all api/*/urls.py modules
# ============================================
def load_api_urlpatterns(base_package="api"):
    """
    Dynamically discovers and includes all `urls.py` modules inside api/* directories.
    Example: api/members/urls.py → /api/members/
    """
    patterns = []
    package = importlib.import_module(base_package)
    for _, module_name, is_pkg in pkgutil.iter_modules(package.__path__):
        if is_pkg:
            try:
                urls_module = importlib.import_module(f"{base_package}.{module_name}.urls")
                patterns.append(path(f"api/{module_name}/", include(urls_module)))  # ✅ FIXED
            except ModuleNotFoundError:
                continue
    return patterns


# ============================================
# Swagger/OpenAPI schema
# ============================================
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

# ============================================
# Core URLs
# ============================================
urlpatterns = [
    path('admin/', admin.site.urls),

    # --- Authentication ---
    path("api/auth/login/", medical_views.login_view, name="login"),
    path("api/auth/logout/", medical_views.logout_view, name="logout"),
    path("api/auth/me/", medical_views.me, name="me"),
    path("api/auth/csrf/", medical_views.csrf_cookie),
    path("api/auth/get-csrf-token/", medical_views.get_csrf_token, name="get_csrf-token"),
    path('api/members/', include('api.members.urls')),

    # --- Medical Fund ---
    path('api/claims/committee/', medical_views.committee_claims, name='committee-claims'),
    path('api/claims/committee/<uuid:pk>/', medical_views.committee_claim_detail, name='committee-claim-detail'),


    # --- Swagger / ReDoc ---
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# ============================================
# Automatically load all api/*/urls.py files
# ============================================
urlpatterns += load_api_urlpatterns("api")
