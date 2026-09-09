# Deploying GC Buddy

Production site: **https://gcbuddyai.pages.dev**

## How it deploys

This repo is connected to the Cloudflare Pages project **`gcbuddyai`**
(account `0074802ce20696cbe347ea197ebb12eb`). Every push to **`main`**
triggers an automatic production build and deploy.

**Cloudflare Pages build settings (Settings → Build configuration):**

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Production branch | `main` |

> ⚠️ These must stay set. If the build command is left blank and the
> output directory is `public`, Cloudflare skips the Vite build and
> serves the raw `public/` folder (which has no `index.html`), so the
> site 404s / serves a stale bundle. That exact misconfiguration once
> silently broke every deploy.

## Environment variables

The `VITE_*` values are injected at **build time** and must be set in the
Cloudflare Pages project env (Settings → Variables and secrets, Production):
`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_PASSWORD`,
`VITE_FACULTY_PASSWORD`, `VITE_LLM_API_KEY`, `VITE_LLM_ENDPOINT`.
See `.env.example`.

## SPA routing

`public/_redirects` (`/* /index.html 200`) makes deep links resolve to the
SPA. Portals are reachable by query **or** hash, e.g. `?admin=1` / `#admin`,
`?multiverse=1` / `#multiverse` — the hash form is resilient if the edge
ever fails to apply the SPA fallback.

## Admin surfaces

- `/#multiverse` — GC Multiverse (student activity & success dashboard)
- `/#admin` — Coordinator dashboard
- `/#faculty` — Faculty panel
- `/#students` — Student manager

All are gated by the staff passwords above.
