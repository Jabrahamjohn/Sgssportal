-- ============================================================
-- 004_rls_policies.sql
-- Role-Based Access Policies for SGSS Medical Fund
-- ============================================================

-- Enable RLS
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

-- ============================================================
--  USERS
-- ============================================================
create policy "Users can view own record"
on users for select
using (auth.uid() = id);

create policy "Admins can manage all users"
on users for all
using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

-- ============================================================
--  MEMBERS
-- ============================================================
create policy "Members can view own membership"
on members for select
using (user_id = auth.uid());

create policy "Admins & committee can view all members"
on members for select
using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin','committee'))
);

create policy "Admins can manage all members"
on members for all
using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

-- ============================================================
--  CLAIMS
-- ============================================================
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
using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('committee','admin'))
);

create policy "Committee can update status or add notes"
on claims for update
using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('committee','admin'))
);

-- ============================================================
--  CLAIM ITEMS
-- ============================================================
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
using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('committee','admin'))
);

-- ============================================================
--  CLAIM ATTACHMENTS
-- ============================================================
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
using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('committee','admin'))
);

-- ============================================================
--  CHRONIC REQUESTS
-- ============================================================
create policy "Members can manage own chronic requests"
on chronic_requests for all
using (
  exists (
    select 1 from members m
    where m.id = chronic_requests.member_id and m.user_id = auth.uid()
  )
);

create policy "Committee/Admin can view all chronic requests"
on chronic_requests for select
using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('committee','admin'))
);

-- ============================================================
--  CLAIM REVIEWS
-- ============================================================
create policy "Committee/Admin can review all claims"
on claim_reviews for all
using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('committee','admin'))
);

create policy "Members can read reviews of their own claims"
on claim_reviews for select
using (
  exists (
    select 1 from claims c
    join members m on c.member_id = m.id
    where c.id = claim_reviews.claim_id and m.user_id = auth.uid()
  )
);

-- ============================================================
--  NOTIFICATIONS
-- ============================================================
create policy "Members can read their notifications"
on notifications for select
using (recipient_id = auth.uid());

create policy "Admins & Committee can see all notifications"
on notifications for select
using (
  exists (select 1 from users u where u.id = auth.uid() and u.role in ('admin','committee'))
);

-- ============================================================
--  SETTINGS, REIMBURSEMENT_SCALES, AUDIT_LOGS
-- ============================================================
create policy "Admin full access"
on settings for all
using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Committee read-only"
on settings for select
using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'committee'));

create policy "Admin full access"
on reimbursement_scales for all
using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));

create policy "Committee read-only"
on reimbursement_scales for select
using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'committee'));

create policy "Admin full access"
on audit_logs for all
using (exists (select 1 from users u where u.id = auth.uid() and u.role = 'admin'));
