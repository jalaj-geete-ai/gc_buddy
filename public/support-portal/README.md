# GC Support Portal — Global Careers by Testbook

A Student Grievance & Support Portal: students log in, raise grievances, request
callbacks and track resolution; a single admin console triages everything, posts
remarks, updates status and views analytics.

This is a **dependency-free front end** (plain HTML/CSS/JS — no build step, no
framework) with a **pluggable data layer** (`api.js`). It runs out of the box on
in-browser demo data, and switches to your live backend by editing one config file.

---

## Quick start

Because the app uses `fetch`/modules, serve it over HTTP (don't open the file
directly):

```bash
# any static server works, e.g.
npx serve .
# or
python3 -m http.server 8080
```

Open the printed URL. It works immediately with demo data (stored in the
browser's localStorage).

### Logins (demo)
- **Student:** any Full Name + any GC Buddy Roll Number (the 5 seeded rolls
  `GCB2024001`–`GCB2024005` auto-fill course/batch/mobile).
- **Admin:** click the small **Admin login** button (bottom-right of the login
  screen) → `admin` / `gc@admin`.

---

## Project structure

```
gc-support-portal/
├── index.html         # page shell (loads fonts + the three scripts)
├── styles.css         # all styling (brand: teal #00AFC1 / deep-teal #052E3A)
├── config.js          # <-- EDIT ME: mock vs live, API base URL, SLA days
├── api.js             # data layer (GCApi): localStorage OR your REST API
├── app.js             # UI + application logic (views, forms, admin console)
├── assets/gc-logo.png # the Global Careers logo (also embedded in app.js)
└── server-example/    # reference Express backend implementing the contract
```

---

## Going live (connect your backend / GC Buddy)

1. Open **`config.js`** and set:
   ```js
   window.GC_CONFIG = {
     useMockData: false,
     apiBaseUrl: "https://your-api.example.com",
     slaDays: 3
   };
   ```
2. Implement the REST endpoints below (see `server-example/server.js` for a
   working reference you can extend).

### REST API contract (used by `api.js`)

| Method | Path                | Purpose                                   | Body / Returns |
|--------|---------------------|-------------------------------------------|----------------|
| GET    | `/grievances`       | list all grievances                        | → `Grievance[]` |
| GET    | `/grievances/:id`   | one grievance                              | → `Grievance` |
| POST   | `/grievances`       | create                                     | `Grievance` → `Grievance` |
| PUT    | `/grievances/:id`   | replace / update                           | `Grievance` → `Grievance` |
| GET    | `/students/:roll`   | **GC Buddy** roll-number lookup            | → `{name?,course,batch,mobile,email}` or `404` |
| POST   | `/admin/login`      | verify admin, issue token                  | `{username,password}` → `{token, admin}` |

`api.js` sends the admin token as `Authorization: Bearer <token>` on every
request once logged in.

### The three integration points (grep `INTEGRATION POINT` in `api.js`)
1. **GC Buddy directory** — `lookupStudent(roll)` → `GET /students/:roll`.
   Wire this to your live GC Buddy roll-number service. (By default the app
   accepts any roll; to allow **only** registered students, uncomment the guard
   in `studentLogin()` in `app.js`.)
2. **Admin auth / RBAC** — `adminLogin()` → `POST /admin/login`. Verify
   server-side and return a JWT. The current single admin has full access to all
   departments.
3. **Grievance persistence** — `create/update/refresh` → the `/grievances`
   endpoints, backed by your database.

### Real-time updates
In mock mode, tabs sync via the `storage` event. Against a live API, `api.js`
**polls** `GET /grievances` every 15s. For instant updates, replace the poll in
`GCApi.init()` with Server-Sent Events or a WebSocket.

---

## Data model — `Grievance`

```jsonc
{
  "id": "GC-2611-AB12",            // unique, human-readable
  "roll": "GCB2024001",
  "studentName": "Priya Sharma",
  "course": "", "batch": "", "mobile": "",
  "category": "EMI & Payment",      // one of 5 categories
  "brief": "…", "detail": "…",
  "callback": { "date": "2026-11-10", "slot": "03:00-05:00 PM", "num": "+91…" } | null,
  "status": "Submitted|Under Review|In Progress|Awaiting Student Response|Resolved",
  "dept": "Finance",                // derived from category
  "submittedAt": "ISO", "updatedAt": "ISO", "resolvedAt": "ISO|null",
  "reopened": false,
  "lastStudentMsg": { "text": "…", "at": "ISO" },
  "remarks": [ { "by": "...", "at": "ISO", "text": "..." } ],  // visible to student
  "notes":   [ { "by": "...", "at": "ISO", "text": "..." } ],  // internal only
  "audit":   [ { "at": "ISO", "by": "...", "action": "...", "to": "Status?", "student": true, "text": "..." } ]
}
```

Notes:
- **Resolved = closed.** There is no separate "Closed" status.
- The student's **reopen** control is intentionally low-emphasis.
- `remarks` are shown to the student; `notes` are internal; `audit` powers the
  timeline and the student notifications feed.

---

## Security checklist for production
- Verify admin credentials **server-side**; never trust the browser. Remove
  `MOCK_ADMINS` from `api.js` when `useMockData` is false.
- Enforce authorization on `/grievances*` so students can only read/write their
  own tickets (the front end filters by roll, but the server must enforce it).
- Store attachments (if re-enabled) in object storage, not the document.
- Serve over HTTPS; set CORS to your front-end origin only.

---

## Deploy
- **Front end:** any static host (Vercel, Netlify, Cloudflare Pages, S3, Nginx).
- **API:** deploy `server-example/` (or your own) and point `apiBaseUrl` at it.

---

## Transition notes (for the new code chat)
Link your GitHub repo and drop this folder in (e.g. `apps/support-portal/` or the
repo root). Then: flip `config.js` to `useMockData:false`, implement the six
endpoints above against your DB + GC Buddy, and remove the mock admin. Everything
in `app.js` (views, forms, admin console, analytics, export) stays as-is.
