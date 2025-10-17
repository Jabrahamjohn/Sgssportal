# SGSS Portal — Medical Fund Management System

A modern portal for managing members, medical claims, reimbursements, and fund administration. Built with React, TypeScript, Vite, Tailwind CSS, and Supabase (Postgres, Auth, Storage, Edge Functions).

Last updated: 2025-10-17

---

## Table of Contents
- Overview
- Features
- Tech Stack
- Prerequisites
- Getting Started
- Environment Variables
- Project Structure
- Database Architecture
- Business & Calculation Rules
- Security (RLS) and Access Control
- Edge Functions (Supabase)
- Scripts
- Testing
- Deployment
- Troubleshooting
- Contributing
- License

---

## Overview
The SGSS Portal streamlines the entire claim lifecycle: member onboarding, claim submission, review, approval or rejection, and automated reimbursement calculation with audit logs, notifications, and role-based access control. It enforces constitution and byelaws such as waiting periods, submission windows, exclusions, and per-membership annual limits.

---

## Features

### Member Management
- Membership types (Single, Family, etc.) with annual limits.
- Member profile: NHIF number, photo, validity windows (valid_from/valid_to).
- No-claim discount tracking (no_claim_discount_percent).

### Claims
- Claim types supported: Outpatient, Inpatient, Chronic.
- Claim items (category, amount, quantity) with automatic totals.
- Attachments (receipts, docs) stored via Supabase Storage.
- Status workflow: draft → submitted → reviewed → approved → rejected.
- Claim reviews with role and actions (committee/admin).
- In-app notifications on submission and status changes.

### Administration
- Settings for general limits and procedure tiers (stored in settings).
- Reimbursement scales per category (fund and member share, ceiling).
- Reports and admin panels for claims, membership types, scales, and analytics.
- Audit logging across key tables.

### UX & DevX
- Responsive UI with Tailwind.
- Typed end-to-end (TypeScript).
- React Router pages for members, claims, admin flows.
- Real-time updates via Supabase.
- Edge Functions for secure server-side logic.

---

## Tech Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- State/Data: Zustand, React Query
- Forms/Validation: React Hook Form, Zod
- Utilities: date-fns, jsPDF
- Backend: Supabase (PostgreSQL, Auth, Storage, Edge Functions)

---

## Prerequisites
- Node.js v18+
- npm v8+ (or Yarn v1.22+)
- Git
- Supabase account
- Supabase CLI (for local dev)

---

## Getting Started

1) Clone
```bash
git clone https://github.com/Jabrahamjohn/Sgssportal.git
cd Sgssportal
```

2) Install
```bash
npm install
# or
yarn install
```

3) Environment
Create a .env file (see Environment Variables below).

4) Supabase (local, optional)
```bash
npm i -g @supabase/cli
npx supabase init
npx supabase start
npx supabase db push
# optional seed/reset:
npx supabase db reset --seed
```

5) Run
```bash
npm run dev
```
Open http://localhost:5173

---

## Environment Variables
Create a .env in project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Production:
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_APP_ENV=production
```

---

## Project Structure
```
src/
├─ App.tsx, main.tsx, index.css
├─ components/
│  ├─ admin/ (EditableTable, SettingsCard)
│  ├─ auth/ (ProtectedRoute)
│  ├─ claims/ (ClaimInput, ClaimItemsTable, FileUploader, ReimbursementPreview, TotalsCard)
│  ├─ layout/ (Header, Sidebar)
│  ├─ members/ (MemberCard, MemberForm, MemberTable)
│  ├─ system/ (EnvironmentBadge)
│  └─ ui/ (Button, Card, Input, Modal, Select)
├─ contexts/ (AuthContext)
├─ hooks/ (useAuth, useMembers, useNotifications)
├─ pages/
│  ├─ admin/ (AdminDashboard, ClaimsAdminPanel, ReimbursementScales, Reports, MembershipTypes, claimDetailAdmin)
│  ├─ auth/ (LoginPage, SsoLogin)
│  ├─ claims/ (OutpatientClaimForm, InpatientClaimForm, ChronicClaimForm, ClaimsDashboard, ClaimHistory, ClaimSummary, ClaimItemsTable)
│  ├─ dashboard/ (Dashboard)
│  └─ members/ (MembersList, MemberDetail, NewMemberForm)
├─ services/ (supabaseClient, membersService, claimsService, reimbursementService, adminService, adminClaimsService, reportService)
├─ types/ (index.ts)
├─ utils/ (calc, reimbursement, reimbursement.server, reimbursement.test, supabase, classnames)
└─ styles/
```

Supabase project files:
```
supabase/
├─ config.toml
├─ seed.sql
├─ migrations/
│  ├─ 001_initial.sql
│  ├─ 002_attachments_and_calc.sql
│  ├─ 003_bylaws_enforcement.sql
│  ├─ 004_rls_policies.sql
│  └─ 20251017021649_remote_schema.sql
└─ functions/
   ├─ calc_claim/
   ├─ create_sso_token/
   ├─ get_profile/
   ├─ get_settings/
   ├─ send-notification-email/
   ├─ update_settings/
   └─ verify_sso_token/
```

---

## Database Architecture

Core tables
- users: id (auth.users ref), email, full_name, role (member|committee|admin)
- roles: seed of available roles
- membership_types: key, name, annual_limit
- members: user_id, membership_type_id, nhif_number, photo_url, valid_from/to, no_claim_discount_percent
- claims: member_id, claim_type (Outpatient|Inpatient|Chronic), dates, totals, member_payable, status (draft|submitted|reviewed|approved|rejected), timestamps, notes
- claim_items: claim_id, category, description, amount, quantity, retail_price
- claim_attachments: claim_id, storage_path/url, file metadata
- claim_reviews: claim_id, reviewer_id, role (committee|admin), action (reviewed|approved|rejected), note
- reimbursement_scales: category, fund_share, member_share, ceiling
- settings: key/value JSON (general_limits, procedure_tiers)
- chronic_requests: chronic benefits requests (member_id, medicines JSON, totals, status)
- notifications: in-app notifications (recipient_id, title, message, link, type)
- audit_logs: action trail (actor_id, action, meta)

Indexes
- claims: member_id, status
- claim_reviews: claim_id

Triggers and functions
- Audit: log_audit_event() on claims, members, chronic_requests, reimbursement_scales
- Notifications: notify_on_claim_event() on claims (insert and status change)
- Auto user: handle_new_user() to mirror auth.users to public.users
- Claim compute:
  - compute_claim_payable(p_claim_id)
  - trigger_compute_claim_payable() on claims (recalculate)
  - recalc_claim_total_on_items() on claim_items (maintain total_claimed and total_payable)
- Byelaws enforcement:
  - fn_check_submission_window() (≤90 days from visit/discharge)
  - fn_check_membership_active() (60-day waiting, not expired)
  - fn_autoflag_exclusions() (cosmetic, transport, mortuary, infertility)
  - apply_discretionary_override(p_claim, p_amount, p_actor) with cap check

---

## Business & Calculation Rules

Reimbursement logic (compute_claim_payable)
- Fund vs member share from reimbursement_scales[category] or general_limits fallback.
- Ceiling per category; also enforces membership annual_limit per year.
- NHIF/other insurance amounts reduce fund share.
- Clinic 100% rule: If Outpatient at “Siri Guru Nanak Clinic” (matched in notes) and clinic_outpatient_percent = 100, fund covers 100%.
- Exclusions flagged: excluded claims pay 0 fund_share (member pays full).
- Totals auto-recompute when claim or items change.

Byelaws enforcement
- Submission window: Outpatient within 90 days of first visit; Inpatient within 90 days of discharge.
- Waiting period: 60 days after membership start before benefits.
- Discretionary override: Committee can override up to Ksh 150,000.

Statuses
- draft → submitted → reviewed → approved → rejected

---

## Security (RLS) and Access Control

Row Level Security enabled on: users, members, claims, claim_items, claim_attachments, chronic_requests, claim_reviews, notifications, settings, reimbursement_scales, audit_logs.

Policies (high level)
- Members: can manage their own members/claims/items/attachments/chronic and read claim reviews of their claims.
- Committee/Admin: can view all relevant records; committee/admin can update claims status/notes, review claims; admin has full access to settings/reimbursement_scales/audit_logs.
- Notifications: members read their own; committee/admin can read all.

Auth and user mirroring
- New auth.users rows mirrored into public.users with default role=member.

---

## Edge Functions (Supabase)
- calc_claim: server-side claim computations (e.g., validation/calc consolidation)
- create_sso_token / verify_sso_token: SSO flow helpers
- get_profile: fetch user profile securely
- get_settings / update_settings: read/write portal settings
- send-notification-email: email delivery for notifications

Note: Configure function secrets and service role keys in Supabase Dashboard for production.

---

## Scripts
Common:
- npm run dev — start Vite dev server
- npm run build — build for production
- npm run preview — preview built app
- npm run lint — lint codebase
- npm run test — run tests (see utils/reimbursement.test.ts)

Supabase:
- npx supabase db push — apply migrations
- npx supabase db reset --seed — reset and seed local DB
- npx supabase start | stop — manage local stack

---

## Testing
- Unit tests focus on reimbursement and calc utilities (utils/reimbursement.test.ts).
- Suggested: add integration tests for claims workflow and RLS with supabase-js.

Run:
```bash
npm run test
# optional
npm run test:watch
npm run test:coverage
```

---

## Deployment

Vercel (recommended)
- Set env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).
- Build command: npm run build
- Output dir: dist

Netlify
- Build: npm run build
- Publish: dist

Docker (static serve)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
```

---

## Troubleshooting

“failed to send batch: ERROR: record ‘old’ has no field ‘claim_id’ (SQLSTATE 42703)”)”
- Cause: A trigger referencing OLD.claim_id fired during seed/reset when the row or column context didn’t match.
- Fixes:
  - Ensure claim_items has column claim_id (it does in 001_initial.sql).
  - Recreate claim item trigger to defensively guard:
    - 002_attachments_and_calc.sql defines recalc_claim_total_on_items; confirm it uses IF TG_OP checks and references NEW/OLD only in their branch (already done).
  - If seed.sql performs operations that conflict with triggers, temporarily disable triggers during seeding:
    - Wrap seed with: alter table claim_items disable trigger recalc_claim_total_after_ins_upd_del; and re-enable after.
  - Rerun with debug to see failing statement:
    ```bash
    npx supabase db reset --debug
    ```
- Quick workaround during local dev:
  - Run migrations first: npx supabase db reset
  - Seed in smaller batches or disable/re-enable the item trigger around seed.

Other common issues
- RLS blocking writes: test with service role key or add missing policies.
- Missing users mirror: ensure handle_new_user trigger exists and auth.users insert events fire.

---

## Contributing
- Branch: feature/your-feature
- Code style: strict TypeScript, small typed components, shared hooks/ui
- Add/extend tests for calc and workflows
- Update documentation for schema or settings changes
- Open PR with clear description and screenshots where applicable

---

## License
MIT — see LICENSE.
