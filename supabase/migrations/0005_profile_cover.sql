-- Customizable profile cover/banner image (Hi5-style).

alter table public.profiles
  add column if not exists cover_url text;
