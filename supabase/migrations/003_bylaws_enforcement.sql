-- 003_bylaws_enforcement.sql
-- Enforce Constitution & Byelaws: waiting period, submission deadline, required attachments,
-- NHIF/other insurance deductions, exclusions, and committee discretionary override flags.

-- 1) Add metadata columns for claims if missing
alter table claims
  add column if not exists first_visit_date date,
  add column if not exists discharge_date date,
  add column if not exists nhif_number text,
  add column if not exists other_insurance jsonb,
  add column if not exists excluded boolean default false, -- flagged as exclusion (cosmetic etc)
  add column if not exists override_amount numeric default null, -- discretionary override by committee
  add column if not exists member_payable numeric default 0;

-- 2) Helper: check submission window.
create or replace function fn_check_submission_window()
returns trigger as $$
declare
  v_first_visit date := coalesce(new.date_of_first_visit, new.first_visit_date);
  v_discharge_date date := coalesce(new.date_of_discharge, new.discharge_date);
  claim_t text := lower(coalesce(new.claim_type, 'outpatient'));
begin
  if tg_op = 'INSERT' then
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
    elsif claim_t = 'chronic' then
      -- allowed (may require doctor validation elsewhere)
      null;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_check_submission_window on claims;
create trigger trg_check_submission_window
before insert on claims
for each row execute procedure fn_check_submission_window();


-- 3) Helper: membership waiting period (60 days) and membership active check
create or replace function fn_check_membership_active()
returns trigger as $$
declare
  m record;
  membership_start date;
begin
  select * into m from members where id = new.member_id;
  if not found then
    raise exception 'Member record not found for claim.';
  end if;

  -- benefits start after 60 days from valid_from (Constitution)
  membership_start := coalesce(m.valid_from, current_date);

  if (current_date - membership_start) < 60 then
    raise exception 'Membership waiting period (60 days) not satisfied. See Constitution §6.3.';
  end if;

  if m.valid_to is not null and current_date > m.valid_to then
    raise exception 'Membership expired; renew to submit claims.';
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_check_membership_active on claims;
create trigger trg_check_membership_active
before insert on claims
for each row execute procedure fn_check_membership_active();


-- 4) Exclusions: mark excluded claims (cosmetic, transport, mortuary, infertility)
create or replace function fn_autoflag_exclusions()
returns trigger as $$
declare
  c text := lower(coalesce(new.claim_type, ''));
  notes text := lower(coalesce(new.notes, ''));
  excluded_flag boolean := false;
  ci_count int := 0;
  ref_claim_id uuid;
begin
  -- Determine claim id for lookup
  if tg_op = 'INSERT' then
    ref_claim_id := new.id;
  elsif tg_op = 'UPDATE' then
    ref_claim_id := coalesce(new.id, old.id);
  else
    ref_claim_id := null;
  end if;

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
    new.excluded := true;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_autoflag_exclusions on claims;
create trigger trg_autoflag_exclusions
before insert or update on claims
for each row execute procedure fn_autoflag_exclusions();


-- 5) compute_claim_payable function (ensure exists; this will replace older definition)
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

  select membership_type_id into membership_type_id
  from members where id = c.member_id;

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
    -- fallback to a minimal object structure: set local temp values
    scale := (select row(null::uuid, (value->>'fund_share_percent')::numeric, null::numeric, null::numeric) from settings where key='general_limits');
    -- note: scale.fund_share will be available via field position
  end if;

  -- compute fund/member shares
  if lower(c.claim_type) = 'outpatient'
     and clinic_outpatient_percent = 100
     and lower(coalesce(c.notes, '')) like '%siri guru nanak clinic%' then
    fund_share_amount := c.total_claimed;
    member_share_amount := 0;
  else
    fund_share_amount := (c.total_claimed * (coalesce((scale).fund_share, 80) / 100.0));
    member_share_amount := c.total_claimed - fund_share_amount;
  end if;

  ceiling := coalesce((scale).ceiling, (select (value->>'annual_limit')::numeric from settings where key='general_limits'));

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


-- 6) Discretionary override function (fixed update of total_payable)
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
