-- Credit system: AI video clip allotment (separate hard cap from the text/image/voice pool).
-- video_engine_credits stays as the universal text/image/voice credit pool.
alter table public.profiles
  add column if not exists ai_video_credits integer not null default 0;

comment on column public.profiles.ai_video_credits is
  'Lifetime AI video (p-video) clip allotment. Each 10s 720p clip = 1. Never unlimited.';
