from medical import views as medical_views

urlpatterns = [
    # ... existing viewsets / routers
    path("<uuid:claim_id>/upload_summary/", medical_views.upload_summary_pdf, name="upload-summary-pdf"),
]
