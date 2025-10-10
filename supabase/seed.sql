-- ================================================================
-- SGSS MEDICAL FUND — LOCAL SEED DATA
-- ================================================================

-- USERS ------------------------------------------------------------
insert into users (id, email, full_name, role)
values
  ('00000000-0000-0000-0000-000000000001', 'member1@example.com', 'Test Member', 'member'),
  ('00000000-0000-0000-0000-000000000002', 'admin1@example.com', 'Admin User', 'admin')
on conflict (id) do nothing;

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
    (select id from membership_types where key='single'),
    'NHIF123',
    current_date,
    current_date + interval '2 years'
  )
on conflict (id) do nothing;

-- CLAIMS -----------------------------------------------------------
insert into claims (id, member_id, claim_type, date_of_first_visit, total_claimed, status)
values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'outpatient',
    current_date - interval '3 days',
    4000,
    'submitted'
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
on conflict do nothing;

-- SETTINGS ---------------------------------------------------------
insert into settings (key, value)
values
  ('reimbursement_scales', '[
    {"category": "Outpatient", "fund_share": 80, "member_share": 20, "ceiling": 50000},
    {"category": "Inpatient", "fund_share": 85, "member_share": 15, "ceiling": 200000},
    {"category": "Chronic", "fund_share": 60, "member_share": 40, "ceiling": 120000}
  ]'::jsonb)
on conflict (key)
do update set value = excluded.value, updated_at = now();

-- AUDIT LOG --------------------------------------------------------
insert into audit_logs (actor_id, action, meta)
values
  (
    '00000000-0000-0000-0000-000000000002',
    'seed_init',
    '{"note": "Seed data inserted for testing."}'::jsonb
  )
on conflict do nothing;

-- NOTIFICATIONS ----------------------------------------------------
-- A sample claim notification for demo purposes
insert into notifications (recipient_id, title, message, link, type)
values
  (
    '00000000-0000-0000-0000-000000000001', 
    'Welcome to SGSS Medical Fund',
    'Your profile and membership are active. You can now submit claims.',
    '/dashboard',
    'system'
  )
on conflict do nothing;


-- sample attachments + review seeds for testing
-- Note: we don't insert real storage_path — the frontend will upload files to storage and write record.

-- Example review line
insert into claim_reviews (claim_id, reviewer_id, role, action, note)
values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'committee', 'reviewed', 'Sample review from seed')
on conflict do nothing;
