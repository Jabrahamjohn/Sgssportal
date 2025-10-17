-- ================================================================
-- SGSS MEDICAL FUND — LOCAL SEED DATA (v4, VERIFIED)
-- ================================================================

-- AUTH USERS ------------------------------------------------------
insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-000000000001', 'member@sgss.com'),
  ('00000000-0000-0000-0000-000000000002', 'admin@sgss.com'),
  ('00000000-0000-0000-0000-000000000003', 'committee@sgss.com')
on conflict (id) do nothing;

-- APP USERS -------------------------------------------------------
insert into public.users (id, email, full_name, role)
values
  ('00000000-0000-0000-0000-000000000001', 'member@sgss.com', 'Test Member', 'member'),
  ('00000000-0000-0000-0000-000000000002', 'admin@sgss.com', 'Admin User', 'admin'),
  ('00000000-0000-0000-0000-000000000003', 'committee@sgss.com', 'Committee Reviewer', 'committee')
on conflict (id) do nothing;

-- ROLES ------------------------------------------------------------
insert into roles (name)
values ('member'), ('committee'), ('admin')
on conflict (name) do nothing;

-- MEMBERSHIP TYPES ------------------------------------------------
insert into membership_types (key, name, annual_limit)
values
  ('single', 'Single', 250000),
  ('family', 'Family', 500000)
on conflict (key) do nothing;

-- MEMBERS ----------------------------------------------------------
insert into members (id, user_id, membership_type_id, nhif_number, valid_from, valid_to)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    (select id from membership_types where key = 'single'),
    'NHIF123',
    current_date - interval '90 days',
    current_date + interval '2 years'
  )
on conflict (id) do nothing;

-- CLAIMS -----------------------------------------------------------
insert into claims (
  id, member_id, claim_type, date_of_first_visit, total_claimed, status, notes
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'outpatient',
    current_date - interval '3 days',
    4000,
    'submitted',
    'Consulted at Siri Guru Nanak Clinic'
  )
on conflict (id) do nothing;

-- CLAIM ITEMS ------------------------------------------------------
insert into claim_items (id, claim_id, category, description, amount, quantity)
values
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', 'consultation', 'Doctor consultation', 2000, 1),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', 'medicine', 'Pain relief tablets', 2000, 1)
on conflict (id) do nothing;

-- CHRONIC REQUESTS -------------------------------------------------
insert into chronic_requests (id, member_id, doctor_name, medicines, total_amount, member_payable, status)
values
  (
    gen_random_uuid(),
    '10000000-0000-0000-0000-000000000001',
    'Dr. Patel',
    '[{"name":"Metformin","strength":"500mg","dosage":"2x daily","duration":"30 days"}]'::jsonb,
    3000,
    1800,
    'approved'
  )
on conflict (id) do nothing;

-- REIMBURSEMENT SCALES --------------------------------------------
insert into reimbursement_scales (category, fund_share, member_share, ceiling)
values
  ('Outpatient', 80, 20, 50000),
  ('Inpatient', 85, 15, 200000),
  ('Chronic', 60, 40, 120000)
on conflict (category) do update
set fund_share = excluded.fund_share,
    member_share = excluded.member_share,
    ceiling = excluded.ceiling;

-- SETTINGS ---------------------------------------------------------
insert into settings (key, value)
values
  ('general_limits', '{"annual_limit":250000,"critical_addon":200000,"fund_share_percent":80,"clinic_outpatient_percent":100}'::jsonb),
  ('reimbursement_scales', '[
    {"category":"Outpatient","fund_share":80,"member_share":20,"ceiling":50000},
    {"category":"Inpatient","fund_share":85,"member_share":15,"ceiling":200000},
    {"category":"Chronic","fund_share":60,"member_share":40,"ceiling":120000}
  ]'::jsonb)
on conflict (key)
do update set value = excluded.value, updated_at = now();

-- NOTIFICATIONS ----------------------------------------------------
insert into notifications (recipient_id, title, message, link, type)
values
  (
    '00000000-0000-0000-0000-000000000001',
    'Welcome to SGSS Medical Fund',
    'Your profile and membership are active. You can now submit claims.',
    '/dashboard',
    'system'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Claim Submitted',
    'A new claim from Test Member is awaiting review.',
    '/committee/claims',
    'claim'
  )
on conflict do nothing;

-- CLAIM REVIEWS ----------------------------------------------------
insert into claim_reviews (claim_id, reviewer_id, role, action, note)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000003',
    'committee',
    'reviewed',
    'Seed review - claim appears valid and compliant'
  )
on conflict do nothing;

-- AUDIT LOG --------------------------------------------------------
insert into audit_logs (actor_id, action, meta)
values
  (
    '00000000-0000-0000-0000-000000000002',
    'seed_init',
    '{"note": "Seed data inserted for testing and roles setup."}'::jsonb
  )
on conflict do nothing;

-- AUTO COMPUTE PAYABLE ---------------------------------------------
select compute_claim_payable('20000000-0000-0000-0000-000000000001');

-- VERIFY -----------------------------------------------------------
select u.id, u.email, u.role from public.users u order by role;


update public.users set role = 'admin' where email = 'admin@sgss.com';
update public.users set role = 'committee' where email = 'committee@sgss.com';
update public.users set role = 'member' where email = 'member@sgss.com';