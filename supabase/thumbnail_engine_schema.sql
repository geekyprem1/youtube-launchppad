create table if not exists public.thumbnail_engine_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  video_type text not null check (video_type in ('long', 'shorts')),
  input_type text not null check (input_type in ('topic', 'title', 'prompt')),
  user_input text not null,
  category text not null,
  mood text not null,
  optimized_prompt text not null,
  image_url text not null,
  model_name text not null,
  image_size text not null,
  seed text,
  generation_time numeric,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.thumbnail_engine_history enable row level security;

-- Drop policy if exists to avoid errors on multiple runs
drop policy if exists "Users can manage own thumbnail history" on public.thumbnail_engine_history;

-- Create policy
create policy "Users can manage own thumbnail history" on public.thumbnail_engine_history for all using (auth.uid() = user_id);
