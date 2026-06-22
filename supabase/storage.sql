-- ============================================================================
-- NudGoo storage  (run in the Supabase SQL Editor)
-- ----------------------------------------------------------------------------
-- A public bucket for chat media (photos + GIFs). Anyone can read (so images
-- render), and signed-in members can upload. Safe to re-run.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('chat-media', 'chat-media', true)
on conflict (id) do nothing;

do $$ begin
  create policy "chat-media public read"
    on storage.objects for select
    using (bucket_id = 'chat-media');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "chat-media authenticated upload"
    on storage.objects for insert to authenticated
    with check (bucket_id = 'chat-media');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "chat-media owner delete"
    on storage.objects for delete to authenticated
    using (bucket_id = 'chat-media' and owner = auth.uid());
exception when duplicate_object then null; end $$;
