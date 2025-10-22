# SGSS Medical Fund Backend — Django REST Framework

A Django REST Framework backend for the SGSS Medical Fund Portal, providing REST APIs for member management, claims processing, reimbursement calculations, and administrative functions.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Business Logic & Calculations](#business-logic--calculations)
- [Authentication & Permissions](#authentication--permissions)
- [Testing](#testing)
- [Deployment](#deployment)
- [Migration from Supabase](#migration-from-supabase)
- [Troubleshooting](#troubleshooting)

---

## Overview

This Django backend serves as an alternative/complement to the Supabase backend for the SGSS Portal. It implements:

- RESTful APIs for all core entities (Members, Claims, Membership Types, etc.)
- Business logic ported from PostgreSQL triggers/functions to Python
- Role-based access control
- Automated reimbursement calculations
- Constitutional rules enforcement (waiting periods, submission windows, exclusions)
- Admin panel for data management
- API documentation via DRF Spectacular

---

## Features

### Core Functionality

- **Member Management**: CRUD operations for members with NHIF validation
- **Claims Processing**: Multi-stage workflow (draft → submitted → reviewed → approved/rejected)
- **Claim Items**: Line-item tracking with automatic totals calculation
- **Attachments**: File upload and management for receipts/documents
- **Reimbursement Calculation**: Automated fund/member share computation
- **Claim Reviews**: Committee and admin review workflow
- **Chronic Requests**: Separate workflow for chronic illness benefits

### Administrative Features

- **Membership Types**: Configurable membership tiers with annual limits
- **Reimbursement Scales**: Category-based fund/member share configuration
- **Settings**: Key-value store for general limits and procedure tiers
- **Audit Logging**: Complete activity trail
- **Notifications**: In-app notification system
- **Reports**: Financial and operational reporting

### Constitutional Enforcement

- **Waiting Period**: 60-day waiting period after membership start
- **Submission Window**: 90-day window from visit/discharge date
- **Annual Limits**: Per-membership annual caps enforcement
- **Exclusions**: Auto-flagging of excluded procedures (cosmetic, transport, etc.)
- **Discretionary Override**: Committee override with Ksh 150,000 cap

---

## Tech Stack

- **Framework**: Django 4.2+ with Django REST Framework 3.14+
- **Database**: PostgreSQL 14+ (compatible with Supabase)
- **Authentication**: Django Token Authentication / JWT (dj-rest-auth)
- **API Documentation**: drf-spectacular (OpenAPI/Swagger)
- **File Storage**: Django Storage / S3-compatible (Supabase Storage)
- **Task Queue**: Celery (optional, for async processing)
- **CORS**: django-cors-headers
- **Environment**: python-decouple for config management

---

## Project Structure

```
backend/
├── sgss_backend/                 # Main project package
│   ├── settings.py              # Django settings
│   ├── urls.py                  # Root URL configuration
│   ├── wsgi.py / asgi.py        # WSGI/ASGI applications
│   └── celery.py                # Celery configuration (optional)
│
├── api/                         # Main API application
│   ├── models.py                # Database models
│   ├── serializers.py           # DRF serializers
│   ├── views.py                 # API views/viewsets
│   ├── urls.py                  # API URL routing
│   ├── permissions.py           # Custom permissions
│   ├── filters.py               # Query filters
│   ├── pagination.py            # Custom pagination
│   └── utils/
│       ├── calculations.py      # Reimbursement logic
│       ├── validators.py        # Business rule validators
│       └── notifications.py     # Notification helpers
│
├── authentication/              # Auth application (optional)
│   ├── models.py                # User extensions
│   ├── serializers.py           # Auth serializers
│   ├── views.py                 # Login/registration views
│   └── backends.py              # Custom auth backends
│
├── reports/                     # Reporting application (optional)
│   ├── views.py                 # Report generation
│   └── generators.py            # PDF/Excel generators
│
├── tests/                       # Test suite
│   ├── test_models.py
│   ├── test_views.py
│   ├── test_calculations.py
│   └── test_permissions.py
│
├── manage.py                    # Django management script
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

---

## Setup & Installation

### Prerequisites

- Python 3.10+
- PostgreSQL 14+ (or Supabase connection)
- pip (latest version)
- virtualenv or venv

### 1. Clone Repository

```bash
git clone https://github.com/Jabrahamjohn/Sgssportal.git
cd Sgssportal/backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL/Supabase)
DATABASE_URL=postgresql://user:password@host:port/dbname
# or individual settings:
DB_NAME=sgss_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=db.xxx.supabase.co
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Supabase (if using for storage/auth)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key

# Email (for notifications)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@example.com
EMAIL_HOST_PASSWORD=your-app-password

# Storage (optional, for S3/Supabase)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=sgss-attachments
AWS_S3_ENDPOINT_URL=https://xxx.supabase.co/storage/v1/s3

# Celery (optional)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

### 5. Database Setup

```bash
# Run migrations
python manage.py migrate

# Create superuser (admin access)
python manage.py createsuperuser

# (Optional) Load initial data
python manage.py loaddata fixtures/initial_data.json
```

### 6. Run Development Server

```bash
python manage.py runserver
```

API available at: `http://127.0.0.1:8000/api/`  
Admin panel: `http://127.0.0.1:8000/admin/`  
API docs: `http://127.0.0.1:8000/api/schema/swagger-ui/`

---

## Configuration

### Key Settings (settings.py)

```python
# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# CORS
CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS')
CORS_ALLOW_CREDENTIALS = True

# File Upload
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB
ALLOWED_UPLOAD_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png']

# Business Rules
WAITING_PERIOD_DAYS = 60
SUBMISSION_WINDOW_DAYS = 90
DISCRETIONARY_OVERRIDE_LIMIT = 150000  # Ksh
```

---

## Database Models

### Core Models

#### User

```python
class User(AbstractUser):
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    phone_number = models.CharField(max_length=15, blank=True)
    # ... extends Django's AbstractUser
```

#### Member

```python
class Member(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    membership_type = models.ForeignKey(MembershipType, on_delete=models.PROTECT)
    nhif_number = models.CharField(max_length=50, unique=True)
    photo = models.ImageField(upload_to='members/photos/')
    valid_from = models.DateField()
    valid_to = models.DateField()
    no_claim_discount_percent = models.DecimalField(max_digits=5, decimal_places=2)
    # ...

    def compute_claim_payable(self, claim):
        """Reimbursement calculation (ported from SQL)"""
        # Implementation in utils/calculations.py
```

#### Claim

```python
class Claim(models.Model):
    CLAIM_TYPES = [
        ('Outpatient', 'Outpatient'),
        ('Inpatient', 'Inpatient'),
        ('Chronic', 'Chronic'),
    ]
    STATUSES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    member = models.ForeignKey(Member, on_delete=models.CASCADE)
    claim_type = models.CharField(max_length=20, choices=CLAIM_TYPES)
    status = models.CharField(max_length=20, choices=STATUSES, default='draft')
    visit_date = models.DateField()
    discharge_date = models.DateField(null=True, blank=True)
    total_claimed = models.DecimalField(max_digits=10, decimal_places=2)
    total_payable = models.DecimalField(max_digits=10, decimal_places=2)
    member_payable = models.DecimalField(max_digits=10, decimal_places=2)
    # ...

    def save(self, *args, **kwargs):
        # Auto-compute totals
        self.calculate_totals()
        super().save(*args, **kwargs)

    def calculate_totals(self):
        """Compute total_claimed, total_payable, member_payable"""
        # Implementation in model method
```

#### ClaimItem

```python
class ClaimItem(models.Model):
    claim = models.ForeignKey(Claim, related_name='items', on_delete=models.CASCADE)
    category = models.CharField(max_length=50)
    description = models.TextField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)
    retail_price = models.DecimalField(max_digits=10, decimal_places=2)
    # ...
```

#### ClaimReview

```python
class ClaimReview(models.Model):
    claim = models.ForeignKey(Claim, related_name='reviews', on_delete=models.CASCADE)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20)  # committee, admin
    action = models.CharField(max_length=20)  # reviewed, approved, rejected
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

#### MembershipType

```python
class MembershipType(models.Model):
    key = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    annual_limit = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
```

#### ReimbursementScale

```python
class ReimbursementScale(models.Model):
    category = models.CharField(max_length=50, unique=True)
    fund_share = models.DecimalField(max_digits=5, decimal_places=2)  # percentage
    member_share = models.DecimalField(max_digits=5, decimal_places=2)
    ceiling = models.DecimalField(max_digits=10, decimal_places=2)
```

#### Settings

```python
class Settings(models.Model):
    key = models.CharField(max_length=100, unique=True)
    value = models.JSONField()
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
```

---

## API Endpoints

### Authentication

```
POST   /api/auth/login/           # Login (returns token)
POST   /api/auth/logout/          # Logout
POST   /api/auth/register/        # User registration
GET    /api/auth/profile/         # Get current user profile
PUT    /api/auth/profile/         # Update profile
```

### Members

```
GET    /api/members/              # List all members (admin)
POST   /api/members/              # Create member
GET    /api/members/{id}/         # Get member details
PUT    /api/members/{id}/         # Update member
DELETE /api/members/{id}/         # Delete member
GET    /api/members/me/           # Get current user's member profile
```

### Claims

```
GET    /api/claims/               # List claims (filtered by user role)
POST   /api/claims/               # Create claim
GET    /api/claims/{id}/          # Get claim details
PUT    /api/claims/{id}/          # Update claim
DELETE /api/claims/{id}/          # Delete claim (draft only)
POST   /api/claims/{id}/submit/   # Submit claim for review
POST   /api/claims/{id}/review/   # Add review (committee/admin)
POST   /api/claims/{id}/approve/  # Approve claim
POST   /api/claims/{id}/reject/   # Reject claim
GET    /api/claims/stats/         # Claim statistics
```

### Claim Items

```
GET    /api/claims/{claim_id}/items/     # List claim items
POST   /api/claims/{claim_id}/items/     # Add item
PUT    /api/claims/{claim_id}/items/{id}/    # Update item
DELETE /api/claims/{claim_id}/items/{id}/    # Delete item
```

### Attachments

```
GET    /api/claims/{claim_id}/attachments/   # List attachments
POST   /api/claims/{claim_id}/attachments/   # Upload attachment
DELETE /api/attachments/{id}/                # Delete attachment
```

### Membership Types

```
GET    /api/membership-types/     # List membership types
POST   /api/membership-types/     # Create type (admin)
PUT    /api/membership-types/{id}/    # Update type (admin)
DELETE /api/membership-types/{id}/    # Delete type (admin)
```

### Reimbursement Scales

```
GET    /api/reimbursement-scales/     # List scales
POST   /api/reimbursement-scales/     # Create scale (admin)
PUT    /api/reimbursement-scales/{id}/    # Update scale (admin)
DELETE /api/reimbursement-scales/{id}/    # Delete scale (admin)
```

### Settings

```
GET    /api/settings/            # Get all settings
GET    /api/settings/{key}/      # Get specific setting
PUT    /api/settings/{key}/      # Update setting (admin)
```

### Reports

```
GET    /api/reports/claims/              # Claims report
GET    /api/reports/financial/           # Financial summary
GET    /api/reports/members/             # Member statistics
GET    /api/reports/claims/{id}/pdf/     # Download claim PDF
```

### Chronic Requests

```
GET    /api/chronic-requests/            # List chronic requests
POST   /api/chronic-requests/            # Create request
GET    /api/chronic-requests/{id}/       # Get request details
PUT    /api/chronic-requests/{id}/       # Update request
POST   /api/chronic-requests/{id}/approve/   # Approve request
```

---

## Business Logic & Calculations

### Reimbursement Calculation (compute_claim_payable)

Located in `api/utils/calculations.py`:

```python
def compute_claim_payable(claim):
    """
    Calculate fund_share, member_payable for a claim
    Ported from PostgreSQL function compute_claim_payable()
    """
    # 1. Get membership annual limit
    member = claim.member
    annual_limit = member.membership_type.annual_limit

    # 2. Calculate year-to-date spending
    year_start = date(claim.visit_date.year, 1, 1)
    ytd_total = Claim.objects.filter(
        member=member,
        visit_date__gte=year_start,
        status='approved'
    ).exclude(id=claim.id).aggregate(Sum('total_payable'))['total_payable__sum'] or 0

    # 3. Calculate item-level reimbursements
    total_fund_share = Decimal('0.00')
    total_member_payable = Decimal('0.00')

    for item in claim.items.all():
        # Get reimbursement scale for category
        try:
            scale = ReimbursementScale.objects.get(category=item.category)
            fund_percent = scale.fund_share / 100
            ceiling = scale.ceiling
        except ReimbursementScale.DoesNotExist:
            # Fallback to general limits
            settings = Settings.objects.get(key='general_limits')
            fund_percent = settings.value.get('default_fund_share', 80) / 100
            ceiling = Decimal('999999.00')

        # Calculate amounts
        item_total = item.amount * item.quantity
        fund_amount = min(item_total * fund_percent, ceiling)

        # Apply clinic 100% rule (Outpatient at Siri Guru Nanak Clinic)
        if (claim.claim_type == 'Outpatient' and
            'Siri Guru Nanak Clinic' in (claim.notes or '')):
            fund_amount = item_total

        total_fund_share += fund_amount
        total_member_payable += (item_total - fund_amount)

    # 4. Adjust for NHIF/insurance
    if claim.nhif_amount:
        total_fund_share -= claim.nhif_amount

    # 5. Check annual limit
    if ytd_total + total_fund_share > annual_limit:
        total_fund_share = max(annual_limit - ytd_total, 0)
        total_member_payable = claim.total_claimed - total_fund_share

    # 6. Apply exclusions
    if claim.is_excluded:
        total_fund_share = Decimal('0.00')
        total_member_payable = claim.total_claimed

    # 7. Update claim
    claim.total_payable = total_fund_share
    claim.member_payable = total_member_payable
    claim.save(update_fields=['total_payable', 'member_payable'])

    return claim
```

### Constitutional Rules Validation

Located in `api/utils/validators.py`:

```python
def validate_submission_window(claim):
    """90-day submission window from visit/discharge"""
    reference_date = claim.discharge_date or claim.visit_date
    days_elapsed = (date.today() - reference_date).days

    if days_elapsed > SUBMISSION_WINDOW_DAYS:
        raise ValidationError(
            f"Claim must be submitted within {SUBMISSION_WINDOW_DAYS} days. "
            f"{days_elapsed} days have elapsed."
        )

def validate_membership_active(member, claim_date):
    """60-day waiting period + membership validity"""
    # Check waiting period
    days_since_start = (claim_date - member.valid_from).days
    if days_since_start < WAITING_PERIOD_DAYS:
        raise ValidationError(
            f"Membership has {WAITING_PERIOD_DAYS}-day waiting period. "
            f"Only {days_since_start} days have elapsed."
        )

    # Check validity
    if not (member.valid_from <= claim_date <= member.valid_to):
        raise ValidationError("Membership not valid on claim date.")

def check_exclusions(claim):
    """Auto-flag excluded procedures"""
    excluded_keywords = [
        'cosmetic', 'beauty', 'aesthetic',
        'transport', 'ambulance',
        'mortuary', 'funeral',
        'infertility', 'ivf'
    ]

    notes_lower = (claim.notes or '').lower()

    for item in claim.items.all():
        desc_lower = item.description.lower()
        if any(keyword in desc_lower or keyword in notes_lower
               for keyword in excluded_keywords):
            claim.is_excluded = True
            claim.exclusion_reason = "Contains excluded procedure"
            claim.save()
            return

def apply_discretionary_override(claim, override_amount, actor):
    """Committee discretionary override (max Ksh 150,000)"""
    if override_amount > DISCRETIONARY_OVERRIDE_LIMIT:
        raise ValidationError(
            f"Discretionary override cannot exceed Ksh {DISCRETIONARY_OVERRIDE_LIMIT:,.2f}"
        )

    claim.discretionary_override = override_amount
    claim.override_by = actor
    claim.override_at = timezone.now()
    claim.save()

    # Recalculate with override
    compute_claim_payable(claim)
```

---

## Authentication & Permissions

### Custom Permissions (api/permissions.py)

```python
class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow owners to access their own data, admins to access all"""
    def has_object_permission(self, request, view, obj):
        if request.user.role in ['admin', 'trustee']:
            return True
        return obj.user == request.user

class IsCommitteeOrAdmin(permissions.BasePermission):
    """Committee and admin can review claims"""
    def has_permission(self, request, view):
        return request.user.role in ['committee', 'admin', 'trustee']

class IsAdminOnly(permissions.BasePermission):
    """Admin-only operations"""
    def has_permission(self, request, view):
        return request.user.role == 'admin'
```

### Role-Based Access

| Role          | Permissions                                       |
| ------------- | ------------------------------------------------- |
| **member**    | Own member profile, own claims, submit claims     |
| **committee** | View all claims, add reviews, recommend approval  |
| **admin**     | Full CRUD on all resources, approve/reject claims |
| **trustee**   | View-only access to all data, financial reports   |

---

## Testing

### Run Tests

```bash
# All tests
python manage.py test

# Specific app
python manage.py test api

# With coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report
```

### Test Structure

```python
# tests/test_calculations.py
class ReimbursementCalculationTests(TestCase):
    def setUp(self):
        # Create test data
        self.member = Member.objects.create(...)
        self.claim = Claim.objects.create(...)

    def test_basic_reimbursement(self):
        """Test standard 80% fund share"""
        # ...

    def test_annual_limit_enforcement(self):
        """Test annual cap is respected"""
        # ...

    def test_clinic_100_percent_rule(self):
        """Test Siri Guru Nanak Clinic 100% coverage"""
        # ...

    def test_exclusion_flagging(self):
        """Test auto-flagging of excluded procedures"""
        # ...

# tests/test_permissions.py
class PermissionsTests(TestCase):
    def test_member_can_view_own_claims(self):
        # ...

    def test_member_cannot_view_others_claims(self):
        # ...

    def test_committee_can_review_claims(self):
        # ...
```

---

## Deployment

### Production Checklist

1. **Environment Variables**

```bash
DEBUG=False
SECRET_KEY=<strong-random-key>
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=postgresql://user:pass@host/db
CORS_ALLOWED_ORIGINS=https://your-frontend.com
```

2. **Static Files**

```bash
python manage.py collectstatic --noinput
```

3. **Migrations**

```bash
python manage.py migrate --noinput
```

4. **Create Superuser**

```bash
python manage.py createsuperuser --noinput \
    --username admin \
    --email admin@example.com
```

### Deployment Options

#### Heroku

```bash
# Install Heroku CLI
heroku create sgss-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

#### Railway

```bash
# railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -r requirements.txt"
  },
  "deploy": {
    "startCommand": "gunicorn sgss_backend.wsgi:application",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

#### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "sgss_backend.wsgi:application"]
```

#### DigitalOcean App Platform

```yaml
# .do/app.yaml
name: sgss-backend
services:
  - name: web
    github:
      repo: Jabrahamjohn/Sgssportal
      branch: main
      deploy_on_push: true
    source_dir: /backend
    environment_slug: python
    run_command: gunicorn sgss_backend.wsgi:application
    http_port: 8000
databases:
  - name: sgss-db
    engine: PG
    version: "14"
```

### Production Server (Gunicorn + Nginx)

**Gunicorn config (gunicorn.conf.py)**

```python
bind = "0.0.0.0:8000"
workers = 3
timeout = 120
accesslog = "-"
errorlog = "-"
loglevel = "info"
```

**Nginx config**

```nginx
server {
    listen 80;
    server_name api.sgssportal.com;

    location /static/ {
        alias /var/www/sgss-backend/static/;
    }

    location /media/ {
        alias /var/www/sgss-backend/media/;
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Migration from Supabase

### Database Schema Sync

- Django models mirror Supabase tables
- Use `DATABASE_URL` pointing to Supabase Postgres instance
- Keep both systems in sync during transition

### Business Logic Migration

```
Supabase (PostgreSQL)          →    Django
========================              ======
compute_claim_payable()        →    Member.compute_claim_payable()
trigger_compute_claim_payable  →    Claim.save() override
recalc_claim_total_on_items    →    ClaimItem.save() signal
handle_new_user()              →    User post_save signal
notify_on_claim_event()        →    Notification service
log_audit_event()              →    AuditLog middleware
fn_check_submission_window()   →    validators.validate_submission_window()
fn_check_membership_active()   →    validators.validate_membership_active()
fn_autoflag_exclusions()       →    validators.check_exclusions()
```

### Authentication Sync

- **Option 1**: Use Supabase JWT verification in Django
- **Option 2**: Sync `auth.users` to Django `User` model via webhook
- **Option 3**: Use Django auth exclusively

### Storage Migration

- Keep using Supabase Storage via S3-compatible API
- Or migrate to Django's file storage (local/S3)

---

## Troubleshooting

### Common Issues

**"relation does not exist" error**

```bash
# Ensure migrations are applied
python manage.py migrate
python manage.py showmigrations
```

**CORS errors from frontend**

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
]
CORS_ALLOW_CREDENTIALS = True
```

**File upload fails**

```python
# Check max upload size
DATA_UPLOAD_MAX_MEMORY_SIZE = 5242880  # 5MB

# Check media URL and root
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

**Calculation discrepancies**

```python
# Enable detailed logging
LOGGING = {
    'version': 1,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'loggers': {
        'api.utils.calculations': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

**Performance issues**

```python
# Add indexes to models
class Claim(models.Model):
    # ...
    class Meta:
        indexes = [
            models.Index(fields=['member', 'status']),
            models.Index(fields=['visit_date']),
        ]

# Use select_related and prefetch_related
claims = Claim.objects.select_related('member__membership_type').prefetch_related('items', 'reviews')
```

---

## API Documentation

Access interactive API docs at:

- Swagger UI: `http://localhost:8000/api/schema/swagger-ui/`
- ReDoc: `http://localhost:8000/api/schema/redoc/`
- OpenAPI Schema: `http://localhost:8000/api/schema/`

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/backend-feature`
3. Write tests for new functionality
4. Ensure all tests pass: `python manage.py test`
5. Update documentation
6. Submit Pull Request

---

## License

MIT License - see LICENSE file

---

## Support

- Backend Issues: https://github.com/Jabrahamjohn/Sgssportal/issues
- Email: backend-support@sgssportal.com

---

**Version**: 1.0.0  
**Last Updated**: October 2024  
**Django Version**: 4.2+  
**DRF Version**: 3.14+
