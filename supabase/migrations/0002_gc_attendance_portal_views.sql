-- Portal read/write policy for attendance during dev
drop policy if exists dev_all_attendance on public.attendance_records;
create policy dev_all_attendance on public.attendance_records
  for all to anon, authenticated using (true) with check (true);

-- Per-student, per-batch, per-slot attendance summary
create or replace view public.v_batch_attendance
with (security_invoker = on) as
select
  e.batch_name, e.slot, e.roll_number, s.name,
  count(a.id) filter (where a.status = 'Present') as present,
  count(a.id)                                      as total,
  case when count(a.id) > 0
       then round(100.0 * count(a.id) filter (where a.status='Present') / count(a.id))
       else null end                               as pct
from public.batch_enrollments e
join public.approved_students s on s.roll_number = e.roll_number
left join public.attendance_records a
       on a.roll_number = e.roll_number and a.batch_name = e.batch_name
      and (a.class_type = e.slot or e.slot = 'Single')
where e.is_active
group by e.batch_name, e.slot, e.roll_number, s.name;

-- Unified per-student profile: attendance + GC Buddy tests + usage (joined on roll_number)
create or replace view public.v_student_overview
with (security_invoker = on) as
select
  s.roll_number, s.name, sp.level as current_level,
  att.present as att_present, att.total as att_total,
  case when att.total > 0 then round(100.0 * att.present / att.total) else null end as att_pct,
  tst.tests_taken, tst.avg_test_pct, usg.usage_events, usg.last_used
from public.approved_students s
left join public.student_progress sp on sp.roll_number = s.roll_number
left join lateral (select count(*) filter (where status='Present') as present, count(*) as total
                   from public.attendance_records a where a.roll_number = s.roll_number) att on true
left join lateral (select count(*) as tests_taken, round(avg(percentage),1) as avg_test_pct
                   from public.daily_test_submissions d where d.roll_number = s.roll_number) tst on true
left join lateral (select count(*) as usage_events, max(created_at) as last_used
                   from public.usage_events u where u.roll_number = s.roll_number) usg on true;

grant select on public.v_batch_attendance, public.v_student_overview to anon, authenticated;
