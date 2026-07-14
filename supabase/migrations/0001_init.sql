-- Connectiv — schema inițială
-- Enums, tabele, RLS, triggere, storage buckets, seed data.

-- ---------- Enums ----------

create type public.city_slug as enum ('cluj-napoca', 'bucuresti', 'timisoara', 'craiova');

create type public.post_category as enum (
  'side-hustle',
  'antreprenoriat',
  'career-switch',
  'colaborare',
  'caut-de-lucru'
);

create type public.action_type as enum ('sfat', 'cafea', 'colaborare');

-- ---------- profiles ----------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  building_what text not null default '',
  city public.city_slug not null default 'cluj-napoca',
  avatar_url text,
  is_approved boolean not null default true,
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up, seeded from
-- signUp() options.data (full_name, building_what, city) passed at registration.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, building_what, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'Membru connectiv'),
    coalesce(new.raw_user_meta_data ->> 'building_what', ''),
    coalesce((new.raw_user_meta_data ->> 'city')::public.city_slug, 'cluj-napoca')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- posts ----------

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  category public.post_category not null,
  description text not null default '',
  video_url text,
  thumbnail_url text,
  city public.city_slug not null,
  created_at timestamptz not null default now()
);

create index posts_city_idx on public.posts (city);
create index posts_author_idx on public.posts (author_id);
create index posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

create policy "posts are publicly readable"
  on public.posts for select
  using (true);

create policy "users can insert their own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "users can update their own posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- ---------- follows ----------

create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

alter table public.follows enable row level security;

create policy "follows are publicly readable"
  on public.follows for select
  using (true);

create policy "users can follow as themselves"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "users can unfollow as themselves"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ---------- saves ----------

create table public.saves (
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.posts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table public.saves enable row level security;

create policy "users can read their own saves"
  on public.saves for select
  using (auth.uid() = user_id);

create policy "users can save as themselves"
  on public.saves for insert
  with check (auth.uid() = user_id);

create policy "users can unsave as themselves"
  on public.saves for delete
  using (auth.uid() = user_id);

-- ---------- conversations ----------

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  initiator_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid references public.posts (id) on delete set null,
  action_type public.action_type not null,
  created_at timestamptz not null default now(),
  constraint conversations_no_self check (initiator_id <> recipient_id)
);

create index conversations_initiator_idx on public.conversations (initiator_id);
create index conversations_recipient_idx on public.conversations (recipient_id);

alter table public.conversations enable row level security;

create policy "participants can read their conversations"
  on public.conversations for select
  using (auth.uid() = initiator_id or auth.uid() = recipient_id);

create policy "users can start conversations as the initiator"
  on public.conversations for insert
  with check (auth.uid() = initiator_id);

-- ---------- messages ----------

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

create policy "participants can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.initiator_id = auth.uid() or c.recipient_id = auth.uid())
    )
  );

create policy "participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.initiator_id = auth.uid() or c.recipient_id = auth.uid())
    )
  );

alter publication supabase_realtime add table public.messages;

-- ---------- usage_counters (freemium conversation limit) ----------

create table public.usage_counters (
  user_id uuid not null references public.profiles (id) on delete cascade,
  month date not null,
  conversations_started integer not null default 0,
  primary key (user_id, month)
);

alter table public.usage_counters enable row level security;

create policy "users can read their own usage"
  on public.usage_counters for select
  using (auth.uid() = user_id);

create policy "users can upsert their own usage"
  on public.usage_counters for insert
  with check (auth.uid() = user_id);

create policy "users can update their own usage"
  on public.usage_counters for update
  using (auth.uid() = user_id);

-- ---------- meeting_spots (static seed, read-only for clients) ----------

create table public.meeting_spots (
  id uuid primary key default gen_random_uuid(),
  city public.city_slug not null,
  name text not null,
  area text not null
);

alter table public.meeting_spots enable row level security;

create policy "meeting spots are publicly readable"
  on public.meeting_spots for select
  using (true);

insert into public.meeting_spots (city, name, area) values
  ('cluj-napoca', 'The Office Coffee Bar', 'The Office Business Center'),
  ('cluj-napoca', 'Alt Shift Coffee', 'Centru'),
  ('cluj-napoca', 'Nomad Skye Bar', 'Centru'),
  ('bucuresti', 'Verse Coffee', 'SKY Tower, Barbu Văcărescu'),
  ('bucuresti', 'Anantea', 'Orhideea Towers'),
  ('bucuresti', 'Beans & Dots', 'Floreasca'),
  ('timisoara', 'Alfa Coffee', 'Centru'),
  ('timisoara', 'Ivan Torent', 'Piața Unirii'),
  ('timisoara', 'The Coffee Room', 'Complex Openville'),
  ('craiova', 'Diesel Cafe', 'Centru'),
  ('craiova', 'Coffee Time', 'Craiova Business Park'),
  ('craiova', 'Nord Est', 'Centru');

-- ---------- storage buckets ----------

insert into storage.buckets (id, name, public)
values ('videos', 'videos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "public read videos"
  on storage.objects for select
  using (bucket_id = 'videos');

create policy "authenticated users upload their own video folder"
  on storage.objects for insert
  with check (
    bucket_id = 'videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users manage their own video files"
  on storage.objects for update
  using (bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users delete their own video files"
  on storage.objects for delete
  using (bucket_id = 'videos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "public read avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "authenticated users upload their own avatar folder"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users manage their own avatar files"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
