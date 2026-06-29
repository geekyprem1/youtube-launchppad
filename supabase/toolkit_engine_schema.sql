create table if not exists public.toolkit_engine_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  video_type text not null check (video_type in ('long', 'shorts')),
  topic text not null,
  titles jsonb not null,
  description text not null,
  keywords jsonb not null,
  tags jsonb not null,
  hashtags jsonb not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.toolkit_engine_history enable row level security;

-- Drop policy if exists to avoid errors on multiple runs
drop policy if exists "Users can manage own toolkit history" on public.toolkit_engine_history;

-- Create policy
create policy "Users can manage own toolkit history" on public.toolkit_engine_history for all using (auth.uid() = user_id);
