-- supabase/schema/reimbursement_scales.sql
create table if not exists reimbursement_scales (
  id serial primary key,
  category text unique, -- Outpatient | Inpatient | Chronic
  fund_share numeric, -- e.g. 80
  member_share numeric, -- e.g. 20
  ceiling bigint, -- e.g. 50000
  created_at timestamptz default now()
);

insert into reimbursement_scales (category, fund_share, member_share, ceiling) values
('Outpatient', 80, 20, 50000),
('Inpatient', 85, 15, 200000),
('Chronic', 60, 40, 120000)
on conflict do nothing;
