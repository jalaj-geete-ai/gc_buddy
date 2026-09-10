-- Course level (A1/A2/B1/B2) for each class date. A cohort progresses through
-- levels over time; the whole batch attends the same level on a given date, so
-- level is denormalized onto attendance_records per row (like topic). Faculty pick
-- the level when adding a class; Summary reports attendance overall and per level.
alter table public.attendance_records add column if not exists level text;
comment on column public.attendance_records.level is
  'Course level for the class on this date (A1/A2/B1/B2).';

-- Backfill A1_MAR_01 (only batch with a known multi-level syllabus so far):
update public.attendance_records set level='A1'
  where batch_name='A1_MAR_01' and date between '2026-03-10' and '2026-04-30';
update public.attendance_records set level='A2'
  where batch_name='A1_MAR_01' and date between '2026-05-16' and '2026-07-04';
update public.attendance_records set level='B1'
  where batch_name='A1_MAR_01' and date between '2026-07-14' and '2026-09-06';
