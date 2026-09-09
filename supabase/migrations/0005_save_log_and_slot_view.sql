-- Audit log: one row per Save action in the portal (timestamped)
create table if not exists public.attendance_save_log (
  id          bigint generated always as identity primary key,
  saved_at    timestamptz not null default now(),
  faculty     text,
  batch_name  text,
  slot        text,
  marked      integer default 0,
  cleared     integer default 0,
  dates       text
);
alter table public.attendance_save_log enable row level security;
drop policy if exists dev_all on public.attendance_save_log;
create policy dev_all on public.attendance_save_log for all to anon, authenticated using (true) with check (true);

-- Per-session (Morning/Evening) attendance for the backend + Summary breakdown.
-- Dual-slot batches (A1_JUL_02 onward) store Morning/Evening rows in
-- attendance_records.class_type; single-slot batches store 'Day'. The faculty
-- grid combines a date's sessions into one column (present if present in either).
create or replace view public.v_slot_attendance
with (security_invoker = on) as
select a.batch_name, a.roll_number, s.name, a.class_type as slot,
       count(*) filter (where a.status='Present') as present,
       count(*) as total,
       case when count(*)>0 then round(100.0*count(*) filter (where a.status='Present')/count(*)) end as pct
from public.attendance_records a
join public.approved_students s on s.roll_number=a.roll_number
group by a.batch_name, a.roll_number, s.name, a.class_type;
grant select on public.v_slot_attendance to anon, authenticated;
