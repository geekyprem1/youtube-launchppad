-- ============================================================
-- AI Video Engine Schema
-- Run this in your Supabase SQL Editor AFTER the main schema.sql
-- ============================================================

-- 1. video_engine_sessions
-- One row per wizard run. Stores every step's selections and AI outputs.
create table if not exists public.video_engine_sessions (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users on delete cascade not null,

  -- Step 0: Input
  input_type    text not null check (input_type in ('keyword', 'channel')),
  raw_input     text not null,
  channel_id    text,
  resolved_niche text,

  -- Step 1: Topic Discovery
  selected_topic       text,
  selected_confidence  numeric(5,2),
  selected_trend       text,
  selected_difficulty  text,
  all_topics           jsonb not null default '[]',

  -- Step 2: Language
  language      text not null default 'English',

  -- Step 3: Video Type
  video_type    text check (video_type in (
                  'shorts','long_form','documentary','tutorial',
                  'listicle','storytelling','faceless','news','podcast'
                )),

  -- Step 4: Audience
  audience_level  text check (audience_level in ('beginner','intermediate','advanced')),
  audience_age    text check (audience_age in ('kids','teen','18_25','25_40','40_plus')),

  -- Step 5: Tone
  tone          text check (tone in (
                  'professional','funny','emotional','motivational',
                  'educational','storytelling','aggressive','luxury'
                )),

  -- Step 6: Hook Generator
  selected_hook        text,
  selected_hook_type   text,
  all_hooks            jsonb not null default '[]',

  -- Step 7: Script Generator
  script               jsonb not null default '{}',

  -- Step 8: Complete Video Kit
  video_kit            jsonb not null default '{}',

  -- Meta
  status        text not null default 'in_progress'
                  check (status in ('in_progress','completed','exported')),
  credits_used  integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Index for fast user history queries
create index if not exists idx_ve_sessions_user_created
  on public.video_engine_sessions (user_id, created_at desc);

-- Auto-update updated_at on row changes
create or replace function public.handle_ve_session_updated()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_ve_session_updated on public.video_engine_sessions;
create trigger on_ve_session_updated
  before update on public.video_engine_sessions
  for each row execute procedure public.handle_ve_session_updated();

-- RLS
alter table public.video_engine_sessions enable row level security;

create policy "Users manage own video engine sessions"
  on public.video_engine_sessions
  for all
  using (auth.uid() = user_id);


-- 2. video_engine_cache
-- Content-addressable cache keyed on sha256(step+topic+lang+videoType+audience+tone+hook).
-- Shared across all users — same inputs always produce same AI output.
create table if not exists public.video_engine_cache (
  cache_key     text primary key,
  step          text not null,
  payload       jsonb not null,
  hit_count     integer not null default 1,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default (now() + interval '7 days')
);

create index if not exists idx_ve_cache_expires
  on public.video_engine_cache (expires_at);

-- RLS: authenticated users can read cache; only service_role can write
alter table public.video_engine_cache enable row level security;

create policy "Authenticated users read cache"
  on public.video_engine_cache
  for select
  using (auth.role() = 'authenticated');


-- 3. Extend profiles table with video engine credits
alter table public.profiles
  add column if not exists video_engine_credits integer not null default 10;
