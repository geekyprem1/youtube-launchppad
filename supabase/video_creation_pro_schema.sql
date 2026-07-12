create table if not exists public.video_engine_pro_generations (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid references auth.users on delete cascade not null,
  video_type                text not null check (video_type in ('long', 'shorts')),
  topic                     text not null,
  enhanced_prompt           text not null,
  replicate_prediction_id   text not null,
  status                    text not null default 'starting'
                              check (status in ('starting', 'processing', 'succeeded', 'failed', 'canceled')),
  video_url                 text,
  model_name                text not null,
  error_message             text,
  created_at                timestamptz not null default now(),
  completed_at              timestamptz
);

create index if not exists idx_video_pro_user_created
  on public.video_engine_pro_generations (user_id, created_at desc);

create index if not exists idx_video_pro_prediction_id
  on public.video_engine_pro_generations (replicate_prediction_id);

alter table public.video_engine_pro_generations enable row level security;

drop policy if exists "Users manage own video pro generations" on public.video_engine_pro_generations;

create policy "Users manage own video pro generations"
  on public.video_engine_pro_generations
  for all
  using (auth.uid() = user_id);
