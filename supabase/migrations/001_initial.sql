-- 001_initial.sql

-- ======================================
-- Core Tables for SGSS Medical Fund
-- ======================================

-- USERS TABLE
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text,
  role text default 'member',
  created_at timestamptz default now()
);

-- ROLES TABLE (optional reference)
create table if not exists roles (
  id serial primary key,
  name text unique not null
);

insert into roles (name)
values ('member'), ('committee'), ('admin')
on conflict (name) do nothing;

-- MEMBERSHIP TYPES
create table if not exists membership_types (
  id serial primary key,
  key text unique not null,
  name text not null,
  annual_limit numeric default 0,
  created_at timestamptz default now()
);

insert into membership_types (key, name, annual_limit)
values 
('single', 'Single', 250000),
('family', 'Family', 500000)
on conflict (key) do nothing;

-- MEMBERS TABLE
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

-- CLAIMS
create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) not null,
  claim_type text not null, -- inpatient | outpatient | chronic
  date_of_first_visit date,
  date_of_discharge date,
  total_claimed bigint default 0,
  total_payable bigint default 0,
  status text default 'draft', -- draft | submitted | approved | paid | rejected
  submitted_at timestamptz,
  processed_at timestamptz,
  approved_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

-- CLAIM ITEMS
create table if not exists claim_items (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete cascade,
  category text,
  description text,
  amount bigint not null,
  retail_price bigint,
  quantity int default 1
);

-- CHRONIC REQUESTS
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


-- REIMBURSEMENT SCALES
create table if not exists reimbursement_scales (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  fund_share numeric not null,
  member_share numeric not null,
  ceiling numeric not null,
  updated_at timestamptz default now()
);

insert into reimbursement_scales (category, fund_share, member_share, ceiling)
values
('Outpatient', 80, 20, 50000),
('Inpatient', 85, 15, 200000),
('Chronic', 60, 40, 120000)
on conflict do nothing;

-- AUDIT LOGS
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- SETTINGS (Admin configurable parameters)
create table if not exists settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

insert into settings (key, value) values
('procedure_tiers', '{"minor":30000, "medium":35000, "major":50000, "regional":90000, "special":70000}'),
('general_limits', '{"annual_limit":250000, "critical_addon":200000, "fund_share_percent":80, "clinic_outpatient_percent":100}')
on conflict (key) do update set value = excluded.value, updated_at = now();

-- INDEXES
create index if not exists idx_claims_member on claims(member_id);
create index if not exists idx_claims_status on claims(status);


-- =========================================================
-- UNIVERSAL AUDIT LOGGING SYSTEM
-- =========================================================

-- 1. Audit function: captures action type and row data
create or replace function log_audit_event()
returns trigger as $$
begin
  insert into audit_logs (actor_id, action, meta)
  values (
    current_setting('request.jwt.claim.sub', true)::uuid,  -- current user id if available
    TG_TABLE_NAME || ':' || TG_OP,                        -- e.g. claims:INSERT
    case 
      when TG_OP = 'DELETE' then to_jsonb(OLD)
      else to_jsonb(NEW)
    end
  );
  return null;
end;
$$ language plpgsql security definer;

-- 2. Attach triggers to key tables
create trigger audit_claims
after insert or update or delete on claims
for each row execute procedure log_audit_event();

create trigger audit_members
after insert or update or delete on members
for each row execute procedure log_audit_event();

create trigger audit_chronic_requests
after insert or update or delete on chronic_requests
for each row execute procedure log_audit_event();

create trigger audit_reimbursement_scales
after insert or update or delete on reimbursement_scales
for each row execute procedure log_audit_event();

create trigger audit_settings
after insert or update or delete on settings
for each row execute procedure log_audit_event();


-- =========================================================
-- NOTIFICATIONS SYSTEM
-- =========================================================

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references users(id),
  title text not null,
  message text not null,
  link text,
  read boolean default false,
  created_at timestamptz default now()
);

-- Notification trigger for claims
create or replace function notify_on_claim_event()
returns trigger as $$
declare
  msg text;
begin
  if TG_OP = 'INSERT' then
    msg := 'New claim submitted with total ' || new.total_claimed;
  elsif TG_OP = 'UPDATE' and new.status != old.status then
    msg := 'Your claim status changed to ' || new.status;
  else
    return null;
  end if;

  insert into notifications (recipient_id, title, message, link)
  values (
    new.member_id,
    'Claim Update',
    msg,
    '/claims/' || new.id
  );

  return null;
end;
$$ language plpgsql security definer;

create trigger notify_claims
after insert or update on claims
for each row execute procedure notify_on_claim_event();


alter table notifications
add column if not exists type text default 'system', -- 'system', 'claim', 'chronic', etc.
add column if not exists sent_email boolean default false,
add column if not exists actor_id uuid, -- who triggered the notification
add column if not exists metadata jsonb; -- any extra structured info


create or replace function trigger_email_on_notification()
returns trigger as $$
begin
  -- Only send for specific events
  if new.type in ('claim', 'chronic') then
    perform net.http_post(
      url := current_setting('app.settings.edge_url') || '/functions/v1/send-notification-email',
      body := json_build_object('record', new)::text,
      headers := jsonb_build_object('Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'))
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger send_email_trigger
after insert on notifications
for each row execute procedure trigger_email_on_notification();
