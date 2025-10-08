-- seed_sample_data.sql
-- ================================================================
-- Sample SGSS data for local testing

-- User + Member ---------------------------------------------------
insert into users (id, email, full_name, role_id)
values
  ('00000000-0000-0000-0000-000000000001',
   'member1@example.com',
   'Test Member',
   (select id from roles where name='member'))
on conflict (id) do nothing;

insert into members (id, user_id, membership_type_id, nhif_number, valid_from, valid_to)
values
  ('10000000-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000001',
   (select id from membership_types where key='single'),
   'NHIF123',
   current_date,
   current_date + interval '2 years')
on conflict (id) do nothing;

-- Sample Claim ----------------------------------------------------
insert into claims (id, member_id, claim_type, date_of_first_visit, total_claimed, status)
values
  ('20000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001',
   'outpatient',
   current_date - interval '3 days',
   4000,
   'submitted')
on conflict (id) do nothing;

-- Claim Items -----------------------------------------------------
insert into claim_items (id, claim_id, category, description, amount, quantity)
values
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', 'consultation', 'Doctor consultation', 2000, 1),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', 'medicine', 'Pain relief tablets', 2000, 1);

-- Chronic request -------------------------------------------------
insert into chronic_requests (id, member_id, doctor_name, medicines, total_amount, member_payable, status)
values
  (gen_random_uuid(),
   '10000000-0000-0000-0000-000000000001',
   'Dr. Patel',
   '[{"name":"Metformin","strength":"500mg","dosage":"2x daily","duration":"30 days"}]'::jsonb,
   3000,
   1800,
   'approved');

-- Audit log -------------------------------------------------------
insert into audit_logs (actor_id, action, meta)
values
  ('00000000-0000-0000-0000-000000000001',
   'seed_init',
   '{"note":"Seed data inserted for testing."}');

insert into settings (key, value) values
('reimbursement_scales', '[
  {"category": "Outpatient", "fund_share": 80, "member_share": 20, "ceiling": 50000},
  {"category": "Inpatient", "fund_share": 85, "member_share": 15, "ceiling": 200000},
  {"category": "Chronic", "fund_share": 60, "member_share": 40, "ceiling": 120000}
]');
