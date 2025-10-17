-- 001_initial.sql (Fixed and verified)
-- ======================================
-- Core Tables for SGSS Medical Fund
-- ======================================

-- USERS TABLE
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text default 'member',
  created_at timestamptz default now()
);


-- ROLES TABLE
create table if not exists roles (
  id serial primary key,
  name text unique not null
);

-- MEMBERSHIP TYPES
create table if not exists membership_types (
  id serial primary key,
  key text unique not null,
  name text not null,
  annual_limit numeric default 0,
  created_at timestamptz default now()
);


-- MEMBERS TABLE
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
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
  claim_type text not null,
  date_of_first_visit date,
  date_of_discharge date,
  total_claimed bigint default 0,
  total_payable bigint default 0,
  status text default 'draft',
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



-- AUDIT LOGS
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- SETTINGS
create table if not exists settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);



-- INDEXES
create index if not exists idx_claims_member on claims(member_id);
create index if not exists idx_claims_status on claims(status);

-- =========================================================
-- UNIVERSAL AUDIT LOGGING SYSTEM
-- =========================================================
create or replace function log_audit_event()
returns trigger as $$
begin
  insert into audit_logs (actor_id, action, meta)
  values (
    current_setting('request.jwt.claim.sub', true)::uuid,
    TG_TABLE_NAME || ':' || TG_OP,
    case when TG_OP = 'DELETE' then to_jsonb(OLD) else to_jsonb(NEW) end
  );
  return null;
end;
$$ language plpgsql security definer;

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
-- NOTIFICATIONS SYSTEM (fixed)
-- =========================================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references users(id),
  title text not null,
  message text not null,
  link text,
  read boolean default false,
  type text default 'system',
  sent_email boolean default false,
  actor_id uuid,
  metadata jsonb,
  created_at timestamptz default now()
);

create or replace function notify_on_claim_event()
returns trigger as $$
declare
  msg text;
  recipient uuid;
begin
  select user_id into recipient from members where id = new.member_id;
  if recipient is null then return null; end if;

  if TG_OP = 'INSERT' then
    msg := 'New claim submitted with total ' || new.total_claimed;
  elsif TG_OP = 'UPDATE' and new.status != old.status then
    msg := 'Your claim status changed to ' || new.status;
  else
    return null;
  end if;

  insert into notifications (recipient_id, title, message, link, type, actor_id)
  values (recipient, 'Claim Update', msg, '/claims/' || new.id, 'claim', current_setting('request.jwt.claim.sub', true)::uuid);
  return null;
end;
$$ language plpgsql security definer;

create trigger notify_claims
after insert or update on claims
for each row execute procedure notify_on_claim_event();

-- Edge email trigger
create or replace function trigger_email_on_notification()
returns trigger as $$
begin
  if new.type in ('claim', 'chronic') and current_setting('app.settings.edge_url', true) is not null then
    perform net.http_post(
      url := current_setting('app.settings.edge_url') || '/functions/v1/send-notification-email',
      body := json_build_object('record', new)::text,
      headers := jsonb_build_object('Authorization', 'Bearer ' || coalesce(current_setting('app.settings.service_role_key', true), ''))
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger send_email_trigger
after insert on notifications
for each row execute procedure trigger_email_on_notification();

create index if not exists idx_notifications_recipient_created
on notifications (recipient_id, created_at desc);


-- Auto-create entry in public.users when new auth.user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'member')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();
