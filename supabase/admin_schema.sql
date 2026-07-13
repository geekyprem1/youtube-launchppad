-- Run this in your Supabase SQL Editor

-- 1. Add role and is_banned columns to profiles
alter table public.profiles
  add column if not exists role text not null default 'user',
  add column if not exists is_banned boolean not null default false;

-- 1b. FE / OTO access (see also migrations/20260713_unlocked_otos.sql)
-- plan_type: free | fe | starter | pro | elite | creator_pro | ultimate
-- unlocked_otos: e.g. {oto2,oto5} — admin manual after LaunchPadJV payment
alter table public.profiles
  add column if not exists unlocked_otos text[] not null default '{}';

-- 2. Create a secure function to check admin status bypassing RLS
create or replace function public.is_admin()
returns boolean as $$
declare
  is_adm boolean;
begin
  select role = 'admin' into is_adm from public.profiles where id = auth.uid();
  return coalesce(is_adm, false);
end;
$$ language plpgsql security definer;

-- 3. Add RLS policies for admins
-- This allows admins to view and update any profile
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles 
  for select using (public.is_admin());

drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles" on public.profiles 
  for update using (public.is_admin());
