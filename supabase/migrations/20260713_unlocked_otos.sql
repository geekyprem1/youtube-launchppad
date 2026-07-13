-- FE-OTO-ACCESS-PLAN Phase B
-- Admin-manual OTO unlocks on profiles (no payment webhooks).
--
-- plan_type values going forward:
--   'free'  = no FE yet (signup default)
--   'fe'    = FE buyer (Video Engine core + Basic Thumbnail)
--   legacy: starter | pro | elite | creator_pro | ultimate
--
-- unlocked_otos examples: '{}', '{oto2}', '{oto2,oto5}', '{oto12}' (Infinity = all)
-- Run in Supabase SQL Editor if not applying via CLI.

alter table public.profiles
  add column if not exists unlocked_otos text[] not null default '{}';

comment on column public.profiles.unlocked_otos is
  'OTO product ids unlocked for this user (e.g. oto1..oto12). Admin sets manually after LaunchPadJV payment.';
