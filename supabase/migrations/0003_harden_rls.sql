-- ============================================================
-- 0003 — Production RLS hardening.  APPLY ONLY AFTER faculty
-- Google sign-in (testbook.com) is wired up, or you will lock
-- yourself out of writing. Until then the app runs on 0001/0002
-- dev policies (anon read/write).
--
-- Model: a logged-in user's email (auth.jwt()->>'email') is matched
-- to public.faculty.email. Admins can do everything; other faculty
-- can only mark attendance for batches mapped to them in faculty_batches.
-- ============================================================

-- helper: is the current user an active admin?
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.faculty f
                 where f.email = auth.jwt()->>'email' and f.is_admin and f.is_active);
$$;

-- helper: may the current user mark the given batch?
create or replace function public.can_mark(p_batch text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (
    select 1 from public.faculty f
    join public.faculty_batches fb on fb.faculty_id = f.id
    where f.email = auth.jwt()->>'email' and f.is_active and fb.batch_name = p_batch);
$$;

-- ---- batches: everyone signed in can read; only admins write ----
drop policy if exists dev_all on public.batches;
create policy read_batches   on public.batches for select to authenticated using (true);
create policy admin_batches  on public.batches for all    to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---- enrollments: readable by signed-in faculty; admins write ----
drop policy if exists dev_all on public.batch_enrollments;
create policy read_enroll  on public.batch_enrollments for select to authenticated using (true);
create policy admin_enroll on public.batch_enrollments for all    to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---- faculty tables: admin-managed ----
drop policy if exists dev_all on public.faculty;
drop policy if exists dev_all on public.faculty_batches;
create policy read_faculty  on public.faculty         for select to authenticated using (true);
create policy admin_faculty on public.faculty         for all    to authenticated using (public.is_admin()) with check (public.is_admin());
create policy read_fb       on public.faculty_batches for select to authenticated using (true);
create policy admin_fb      on public.faculty_batches for all    to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---- attendance: faculty may read/write only their batches ----
drop policy if exists dev_all_attendance on public.attendance_records;
create policy read_att  on public.attendance_records for select to authenticated using (public.can_mark(batch_name));
create policy write_att on public.attendance_records for all    to authenticated using (public.can_mark(batch_name)) with check (public.can_mark(batch_name));
