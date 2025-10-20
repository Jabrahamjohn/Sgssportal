-- ==============================================================
-- SGSS MEDICAL FUND — COMBINED MIGRATIONS + SEED (v5.1 fixed)
-- Deployable bundle: schema -> functions -> triggers -> policies -> seed
-- ==============================================================

-- ensure pgcrypto is available (for gen_random_uuid)
create extension if not exists pgcrypto;

-- ----------------------------
-- 1. users, roles
-- ----------------------------
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

insert into roles (name) values ('member'), ('committee'), ('admin')
on conflict (name) do nothing;

-- ----------------------------
-- 2. membership_types, members
-- ----------------------------
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

-- ----------------------------
-- 3. claims & claim_items
-- ----------------------------
create table if not exists claims (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete cascade,
  claim_type text not null,
  date_of_first_visit date,
  date_of_discharge date,
  total_claimed bigint default 0,
  total_payable numeric default 0,
  member_payable numeric default 0,
  override_amount numeric default null,
  status text default 'draft' check (status in ('draft','submitted','reviewed','approved','rejected')),
  submitted_at timestamptz,
  processed_at timestamptz,
  approved_at timestamptz,
  notes text,
  excluded boolean default false,
  nhif_number text,
  other_insurance jsonb,
  first_visit_date date,
  discharge_date date,
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

-- ----------------------------
-- 4. claim_reviews, claim_attachments, chronic_requests
-- ----------------------------
create table if not exists claim_reviews (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete cascade,
  reviewer_id uuid references users(id) on delete set null,
  role text check (role in ('committee','admin')),
  action text check (action in ('reviewed','approved','rejected','override','paid')),
  note text,
  created_at timestamptz default now()
);

create index if not exists idx_claim_reviews_claim on claim_reviews(claim_id);

create table if not exists claim_attachments (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete cascade,
  uploaded_by uuid references users(id),
  storage_path text not null,
  url text not null,
  file_name text,
  content_type text,
  created_at timestamptz default now()
);

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

-- ----------------------------
-- 5. reimbursement_scales, settings, notifications, audit_logs
-- ----------------------------
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
on conflict (category) do update set fund_share = excluded.fund_share, member_share = excluded.member_share, ceiling = excluded.ceiling;

create table if not exists settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

insert into settings (key, value)
values
  ('general_limits', '{"annual_limit":250000,"critical_addon":200000,"fund_share_percent":80,"clinic_outpatient_percent":100}'::jsonb),
  ('procedure_tiers', '{"minor":30000,"medium":35000,"major":50000,"regional":90000,"special":70000}'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references users(id) on delete cascade,
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

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- ----------------------------
-- 6. SAFE TRIGGERS & FUNCTIONS (Hardened)
-- ----------------------------

-- 6.1 log_audit_event (safe: swallows errors)
drop function if exists log_audit_event();
create or replace function log_audit_event()
returns trigger as $$
begin
  begin
    insert into audit_logs (actor_id, action, meta)
    values (
      nullif(current_setting('request.jwt.claim.sub', true), '')::uuid,
      TG_TABLE_NAME || ':' || TG_OP,
      case when TG_OP = 'DELETE' then to_jsonb(OLD) else to_jsonb(NEW) end
    );
  exception when others then
    -- swallow to avoid breaking calling transaction
    null;
  end;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists audit_claims on claims;
drop trigger if exists audit_members on members;
drop trigger if exists audit_chronic_requests on chronic_requests;
drop trigger if exists audit_reimbursement on reimbursement_scales;

create trigger audit_claims after insert or update or delete on claims for each row execute procedure log_audit_event();
create trigger audit_members after insert or update or delete on members for each row execute procedure log_audit_event();
create trigger audit_chronic_requests after insert or update or delete on chronic_requests for each row execute procedure log_audit_event();
create trigger audit_reimbursement after insert or update or delete on reimbursement_scales for each row execute procedure log_audit_event();

-- 6.2 notify_on_claim_event (safe checks)
drop function if exists notify_on_claim_event();
drop trigger if exists notify_claims on claims;

create or replace function notify_on_claim_event()
returns trigger as $$
declare
  msg text;
  recipient uuid;
  actor uuid;
begin
  -- safe auth subject
  begin
    actor := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  exception when others then
    actor := null;
  end;

  -- only proceed if NEW is present (INSERT/UPDATE)
  if TG_OP not in ('INSERT','UPDATE') then
    return null;
  end if;

  -- safe access to member_id
  if NEW.member_id is null then
    return null;
  end if;

  select user_id into recipient from members where id = NEW.member_id;
  if recipient is null then return null; end if;

  if TG_OP = 'INSERT' then
    msg := 'New claim submitted (total ' || coalesce(NEW.total_claimed,0) || ')';
  elsif TG_OP = 'UPDATE' and COALESCE(OLD.status,'') is distinct from COALESCE(NEW.status,'') then
    msg := 'Your claim status changed to ' || coalesce(NEW.status, 'unknown');
  else
    return null;
  end if;

  insert into notifications (recipient_id, title, message, link, type, actor_id)
  values (recipient, 'Claim Update', msg, '/claims/' || NEW.id, 'claim', actor);

  return null;
end;
$$ language plpgsql security definer;

create trigger notify_claims
after insert or update on claims
for each row execute procedure notify_on_claim_event();

-- 6.3 handle_new_user (safe)
drop function if exists handle_new_user();
drop trigger if exists on_auth_user_created on auth.users;

create or replace function handle_new_user()
returns trigger as $$
begin
  begin
    insert into public.users (id, email, role)
    values (NEW.id, NEW.email, 'member')
    on conflict (id) do nothing;
  exception when others then
    null;
  end;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- 6.4 enforce_claim_review_status (safe)
drop function if exists enforce_claim_review_status();
drop trigger if exists trg_auto_update_claim_status on claim_reviews;

create or replace function enforce_claim_review_status()
returns trigger as $$
declare
  exists_claim boolean;
  v_claim_id uuid;
begin
  -- only run for INSERT
  if TG_OP <> 'INSERT' then
    return NEW;
  end if;

  v_claim_id := NEW.claim_id;
  if v_claim_id is null then
    raise notice 'Skipping claim status update — new.claim_id is null';
    return NEW;
  end if;

  select exists(select 1 from claims where id = v_claim_id) into exists_claim;
  if not exists_claim then
    raise notice 'Skipping claim status update — claim_id % not found', v_claim_id;
    return NEW;
  end if;

  case NEW.action
    when 'approved' then
      update claims set status = 'approved', approved_at = now() where id = v_claim_id;
    when 'rejected' then
      update claims set status = 'rejected' where id = v_claim_id;
    when 'override' then
      -- override handled by dedicated function; here treat as approved for status flow
      update claims set status = 'approved', approved_at = now() where id = v_claim_id;
    else
      update claims set status = 'reviewed' where id = v_claim_id;
  end case;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_auto_update_claim_status
after insert on claim_reviews
for each row execute procedure enforce_claim_review_status();

-- 6.5 fn_check_submission_window (safe)
drop function if exists fn_check_submission_window();
drop trigger if exists trg_check_submission_window on claims;

create or replace function fn_check_submission_window()
returns trigger as $$
declare
  v_first_visit date := coalesce(NEW.date_of_first_visit, NEW.first_visit_date);
  v_discharge_date date := coalesce(NEW.date_of_discharge, NEW.discharge_date);
  claim_t text := lower(coalesce(NEW.claim_type, 'outpatient'));
begin
  if TG_OP = 'INSERT' then
    if claim_t = 'outpatient' then
      if v_first_visit is null then
        raise exception 'Outpatient claims require date_of_first_visit.';
      end if;
      if (current_date - v_first_visit) > 90 then
        raise exception 'Outpatient claims must be submitted within 90 days of first visit. See Byelaws §4.1.';
      end if;
    elsif claim_t = 'inpatient' then
      if v_discharge_date is null then
        raise exception 'Inpatient claims require date_of_discharge.';
      end if;
      if (current_date - v_discharge_date) > 90 then
        raise exception 'Inpatient claims must be submitted within 90 days of discharge. See Byelaws §4.1.';
      end if;
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_check_submission_window
before insert on claims
for each row execute procedure fn_check_submission_window();

-- 6.6 fn_check_membership_active (safe)
drop function if exists fn_check_membership_active();
drop trigger if exists trg_check_membership_active on claims;

create or replace function fn_check_membership_active()
returns trigger as $$
declare
  m record;
  membership_start date;
begin
  if TG_OP <> 'INSERT' then
    return NEW;
  end if;

  select * into m from members where id = NEW.member_id;
  if not found then
    raise exception 'Member record not found for claim.';
  end if;

  membership_start := coalesce(m.valid_from, current_date);

  if (current_date - membership_start) < 60 then
    raise exception 'Membership waiting period (60 days) not satisfied. See Constitution §6.3.';
  end if;

  if m.valid_to is not null and current_date > m.valid_to then
    raise exception 'Membership expired; renew to submit claims.';
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_check_membership_active
before insert on claims
for each row execute procedure fn_check_membership_active();

-- 6.7 fn_autoflag_exclusions (safe)
drop function if exists fn_autoflag_exclusions();
drop trigger if exists trg_autoflag_exclusions on claims;

create or replace function fn_autoflag_exclusions()
returns trigger as $$
declare
  c text := lower(coalesce(NEW.claim_type, ''));
  notes text := lower(coalesce(NEW.notes, ''));
  excluded_flag boolean := false;
  ci_count int := 0;
  ref_claim_id uuid;
begin
  if TG_OP not in ('INSERT','UPDATE') then
    return NEW;
  end if;

  ref_claim_id := COALESCE(NEW.id, OLD.id);

  if notes like '%cosmetic%' or notes like '%infertility%' or notes like '%nature cure%' then
    excluded_flag := true;
  end if;

  if ref_claim_id is not null then
    select count(*) into ci_count
    from claim_items ci
    where ci.claim_id = ref_claim_id
      and lower(ci.category) in ('cosmetic','transport','mortuary','infertility');

    if ci_count > 0 then
      excluded_flag := true;
    end if;
  end if;

  if excluded_flag then
    NEW.excluded := true;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_autoflag_exclusions
before insert or update on claims
for each row execute procedure fn_autoflag_exclusions();

-- 6.8 compute_claim_payable (single robust definition)
drop function if exists compute_claim_payable();
create or replace function compute_claim_payable(p_claim_id uuid)
returns void as $$
declare
  c record;
  scale record;
  fund_share_amount numeric := 0;
  member_share_amount numeric := 0;
  ceiling numeric := 0;
  membership_lim numeric := null;
  membership_type_id int;
  nhif_amount numeric := 0;
  other_ins_amount numeric := 0;
  clinic_outpatient_percent numeric := null;
  yearly_spent numeric := 0;
begin
  select * into c from claims where id = p_claim_id;
  if not found then return; end if;

  if c.excluded then
    update claims
      set total_payable = 0,
          member_payable = c.total_claimed
    where id = p_claim_id;
    return;
  end if;

  select m.membership_type_id into membership_type_id
  from members m where id = c.member_id;

  if membership_type_id is not null then
    select annual_limit into membership_lim
    from membership_types where id = membership_type_id;
  end if;

  select (value->>'clinic_outpatient_percent')::numeric
  into clinic_outpatient_percent
  from settings where key = 'general_limits';

  select * into scale
  from reimbursement_scales
  where lower(category) = lower(c.claim_type)
  limit 1;

  if not found then
    -- fallback to use general limits
    select (value->>'fund_share_percent')::numeric as fund_share,
           (value->>'annual_limit')::numeric as ceiling
    into scale
    from settings where key='general_limits';
    -- Note: scale.fund_share and scale.ceiling may be null in record context; guard below
  end if;

  if clinic_outpatient_percent is null then
    clinic_outpatient_percent := 100;
  end if;

  if lower(c.claim_type) = 'outpatient'
     and clinic_outpatient_percent = 100
     and lower(coalesce(c.notes, '')) like '%siri guru nanak clinic%' then
    fund_share_amount := c.total_claimed;
    member_share_amount := 0;
  else
    fund_share_amount := (c.total_claimed * (coalesce((scale).fund_share, 80) / 100.0));
    member_share_amount := c.total_claimed - fund_share_amount;
  end if;

  ceiling := coalesce((scale).ceiling, (select (value->>'annual_limit')::numeric from settings where key='general_limits'), 50000);

  if c.nhif_number is not null and length(trim(c.nhif_number)) > 0 then
    if c.other_insurance is not null and c.other_insurance ? 'nhif' then
      nhif_amount := (c.other_insurance->>'nhif')::numeric;
    else
      nhif_amount := 0;
    end if;
  end if;

  if c.other_insurance is not null and c.other_insurance ? 'other' then
    other_ins_amount := (c.other_insurance->>'other')::numeric;
  end if;

  fund_share_amount := greatest(0, fund_share_amount - coalesce(nhif_amount,0) - coalesce(other_ins_amount,0));
  member_share_amount := c.total_claimed - fund_share_amount - coalesce(nhif_amount,0) - coalesce(other_ins_amount,0);

  if fund_share_amount > ceiling then
    fund_share_amount := ceiling;
    member_share_amount := c.total_claimed - fund_share_amount - coalesce(nhif_amount,0) - coalesce(other_ins_amount,0);
  end if;

  if membership_lim is not null and membership_lim > 0 then
    select coalesce(sum(total_payable),0) into yearly_spent
    from claims
    where member_id = c.member_id
      and date_part('year', created_at) = date_part('year', now());

    if yearly_spent + fund_share_amount > membership_lim then
      fund_share_amount := greatest(0, membership_lim - yearly_spent);
      member_share_amount := c.total_claimed - fund_share_amount - coalesce(nhif_amount,0) - coalesce(other_ins_amount,0);
    end if;
  end if;

  update claims
  set total_payable = fund_share_amount,
      member_payable = member_share_amount
  where id = p_claim_id;
end;
$$ language plpgsql security definer;

-- 6.9 trigger_compute_claim_payable (robust: guards NEW/OLD and TG_OP)
drop function if exists trigger_compute_claim_payable();
create or replace function trigger_compute_claim_payable()
returns trigger as $$
declare
  target_claim_id uuid;
begin
  -- choose target claim id depending on table and operation
  if TG_TABLE_NAME = 'claims' then
    if TG_OP = 'DELETE' then
      target_claim_id := OLD.id;
    else
      target_claim_id := NEW.id;
    end if;
  elsif TG_TABLE_NAME = 'claim_items' then
    if TG_OP = 'DELETE' then
      target_claim_id := OLD.claim_id;
    else
      target_claim_id := NEW.claim_id;
    end if;
  else
    return null;
  end if;

  if target_claim_id is null then
    return null;
  end if;

  perform compute_claim_payable(target_claim_id);
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists compute_on_claim on claims;
create trigger compute_on_claim
after insert or update or delete on claims
for each row execute procedure trigger_compute_claim_payable();

-- 6.10 recalc_claim_total_on_items (robust: use TG_OP checks)
drop function if exists recalc_claim_total_on_items();
create or replace function recalc_claim_total_on_items()
returns trigger as $$
declare
  sum_total numeric;
  tgt uuid;
begin
  if TG_TABLE_NAME <> 'claim_items' then
    return null;
  end if;

  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    if NEW.claim_id is null then
      return null;
    end if;
    tgt := NEW.claim_id;

    select coalesce(sum(amount * quantity), 0)
    into sum_total
    from claim_items
    where claim_id = tgt;

    update claims
    set total_claimed = sum_total
    where id = tgt;

    perform compute_claim_payable(tgt);

  elsif TG_OP = 'DELETE' then
    if OLD.claim_id is null then
      return null;
    end if;
    tgt := OLD.claim_id;

    select coalesce(sum(amount * quantity), 0)
    into sum_total
    from claim_items
    where claim_id = tgt;

    update claims
    set total_claimed = sum_total
    where id = tgt;

    perform compute_claim_payable(tgt);
  end if;

  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists recalc_claim_total_after_ins_upd_del on claim_items;
create trigger recalc_claim_total_after_ins_upd_del
after insert or update or delete on claim_items
for each row execute procedure recalc_claim_total_on_items();

-- 6.11 apply_discretionary_override (safe)
drop function if exists apply_discretionary_override();
create or replace function apply_discretionary_override(p_claim uuid, p_amount numeric, p_actor uuid)
returns void as $$
begin
  if p_amount > 150000 then
    raise exception 'Discretionary override cannot exceed Ksh 150,000 as per Byelaws §6.1.';
  end if;

  update claims
  set override_amount = p_amount,
      total_payable = p_amount
  where id = p_claim;

  insert into claim_reviews (claim_id, reviewer_id, role, action, note)
  values (p_claim, p_actor, 'committee', 'override', 'Discretionary override applied');
end;
$$ language plpgsql security definer;

-- ----------------------------
-- 7. RLS policies (unchanged, applied last)
-- ----------------------------
-- enable RLS for resource tables
alter table users enable row level security;
alter table members enable row level security;
alter table claims enable row level security;
alter table claim_items enable row level security;
alter table claim_attachments enable row level security;
alter table chronic_requests enable row level security;
alter table claim_reviews enable row level security;
alter table notifications enable row level security;
alter table settings enable row level security;
alter table reimbursement_scales enable row level security;
alter table audit_logs enable row level security;

-- Users policies
create policy "Users can view own record"
on users for select
using (auth.uid() = id);

create policy "Admins can manage all users"
on users for all
using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

-- Members
create policy "Members can view own membership"
on members for select
using (user_id = auth.uid());

create policy "Admins & committee can view all members"
on members for select
using (exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin','committee')));

create policy "Admins can manage all members"
on members for all
using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

-- Claims
create policy "Members can view and manage their own claims"
on claims for all
using (
  exists (
    select 1 from members m
    where m.id = claims.member_id and m.user_id = auth.uid()
  )
);

create policy "Committee can view all claims"
on claims for select
using (exists (select 1 from users u where u.id = auth.uid() and u.role in ('committee','admin')));

create policy "Committee can update status or add notes"
on claims for update
using (exists (select 1 from users u where u.id = auth.uid() and u.role in ('committee','admin')));

-- Claim items
create policy "Members can edit their claim items"
on claim_items for all
using (
  exists (
    select 1 from claims c
    join members m on c.member_id = m.id
    where claim_items.claim_id = c.id and m.user_id = auth.uid()
  )
);

create policy "Committee/Admin can view all items"
on claim_items for select
using (exists (select 1 from users u where u.id = auth.uid() and u.role in ('committee','admin')));

-- Attachments
create policy "Members can upload attachments for their own claims"
on claim_attachments for all
using (
  exists (
    select 1 from claims c
    join members m on c.member_id = m.id
    where claim_attachments.claim_id = c.id and m.user_id = auth.uid()
  )
);

create policy "Committee/Admin can view all attachments"
on claim_attachments for select
using (exists (select 1 from users u where u.id = auth.uid() and u.role in ('committee','admin')));

-- Chronic requests
create policy "Members can manage own chronic requests"
on chronic_requests for all
using (exists (select 1 from members m where m.id = chronic_requests.member_id and m.user_id = auth.uid()));

create policy "Committee/Admin can view all chronic requests"
on chronic_requests for select
using (exists (select 1 from users u where u.id = auth.uid() and u.role in ('committee','admin')));

-- Claim reviews
create policy "Committee/Admin can review all claims"
on claim_reviews for all
using (exists (select 1 from users u where u.id = auth.uid() and u.role in ('committee','admin')));

create policy "Members can read reviews of their own claims"
on claim_reviews for select
using (
  exists (
    select 1 from claims c
    join members m on c.member_id = m.id
    where c.id = claim_reviews.claim_id and m.user_id = auth.uid()
  )
);

-- Notifications
create policy "Members can read their notifications"
on notifications for select
using (recipient_id = auth.uid());

create policy "Admins & Committee can see all notifications"
on notifications for select
using (exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin','committee')));

-- Settings / scales / audit
create policy "Admin full access settings" on settings for all using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));
create policy "Committee read-only settings" on settings for select using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'committee'));
create policy "Admin full access reimbursement_scales" on reimbursement_scales for all using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));
create policy "Committee read-only reimbursement_scales" on reimbursement_scales for select using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'committee'));
create policy "Admin full access audit_logs" on audit_logs for all using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

-- ----------------------------
-- 8. SEED (safe inserts)
-- ----------------------------
-- Auth users
insert into auth.users (id, email)
values
  ('00000000-0000-0000-0000-000000000001', 'member@sgss.com'),
  ('00000000-0000-0000-0000-000000000002', 'admin@sgss.com'),
  ('00000000-0000-0000-0000-000000000003', 'committee@sgss.com')
on conflict (id) do nothing;

-- App users (public.users)
insert into public.users (id, email, full_name, role)
values
  ('00000000-0000-0000-0000-000000000001', 'member@sgss.com', 'Test Member', 'member'),
  ('00000000-0000-0000-0000-000000000002', 'admin@sgss.com', 'Admin User', 'admin'),
  ('00000000-0000-0000-0000-000000000003', 'committee@sgss.com', 'Committee Reviewer', 'committee')
on conflict (id) do update
set email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role;

-- Roles and membership_types already seeded above via inserts.

-- Members
insert into members (id, user_id, membership_type_id, nhif_number, valid_from, valid_to)
values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    (select id from membership_types where key='single'),
    'NHIF123',
    current_date - interval '90 days',
    current_date + interval '2 years'
  )
on conflict (id) do update
set nhif_number = excluded.nhif_number,
    valid_to = excluded.valid_to;

-- A sample claim
insert into claims (id, member_id, claim_type, date_of_first_visit, total_claimed, status, notes)
values (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'outpatient',
  current_date - interval '3 days',
  4000,
  'submitted',
  'Consulted at Siri Guru Nanak Clinic'
)
on conflict (id) do update set total_claimed = excluded.total_claimed, status = excluded.status, notes = excluded.notes;

-- Claim items for sample claim
insert into claim_items (id, claim_id, category, description, amount, quantity)
values
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', 'consultation', 'Doctor consultation', 2000, 1),
  (gen_random_uuid(), '20000000-0000-0000-0000-000000000001', 'medicine', 'Pain relief tablets', 2000, 1)
on conflict do nothing;

-- Chronic requests, settings, notifications, audit log
insert into chronic_requests (id, member_id, doctor_name, medicines, total_amount, member_payable, status)
values
  (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', 'Dr. Patel',
   '[{"name":"Metformin","strength":"500mg","dosage":"2x daily","duration":"30 days"}]'::jsonb, 3000, 1800, 'approved')
on conflict do nothing;

insert into settings (key, value)
values
  ('general_limits', '{"annual_limit":250000,"critical_addon":200000,"fund_share_percent":80,"clinic_outpatient_percent":100}'::jsonb),
  ('reimbursement_scales', '[{"category":"Outpatient","fund_share":80,"member_share":20,"ceiling":50000},{"category":"Inpatient","fund_share":85,"member_share":15,"ceiling":200000},{"category":"Chronic","fund_share":60,"member_share":40,"ceiling":120000}]'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

insert into notifications (recipient_id, title, message, link, type)
values
  ('00000000-0000-0000-0000-000000000001', 'Welcome to SGSS Medical Fund', 'Your profile and membership are active. You can now submit claims.', '/dashboard', 'system'),
  ('00000000-0000-0000-0000-000000000003', 'Claim Submitted', 'A new claim from Test Member is awaiting review.', '/committee/claims', 'claim')
on conflict do nothing;

insert into audit_logs (actor_id, action, meta)
values ('00000000-0000-0000-0000-000000000002', 'seed_init', '{"note": "Seed data inserted for testing and role setup."}'::jsonb)
on conflict do nothing;

-- Final verification select (harmless)
-- select u.id, u.email, u.role from public.users u order by role;
