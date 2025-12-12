# SGSS Medical Fund Portal - Development Guide

## 🚀 Quick Start

### Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+
- Git

### Initial Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/Jabrahamjohn/Sgssportal.git
cd Sgssportal
```

#### 2. Backend Setup

```bash
# Navigate to backend
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp ../.env.example .env

# Edit .env with your settings
# Important: Generate a secure SECRET_KEY
# You can use: python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Create database (PostgreSQL)
createdb sgss_medical_fund

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create initial groups and permissions
python manage.py shell << EOF
from django.contrib.auth.models import Group
Group.objects.get_or_create(name='Committee')
Group.objects.get_or_create(name='Admin')
Group.objects.get_or_create(name='Member')
EOF

# Run development server
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`
API documentation (Swagger): `http://localhost:8000/swagger/`

#### 3. Frontend Setup

```bash
# Open new terminal
cd Frontend

# Install dependencies
npm install

# Copy environment variables (if needed)
# Create .env.local with:
# VITE_API_URL=http://localhost:8000/api/

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Using Docker Compose (Alternative)

```bash
# From project root
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

## 🧪 Testing

### Backend Tests

```bash
cd Backend
source venv/bin/activate

# Run all tests
python manage.py test

# Run specific test file
python manage.py test medical.tests.test_models

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generates htmlcov/index.html
```

### Frontend Tests

```bash
cd Frontend

# Run tests (when implemented)
npm test

# Run linting
npm run lint
```

## 🔧 Development Tools

### Pre-commit Hooks

Install pre-commit hooks to automatically check code quality:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Run manually on all files
pre-commit run --all-files
```

### Code Formatting

**Backend (Python):**
```bash
# Format with Black
black Backend/

# Sort imports with isort
isort Backend/

# Lint with Ruff
ruff check Backend/ --fix
```

**Frontend (TypeScript/JavaScript):**
```bash
cd Frontend

# Lint
npm run lint

# Format (if Prettier is configured)
npx prettier --write src/
```

## 📊 Database Management

### Migrations

```bash
# Create new migration after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Rollback to specific migration
python manage.py migrate medical 0001
```

### Database Backup and Restore

```bash
# Backup
pg_dump sgss_medical_fund > backup.sql

# Restore
psql sgss_medical_fund < backup.sql
```

## 🔐 Security Considerations

### Development vs Production Settings

**Development (.env):**
```env
DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production
CSRF_COOKIE_SECURE=False
SESSION_COOKIE_SECURE=False
```

**Production (.env):**
```env
DEBUG=False
SECRET_KEY=<long-random-secure-key>
CSRF_COOKIE_SECURE=True
SESSION_COOKIE_SECURE=True
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com
```

### Generating Secure Secret Key

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## 🐛 Debugging

### Backend Debugging

**Using Django Debug Toolbar:**
```bash
pip install django-debug-toolbar
# Add to INSTALLED_APPS and configure in settings.py
```

**Using pdb:**
```python
import pdb; pdb.set_trace()  # Add breakpoint in code
```

**Check logs:**
```bash
tail -f Backend/*.log
```

### Frontend Debugging

**React DevTools:**
- Install React DevTools browser extension
- Open browser DevTools → React tab

**Network Debugging:**
- Open browser DevTools → Network tab
- Monitor API requests/responses

## 🌐 API Testing

### Using cURL

```bash
# Get CSRF token
curl -X GET http://localhost:8000/api/auth/csrf/ -c cookies.txt

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -b cookies.txt -c cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Get current user
curl -X GET http://localhost:8000/api/auth/me/ \
  -b cookies.txt
```

### Using Postman/Insomnia

1. Import the Swagger JSON: `http://localhost:8000/swagger.json`
2. Configure authentication (session cookies)
3. Test endpoints

## 📁 Project Structure

```
Sgssportal/
├── Backend/
│   ├── medical/              # Main Django app
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API views
│   │   ├── serializers.py    # DRF serializers
│   │   ├── permissions.py    # Custom permissions
│   │   ├── urls.py           # URL routing
│   │   └── tests/            # Test files
│   ├── sgss_medical_fund/    # Django project settings
│   │   ├── settings.py       # Configuration
│   │   └── urls.py           # Main URL routing
│   ├── manage.py             # Django management
│   └── requirements.txt      # Python dependencies
├── Frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── store/            # State management
│   │   ├── config/           # Configuration
│   │   └── utils/            # Utility functions
│   ├── package.json          # Node dependencies
│   └── vite.config.ts        # Vite configuration
├── .env.example              # Environment template
├── docker-compose.yml        # Docker setup
└── README.md                 # Project overview
```

## 🚀 Deployment

### Backend Deployment Checklist

- [ ] Set `DEBUG=False`
- [ ] Configure secure `SECRET_KEY`
- [ ] Set `ALLOWED_HOSTS`
- [ ] Enable `CSRF_COOKIE_SECURE=True`
- [ ] Enable `SESSION_COOKIE_SECURE=True`
- [ ] Configure production database
- [ ] Set up static file serving
- [ ] Configure media file storage (S3 recommended)
- [ ] Set up SSL/TLS certificates
- [ ] Configure email backend
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy

### Frontend Deployment

**Build for production:**
```bash
cd Frontend
npm run build
# Output in dist/ directory
```

**Deploy to:**
- Netlify: Connect GitHub repo, set build command
- Vercel: Similar to Netlify
- Static hosting: Upload dist/ contents

## 🔍 Common Issues

### Issue: Database connection error
**Solution:** Check DATABASE_URL in .env, ensure PostgreSQL is running

### Issue: CORS errors in browser
**Solution:** Verify CORS_ALLOWED_ORIGINS includes your frontend URL

### Issue: CSRF token missing
**Solution:** Call `/api/auth/csrf/` before making authenticated requests

### Issue: Port already in use
**Solution:**
```bash
# Find process using port 8000
lsof -i :8000
# Kill process
kill -9 <PID>
```

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linters
4. Commit with descriptive messages
5. Push and create Pull Request

## 📝 Notes

- Always activate virtual environment before working on backend
- Keep dependencies updated regularly
- Follow existing code style and patterns
- Document new features and changes
- Write tests for new functionality
