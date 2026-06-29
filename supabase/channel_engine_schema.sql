-- ============================================================
-- Channel Engine Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

create table if not exists public.channel_engine_audits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  channel_url text not null,
  channel_name text,
  overall_score integer not null,
  analysis_type text not null check (analysis_type in ('real', 'ai_smart')),
  report jsonb not null,
  created_at timestamptz default now()
);

alter table public.channel_engine_audits enable row level security;
create policy "Users can manage own audits" on public.channel_engine_audits for all using (auth.uid() = user_id);
