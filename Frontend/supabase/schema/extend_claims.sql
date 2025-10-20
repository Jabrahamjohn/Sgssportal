-- supabase/schema/extend_claims.sql
alter table claims
add column if not exists processed_by uuid references users(id),
add column if not exists approved_by uuid references users(id),
add column if not exists paid_by uuid references users(id),
add column if not exists payment_reference text,
add column if not exists fund_share bigint default 0,
add column if not exists member_share bigint default 0;
