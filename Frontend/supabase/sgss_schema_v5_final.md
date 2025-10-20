# SGSS Medical Fund — Schema & Migration Notes (v5.1 fixed)

## Overview
This bundle creates the production/test schema for the SGSS Medical Fund:
- Users, Roles, Membership types, Members
- Claims, Claim Items, Claim Reviews, Claim Attachments
- Chronic requests, Reimbursement scales, Settings, Notifications, Audit logs
- Robust triggers and functions for auditing, notifications, claim calculations and bylaws enforcement
- Seed data for admin/member/committee users and a sample claim

## Key functions & triggers (what they do)
- `log_audit_event()` — Insert audit rows on create/update/delete (swallows errors: safe)
- `notify_on_claim_event()` — Inserts a notification when a claim is inserted or its status is changed
- `handle_new_user()` — Creates a `public.users` row when a new `auth.users` row is inserted
- `fn_check_submission_window()` — Enforces time window rules for claim submission (before insert)
- `fn_check_membership_active()` — Validates membership waiting period and expiry (before insert)
- `fn_autoflag_exclusions()` — Auto-flag claims as excluded (cosmetic etc) depending on notes/items
- `compute_claim_payable(p_claim_id)` — Calculates fund share/member share/ceiling/nhif/other insurance/deductions
- `trigger_compute_claim_payable()` — Dispatch wrapper that determines the correct claim id for compute
- `recalc_claim_total_on_items()` — Recomputes `claims.total_claimed` when claim_items change (after insert/update/delete)
- `apply_discretionary_override()` — Allows committee to set a discretionary payable (with limit)

## The error you saw and how it was fixed
**Original error:** `record "old" has no field "claim_id" (SQLSTATE 42703)` during seeding.

**Cause:** Certain trigger functions attempted to access `OLD.claim_id` (or `NEW.claim_id`) without ensuring the trigger was running in a context where `OLD` or `NEW` has that field (e.g., DELETE vs INSERT or wrong table). That happens when triggers or functions assume `OLD` or `NEW` exist or have a `claim_id` field in all cases.

**Fixes applied:**
- *Guarded all trigger functions* to only reference `OLD` or `NEW` fields when they exist for the current `TG_OP` (INSERT/UPDATE/DELETE). For example:
  - `recalc_claim_total_on_items()` now checks `TG_OP` and uses `NEW.claim_id` on INSERT/UPDATE, `OLD.claim_id` on DELETE — and aborts if those are null.
  - `trigger_compute_claim_payable()` now explicitly picks `NEW.id` / `OLD.id` for `claims`, and `NEW.claim_id` / `OLD.claim_id` for `claim_items`. If `target_claim_id` is null it returns early.
- De-duplicated/replaced any conflicting `claim_reviews`/`claim_items` definitions and ensured a single authoritative function for `compute_claim_payable`.
- Wrapped non-critical actions in `BEGIN/EXCEPTION` to avoid breaking the overall seed/migration when something minor fails.

## How to apply
1. Put the `sgss_schema_v5_final.sql` content above into a single migration file in your Supabase project (e.g., `/supabase/migrations/001_sgss_v5_init.sql`), or run it in the SQL editor.
2. On your local Supabase CLI environment run:
