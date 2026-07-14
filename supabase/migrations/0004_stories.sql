-- Ephemeral 30s video stories — expire 24h after posting, shown as a
-- lightning-ring around the author's avatar while active.

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  video_url text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create index stories_expires_at_idx on public.stories (expires_at);
create index stories_author_idx on public.stories (author_id, created_at desc);

alter table public.stories enable row level security;

create policy "active stories are publicly readable"
  on public.stories for select
  using (expires_at > now());

create policy "users can post their own stories"
  on public.stories for insert
  with check (auth.uid() = author_id);

create policy "users can delete their own stories"
  on public.stories for delete
  using (auth.uid() = author_id);

-- Reuses the existing "videos" storage bucket/policies — stories are uploaded
-- under {user_id}/stories/{uuid}.ext, which still matches the
-- "(storage.foldername(name))[1] = auth.uid()" check from migration 0001.
