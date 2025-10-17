-- =====================================================================
-- SGSS MEDICAL FUND — SEED DATA (v5, Clean & Constitution-Compliant)
-- Author: Abraham John
-- =====================================================================
-- This seed initializes:
--  - 3 Auth Users (Admin, Committee, Member)
--  - Full User Profiles (public.users)
--  - Memberships and Membership Types
--  - Claims, Claim Items, and Reviews
--  - Reimbursement Scales & Settings
--  - Notifications, Chronic Requests, and Audit Logs
-- =====================================================================

-- ============================================================
-- AUTH USERS (used for login via Supabase Auth)
-- ============================================================
insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-000000000001', 'member@sgss.com'),
  ('00000000-0000-0000-0000-000000000002', 'admin@sgss.com'),
  ('00000000-0000-0000-0000-000000000003', 'committee@sgss.com')
on conflict (id) do nothing;

-- ============================================================
-- PUBLIC USERS TABLE (application-level users)
-- ============================================================
insert into public.users (id, email, full_name, role)
values
  ('00000000-0000-0000-0000-000000000001', 'member@sgss.com', 'Test Member', 'member'),
  ('00000000-0000-0000-0000-000000000002', 'admin@sgss.com', 'Admin User', 'admin'),
  ('00000000-0000-0000-0000-000000000003', 'committee@sgss.com', 'Committee Reviewer', 'committee')
on conflict (id) do nothing;

-- ============================================================
-- ROLES
-- ============================================================
insert into roles (name)
values ('member'), ('committee'), ('admin')
on conflict (name) do nothing;

-- ============================================================
-- MEMBERSHIP TYPES (as defined in SGSS Bylaws)
-- ============================================================
insert into membership_types (key, name, annual_limit)
values
  ('single', 'Single Member', 250000),
  ('family', 'Family Member', 500000)
on conflict (key) do nothing;

-- ============================================================
-- MEMBERSHIP RECORDS
-- ============================================================
insert into members (id, user_id, membership_type_id, nhif_number, valid_from, valid_to, no_claim_discount_percent)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    (select id from membership_types where key='single'),
    'NHIF123',
    current_date - interval '120 days',
    current_date + interval '2 years',
    5
  )
on conflict (id) do nothing;

-- ============================================================
-- REIMBURSEMENT SCALES (based on fund policy)
-- ============================================================
insert into reimbursement_scales (category, fund_share, member_share, ceiling)
values
  ('Outpatient', 80, 20, 50000),
  ('Inpatient', 85, 15, 200000),
  ('Chronic', 60, 40, 120000)
on conflict (category)
do update set
  fund_share = excluded.fund_share,
  member_share = excluded.member_share,
  ceiling = excluded.ceiling;

-- ============================================================
-- SETTINGS (editable in admin panel)
-- ============================================================
insert into settings (key, value)
values
  ('general_limits', '{"annual_limit":250000,"critical_addon":200000,"fund_share_percent":80,"clinic_outpatient_percent":100}'::jsonb),
  ('procedure_tiers', '{"minor":30000,"medium":35000,"major":50000,"regional":90000,"special":70000}'::jsonb)
on conflict (key)
do update set value = excluded.value, updated_at = now();

-- ============================================================
-- CLAIMS (simulated as per medical constitution clause)
-- ============================================================
insert into claims (id, member_id, claim_type, date_of_first_visit, total_claimed, total_payable, status, notes, submitted_at)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'outpatient',
    current_date - interval '5 days',
    4000,
    3200,
    'submitted',
    'Consulted at Siri Guru Nanak Clinic for fever treatment.',
    now()
  )
on conflict (id) do nothing;

-- ============================================================
-- CLAIM ITEMS
-- ============================================================
insert into claim_items (claim_id, category, description, amount, quantity)
values
  ('20000000-0000-0000-0000-000000000001', 'consultation', 'Doctor consultation', 2000, 1),
  ('20000000-0000-0000-0000-000000000001', 'medicine', 'Pain relief tablets', 2000, 1)
on conflict do nothing;

-- ============================================================
-- CLAIM REVIEWS (Committee Evaluation)
-- ============================================================
insert into claim_reviews (claim_id, reviewer_id, role, action, note)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'committee',
    'reviewed',
    'Claim verified and approved under outpatient limit.'
  )
on conflict do nothing;

-- ============================================================
-- CHRONIC ILLNESS REQUESTS
-- ============================================================
insert into chronic_requests (member_id, doctor_name, medicines, total_amount, member_payable, status)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'Dr. Patel',
    '[{"name":"Metformin","strength":"500mg","dosage":"2x daily","duration":"30 days"}]'::jsonb,
    3000,
    1800,
    'approved'
  )
on conflict do nothing;

-- ============================================================
-- NOTIFICATIONS (automatically triggered + manual seed)
-- ============================================================
insert into notifications (recipient_id, title, message, link, type)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'Welcome to SGSS Medical Fund',
    'Your membership is active and ready for claims submission.',
    '/dashboard',
    'system'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'New Claim Submitted',
    'A claim from Test Member awaits your committee review.',
    '/committee/claims',
    'claim'
  )
on conflict do nothing;

-- ============================================================
-- AUDIT LOG (seed initialization)
-- ============================================================
insert into audit_logs (actor_id, action, meta)
values
  (
    '00000000-0000-0000-0000-000000000002',
    'seed_init',
    '{"note": "Initial seed data created in compliance with SGSS bylaws."}'::jsonb
  )
on conflict do nothing;

-- ============================================================
-- VALIDATION & VIEW TESTING
-- ============================================================
select 'SEED COMPLETE' as status, count(*) as total_users from public.users;
select id, email, role from public.users order by role;
select * from claims limit 1;