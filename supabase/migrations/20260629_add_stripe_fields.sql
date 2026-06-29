-- Add stripe integration fields to profiles table
alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text;
