SGSS Medical Fund - Django REST Starter (v1)
This single-file contains a scaffold you can copy into a project folder.


Quick start:
1. Create virtualenv: python -m venv .venv && source .venv/bin/activate
2. Install: pip install -r requirements.txt
3. Create project: django-admin startproject sgss_project .
4. Create app: python manage.py startapp medical
5. Replace files with contents from this scaffold (see sections below).
6. Set DATABASE_URL in .env, then python manage.py migrate && python manage.py runserver


Requirements (requirements.txt):
Django>=4.2
djangorestframework
psycopg2-binary
python-dotenv
django-environ