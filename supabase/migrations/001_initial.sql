-- =====================================================================
-- SGSS MEDICAL FUND — INITIAL MIGRATION (v5.1 FINAL)
-- Author: Abraham John
-- Date: 2025-10-17
-- Description:
--   Full schema definition for the SGSS Medical Fund portal
--   Safe triggers for seed and production
-- =====================================================================

-- ================================================================
-- 1️⃣ USERS & ROLES
-- ================================================================
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text default 'member' check (role in ('member','committee','admin')),
  created_at timestamptz default now()
);

create table if not exists roles (
  id serial primary key,
  name text unique not null
);

insert into roles (name)
values ('member'), ('committee'), ('admin')
on conflict (name) do nothing;

-- ================================================================
-- 2️⃣ MEMBERSHIP TYPES & MEMBERS
-- ================================================================
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

-- ================================================================
-- 3️⃣ CLAIMS & CLAIM ITEMS
-- ================================================================
create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  claim_type text not null,
  date_of_first_visit date,
  date_of_discharge date,
  total_claimed bigint default 0,
  total_payable bigint default 0,
  status text default 'draft' check (status in ('draft','submitted','reviewed','approved','rejected')),
  submitted_at timestamptz,
  processed_at timestamptz,
  approved_at timestamptz,
  notes text,
  created_at timestamptz default now()
);

create table if not exists claim_items (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete cascade,
  category text,
  description text,
  amount bigint not null,
  retail_price bigint,
  quantity int default 1
);

create index if not exists idx_claims_member on claims(member_id);
create index if not exists idx_claims_status on claims(status);

-- ================================================================
-- 4️⃣ CLAIM REVIEWS
-- ================================================================
create table if not exists claim_reviews (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete cascade,
  reviewer_id uuid references users(id) on delete set null,
  role text check (role in ('committee','admin')) not null,
  action text check (action in ('reviewed','approved','rejected')) not null,
  note text,
  created_at timestamptz default now()
);

create index if not exists idx_claim_reviews_claim on claim_reviews(claim_id);

-- ================================================================
-- 5️⃣ CHRONIC REQUESTS
-- ================================================================
create table if not exists chronic_requests (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  doctor_name text,
  medicines jsonb,
  total_amount bigint,
  member_payable bigint,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- ================================================================
-- 6️⃣ REIMBURSEMENT SCALES
-- ================================================================
create table if not exists reimbursement_scales (
  id uuid primary key default gen_random_uuid(),
  category text unique not null,
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

-- ================================================================
-- 7️⃣ SETTINGS
-- ================================================================
create table if not exists settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

insert into settings (key, value)
values
  ('general_limits', '{"annual_limit":250000,"critical_addon":200000,"fund_share_percent":80,"clinic_outpatient_percent":100}'::jsonb),
  ('procedure_tiers', '{"minor":30000,"medium":35000,"major":50000,"regional":90000,"special":70000}'::jsonb)
on conflict (key)
do update set value = excluded.value, updated_at = now();

-- ================================================================
-- 8️⃣ AUDIT LOGGING
-- ================================================================
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  meta jsonb,
  created_at timestamptz default now()
);

drop function if exists log_audit_event();
create or replace function log_audit_event()
returns trigger as $$
begin
  insert into audit_logs (actor_id, action, meta)
  values (
    nullif(current_setting('request.jwt.claim.sub', true), '')::uuid,
    TG_TABLE_NAME || ':' || TG_OP,
    case when TG_OP = 'DELETE' then to_jsonb(OLD) else to_jsonb(NEW) end
  );
  return null;
exception
  when others then
    return null;
end;
$$ language plpgsql security definer;

create trigger audit_claims after insert or update or delete on claims for each row execute procedure log_audit_event();
create trigger audit_members after insert or update or delete on members for each row execute procedure log_audit_event();
create trigger audit_chronic_requests after insert or update or delete on chronic_requests for each row execute procedure log_audit_event();
create trigger audit_reimbursement after insert or update or delete on reimbursement_scales for each row execute procedure log_audit_event();

-- ================================================================
-- 9️⃣ NOTIFICATIONS (SAFE VERSION)
-- ================================================================
drop function if exists notify_on_claim_event();
drop trigger if exists notify_claims on claims;

create or replace function notify_on_claim_event()
returns trigger as $$
declare
  msg text;
  recipient uuid;
  actor uuid;
begin
  -- Safely handle missing auth context
  begin
    actor := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  exception when others then
    actor := null;
  end;

  select user_id into recipient from members where id = new.member_id;
  if recipient is null then return null; end if;

  if TG_OP = 'INSERT' then
    msg := 'New claim submitted (total ' || coalesce(new.total_claimed, 0) || ')';
  elsif TG_OP = 'UPDATE' and old.status is distinct from new.status then
    msg := 'Your claim status changed to ' || coalesce(new.status, 'unknown');
  else
    return null;
  end if;

  insert into notifications (recipient_id, title, message, link, type, actor_id)
  values (recipient, 'Claim Update', msg, '/claims/' || new.id, 'claim', actor);

  return null;
end;
$$ language plpgsql security definer;

create trigger notify_claims
after insert or update on claims
for each row execute procedure notify_on_claim_event();

-- ================================================================
-- 🔟 USER AUTO CREATION FROM AUTH
-- ================================================================
drop function if exists handle_new_user();
drop trigger if exists on_auth_user_created on auth.users;

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'member')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- ================================================================
-- 1️⃣1️⃣ SAFE REVIEW STATUS TRIGGER
-- ================================================================
drop function if exists enforce_claim_review_status();
drop trigger if exists trg_auto_update_claim_status on claim_reviews;

create or replace function enforce_claim_review_status()
returns trigger as $$
declare
  exists_claim boolean;
begin
  select exists(select 1 from claims where id = new.claim_id) into exists_claim;
  if not exists_claim then
    raise notice 'Skipping claim status update — claim_id % not found', new.claim_id;
    return new;
  end if;

  case new.action
    when 'approved' then
      update claims set status = 'approved', approved_at = now() where id = new.claim_id;
    when 'rejected' then
      update claims set status = 'rejected' where id = new.claim_id;
    else
      update claims set status = 'reviewed' where id = new.claim_id;
  end case;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_auto_update_claim_status
after insert on claim_reviews
for each row execute procedure enforce_claim_review_status();

-- ================================================================
-- ✅ VERIFIED END OF MIGRATION
-- ================================================================