# Historical backfill — completed

Loaded from the **updated** "GC attendance tracker (1).xlsx" (faculties enter
D/M/Y; years forced to 2026 since the programme began March 2026).

Parsing rules:
- Excel **serial** date cells → converted to real dates (these are valid).
- **Text** D/M/Y cells → parsed day/month, **year forced to 2026** (fixes `2025`
  typos and the `//` double-slash slip).
- Dropped dates **before the batch's start month** (removes a few corrupted early
  `A1_JUN_01` cells that landed on the 6th of alternating months).
- Dropped any date **after today** (no attendance for future classes).
- Morning + Evening of the same class combined to **Present if either**.

Result: ~2,024 daily marks across MAR–JUL batches, matched to each batch's roster
by name (fuzzy, scoped per batch). Percentages/grid verified in the app.

Unmatched tracker columns (not loaded) are mostly **A1_JUL_02 students the CRM
didn't assign to that batch** (Saba bari, Jyoti Sahil Tak, Prabha, Anitha B, …)
plus a few cross-batch/two-name cells — enroll them if you want their history.

Scripts (scratch): C:\gcx\parse_tracker3.ps1, C:\gcx\backfill_rest.ps1.
