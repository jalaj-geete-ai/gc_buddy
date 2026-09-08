# GC Attendance Portal

A lightweight web portal for marking German-course attendance and viewing each
student's full picture (attendance + GC Buddy test scores + GC Buddy usage, and
GATE marks once connected). Built as a **no-build static app** that talks
directly to the existing GC Buddy Supabase project.

## Why this design
The GC Buddy backend already keys everything on **`roll_number`**
(`approved_students`, `daily_test_submissions`, `usage_events`, …). This portal
plugs into that same key instead of creating a parallel student list, so one
student = one record everywhere.

## Run locally
No Node needed. From this folder:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open http://localhost:8080/ . (You can also just open `public/index.html`.)

## Who it's for
**Faculty only.** It does one job: see every student in a batch and mark
Present/Absent. The cross-data analytics (GC Buddy tests, usage, GATE, attendance
in one profile) is a **backend** concern — available via the `v_student_overview`
view / SQL, not shown on the faculty screen.

## Tabs
- **Attendance** — Excel-style grid: students as rows, class dates as columns.
  Pick a date + **Add** to start a class (everyone defaults Present); click a cell
  to flip P↔A; **Save**. Cells before a student's enrollment date show hatched
  ("not yet in batch"), never counted as absent.
- **Summary** — per-batch attendance %, at-risk (<75%) students on top.

## Attendance rule
A student may attend the **morning OR evening** session of a class; attending
either counts as **Present**. So marking is one Present/Absent per student per
class day (`class_type = 'Day'`) — the faculty simply marks whoever showed up.

## Batch naming
`<LEVEL>_<MON>_<NN>` — starting level, launch month, Nth batch that month
(e.g. `A1_SEP_01`). The code is fixed at birth; the cohort then progresses
A1→A2→B1 (tracked separately as current level).

## Data loaded
Batches, faculty, and 89 enrollments (with join dates) were loaded from the CRM
workbook (`Post sales management - GC`). Students are matched to the GC Buddy
roster by phone → roll number, falling back to name.

## Database
Project: `uxdrldreaockdloqvojs`. Migrations in `supabase/migrations/`.
New tables: `batches`, `batch_enrollments`, `faculty`, `faculty_batches`.
Attendance is written to the existing `attendance_records` (`class_type` = slot).
Views: `v_batch_attendance`, `v_student_overview`.

## ⚠️ Before deploying (security)
RLS is currently in an **open dev posture** (anon can read/write the new tables).
Ship `0003_harden_rls.sql` (to be added) to require faculty auth + batch mapping,
and wire testbook.com Google sign-in, before this is exposed publicly.
