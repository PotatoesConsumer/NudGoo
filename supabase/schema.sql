-- ============================================================================
-- NudGoo database schema
-- ----------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor (or `supabase db push`) to provision the
-- backend. It is safe to re-run: enum/table creation is guarded and policies
-- are dropped before being recreated.
--
-- Covers: profiles, chat messages, trips + RSVPs, game sessions + signups,
-- and a points ledger powering the leaderboard. Row Level Security is enabled
-- on every table, and the relevant tables are added to the `supabase_realtime`
-- publication so the client receives live changes.
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto"; -- gen_random_uuid()

-- ── Enums ────────────────────────────────────────────────────────────────────
do $$ begin create type public.user_role as enum ('member', 'admin'); exception when duplicate_object then null; end $$;
do $$ begin create type public.member_status as enum ('pending', 'approved', 'rejected'); exception when duplicate_object then null; end $$;
do $$ begin create type public.rsvp_status as enum ('going', 'maybe', 'declined'); exception when duplicate_object then null; end $$;
do $$ begin create type public.trip_status as enum ('proposed', 'planning', 'confirmed', 'completed', 'cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.session_status as enum ('proposed', 'scheduled', 'completed', 'cancelled'); exception when duplicate_object then null; end $$;

-- ── Tables ───────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url   text,
  role         public.user_role   not null default 'member',
  status       public.member_status not null default 'pending',
  points       integer not null default 0,
  created_at   timestamptz not null default now()
);

create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists messages_created_at_idx on public.messages (created_at);

create table if not exists public.trips (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  destination text not null,
  description text,
  start_date  date,
  end_date    date,
  cover_url   text,
  status      public.trip_status not null default 'proposed',
  created_by  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create table if not exists public.trip_participants (
  trip_id    uuid not null references public.trips (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  rsvp       public.rsvp_status not null default 'maybe',
  created_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create table if not exists public.game_sessions (
  id           uuid primary key default gen_random_uuid(),
  game_name    text not null,
  description  text,
  host_id      uuid not null references public.profiles (id) on delete cascade,
  location     text,
  scheduled_at timestamptz,
  max_players  integer check (max_players is null or max_players > 0),
  status       public.session_status not null default 'proposed',
  created_at   timestamptz not null default now()
);

create table if not exists public.game_signups (
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

create table if not exists public.point_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  points     integer not null,
  reason     text not null,
  created_at timestamptz not null default now()
);
create index if not exists point_events_user_idx on public.point_events (user_id);

-- ── Helper functions (SECURITY DEFINER to avoid recursive RLS on profiles) ────
create or replace function public.is_member()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── New-user trigger: create a pending profile on signup ─────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Points ledger → keep profiles.points in sync ─────────────────────────────
create or replace function public.recalc_points(target uuid)
returns void language sql security definer set search_path = public as $$
  update public.profiles p
  set points = coalesce((select sum(points) from public.point_events where user_id = target), 0)
  where p.id = target;
$$;

create or replace function public.on_point_event_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'DELETE') then
    perform public.recalc_points(old.user_id);
    return old;
  else
    perform public.recalc_points(new.user_id);
    return new;
  end if;
end;
$$;

drop trigger if exists point_events_sync on public.point_events;
create trigger point_events_sync
  after insert or update or delete on public.point_events
  for each row execute function public.on_point_event_change();

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.messages          enable row level security;
alter table public.trips             enable row level security;
alter table public.trip_participants enable row level security;
alter table public.game_sessions     enable row level security;
alter table public.game_signups      enable row level security;
alter table public.point_events      enable row level security;

-- profiles -------------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_member() or public.is_admin());

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- messages -------------------------------------------------------------------
drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select using (public.is_member());

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert with check (public.is_member() and user_id = auth.uid());

drop policy if exists messages_modify_own on public.messages;
create policy messages_modify_own on public.messages
  for delete using (user_id = auth.uid() or public.is_admin());

-- trips ----------------------------------------------------------------------
drop policy if exists trips_select on public.trips;
create policy trips_select on public.trips
  for select using (public.is_member());

drop policy if exists trips_insert on public.trips;
create policy trips_insert on public.trips
  for insert with check (public.is_member() and created_by = auth.uid());

drop policy if exists trips_update on public.trips;
create policy trips_update on public.trips
  for update using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

drop policy if exists trips_delete on public.trips;
create policy trips_delete on public.trips
  for delete using (created_by = auth.uid() or public.is_admin());

-- trip_participants ----------------------------------------------------------
drop policy if exists tp_select on public.trip_participants;
create policy tp_select on public.trip_participants
  for select using (public.is_member());

drop policy if exists tp_upsert_own on public.trip_participants;
create policy tp_upsert_own on public.trip_participants
  for insert with check (public.is_member() and user_id = auth.uid());

drop policy if exists tp_update_own on public.trip_participants;
create policy tp_update_own on public.trip_participants
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists tp_delete_own on public.trip_participants;
create policy tp_delete_own on public.trip_participants
  for delete using (user_id = auth.uid() or public.is_admin());

-- game_sessions --------------------------------------------------------------
drop policy if exists gs_select on public.game_sessions;
create policy gs_select on public.game_sessions
  for select using (public.is_member());

drop policy if exists gs_insert on public.game_sessions;
create policy gs_insert on public.game_sessions
  for insert with check (public.is_member() and host_id = auth.uid());

drop policy if exists gs_update on public.game_sessions;
create policy gs_update on public.game_sessions
  for update using (host_id = auth.uid() or public.is_admin())
  with check (host_id = auth.uid() or public.is_admin());

drop policy if exists gs_delete on public.game_sessions;
create policy gs_delete on public.game_sessions
  for delete using (host_id = auth.uid() or public.is_admin());

-- game_signups ---------------------------------------------------------------
drop policy if exists gsu_select on public.game_signups;
create policy gsu_select on public.game_signups
  for select using (public.is_member());

drop policy if exists gsu_insert_own on public.game_signups;
create policy gsu_insert_own on public.game_signups
  for insert with check (public.is_member() and user_id = auth.uid());

drop policy if exists gsu_delete_own on public.game_signups;
create policy gsu_delete_own on public.game_signups
  for delete using (user_id = auth.uid() or public.is_admin());

-- point_events (readable by members, writable only by admins / service role) -
drop policy if exists pe_select on public.point_events;
create policy pe_select on public.point_events
  for select using (public.is_member());

drop policy if exists pe_admin_write on public.point_events;
create policy pe_admin_write on public.point_events
  for all using (public.is_admin()) with check (public.is_admin());

-- ── Realtime publication ─────────────────────────────────────────────────────
-- Adds the tables whose changes the client subscribes to. Wrapped so re-runs
-- don't error if a table is already a member of the publication.
do $$
declare t text;
begin
  foreach t in array array[
    'messages', 'trips', 'trip_participants',
    'game_sessions', 'game_signups', 'profiles', 'point_events'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- Emit full row data on UPDATE/DELETE so Realtime payloads carry old values
-- where the UI needs them (e.g. leaderboard point changes).
alter table public.profiles    replica identity full;
alter table public.trips       replica identity full;
alter table public.game_sessions replica identity full;
