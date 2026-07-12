-- ============================================================
-- Voice Studio Schema (standalone AI voiceover / TTS tool)
-- Run this in your Supabase SQL Editor AFTER the main schema.sql
-- ============================================================

-- 1. voice_studio_generations
-- One row per generated voiceover.
create table if not exists public.voice_studio_generations (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users on delete cascade not null,
  script_text       text not null,
  voice             text not null,
  audio_url         text not null,
  character_count   integer not null,
  duration_seconds  numeric,
  created_at        timestamptz not null default now()
);

create index if not exists idx_voice_studio_user_created
  on public.voice_studio_generations (user_id, created_at desc);

alter table public.voice_studio_generations enable row level security;

create policy "Users manage own voice studio generations"
  on public.voice_studio_generations
  for all
  using (auth.uid() = user_id);


-- 2. Storage bucket for generated audio files
insert into storage.buckets (id, name, public)
values ('voiceover-audio', 'voiceover-audio', true)
on conflict (id) do nothing;

-- Files are stored at "{user_id}/{filename}.mp3" so RLS can scope by folder.
create policy "Users upload own voiceover audio"
  on storage.objects for insert
  with check (
    bucket_id = 'voiceover-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own voiceover audio"
  on storage.objects for delete
  using (
    bucket_id = 'voiceover-audio'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Public read voiceover audio"
  on storage.objects for select
  using (bucket_id = 'voiceover-audio');
