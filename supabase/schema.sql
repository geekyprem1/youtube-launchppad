-- Run this in your Supabase SQL Editor

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

create table if not exists public.ideas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  niche text not null,
  ideas jsonb not null default '[]',
  created_at timestamptz default now()
);

create table if not exists public.title_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  result jsonb not null default '{}',
  created_at timestamptz default now()
);

create table if not exists public.thumbnail_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  image_url text,
  description text,
  result jsonb not null default '{}',
  created_at timestamptz default now()
);

create table if not exists public.competitors (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  channel_url text not null,
  channel_name text,
  channel_id text,
  subscriber_count bigint,
  video_count bigint,
  result jsonb not null default '{}',
  created_at timestamptz default now()
);

create table if not exists public.keyword_searches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  keyword text not null,
  result jsonb not null default '{}',
  created_at timestamptz default now()
);

create table if not exists public.retention_analyses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  video_url text not null,
  video_id text,
  video_title text,
  result jsonb not null default '{}',
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS policies
alter table public.profiles enable row level security;
alter table public.ideas enable row level security;
alter table public.title_scores enable row level security;
alter table public.thumbnail_analyses enable row level security;
alter table public.competitors enable row level security;
alter table public.keyword_searches enable row level security;
alter table public.retention_analyses enable row level security;

create policy "Users can manage own data" on public.profiles for all using (auth.uid() = id);
create policy "Users can manage own ideas" on public.ideas for all using (auth.uid() = user_id);
create policy "Users can manage own title_scores" on public.title_scores for all using (auth.uid() = user_id);
create policy "Users can manage own thumbnail_analyses" on public.thumbnail_analyses for all using (auth.uid() = user_id);
create policy "Users can manage own competitors" on public.competitors for all using (auth.uid() = user_id);
create policy "Users can manage own keyword_searches" on public.keyword_searches for all using (auth.uid() = user_id);
create policy "Users can manage own retention_analyses" on public.retention_analyses for all using (auth.uid() = user_id);
