# SGSS Medical Fund Backend (Django REST Framework v1)

## Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # (on Windows: venv\Scripts\activate)
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

Deployment notes:
- Use environment variable DATABASE_URL pointing to your Postgres instance (Supabase or elsewhere).
- If using Supabase for auth, consider syncing auth.users with Django users or use JWT flow.
- Move business logic from SQL triggers to Django model methods or Celery tasks (we ported compute_payable to model method).
- Add tests for constitutional rules: 90-day claim window, 60-day membership waiting period, ceilings and exclusions.

