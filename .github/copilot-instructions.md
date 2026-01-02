# SGSS Medical Fund Portal — AI Coding Agent Instructions

## Big Picture Architecture

- **Backend:** Django REST Framework (DRF) API, PostgreSQL, JWT Auth (SimpleJWT), business rules enforced per SGSS bylaws/constitution.
- **Frontend:** React + TypeScript + Vite + Tailwind, role-based dashboards, Axios for API calls.
- **Data Flow:** Member/Committee/Admin roles interact via REST endpoints; claims, chronic requests, notifications, and audit logs are core flows.
- **Key Directories:**
  - `Backend/medical/` — main business logic, models, signals, serializers, views
  - `Backend/api/` — API route organization (claims, members, chronic-requests, etc.)
  - `Frontend/src/` — React app source

## Developer Workflows

- **Backend:**
  - Setup: `python -m venv venv; .\venv\Scripts\activate; pip install -r requirements.txt`
  - DB: `python manage.py makemigrations; python manage.py migrate; python manage.py seed_sgss`
  - Run: `python manage.py runserver` (default users: see Backend README)
  - Test: Use Django's test runner; signals and atomic transactions are critical for fund calculations.
- **Frontend:**
  - Setup: `npm install`
  - Run: `npm run dev` (Vite server)
  - API: All data via REST endpoints (`/api/*`), session cookie auth, handle 401 redirects.

## Project-Specific Conventions

- **Role-based access:** Enforced via Django Groups; frontend routes redirect by role.
- **Claims:** Annual limits, waiting periods, exclusions, and overrides are strictly enforced in backend logic (`Claim.clean()`, `Member.is_active_for_claims()`).
- **Notifications & Audit:** All status changes trigger notifications and audit logs (see `signals.py`).
- **Attachments:** Claim files stored in `/media/claim_attachments/`, linked via `ClaimAttachment` model.
- **Settings:** Fund limits and reimbursement rates managed via `Setting` and `ReimbursementScale` models.

## Integration Points

- **Swagger:** `/swagger/` for live API docs; `/redoc/` for static docs.
- **Authentication:** JWT via SimpleJWT; session cookies for frontend.
- **File Storage:** Local `/media/` in dev, migrate to S3/Supabase in prod.
- **Deployment:** Backend to VPS/Render, frontend to Vercel/Netlify.

## Examples & Patterns

- **Claim Submission:**
  - Member submits claim → adds items/attachments → committee reviews → status/notifications update → audit log entry.
- **Chronic Requests:**
  - Member submits medication list → committee reviews → status/notifications update.
- **Frontend Routing:**
  - Member: `/dashboard/member`, Committee: `/dashboard/committee`, Admin: `/dashboard/admin`.

## Key Files to Reference

- `Backend/medical/models.py`, `serializers.py`, `signals.py`, `views.py`
- `Backend/api/claims/`, `members/`, `chronic-requests/`
- `Frontend/src/` (React components, API handlers)
- `Backend/README.md`, `README.md` (root)

---

**For questions or unclear patterns, review the Backend/README.md and root README.md for up-to-date business rules and workflows.**
