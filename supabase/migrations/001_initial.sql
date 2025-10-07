-- migrations/001_initial.sql
-- Create settings table for admin-editable reimbursement scales
create table if not exists settings (
key text primary key,
value jsonb,
updated_at timestamptz default now()
);


-- seed some reimbursement scales (procedure tiers)
insert into settings (key, value) values
('procedure_tiers', '{"minor":30000, "medium":35000, "major":50000, "regional":90000, "special":70000}'),
('general_limits', '{"annual_limit":250000, "critical_addon":200000, "fund_share_percent":80, "clinic_outpatient_percent":100}')
on conflict (key) do update set value = excluded.value, updated_at = now();
