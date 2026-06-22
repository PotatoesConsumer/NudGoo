-- ============================================================================
-- NudGoo invite code  (run AFTER the earlier SQL files)
-- ----------------------------------------------------------------------------
-- A single-row table holding the group's shareable join code. Members can read
-- it (shown in the Invite sheet); admins can regenerate it. Anyone signing up
-- can validate a code via join_code_valid() before requesting to join.
-- Safe to re-run.
-- ============================================================================

create table if not exists public.group_meta (
  id          smallint primary key default 1 check (id = 1),
  invite_code text not null default upper(substr(md5(random()::text), 1, 6)),
  created_at  timestamptz not null default now()
);

-- Ensure the singleton row exists.
insert into public.group_meta (id) values (1) on conflict (id) do nothing;

alter table public.group_meta enable row level security;

drop policy if exists gm_select on public.group_meta;
create policy gm_select on public.group_meta
  for select using (public.is_member());

drop policy if exists gm_update on public.group_meta;
create policy gm_update on public.group_meta
  for update using (public.is_admin()) with check (public.is_admin());

-- Validate an invite code without exposing the code to non-members.
create or replace function public.join_code_valid(code text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.group_meta
    where id = 1 and upper(invite_code) = upper(trim(code))
  );
$$;

grant execute on function public.join_code_valid(text) to anon, authenticated;

-- Realtime so the Invite sheet reflects a regenerated code live.
do $$ begin
  alter publication supabase_realtime add table public.group_meta;
exception when duplicate_object then null; end $$;
