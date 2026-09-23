-- device_sessions — backs the "one mobile + one laptop per student" limit.
-- Already applied to the production Supabase project (uxdrldreaockdloqvojs).
-- Kept here for reproducibility. Access model mirrors approved_students /
-- student_progress: RLS on, with the anon role granted full access (the app has
-- no server-side auth and uses the anon key client-side).

create table if not exists public.device_sessions (
  roll_number  text not null,
  device_kind  text not null check (device_kind in ('mobile','laptop')),
  device_id    text not null,
  device_label text,
  updated_at   timestamptz not null default now(),
  primary key (roll_number, device_kind)
);

alter table public.device_sessions enable row level security;

create policy anon_select_ds on public.device_sessions for select to anon using (true);
create policy anon_insert_ds on public.device_sessions for insert to anon with check (true);
create policy anon_update_ds on public.device_sessions for update to anon using (true) with check (true);
create policy anon_delete_ds on public.device_sessions for delete to anon using (true);
