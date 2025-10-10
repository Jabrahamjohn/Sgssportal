-- 002_attachments_and_calc.sql
-- Attachments table for claim documents
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

-- Claim comments/log for committee notes & appeals
create table if not exists claim_reviews (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete cascade,
  reviewer_id uuid references users(id),
  role text,
  action text, -- reviewed | recommended | approved | rejected | appealed | note
  note text,
  created_at timestamptz default now()
);

-- Function: compute_payable based on reimbursement_scales, membership limits, nhif deduction
create or replace function compute_claim_payable(p_claim_id uuid)
returns void as $$
declare
  c record;
  member_user uuid;
  scale record;
  fund_share_amount numeric;
  member_share_amount numeric;
  ceiling numeric;
  nhif_ded numeric := 0;
  membership_lim numeric := null;
  membership_type_id int;
begin
  select * into c from claims where id = p_claim_id;
  if not found then return; end if;

  -- fetch membership limits and user's membership type
  select membership_type_id into membership_type_id from members where id = c.member_id;
  if membership_type_id is not null then
    select annual_limit into membership_lim from membership_types where id = membership_type_id;
  end if;

  -- pick reimbursement scale for claim_type
  select * into scale from reimbursement_scales where lower(category) = lower(c.claim_type) limit 1;
  if not found then
    -- fallback to settings.general_limits fund_share_percent if present
    select value->>'fund_share_percent' as fund_percent into scale from settings where key='general_limits';
  end if;

  ceiling := coalesce(scale.ceiling, (select (value->>'annual_limit')::numeric from settings where key='general_limits'));
  fund_share_amount := (c.total_claimed * (coalesce(scale.fund_share, (select (value->>'fund_share_percent')::numeric from settings where key='general_limits')) / 100.0));
  member_share_amount := c.total_claimed - fund_share_amount;

  -- Apply ceiling (fund can only pay up to ceiling)
  if fund_share_amount > ceiling then
    fund_share_amount := ceiling;
  end if;

  -- NHIF: if member has NHIF number, we optionally deduct a fixed percent or leave to business rule.
  select nhif_number into member_user from members where id = c.member_id;
  if member_user is not null and member_user <> '' then
    -- For now we assume NHIF covers nothing automatically here; adjust if needed
    nhif_ded := 0;
  end if;

  -- If membership annual limit exists, cap payable by remaining limit
  if membership_lim is not null and membership_lim > 0 then
    -- compute total paid this year for this member (simplified)
    fund_share_amount := least(fund_share_amount, membership_lim);
  end if;

  update claims set total_payable = fund_share_amount, member_payable = member_share_amount - nhif_ded where id = p_claim_id;
end;
$$ language plpgsql security definer;

-- Trigger to compute payable after insert/update on claim_items or claims total change
create or replace function trigger_compute_claim_payable()
returns trigger as $$
begin
  perform compute_claim_payable(coalesce(new.id, old.claim_id, new.claim_id));
  return null;
end;
$$ language plpgsql security definer;

-- When a claim is inserted/updated
create trigger compute_on_claim
after insert or update on claims
for each row execute procedure trigger_compute_claim_payable();

-- When a claim_item changes, compute parent claim totals and payable
create or replace function recalc_claim_total_on_items()
returns trigger as $$
declare
  sum_total numeric;
begin
  if tg_op = 'INSERT' or tg_op = 'UPDATE' then
    select coalesce(sum(amount * quantity),0) into sum_total from claim_items where claim_id = new.claim_id;
    update claims set total_claimed = sum_total where id = new.claim_id;
    perform compute_claim_payable(new.claim_id);
  elsif tg_op = 'DELETE' then
    select coalesce(sum(amount * quantity),0) into sum_total from claim_items where claim_id = old.claim_id;
    update claims set total_claimed = sum_total where id = old.claim_id;
    perform compute_claim_payable(old.claim_id);
  end if;
  return null;
end;
$$ language plpgsql security definer;

create trigger recalc_claim_total_after_ins_upd_del
after insert or update or delete on claim_items
for each row execute procedure recalc_claim_total_on_items();
