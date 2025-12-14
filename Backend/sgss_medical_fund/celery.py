# Backend/sgss_medical_fund/celery.py
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sgss_medical_fund.settings')
app = Celery('sgss_medical_fund')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# Backend/medical/tasks.py
from celery import shared_task
from django.core.mail import send_mail

@shared_task
def send_claim_notification(claim_id, recipient_email):
    # Send email notification
    send_mail(
        subject=f'Claim #{claim_id} Status Update',
        message='Your claim has been updated...',
        from_email='noreply@sgssmedicalfund.org',
        recipient_list=[recipient_email],
    )