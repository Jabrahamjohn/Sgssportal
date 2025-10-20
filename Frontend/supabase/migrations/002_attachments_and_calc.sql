-- ======================================================
-- 002_attachments_and_calc.sql (Fixed + Enhanced)
-- Adds claim attachments, reviews, and reimbursement logic
-- ======================================================

-- ======================================================
-- 1. Attachments
-- ======================================================
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

-- ======================================================
-- 2. Reviews (committee/admin comments, actions)
-- ======================================================
create table if not exists claim_reviews (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references claims(id) on delete cascade,
  reviewer_id uuid references users(id),
  role text,
  action text, -- reviewed | approved | rejected | paid
  note text,
  created_at timestamptz default now()
);

-- ======================================================
-- 3. Automatic Reimbursement Logic
-- ======================================================

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
begin
  select * into c from claims where id = p_claim_id;
  if not found then return; end if;

  -- Membership info
  select membership_type_id into membership_type_id from members where id = c.member_id;
  if membership_type_id is not null then
    select annual_limit into membership_lim from membership_types where id = membership_type_id;
  end if;

  -- Reimbursement scale
  select * into scale from reimbursement_scales where lower(category) = lower(c.claim_type) limit 1;
  if not found then
    select value->>'fund_share_percent' as fund_share into scale from settings where key='general_limits';
  end if;

  ceiling := coalesce(scale.ceiling, 50000);
  fund_share_amount := (c.total_claimed * (coalesce(scale.fund_share, 80) / 100.0));
  member_share_amount := c.total_claimed - fund_share_amount;

  -- Enforce ceiling
  if fund_share_amount > ceiling then
    fund_share_amount := ceiling;
    member_share_amount := c.total_claimed - fund_share_amount;
  end if;

  -- Enforce membership annual limit
  if membership_lim is not null and fund_share_amount > membership_lim then
    fund_share_amount := membership_lim;
    member_share_amount := c.total_claimed - fund_share_amount;
  end if;

  update claims 
  set total_payable = fund_share_amount,
      member_payable = member_share_amount
  where id = p_claim_id;
end;
$$ language plpgsql security definer;

-- ======================================================
-- 4. Triggers for Claims and Claim Items
-- ======================================================

-- Trigger function: recompute total and payable
create or replace function trigger_compute_claim_payable()
returns trigger as $$
declare
  target_claim_id uuid;
begin
  -- Pick the correct claim id (depending on the table)
  if tg_table_name = 'claims' then
    target_claim_id := new.id;
  elsif tg_table_name = 'claim_items' then
    target_claim_id := coalesce(new.claim_id, old.claim_id);
  else
    return null;
  end if;

  perform compute_claim_payable(target_claim_id);
  return null;
end;
$$ language plpgsql security definer;

-- Trigger on claims table
drop trigger if exists compute_on_claim on claims;
create trigger compute_on_claim
after insert or update on claims
for each row execute procedure trigger_compute_claim_payable();

-- Auto recalc total and payable when claim items change
create or replace function recalc_claim_total_on_items()
returns trigger as $$
declare
  sum_total numeric;
begin
  if tg_op = 'INSERT' or tg_op = 'UPDATE' then
    select coalesce(sum(amount * quantity), 0)
    into sum_total
    from claim_items
    where claim_id = new.claim_id;

    update claims
    set total_claimed = sum_total
    where id = new.claim_id;

    perform compute_claim_payable(new.claim_id);
  elsif tg_op = 'DELETE' then
    select coalesce(sum(amount * quantity), 0)
    into sum_total
    from claim_items
    where claim_id = old.claim_id;

    update claims
    set total_claimed = sum_total
    where id = old.claim_id;

    perform compute_claim_payable(old.claim_id);
  end if;

  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists recalc_claim_total_after_ins_upd_del on claim_items;
create trigger recalc_claim_total_after_ins_upd_del
after insert or update or delete on claim_items
for each row execute procedure recalc_claim_total_on_items();
