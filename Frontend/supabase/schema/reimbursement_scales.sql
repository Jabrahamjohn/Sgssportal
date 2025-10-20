-- supabase/schema/reimbursement_scales.sql
create table if not exists reimbursement_scales (
  id uuid primary key default gen_random_uuid(),
  category text not null, -- Outpatient, Inpatient, Chronic
  fund_share numeric not null, -- percentage of fund cover
  member_share numeric not null, -- percentage paid by member
  ceiling numeric not null, -- max amount claimable
  updated_at timestamptz default now()
);

-- Only allow admins/committee members to update reimbursement scales
create policy "Admins can update reimbursement scales"
on reimbursement_scales
for update
using (auth.role() in ('admin', 'committee'));


-- Sample seed data
insert into reimbursement_scales (category, fund_share, member_share, ceiling)
values
('Outpatient', 80, 20, 50000),
('Inpatient', 85, 15, 200000),
('Chronic', 60, 40, 120000)
on conflict do nothing;
