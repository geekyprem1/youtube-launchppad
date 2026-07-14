-- Permanent storage for AI-generated thumbnails (ClickBoost + Thumbnail Engine).
-- SiliconFlow / other providers return expiring CDN URLs — we re-host here.
-- Run this in Supabase SQL Editor once.

insert into storage.buckets (id, name, public)
values ('generated-thumbnails', 'generated-thumbnails', true)
on conflict (id) do nothing;

-- Paths: "{user_id}/{folder}/{uuid}.ext" — RLS scopes by first folder segment.

drop policy if exists "Users upload own generated thumbnails" on storage.objects;
create policy "Users upload own generated thumbnails"
  on storage.objects for insert
  with check (
    bucket_id = 'generated-thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users delete own generated thumbnails" on storage.objects;
create policy "Users delete own generated thumbnails"
  on storage.objects for delete
  using (
    bucket_id = 'generated-thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users update own generated thumbnails" on storage.objects;
create policy "Users update own generated thumbnails"
  on storage.objects for update
  using (
    bucket_id = 'generated-thumbnails'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Public read generated thumbnails" on storage.objects;
create policy "Public read generated thumbnails"
  on storage.objects for select
  using (bucket_id = 'generated-thumbnails');
