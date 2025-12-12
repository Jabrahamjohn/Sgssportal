# SGSS Medical Fund Portal - Security Guide

## 🔐 Security Overview

This document outlines security best practices, configurations, and guidelines for the SGSS Medical Fund Portal.

## 🎯 Security Principles

1. **Defense in Depth**: Multiple layers of security
2. **Least Privilege**: Minimum required permissions
3. **Secure by Default**: Secure configurations out of the box
4. **Privacy by Design**: Data protection built into the system
5. **Regular Updates**: Keep dependencies current

## 🔒 Authentication & Authorization

### Session-Based Authentication

The portal uses Django's session-based authentication with the following security measures:

**Production Settings (Required):**
```python
# settings.py
SESSION_COOKIE_SECURE = True  # HTTPS only
SESSION_COOKIE_HTTPONLY = True  # Prevent JavaScript access
SESSION_COOKIE_SAMESITE = 'Strict'  # CSRF protection
SESSION_COOKIE_AGE = 3600  # 1 hour (adjust as needed)
```

### CSRF Protection

Cross-Site Request Forgery protection is mandatory:

```python
# settings.py
CSRF_COOKIE_SECURE = True  # Production only
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Strict'
CSRF_TRUSTED_ORIGINS = [
    'https://yourdomain.com',
]
```

**Frontend Implementation:**
```javascript
// Get CSRF token before authenticated requests
await axios.get('/api/auth/csrf/');
// Token automatically sent in subsequent requests via cookie
```

### Role-Based Access Control (RBAC)

Three primary roles with distinct permissions:

| Role | Permissions |
|------|-------------|
| **Member** | View own profile, submit claims, view own claims |
| **Committee** | Review all claims, approve/reject, view reports |
| **Admin** | Full access, manage users, configure settings |

**Custom Permission Implementation:**
```python
from .permissions import IsCommittee, IsSelfOrAdmin

class ClaimViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsClaimOwnerOrCommittee]
```

## 🛡️ Input Validation & Sanitization

### Backend Validation

**Model-Level Validation:**
```python
class Claim(models.Model):
    def clean(self):
        # Validate claim dates
        if self.discharge_date < self.admission_date:
            raise ValidationError("Discharge date must be after admission date")
```

**Serializer Validation:**
```python
class ClaimSerializer(serializers.ModelSerializer):
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive")
        return value
```

### File Upload Security

**Implemented Protections:**

1. **File Type Validation:**
```python
ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png']
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_file(file):
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValidationError(f"File type {ext} not allowed")
    if file.size > MAX_FILE_SIZE:
        raise ValidationError("File too large")
```

2. **Content Type Verification:**
```python
import magic

def verify_file_content(file):
    mime = magic.from_buffer(file.read(1024), mime=True)
    file.seek(0)
    allowed_mimes = ['application/pdf', 'image/jpeg', 'image/png']
    if mime not in allowed_mimes:
        raise ValidationError("Invalid file content")
```

3. **Virus Scanning (Production Recommendation):**
```python
# Use ClamAV or cloud-based scanning service
import clamd

def scan_file(file_path):
    cd = clamd.ClamdUnixSocket()
    scan_result = cd.scan(file_path)
    # Handle result
```

**TODO (Priority: High - Before Production):**
- Timeline: Week 3-4 before production launch
- Implementation: Install ClamAV (`apt install clamav clamav-daemon`) or use VirusTotal API
- Estimated effort: 1-2 days for ClamAV setup, 1 day for API integration
- See FEATURES_ROADMAP.md section 3 for detailed implementation plan

### SQL Injection Prevention

- ✅ Using Django ORM (automatic parameterization)
- ✅ Avoiding raw SQL queries
- ⚠️ When raw SQL is necessary, use parameterized queries:

```python
# ❌ NEVER do this
cursor.execute(f"SELECT * FROM table WHERE id = {user_input}")

# ✅ Always do this
cursor.execute("SELECT * FROM table WHERE id = %s", [user_input])
```

### XSS Prevention

**Backend:**
- ✅ Django template auto-escaping enabled
- ✅ DRF serializers escape output

**Frontend:**
- ✅ React's JSX auto-escapes by default
- ⚠️ Avoid `dangerouslySetInnerHTML`
- ⚠️ Sanitize user input before rendering

```typescript
// Use DOMPurify for HTML sanitization
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(dirty);
```

## 🔑 Secret Management

### Environment Variables

**Never commit secrets to version control:**

```bash
# .gitignore (Backend)
.env
.env.local
.env.*.local
```

**Required Secrets:**
```env
SECRET_KEY=<generated-secret-key>
DATABASE_URL=postgres://user:password@host:port/db
EMAIL_HOST_PASSWORD=<smtp-password>
```

**Production Secret Management:**
- Use environment variables on hosting platform
- Consider AWS Secrets Manager, HashiCorp Vault, or similar
- Rotate secrets regularly

### Password Security

**Django Password Validators:**
```python
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
     'OPTIONS': {'min_length': 12}},  # Increased from default 8
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
```

**Additional Recommendations:**
- Implement password expiration (90 days)
- Require password change on first login
- Prevent password reuse (last 5 passwords)
- Consider multi-factor authentication (MFA)

## 🌐 Network Security

### HTTPS/TLS

**Production Requirements:**
```python
# settings.py
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

### CORS Configuration

**Strict Production CORS:**
```python
CORS_ALLOWED_ORIGINS = [
    "https://portal.sgssmedicalfund.org",
]
CORS_ALLOW_CREDENTIALS = True
```

### Rate Limiting

**DRF Throttling (Implemented):**
```python
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'login': '5/minute',
    }
}
```

**Additional Protection:**
- Consider nginx rate limiting
- Implement account lockout after failed login attempts
- Use CAPTCHA for public endpoints

## 📊 Data Protection

### Personal Data (PII)

**Data Classification:**
- **Highly Sensitive**: NHIF numbers, medical records, bank details
- **Sensitive**: Names, addresses, phone numbers
- **Public**: Membership types, general policies

**Protection Measures:**
1. **Encryption at Rest:**
   - Database encryption (PostgreSQL TDE)
   - Encrypted file storage (S3 with SSE)

2. **Encryption in Transit:**
   - HTTPS/TLS for all connections
   - Secure database connections (SSL)

3. **Access Controls:**
   - Role-based permissions
   - Audit logging of data access
   - Data minimization

### Audit Logging

**Implemented Audit Trail:**
```python
def log_claim_event(claim, event_type, actor, details=None):
    AuditLog.objects.create(
        claim=claim,
        event_type=event_type,
        actor=actor,
        details=details or {},
        timestamp=timezone.now()
    )
```

**Logged Events:**
- ✅ Claim submissions
- ✅ Status changes
- ✅ Reviews and approvals
- ✅ Settings modifications
- ⚠️ TODO: Login/logout events
- ⚠️ TODO: Failed authentication attempts
- ⚠️ TODO: Data exports

## 🚨 Security Monitoring

### Logging

**Django Logging Configuration:**
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': 'security.log',
        },
    },
    'loggers': {
        'django.security': {
            'handlers': ['file'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}
```

**TODO (Priority: Medium - Recommended for Production):**
- Timeline: Before production launch or within first month
- Create GitHub Issue: "Implement comprehensive security logging"
- Estimated effort: 3-5 days
- Acceptance criteria:
  - Security events logged with severity levels
  - Log rotation configured
  - Integration with monitoring system
  - Retention policy implemented (90 days minimum)

### Error Tracking

**Recommended: Sentry Integration**
```bash
pip install sentry-sdk
```

```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-dsn-here",
    environment="production",
    traces_sample_rate=0.1,
)
```

## 🧪 Security Testing

### Regular Security Checks

1. **Dependency Scanning:**
```bash
# Check for known vulnerabilities
pip install safety
safety check

# Frontend dependencies
npm audit
npm audit fix
```

2. **Static Code Analysis:**
```bash
# Python
pip install bandit
bandit -r Backend/

# Frontend
npm install -g snyk
snyk test
```

3. **Penetration Testing:**
   - Schedule regular security audits
   - Test authentication and authorization
   - Check for common OWASP Top 10 vulnerabilities

### Pre-Deployment Checklist

- [ ] All secrets removed from code
- [ ] DEBUG=False in production
- [ ] Secure cookies enabled (SECURE, HTTPONLY, SAMESITE)
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] File upload restrictions in place
- [ ] Database connections encrypted
- [ ] Backups configured
- [ ] Monitoring and alerting set up
- [ ] Security headers configured
- [ ] Error messages don't expose sensitive info

## 🔧 Security Headers

**Recommended Django Middleware Configuration:**

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    # ... other middleware
]

# Security Headers
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
```

**Additional Headers (nginx/server level):**
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()";
```

## 📋 Incident Response

### Security Incident Procedure

1. **Detection**: Monitor logs, alerts, user reports
2. **Containment**: Isolate affected systems
3. **Investigation**: Determine scope and cause
4. **Remediation**: Fix vulnerabilities
5. **Recovery**: Restore normal operations
6. **Post-Incident**: Document and improve

### Contact Information

**Security Issues:**
- Report to: security@sgssmedicalfund.org
- Response time: Within 24 hours

## 🔄 Regular Maintenance

### Monthly Tasks
- [ ] Review access logs
- [ ] Check for suspicious activity
- [ ] Update dependencies
- [ ] Review user permissions

### Quarterly Tasks
- [ ] Security audit
- [ ] Penetration testing
- [ ] Update incident response plan
- [ ] Security training for team

### Annual Tasks
- [ ] Comprehensive security assessment
- [ ] Password rotation policy enforcement
- [ ] Disaster recovery testing
- [ ] Compliance review

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Django Security](https://docs.djangoproject.com/en/stable/topics/security/)
- [DRF Security](https://www.django-rest-framework.org/topics/security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## ⚠️ Known Issues & Mitigations

### Current Limitations

1. **No MFA Implementation**
   - Mitigation: Strong password requirements, rate limiting
   - TODO: Implement TOTP-based MFA

2. **Basic File Upload Validation**
   - Mitigation: Type and size restrictions in place
   - TODO: Add virus scanning, content verification

3. **No Automated Backup Verification**
   - Mitigation: Manual backup testing
   - TODO: Automated backup and restore testing

## 📞 Reporting Security Vulnerabilities

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email security@sgssmedicalfund.org with details
3. Include steps to reproduce
4. Allow reasonable time for response (24-48 hours)

We appreciate responsible disclosure and will acknowledge your contribution.
