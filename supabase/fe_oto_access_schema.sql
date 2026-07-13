-- FE + OTO access columns on profiles
-- Source: FE-OTO-ACCESS-PLAN.md Phase B
-- Safe to re-run (IF NOT EXISTS).
-- Prefer applying migrations/20260713_unlocked_otos.sql in production.

-- plan_type already added in usage_schema.sql; ensure present for fresh installs
alter table public.profiles
  add column if not exists plan_type text not null default 'free';

alter table public.profiles
  add column if not exists unlocked_otos text[] not null default '{}';

comment on column public.profiles.unlocked_otos is
  'OTO product ids unlocked for this user (e.g. oto1..oto12). Admin sets manually after LaunchPadJV payment.';
