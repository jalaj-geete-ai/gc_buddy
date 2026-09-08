-- Join date per enrollment; classes before it are N/A (not absent).
alter table public.batch_enrollments add column if not exists start_date date;
comment on column public.batch_enrollments.start_date is
  'Date the student joined the batch; classes before this are N/A (not absent).';
