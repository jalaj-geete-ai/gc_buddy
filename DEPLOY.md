# Deploying the portal (auto-deploy on git push)

The app is **static** — no build step. Output directory is `public/`.
Your GATE app already runs on **Cloudflare Pages** (`*.pages.dev`), so the same
setup keeps everything in one place.

## One-time: push this repo to GitHub
This must be done from an **interactive** Claude Code terminal (OAuth can't run in
the desktop session). In a terminal:

```bash
cd C:/Users/Admin/gc-attendance-portal
gh auth login          # authorize GitHub once
gh repo create gc-attendance-portal --private --source=. --push
```

(Or create an empty repo on github.com and `git remote add origin … && git push -u origin main`.)

Once the remote exists, I can push future changes automatically.

## Connect Cloudflare Pages (auto-deploy on every push)
1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Pick the `gc-attendance-portal` repo.
3. Build settings:
   - **Framework preset:** None
   - **Build command:** *(leave empty)*
   - **Build output directory:** `public`
4. Deploy. Every `git push` to `main` now publishes automatically.
   `public/_redirects` is already included for SPA routing.

(Vercel works too: import the repo, framework "Other", output dir `public`,
no build command — `vercel.json` is included.)

## After it's live
Do the sign-in + RLS hardening in `SETUP-AUTH.md` **before** sharing the URL,
so only testbook.com faculty can open it and each sees only their batches.
