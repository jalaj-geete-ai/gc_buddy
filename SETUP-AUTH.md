# Faculty sign-in + lock-down (do before sharing the URL)

Today the portal runs in an **open dev posture** (anyone with the link + anon key
can read/write the new tables). Turning on sign-in has three steps.

## 1. Turn on Google sign-in, restricted to testbook.com
In the Supabase dashboard for project `uxdrldreaockdloqvojs`:
- **Authentication → Providers → Google:** enable, paste a Google OAuth client ID
  + secret (Google Cloud → Credentials → OAuth client, type "Web application";
  authorized redirect URI = `https://uxdrldreaockdloqvojs.supabase.co/auth/v1/callback`).
- **Authentication → URL Configuration:** add your Pages URL to redirect allow-list.
- Restrict to the company domain (`hd` = testbook.com) — enforced again in RLS below.

Tell me when the provider is on and I'll add the sign-in button + gate the UI
(sign-in screen, then the grid; `marked_by` becomes the signed-in email).

## 2. Seed faculty + their batch access
Faculty rows already exist (`Himanshu Raj`, `Jahanavi`) mapped to their batches in
`faculty_batches`. Add each real teacher's testbook.com email to `public.faculty`
and map batches — I can do this from a list you give me, or in the admin flow.

## 3. Apply RLS hardening
Once step 1 works, apply `supabase/migrations/0003_harden_rls.sql`. It makes:
- reference data readable only to signed-in users,
- attendance readable/writable only for a faculty's **own** batches (via
  `faculty` + `faculty_batches`), admins everything.

I'll apply it and verify a faculty can only see their batches.

## Note: pre-existing exposure (not introduced by this portal)
Advisory flagged tables with **RLS disabled** in the GC Buddy project
(`german_exam_responses`, `a1_german_exam_responses`) and 16 tables in the
`GC-videofunnel` project. Anyone with those projects' anon keys can read/write
them. Worth fixing separately — say the word and I'll propose policies.
