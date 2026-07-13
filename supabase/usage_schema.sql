-- Run this in Supabase SQL Editor AFTER the main schema.sql

-- Add plan_type to profiles
-- Values: free (signup) | fe (FE $17 base) | legacy starter/pro/elite/creator_pro/ultimate
alter table public.profiles
  add column if not exists plan_type text not null default 'free';

-- OTO unlocks (admin manual). Also: migrations/20260713_unlocked_otos.sql
alter table public.profiles
  add column if not exists unlocked_otos text[] not null default '{}';

-- Usage tracking table for daily limits
create table if not exists public.usage_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  feature text not null,
  date date not null default current_date,
  count int not null default 0,
  unique(user_id, feature, date)
);

-- Channel audits table
create table if not exists public.channel_audits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  channel_url text,
  channel_name text,
  channel_id text,
  result jsonb not null default '{}',
  created_at timestamptz default now()
);

-- RLS
alter table public.usage_logs enable row level security;
alter table public.channel_audits enable row level security;

create policy "Users manage own usage_logs" on public.usage_logs for all using (auth.uid() = user_id);
create policy "Users manage own channel_audits" on public.channel_audits for all using (auth.uid() = user_id);
