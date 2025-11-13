# Backend/api/claims/urls.py
from django.urls import path
from rest_framework.routers import DefaultRouter
from medical.views import (
    ClaimViewSet,
    committee_claims,
    committee_claim_detail,
    set_claim_status,
    upload_summary_pdf,
)

router = DefaultRouter()
router.register(r"", ClaimViewSet, basename="claims")

urlpatterns = [
    # Committee views
    path("committee/", committee_claims, name="committee-claims"),
    path("committee/<uuid:pk>/", committee_claim_detail, name="committee-claim-detail"),

    # Claim actions
    path("<uuid:claim_id>/set_status/", set_claim_status, name="set-claim-status"),
    path("<uuid:claim_id>/upload_summary/", upload_summary_pdf, name="upload-summary-pdf"),
]

urlpatterns += router.urls
