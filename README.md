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

## Tabs
- **Mark Attendance** — pick batch / slot / date, flip absentees, Save (upsert).
- **Reports** — per-batch attendance %, at-risk (<75%) students on top.
- **Student Lookup** — unified profile per student by name or roll number.
- **Batches & Students** — create a batch (`A1_OCT_01` → auto-parsed) and enroll
  students by pasting names or roll numbers (matched against the roster).

## Batch naming
`<LEVEL>_<MON>_<NN>` — starting level, launch month, Nth batch that month
(e.g. `A1_SEP_01`). Batches from `A1_JUL_02` onward run **Morning + Evening**
cohorts (dual-slot); earlier ones are single-slot.

## Database
Project: `uxdrldreaockdloqvojs`. Migrations in `supabase/migrations/`.
New tables: `batches`, `batch_enrollments`, `faculty`, `faculty_batches`.
Attendance is written to the existing `attendance_records` (`class_type` = slot).
Views: `v_batch_attendance`, `v_student_overview`.

## ⚠️ Before deploying (security)
RLS is currently in an **open dev posture** (anon can read/write the new tables).
Ship `0003_harden_rls.sql` (to be added) to require faculty auth + batch mapping,
and wire testbook.com Google sign-in, before this is exposed publicly.
