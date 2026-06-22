-- ============================================================================
-- NudGoo auth bootstrap (run AFTER schema.sql, in the Supabase SQL Editor)
-- ----------------------------------------------------------------------------
-- Adds the single-group membership model on top of the base schema:
--   • group_claimed()  — has a founder (approved admin) been established yet?
--   • claim_group()     — the first signed-in user becomes the founder
--                          (admin + approved), atomically and only while the
--                          group is still unclaimed.
--   • a guard trigger so ordinary members can NEVER self-promote their own
--     role / status / points — approval is something only an admin grants.
--
-- Safe to re-run.
-- ============================================================================

-- Has anyone claimed the group yet? Callable by anon/pending users so the
-- onboarding screen can decide whether to offer "Create group" vs "Join".
create or replace function public.group_claimed()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles where role = 'admin' and status = 'approved'
  );
$$;

-- The first user to "create the group" becomes its founder. Atomic + idempotent:
-- returns false (and changes nothing) once a founder already exists.
create or replace function public.claim_group()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if exists (
    select 1 from public.profiles where role = 'admin' and status = 'approved'
  ) then
    return false;
  end if;
  update public.profiles
    set role = 'admin', status = 'approved'
    where id = auth.uid();
  return true;
end;
$$;

-- Prevent privilege escalation: a non-admin updating their own profile cannot
-- change role / status / points. The sole exception is the founder bootstrap —
-- while the group is unclaimed, the first user may promote themselves (this is
-- what claim_group() relies on).
create or replace function public.guard_profile_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if not exists (
    select 1 from public.profiles where role = 'admin' and status = 'approved'
  ) then
    return new; -- unclaimed group: allow founder bootstrap
  end if;
  new.role   := old.role;
  new.status := old.status;
  new.points := old.points;
  return new;
end;
$$;

drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- Let signed-in users call the helpers.
grant execute on function public.group_claimed() to anon, authenticated;
grant execute on function public.claim_group()  to authenticated;
