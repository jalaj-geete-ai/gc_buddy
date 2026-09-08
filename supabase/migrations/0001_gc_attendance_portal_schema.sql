-- ============================================================
-- GC Attendance Portal — schema (additive; joins on roll_number)
-- Applied to project uxdrldreaockdloqvojs (jalaj-geete-ai's Project)
-- ============================================================

-- 1) Batch registry
create table if not exists public.batches (
  batch_name   text primary key,
  level        text not null default 'A1',
  start_month  smallint,
  start_year   smallint,
  seq          smallint,
  is_dual_slot boolean not null default false,
  is_active    boolean not null default true,
  notes        text,
  created_at   timestamptz default now()
);

-- 2) Enrollments: student (roll_number) -> batch + slot
create table if not exists public.batch_enrollments (
  id          bigint generated always as identity primary key,
  batch_name  text not null references public.batches(batch_name) on update cascade on delete cascade,
  roll_number text not null references public.approved_students(roll_number) on update cascade on delete cascade,
  slot        text not null default 'Single',
  is_active   boolean not null default true,
  enrolled_at timestamptz default now(),
  unique (batch_name, roll_number, slot)
);
create index if not exists idx_enroll_batch on public.batch_enrollments(batch_name);
create index if not exists idx_enroll_roll  on public.batch_enrollments(roll_number);

-- 3) Faculty + batch access
create table if not exists public.faculty (
  id         bigint generated always as identity primary key,
  email      text unique not null,
  name       text,
  is_admin   boolean not null default false,
  is_active  boolean not null default true,
  created_at timestamptz default now()
);
create table if not exists public.faculty_batches (
  faculty_id bigint references public.faculty(id) on delete cascade,
  batch_name text references public.batches(batch_name) on delete cascade,
  primary key (faculty_id, batch_name)
);

-- 4) Extend existing attendance_records (class_type = slot)
alter table public.attendance_records add column if not exists topic     text;
alter table public.attendance_records add column if not exists marked_by text;
create unique index if not exists uq_attendance_slot
  on public.attendance_records(batch_name, date, roll_number, class_type);
create index if not exists idx_att_batch_date on public.attendance_records(batch_name, date);
create index if not exists idx_att_roll on public.attendance_records(roll_number);

-- 5) RLS (DEV posture — open; replace with 0003_harden_rls before deploy)
alter table public.batches           enable row level security;
alter table public.batch_enrollments enable row level security;
alter table public.faculty           enable row level security;
alter table public.faculty_batches   enable row level security;
do $$
declare t text;
begin
  foreach t in array array['batches','batch_enrollments','faculty','faculty_batches'] loop
    execute format('drop policy if exists dev_all on public.%I', t);
    execute format('create policy dev_all on public.%I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end$$;
