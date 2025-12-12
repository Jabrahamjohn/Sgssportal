# SGSS Medical Fund Portal - Features Roadmap

## 📋 Overview

This document outlines the recommended features and enhancements for the SGSS Medical Fund Portal to achieve production-grade status and provide a comprehensive claims management system.

## 🎯 Current Status

### ✅ Implemented Features

**Core Functionality:**
- [x] User authentication (session-based)
- [x] Role-based access control (Member, Committee, Admin)
- [x] Member management (registration, status tracking)
- [x] Membership types configuration
- [x] Claims submission (Outpatient, Inpatient, Chronic)
- [x] Claim items management
- [x] Claim review workflow
- [x] File attachments (receipts, documents)
- [x] Basic audit logging
- [x] Notifications system
- [x] Reimbursement scale configuration
- [x] Annual benefit limits enforcement
- [x] NHIF integration fields
- [x] Chronic illness requests
- [x] Member dependents management

**Technical Foundation:**
- [x] Django REST Framework API
- [x] React/TypeScript frontend with Vite
- [x] PostgreSQL database
- [x] CORS and CSRF protection
- [x] API documentation (Swagger/ReDoc)
- [x] Docker Compose setup
- [x] CI/CD (GitHub Actions for backend)
- [x] Health check endpoint

## 🚀 High-Priority Features (Production Essentials)

### 1. Background Job Processing (Critical)

**Why:** Notifications, emails, and reports should run asynchronously to avoid blocking API requests.

**Implementation:**
```bash
# Install Celery with Redis
pip install celery redis
```

**Features:**
- Async email sending
- Scheduled notifications
- Periodic report generation
- Claim auto-processing jobs
- Database cleanup tasks

**Timeline:** 2-3 weeks

---

### 2. Email/SMS Notification System (Critical)

**Current State:** In-app notifications only  
**Needed:** External communication channels

**Implementation:**
- **Email:** SendGrid, AWS SES, or Mailgun
- **SMS:** Twilio, Africa's Talking, or SMS Gateway

**Notifications to Send:**
- Claim submission confirmation
- Claim status updates (approved/rejected/paid)
- Payment notifications
- Membership expiry reminders
- Password reset emails
- Weekly claim summaries for committee

**Configuration:**
```python
# settings.py
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = env('EMAIL_HOST')
EMAIL_PORT = env.int('EMAIL_PORT', 587)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = env('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL')
```

**Timeline:** 1-2 weeks

---

### 3. File Upload Security Enhancements (High Priority)

**Current State:** Basic file type and size validation  
**Needed:** Comprehensive security

**Features to Add:**
- [x] File size limits (implemented: need to enforce)
- [x] File extension validation (implemented)
- [ ] MIME type verification (content-based)
- [ ] Virus/malware scanning (ClamAV or cloud service)
- [ ] Image sanitization (strip EXIF, re-encode)
- [ ] PDF validation and sanitization
- [ ] Presigned upload URLs
- [ ] Automatic file compression

**Recommended Services:**
- **Virus Scanning:** ClamAV (self-hosted) or VirusTotal API
- **Storage:** AWS S3 with presigned URLs

**Timeline:** 2 weeks

---

### 4. Reporting & Export Functionality (High Priority)

**Why:** Committee and admin need reports for decision-making and compliance.

**Reports Needed:**
- Claim status report (by period, by type)
- Payment summary (monthly, quarterly, annual)
- Member statistics (active, lapsed, pending)
- Utilization report (by member, by category)
- Financial summary (budget vs. actual)
- Audit trail report

**Export Formats:**
- CSV (for Excel/analysis)
- PDF (for printing/archiving)
- JSON (for integration)

**Implementation:**
```python
# Install libraries
pip install reportlab pandas openpyxl

# Or use existing library
from django.http import HttpResponse
import csv

def export_claims_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="claims.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['ID', 'Member', 'Type', 'Amount', 'Status', 'Date'])
    
    claims = Claim.objects.select_related('member__user').all()
    for claim in claims:
        writer.writerow([
            claim.id, claim.member.user.get_full_name(),
            claim.claim_type, claim.total_claimed,
            claim.status, claim.created_at
        ])
    
    return response
```

**Timeline:** 2-3 weeks

---

### 5. Enhanced Audit Logging (Medium Priority)

**Current State:** Claim-related events logged  
**Needed:** Comprehensive audit trail

**Events to Log:**
- [x] Claim submissions
- [x] Claim status changes
- [x] Reviews and approvals
- [x] Settings modifications
- [ ] User login/logout
- [ ] Failed authentication attempts
- [ ] Permission changes
- [ ] Data exports
- [ ] File downloads
- [ ] Search queries (for sensitive data)
- [ ] Bulk operations

**Implementation:**
```python
class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=100)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=100)
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['action', '-timestamp']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]
```

**Timeline:** 1 week

---

## 💡 Important Features (Value-Adding)

### 6. Multi-Factor Authentication (MFA)

**Why:** Enhanced security for sensitive medical and financial data

**Implementation:**
- TOTP-based (Google Authenticator, Authy)
- SMS-based (backup method)
- Email-based (backup method)

**Libraries:**
```bash
pip install django-otp qrcode
```

**Timeline:** 1-2 weeks

---

### 7. Advanced Search & Filtering

**Current State:** Basic filtering exists  
**Needed:** Powerful search capabilities

**Features:**
- Full-text search on claims (description, notes)
- Advanced filters (date ranges, amounts, multiple statuses)
- Saved searches
- Search history
- Export search results

**Implementation Options:**
- PostgreSQL full-text search
- Elasticsearch (for larger datasets)
- Django Q objects for complex queries

**Timeline:** 1-2 weeks

---

### 8. Dashboard Analytics

**Why:** Visual insights for decision-making

**Dashboards Needed:**

**Member Dashboard:**
- Claims summary (submitted, approved, paid)
- Benefit utilization chart
- Remaining balance gauge
- Recent notifications
- Document repository

**Committee Dashboard:**
- Pending claims count
- Claims by status (pie chart)
- Monthly claim trends (line chart)
- Top claimants
- Average processing time

**Admin Dashboard:**
- Total members by status
- Financial overview (income vs. expenses)
- System health metrics
- User activity
- Storage usage

**Implementation:**
```bash
npm install recharts chart.js react-chartjs-2
```

**Timeline:** 2-3 weeks

---

### 9. Payment Integration

**Why:** Streamline payment processing

**Features:**
- Record payment details
- Payment batch processing
- Payment reconciliation
- Payment history
- Payment receipts (auto-generated)

**Integration Options:**
- M-Pesa API (for Kenya)
- Bank API integration
- Manual payment recording

**Timeline:** 3-4 weeks

---

### 10. Document Management System

**Why:** Organized storage and retrieval of documents

**Features:**
- Document categorization
- Version control
- Document templates
- Bulk upload
- Document search
- Secure sharing (time-limited links)
- Document preview

**Timeline:** 2-3 weeks

---

## 🔧 Technical Enhancements

### 11. Caching Strategy

**Why:** Improve performance and reduce database load

**What to Cache:**
- Member benefit balances
- Reimbursement scales
- System settings
- User permissions
- Static content

**Implementation:**
```bash
pip install django-redis
```

```python
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://localhost:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

**Timeline:** 1 week

---

### 12. Error Monitoring & Logging

**Why:** Proactive issue detection and debugging

**Tools:**
- Sentry (error tracking)
- Prometheus + Grafana (metrics)
- ELK Stack (log aggregation)

**Implementation:**
```bash
pip install sentry-sdk
```

**Timeline:** 1 week

---

### 13. API Rate Limiting & Security

**Current State:** Basic DRF throttling implemented  
**Enhancements:**
- Per-endpoint custom limits
- Account lockout after failed attempts
- CAPTCHA for public endpoints
- API key authentication for integrations
- Webhook support

**Timeline:** 1 week

---

### 14. Data Backup & Disaster Recovery

**Why:** Prevent data loss

**Features:**
- Automated daily database backups
- Media file backups
- Backup verification
- Point-in-time recovery
- Backup retention policy
- Disaster recovery testing

**Implementation:**
```bash
# PostgreSQL backup script
pg_dump -U postgres -Fc sgss_medical_fund > backup_$(date +%Y%m%d).dump

# S3 upload
aws s3 cp backup_*.dump s3://sgss-backups/
```

**Timeline:** 1 week

---

## 🌟 Nice-to-Have Features

### 15. Mobile Application

**Why:** Better user experience for members

**Options:**
- React Native (cross-platform)
- Flutter (cross-platform)
- Progressive Web App (PWA)

**Timeline:** 8-12 weeks

---

### 16. WhatsApp Integration

**Why:** Popular communication channel in Kenya

**Features:**
- Claim status notifications
- Quick claim submissions
- Chatbot for FAQs
- Document upload via WhatsApp

**Implementation:** WhatsApp Business API

**Timeline:** 3-4 weeks

---

### 17. AI/ML Features

**Why:** Automate and improve decision-making

**Potential Features:**
- Fraud detection (anomaly detection)
- Claim amount prediction
- Document OCR (extract data from receipts)
- Chatbot for member support
- Predictive analytics (forecast claims)

**Timeline:** 8-12 weeks (research phase included)

---

### 18. Member Portal Enhancements

**Features:**
- Family member management (add dependents)
- Chronic medication tracker
- Appointment scheduling
- Health tips and articles
- Community forum
- Feedback system

**Timeline:** 4-6 weeks

---

### 19. Committee Workflow Automation

**Features:**
- Auto-assign claims to reviewers
- Review deadline tracking
- Escalation for overdue reviews
- Bulk approval/rejection
- Review templates
- Collaboration tools (comments, mentions)

**Timeline:** 2-3 weeks

---

### 20. Compliance & Privacy

**Features:**
- GDPR/Data Protection compliance
- Data anonymization for reports
- Right to be forgotten (data deletion)
- Consent management
- Privacy policy acknowledgment
- Data export for users

**Timeline:** 2-3 weeks

---

## 📅 Recommended Implementation Timeline

### Phase 1 (Immediate - 4 weeks)
- [x] Critical security fixes (COMPLETED)
- [ ] Background job processing (Celery)
- [ ] Email/SMS notifications
- [ ] File upload security enhancements

### Phase 2 (Months 2-3)
- [ ] Reporting & export functionality
- [ ] Enhanced audit logging
- [ ] Payment integration
- [ ] Caching strategy

### Phase 3 (Months 3-4)
- [ ] Advanced search & filtering
- [ ] Dashboard analytics
- [ ] Multi-factor authentication
- [ ] Document management system

### Phase 4 (Months 4-6)
- [ ] Error monitoring setup
- [ ] Data backup automation
- [ ] Committee workflow automation
- [ ] Compliance features

### Phase 5 (Months 6+)
- [ ] Mobile application
- [ ] WhatsApp integration
- [ ] AI/ML features
- [ ] Advanced member portal features

---

## 💰 Estimated Resource Requirements

### Development Team
- 1-2 Backend Developers (Django/Python)
- 1 Frontend Developer (React/TypeScript)
- 1 DevOps Engineer (part-time)
- 1 QA Tester
- 1 Project Manager (part-time)

### Infrastructure Costs (Monthly Estimates)
- **Hosting:** $50-200 (VPS or cloud)
- **Database:** $20-100 (managed PostgreSQL)
- **Storage:** $10-50 (S3 or equivalent)
- **Email/SMS:** $20-100 (usage-based)
- **Monitoring:** $0-50 (free tier or paid)
- **Backups:** $10-30
- **Domain/SSL:** $5-10

**Total:** ~$115-540/month depending on scale

---

## 📊 Success Metrics

### Technical Metrics
- API response time < 200ms (p95)
- Uptime > 99.5%
- Zero critical security vulnerabilities
- Test coverage > 80%
- Page load time < 2s

### Business Metrics
- Claim processing time < 7 days
- User satisfaction > 4/5
- System adoption rate > 80%
- Error rate < 0.1%
- Support tickets < 5/week

---

## 🤝 Contributing

To contribute to this roadmap:
1. Review the proposed features
2. Provide feedback on priorities
3. Suggest additional features
4. Volunteer for implementation

## 📝 Notes

- All timelines are estimates for a single developer
- Priorities may change based on user feedback
- Some features can be developed in parallel
- Regular review and adjustment of roadmap recommended

---

**Last Updated:** 2025-12-12  
**Next Review:** 2026-01-12
