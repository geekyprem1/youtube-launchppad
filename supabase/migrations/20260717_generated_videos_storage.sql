-- Public storage bucket for AI-generated videos (Video Creation Pro / p-video).
-- The app also auto-creates this bucket via the service-role key, but this makes
-- it explicit and sets read/write policies.

insert into storage.buckets (id, name, public, file_size_limit)
values ('generated-videos', 'generated-videos', true, 209715200) -- 200MB
on conflict (id) do update set public = true, file_size_limit = 209715200;

-- Public read (bucket is public so history/playback works via public URL)
drop policy if exists "Public read generated videos" on storage.objects;
create policy "Public read generated videos"
  on storage.objects for select
  using (bucket_id = 'generated-videos');

-- Authenticated users can upload their own videos (path prefixed with their user id)
drop policy if exists "Users upload own generated videos" on storage.objects;
create policy "Users upload own generated videos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'generated-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
