# SGSS Portal — Audit Report

Date: 2025-12-12
Repository: Sgssportal

## Executive summary

This document captures the findings from a repository review of the SGSS Medical Fund portal (Django REST backend + React/Vite frontend). The project has a clear architecture and good documentation of intended workflows. However, several high-priority security and configuration issues must be addressed before production deployment. There are also missing operational and product features typical for a claims portal that should be implemented.

## Files and areas inspected
- `README.md` (root) — architecture & workflows
- `Backend/requirements.txt` — pinned Python deps
- `Backend/sgss_medical_fund/settings.py` — Django configuration
- `Backend/manage.py` — entrypoint
- `Backend/api/` — app submodules (listed)
- `Backend/medical/` — Django app (models, serializers, views, permissions)
- `Frontend/package.json` and `Frontend/README.md`
- `Frontend/src/` — React + TS structure

## High-priority findings (must fix before production)
1. Secrets committed / fallback secret key
   - `SECRET_KEY` appears in `settings.py` as a fallback constant. Never commit secrets.
   - Action: Remove hard-coded value, require `SECRET_KEY` from environment, add `.env.example`, and ensure `.env` is in `.gitignore`.

2. Broken/unsafe default `DATABASE_URL`
   - The default contains `@` characters in the password: `postgres://postgres:km@3108j@localhost:5432/Sgss_medical_fund` which will break parsing.
   - Action: Use a placeholder default or separate DB env vars (DB_HOST, DB_USER, DB_PASS, DB_NAME). Document how to set a safe `DATABASE_URL` (URL-encode special characters).

3. CSRF / CORS / cookie security for production
   - `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` include port `3000` but the frontend dev server runs on `5173` by default; this will cause dev friction.
   - `CSRF_COOKIE_SECURE` and `SESSION_COOKIE_SECURE` are set to `False` (fine for dev only). Ensure production flips these to `True`.
   - Action: Make dev vs production configurations explicit (e.g., via `DEBUG` env), add `5173` for local dev, and require secure cookies in production.

4. Authentication mismatch and accidental omission
   - `djangorestframework_simplejwt` is present in `requirements.txt` but JWT config is commented out in `settings.py`. Current default uses session authentication.
   - Action: Choose a single auth approach and implement it consistently. For SPA + API consider JWT with secure HTTP-only cookies or keep session auth but ensure CSRF flows are correct.

5. `AUTH_USER_MODEL` appears incorrect
   - `AUTH_USER_MODEL = 'auth.user'` is likely wrong (Django default is `auth.User`). If no custom user model exists, remove this setting.
   - Action: Fix or implement a proper custom user model if intended, update migrations.

## Medium-priority issues and correctness
- Verify the purpose and necessity of small/unknown packages (e.g., `signals==0.0.2`). Avoid untrusted/abandoned packages.
- Ensure DB models enforce uniqueness and indexes for query-heavy fields (member IDs, NHIF, claim status). Add migrations and tests for constraints.
- Add DRF throttling and rate-limiting for endpoints (login, file upload) to mitigate abuse.
- Move media storage to S3 (or similar) for production; implement presigned uploads, scanning, and size/type validation.
- Add test coverage: more unit tests for models, API endpoints, claim calculation logic, and permission cases.

## Missing product features (recommended)
These features are commonly required for a production-grade claims portal:
- Granular RBAC beyond Django Groups (fine-grained policies, audit-only roles)
- Immutable audit logs for claim status changes, reviewer actions, and overrides
- Background job processing (Celery, Redis) for notifications, file processing, and scheduled reports
- Email/SMS notification integrations
- Reporting & export (CSV/PDF) for payments and claims
- Observability: Sentry for errors, Prometheus/Grafana for metrics
- Backup and disaster recovery processes (DB + media)
- Admin UI for reimbursement scales, global settings, membership types
- Data privacy & compliance features (PII handling, retention, deletion workflows)

## Repo & code hygiene recommendations
- Add `.env.example` and ensure `.env` is ignored via `.gitignore`.
- Pin exact dependency versions; maintain a `requirements.txt` (already present) and consider `pip-compile` or lockfile tooling.
- Add `pre-commit` hooks (black/isort/ruff/flake8) for Python and ESLint/Prettier for frontend.
- Provide `README.dev.md` with exact local dev steps (env, migrations, seeding, ports).
- Add CI (GitHub Actions) to run tests and checks on PRs.
- Add `Makefile` or npm scripts for common tasks.

## Security checklist (recommended changes)
- Remove secrets from repo; use environment variables and secrets manager in CI/CD.
- Enforce HTTPS (HSTS), secure cookies, `CSRF_COOKIE_SECURE = True` and `SESSION_COOKIE_SECURE = True` for production.
- Limit `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` via environment values.
- Rate-limit auth endpoints; protect against brute force.
- Validate and sanitize all input data; use parameterized queries and ORM methods safely.
- Validate file uploads MIME types, maximum size, and perform virus scanning.
- Use a WAF on production endpoints if public.

## Performance & scale improvements
- Add pagination to all list endpoints.
- Add DB indexes for filterable/sortable fields (status, created_at, member FK).
- Avoid N+1 queries: use `select_related` / `prefetch_related` in list endpoints.
- Add caching layer (Redis) for non-sensitive read endpoints.
- Prepare for horizontal scaling: choose token auth or shared session store (Redis) for sessions.

## Low-risk, high-impact quick wins (I can implement)
1. Add `.env.example` and update `settings.py` to require `SECRET_KEY` from env. Provide clear error if missing.
2. Fix default `DATABASE_URL` to a safe placeholder and document DB env vars.
3. Add `http://localhost:5173` / `http://127.0.0.1:5173` to `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` for local dev (or make these env-driven).
4. Correct `AUTH_USER_MODEL` (remove or set to correct value).
5. Add a minimal GitHub Actions workflow that runs Python tests and the frontend build/lint.
6. Add DRF throttling defaults and a simple healthcheck endpoint.

If you want, I can apply these quick wins now. Tell me which ones to implement and I will make the changes and run validations.

## Suggested roadmap (prioritized)
1. Fix secrets & env handling, correct DB defaults, and production cookie/security flags.
2. Decide on auth approach (session vs JWT) and implement consistently.
3. Add CI that runs backend tests and frontend lint/build.
4. Harden file uploads and move media to S3 with presigned uploads.
5. Implement audit logging, notifications, background jobs, and reporting.
6. Improve test coverage & add monitoring.

## How to validate locally (dev notes)
1. Create a `.env` file in `Backend/` with required entries:

```powershell
# example for Powershell (one-line per env var):
# set up in repo root or backend folder as appropriate
# NOTE: do NOT commit your .env
$env:DEBUG = 'True'; $env:SECRET_KEY = 'your-dev-secret'; $env:DATABASE_URL = 'postgres://user:pass@localhost:5432/sgss_dev'
```

2. Run migrations and dev servers:

```powershell
# Backend
cd Backend
python -m venv .venv; .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd Frontend
npm install
npm run dev
```

3. Run tests (backend):

```powershell
cd Backend
.\.venv\Scripts\Activate.ps1
pytest -q
```

## Next steps I can take (pick what you want)
- Implement the low-risk quick wins (create `.env.example`, fix settings, add `5173` to CORS, correct `AUTH_USER_MODEL`, add minimal CI). — recommended first step.
- Continue with a deep code review of `Backend/medical/` (models, serializers, views, permissions, tests) and propose concrete fixes.
- Review the frontend code (`Frontend/src/`) for routing, auth, and API client patterns.

## Completion note
This audit was created from the repository files and documentation available in the workspace. If you want me to implement the quick fixes, say which ones and I will apply edits and run validations (I can add files, update `settings.py`, and add CI).