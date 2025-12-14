# Generated migration for performance optimization
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('medical', '0007_member_created_at_member_updated_at'),
    ]

    operations = [
        # Index on Claim.status for filtering
        migrations.AddIndex(
            model_name='claim',
            index=models.Index(fields=['status'], name='claim_status_idx'),
        ),
        # Composite index on Claim for common queries (status + created_at)
        migrations.AddIndex(
            model_name='claim',
            index=models.Index(fields=['status', '-created_at'], name='claim_status_date_idx'),
        ),
        # Index on Claim.member for member claims lookup
        migrations.AddIndex(
            model_name='claim',
            index=models.Index(fields=['member'], name='claim_member_idx'),
        ),
        # Index on Member.status for active members queries
        migrations.AddIndex(
            model_name='member',
            index=models.Index(fields=['status'], name='member_status_idx'),
        ),
        # Index on Member.nhif_number for lookups
        migrations.AddIndex(
            model_name='member',
            index=models.Index(fields=['nhif_number'], name='member_nhif_idx'),
        ),
        # Index on AuditLog.created_at for chronological queries
        migrations.AddIndex(
            model_name='auditlog',
            index=models.Index(fields=['-created_at'], name='audit_created_idx'),
        ),
        # Index on Notification.recipient for user notifications
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['recipient'], name='notif_recipient_idx'),
        ),
        # Index on Notification.read for unread filtering
        migrations.AddIndex(
            model_name='notification',
            index=models.Index(fields=['read', '-created_at'], name='notif_read_date_idx'),
        ),
        # Index on ClaimItem.claim for claim items lookup
        migrations.AddIndex(
            model_name='claimitem',
            index=models.Index(fields=['claim'], name='claimitem_claim_idx'),
        ),
    ]
