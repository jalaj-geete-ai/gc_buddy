# Historical backfill — attempted, rolled back

I parsed the original **GC attendance tracker** sheets (Mar–Sep batches),
combining each class's morning + evening into a single daily **Present-if-either**
mark, and matched 2,264 records to enrolled students by name (scoped per batch).

**Why it was rolled back:** the tracker's **Date column is not reliable**. Examples
from `A1_JUN_01`: class 1 = serial `46028` (→ Jan 2026) with subsequent rows
stepping ~60 days apart (not a real class cadence), then text dates like
`15/06/2025` (wrong year) and mixed `D/M` vs `M/D`. Percentages are date-independent
and were fine, but the class **dates** would make the grid misleading, so all
imported rows (`marked_by='import'`) were deleted and the portal left as a clean
slate for go-forward marking.

**If history is wanted later**, two workable options:
1. A **class-number-based** grid (columns = Class 1..N from the sheet's "Class No."),
   ignoring the broken dates entirely.
2. A **per-sheet date-cleaning** pass with you confirming the real class calendar.

Parser + loader live in the scratch dir (`C:\gcx\parse_tracker.ps1`,
`backfill_rest.ps1`) if we revisit this.
