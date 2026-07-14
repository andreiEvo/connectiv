-- Connectiv v2 — reacții, comentarii, cont companie, evenimente, rate limiting

-- ---------- extindere enums existente ----------

alter type public.action_type add value if not exists 'chat';
alter type public.action_type add value if not exists 'sprijin';
alter type public.post_category add value if not exists 'eveniment';

-- ---------- profiles: tip cont + verificare poză ----------

create type public.account_type as enum ('individual', 'companie');

alter table public.profiles
  add column if not exists account_type public.account_type not null default 'individual',
  add column if not exists avatar_verified boolean not null default false;

-- ---------- posts: dată eveniment ----------

alter table public.posts
  add column if not exists event_at timestamptz;

-- ---------- reactions ----------

create type public.reaction_kind as enum ('foc', 'fulger');

create table public.reactions (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.reaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, kind)
);

create index reactions_post_idx on public.reactions (post_id);

alter table public.reactions enable row level security;

create policy "reactions are publicly readable"
  on public.reactions for select
  using (true);

create policy "users can react as themselves"
  on public.reactions for insert
  with check (auth.uid() = user_id);

create policy "users can remove their own reaction"
  on public.reactions for delete
  using (auth.uid() = user_id);

-- ---------- comments ----------

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index comments_post_idx on public.comments (post_id, created_at);

alter table public.comments enable row level security;

create policy "comments are publicly readable"
  on public.comments for select
  using (true);

create policy "users can comment as themselves"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "users can delete their own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

alter publication supabase_realtime add table public.comments;

-- ---------- rate_limit_events ----------

create table public.rate_limit_events (
  key text not null,
  created_at timestamptz not null default now()
);

create index rate_limit_events_key_idx on public.rate_limit_events (key, created_at);

-- Written only by server actions using the service role / server client under
-- RLS bypass is not assumed here; server-side code uses the anon key like the
-- rest of the app, so this table must allow inserts from any authenticated or
-- anonymous request (login/register rate limiting happens pre-auth).
alter table public.rate_limit_events enable row level security;

create policy "anyone can record a rate limit event"
  on public.rate_limit_events for insert
  with check (true);

create policy "anyone can read rate limit events for counting"
  on public.rate_limit_events for select
  using (true);

-- Housekeeping: drop events older than 1 day automatically isn't available
-- without pg_cron on all plans, so cleanup happens lazily from the app
-- (delete-old-rows on write) instead of a scheduled job.
