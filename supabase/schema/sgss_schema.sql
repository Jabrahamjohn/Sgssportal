-- SGSS Medical Fund schema (complete)
-- ==================================

-- Roles
create table if not exists roles (
  id serial primary key,
  name text unique not null
);

insert into roles (name) values
  ('member'),
  ('claims_officer'),
  ('approver'),
  ('trustee'),
  ('admin')
on conflict (name) do nothing;

-- Users
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  role_id int references roles(id),
  created_at timestamptz default now()
);

-- Membership types
create table if not exists membership_types (
  id serial primary key,
  key text unique not null,
  label text not null,
  fee bigint not null,
  term_years int default 2
);

insert into membership_types (key, label, fee, term_years) values
  ('life','Life Member', 1000000, 0),
  ('patron','Patron', 501000, 0),
  ('vice_patron','Vice Patron', 251000, 0),
  ('family','Family', 75000, 2),
  ('joint','Joint', 42000, 2),
  ('single','Single', 24000, 2)
on conflict (key) do nothing;

-- Members
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  membership_type_id int references membership_types(id),
  nhif_number text,
  photo_url text,
  joined_at timestamptz default now(),
  valid_from date,
  valid_to date,
  no_claim_discount_percent int default 0,
  created_at timestamptz default now()
);

-- Claims
create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) not null,
  claim_type text not null, -- inpatient | outpatient | chronic
  date_of_first_visit date,
  date_of_discharge date,
  total_claimed bigint default 0,
  total_payable bigint default 0,
  status text default 'draft', -- draft | submitted | processed | approved | paid | rejected
  submitted_at timestamptz,
  processed_at timestamptz,
  approved_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- Claim items
create table if not exists claim_items (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete cascade,
  category text, -- consultation | medicine | investigation | procedure | bed | doctor | other
  description text,
  amount bigint not null,
  retail_price bigint,
  quantity int default 1
);

-- Chronic illness requests
create table if not exists chronic_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) not null,
  doctor_name text,
  medicines jsonb,
  total_amount bigint,
  member_payable bigint,
  status text default 'pending',
  created_at timestamptz default now()
);

-- Settings (for reimbursement rules)
create table if not exists settings (
  id serial primary key,
  key text unique not null,
  value jsonb not null,
  updated_at timestamptz default now()
);

insert into settings (key, value) values
  ('procedure_tiers', '{"minor":30000,"medium":35000,"major":50000,"regional":90000,"special":70000}'),
  ('general_limits', '{"annual_limit":250000,"critical_addon":200000,"clinic_fund_share":100,"external_fund_share":80}')
on conflict (key) do nothing;

-- Audit logs
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text,
  meta jsonb,
  created_at timestamptz default now()
);



-- Indexes
create index if not exists idx_claims_member on claims(member_id);
create index if not exists idx_claims_status on claims(status);
