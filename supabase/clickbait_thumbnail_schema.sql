create table if not exists public.clickbait_thumbnail_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  video_type text not null check (video_type in ('long', 'shorts')),
  topic text not null,
  clickbait_prompt text not null,
  image_url text not null,
  model_name text not null,
  image_size text not null,
  seed text,
  generation_time numeric,
  created_at timestamptz default now()
);

create index if not exists idx_clickbait_thumbnail_user_created
  on public.clickbait_thumbnail_history (user_id, created_at desc);

alter table public.clickbait_thumbnail_history enable row level security;

drop policy if exists "Users manage own clickbait thumbnail history" on public.clickbait_thumbnail_history;

create policy "Users manage own clickbait thumbnail history"
  on public.clickbait_thumbnail_history
  for all
  using (auth.uid() = user_id);
