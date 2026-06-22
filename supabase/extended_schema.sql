-- ============================================================================
-- NudGoo extended schema  (run AFTER schema.sql + auth_bootstrap.sql)
-- ----------------------------------------------------------------------------
-- Adds backing tables/columns for every prototype feature that the base schema
-- didn't cover yet: richer profiles & trips, date voting, bill splitting,
-- trip albums, chat reactions / polls / replies / pins, gang rules, and
-- mute votes. Leaderboard categories are added to point_events.
--
-- Safe to re-run. RLS: approved members can read group data; writes are scoped
-- to the owner (or admin) of each row.
-- ============================================================================

-- ── profiles: extra identity / payment fields ───────────────────────────────
alter table public.profiles add column if not exists username         text;
alter table public.profiles add column if not exists phone            text;
alter table public.profiles add column if not exists nickname         text;
alter table public.profiles add column if not exists avatar_color     text not null default '#3B5BDB';
alter table public.profiles add column if not exists avatar_emoji     text;
alter table public.profiles add column if not exists promptpay_handle text;

-- ── trips: extra planning / bill fields ──────────────────────────────────────
alter table public.trips add column if not exists emoji              text not null default '🗺️';
alter table public.trips add column if not exists transport          text;
alter table public.trips add column if not exists notes              text;
alter table public.trips add column if not exists blind_vote         boolean not null default false;
alter table public.trips add column if not exists bill_split_enabled boolean not null default false;
alter table public.trips add column if not exists treasurer_id       uuid references public.profiles (id) on delete set null;
alter table public.trips add column if not exists total_amount       integer; -- in baht

-- ── point_events: leaderboard category (e.g. game points vs minutes late) ─────
alter table public.point_events add column if not exists category text not null default 'game';

-- ── Date voting ──────────────────────────────────────────────────────────────
create table if not exists public.trip_date_options (
  id          uuid primary key default gen_random_uuid(),
  trip_id     uuid not null references public.trips (id) on delete cascade,
  label       text not null,
  subtitle    text,
  option_date date,
  created_at  timestamptz not null default now()
);
create index if not exists trip_date_options_trip_idx on public.trip_date_options (trip_id);

create table if not exists public.trip_date_votes (
  option_id  uuid not null references public.trip_date_options (id) on delete cascade,
  trip_id    uuid not null references public.trips (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (option_id, user_id)
);

-- ── Trip album (ephemeral photos) ────────────────────────────────────────────
create table if not exists public.trip_photos (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references public.trips (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  image_url  text,
  tint       text,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists trip_photos_trip_idx on public.trip_photos (trip_id);

-- ── Bill payments (per member, per trip) ─────────────────────────────────────
create table if not exists public.bill_payments (
  trip_id    uuid not null references public.trips (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  paid       boolean not null default false,
  slip_url   text,
  updated_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

-- ── Chat: richer messages (type, reply, edit, pin, metadata) ─────────────────
alter table public.messages add column if not exists type     text not null default 'text';
alter table public.messages add column if not exists reply_to uuid references public.messages (id) on delete set null;
alter table public.messages add column if not exists edited   boolean not null default false;
alter table public.messages add column if not exists pinned   boolean not null default false;
alter table public.messages add column if not exists meta     jsonb; -- gif colours, location, photo dur/tint, etc.

-- Non-text messages (photo/gif/location/poll) may carry empty content, so relax
-- the original 1..2000 length check to 0..2000.
do $$ begin
  alter table public.messages drop constraint if exists messages_content_check;
exception when undefined_object then null; end $$;
alter table public.messages alter column content set default '';
do $$ begin
  alter table public.messages add constraint messages_content_check
    check (char_length(content) <= 2000);
exception when duplicate_object then null; end $$;

create table if not exists public.message_reactions (
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

-- ── Polls (a message of type 'poll' owns the options) ────────────────────────
create table if not exists public.poll_options (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages (id) on delete cascade,
  label      text not null,
  idx        integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists poll_options_message_idx on public.poll_options (message_id);

create table if not exists public.poll_votes (
  option_id  uuid not null references public.poll_options (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (option_id, user_id)
);

-- ── Gang rules ───────────────────────────────────────────────────────────────
create table if not exists public.group_rules (
  id         uuid primary key default gen_random_uuid(),
  body       text not null,
  enabled    boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ── Mute votes (one vote per voter, per target) ──────────────────────────────
create table if not exists public.mute_votes (
  target_id  uuid not null references public.profiles (id) on delete cascade,
  voter_id   uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (target_id, voter_id)
);

-- ── Row Level Security ───────────────────────────────────────────────────────
alter table public.trip_date_options enable row level security;
alter table public.trip_date_votes   enable row level security;
alter table public.trip_photos        enable row level security;
alter table public.bill_payments      enable row level security;
alter table public.message_reactions  enable row level security;
alter table public.poll_options       enable row level security;
alter table public.poll_votes         enable row level security;
alter table public.group_rules        enable row level security;
alter table public.mute_votes         enable row level security;

-- Members read everything in the group; writers are scoped below.
do $$
declare t text;
begin
  foreach t in array array[
    'trip_date_options','trip_date_votes','trip_photos','bill_payments',
    'message_reactions','poll_options','poll_votes','group_rules','mute_votes'
  ] loop
    execute format('drop policy if exists %I_select on public.%I', t, t);
    execute format(
      'create policy %I_select on public.%I for select using (public.is_member())', t, t);
  end loop;
end $$;

-- trip_date_options: trip owner / admin manage
drop policy if exists tdo_write on public.trip_date_options;
create policy tdo_write on public.trip_date_options for all
  using (public.is_admin() or exists (select 1 from public.trips t where t.id = trip_id and t.created_by = auth.uid()))
  with check (public.is_member() and (public.is_admin() or exists (select 1 from public.trips t where t.id = trip_id and t.created_by = auth.uid())));

-- trip_date_votes / poll_votes / game-like: own row only
drop policy if exists tdv_write on public.trip_date_votes;
create policy tdv_write on public.trip_date_votes for all
  using (user_id = auth.uid()) with check (public.is_member() and user_id = auth.uid());

drop policy if exists pv_write on public.poll_votes;
create policy pv_write on public.poll_votes for all
  using (user_id = auth.uid()) with check (public.is_member() and user_id = auth.uid());

drop policy if exists mv_write on public.mute_votes;
create policy mv_write on public.mute_votes for all
  using (voter_id = auth.uid()) with check (public.is_member() and voter_id = auth.uid());

-- trip_photos: uploader or admin
drop policy if exists tp_photos_write on public.trip_photos;
create policy tp_photos_write on public.trip_photos for all
  using (user_id = auth.uid() or public.is_admin())
  with check (public.is_member() and user_id = auth.uid());

-- bill_payments: own row
drop policy if exists bp_write on public.bill_payments;
create policy bp_write on public.bill_payments for all
  using (user_id = auth.uid() or public.is_admin())
  with check (public.is_member() and user_id = auth.uid());

-- message_reactions: own row
drop policy if exists mr_write on public.message_reactions;
create policy mr_write on public.message_reactions for all
  using (user_id = auth.uid()) with check (public.is_member() and user_id = auth.uid());

-- poll_options: author of the parent message / admin
drop policy if exists po_write on public.poll_options;
create policy po_write on public.poll_options for all
  using (public.is_admin() or exists (select 1 from public.messages m where m.id = message_id and m.user_id = auth.uid()))
  with check (public.is_member() and (public.is_admin() or exists (select 1 from public.messages m where m.id = message_id and m.user_id = auth.uid())));

-- group_rules: any member can add; author or admin can change/remove
drop policy if exists gr_insert on public.group_rules;
create policy gr_insert on public.group_rules for insert
  with check (public.is_member() and created_by = auth.uid());
drop policy if exists gr_modify on public.group_rules;
create policy gr_modify on public.group_rules for update
  using (created_by = auth.uid() or public.is_admin())
  with check (public.is_member());
drop policy if exists gr_delete on public.group_rules;
create policy gr_delete on public.group_rules for delete
  using (created_by = auth.uid() or public.is_admin());

-- Allow members to update messages they own (edit / pin) — base schema only had
-- insert + delete. Pinning is a group action, so admins may pin any message too.
drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages for update
  using (user_id = auth.uid() or public.is_admin())
  with check (public.is_member());

-- ── Realtime publication ─────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'trip_date_options','trip_date_votes','trip_photos','bill_payments',
    'message_reactions','poll_options','poll_votes','group_rules','mute_votes'
  ] loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
