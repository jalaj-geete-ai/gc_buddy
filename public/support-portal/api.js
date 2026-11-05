/* ============================================================
   GC Support Portal — data layer (GCApi)
   ------------------------------------------------------------
   Default:  in-browser demo data via localStorage (no backend).
   Live:     set GC_CONFIG.useMockData=false and GC_CONFIG.apiBaseUrl,
             then implement the REST endpoints referenced below.

   >>> INTEGRATION POINT 1: lookupStudent()  -> GC Buddy roll-number directory
   >>> INTEGRATION POINT 2: adminLogin()     -> your admin auth / RBAC
   >>> INTEGRATION POINT 3: create/update/list -> grievance persistence
   ============================================================ */
const GCApi = (function () {
  const LSK = 'gc_grievances_v1';
  let listeners = [];
  let cache = {};
  let poll = null;

  /* ---------- mock directory (replace with GC Buddy in production) ---------- */
  const MOCK_STUDENTS = {
    "GCB2024001": { name: "Priya Sharma", course: "Nursing Careers in Germany", batch: "GER-NUR-12 · Jan 2026", mobile: "+91 98765 43210", email: "priya.s@example.com" },
    "GCB2024002": { name: "Rahul Verma", course: "Nursing Careers in Germany", batch: "GER-NUR-12 · Jan 2026", mobile: "+91 90123 45678", email: "rahul.v@example.com" },
    "GCB2024003": { name: "Anjali Nair", course: "UK Healthcare Pathway", batch: "UK-HC-07 · Feb 2026", mobile: "+91 99887 76655", email: "anjali.n@example.com" },
    "GCB2024004": { name: "Mohammed Ali", course: "Germany Language (B1-B2)", batch: "GER-LANG-04 · Dec 2025", mobile: "+91 93456 78901", email: "m.ali@example.com" },
    "GCB2024005": { name: "Sneha Reddy", course: "Canada Nursing Pathway", batch: "CAN-NUR-03 · Mar 2026", mobile: "+91 97654 32109", email: "sneha.r@example.com" }
  };
  // NOTE: for a real deployment, verify admin credentials SERVER-SIDE.
  // These demo creds live in the browser and are not secure on their own.
  const MOCK_ADMINS = {
    "admin": { pass: "gc@admin", name: "Global Careers Admin", role: "Administrator", dept: "All", superadmin: true }
  };

  function lsLoad() { try { return JSON.parse(localStorage.getItem(LSK) || '{}'); } catch (e) { return {}; } }
  function lsSave(map) { try { localStorage.setItem(LSK, JSON.stringify(map)); } catch (e) {} }
  function emit() { const list = Object.values(cache); listeners.forEach(cb => { try { cb(list); } catch (e) {} }); }
  function apiUrl(p) { return (GC_CONFIG.apiBaseUrl || '').replace(/\/$/, '') + p; }
  function headers() {
    const h = { 'Content-Type': 'application/json' };
    try { const t = sessionStorage.getItem('gc_admin_token'); if (t) h['Authorization'] = 'Bearer ' + t; } catch (e) {}
    return h;
  }

  /* ---------- lifecycle ---------- */
  async function init() {
    if (GC_CONFIG.useMockData) {
      cache = lsLoad();
      if (Object.keys(cache).length === 0) { cache = seedData(); lsSave(cache); }
      window.addEventListener('storage', e => { if (e.key === LSK) { cache = lsLoad(); emit(); } }); // cross-tab sync
      emit();
    } else {
      await refresh();
      poll = setInterval(() => { refresh().catch(() => {}); }, 15000); // near-realtime; swap for SSE/WebSocket if available
    }
  }
  function subscribe(cb) {
    listeners.push(cb);
    if (Object.keys(cache).length) cb(Object.values(cache));
    return () => { listeners = listeners.filter(x => x !== cb); };
  }

  /* ---------- grievance CRUD (INTEGRATION POINT 3) ---------- */
  async function create(g) {
    if (GC_CONFIG.useMockData) { cache[g.id] = g; lsSave(cache); emit(); return g; }
    const r = await fetch(apiUrl('/grievances'), { method: 'POST', headers: headers(), body: JSON.stringify(g) });
    if (!r.ok) throw new Error('create failed'); const saved = await r.json(); cache[saved.id] = saved; emit(); return saved;
  }
  async function update(id, next) {
    if (GC_CONFIG.useMockData) { cache[id] = next; lsSave(cache); emit(); return next; }
    const r = await fetch(apiUrl('/grievances/' + encodeURIComponent(id)), { method: 'PUT', headers: headers(), body: JSON.stringify(next) });
    if (!r.ok) throw new Error('update failed'); const saved = await r.json(); cache[id] = saved; emit(); return saved;
  }
  async function refresh() {
    const r = await fetch(apiUrl('/grievances'), { headers: headers() });
    if (!r.ok) throw new Error('list failed'); const arr = await r.json();
    cache = {}; arr.forEach(g => { cache[g.id] = g; }); emit();
  }

  /* ---------- student lookup (INTEGRATION POINT 1: GC Buddy) ---------- */
  async function lookupStudent(roll) {
    if (GC_CONFIG.useMockData) return MOCK_STUDENTS[roll] || null;
    const r = await fetch(apiUrl('/students/' + encodeURIComponent(roll)), { headers: headers() });
    if (r.status === 404) return null;
    if (!r.ok) throw new Error('lookup failed');
    return await r.json(); // { name?, course, batch, mobile, email }
  }

  /* ---------- admin auth (INTEGRATION POINT 2) ---------- */
  async function adminLogin(username, password) {
    if (GC_CONFIG.useMockData) {
      const a = MOCK_ADMINS[username];
      return (a && a.pass === password) ? { user: username, name: a.name, role: a.role, dept: a.dept, superadmin: a.superadmin } : null;
    }
    const r = await fetch(apiUrl('/admin/login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    if (!r.ok) return null;
    const d = await r.json(); // { token, admin: {name, role, dept, superadmin} }
    try { if (d.token) sessionStorage.setItem('gc_admin_token', d.token); } catch (e) {}
    return d.admin || null;
  }

  /* ---------- demo seed (mock mode only) ---------- */
  function rid() { let r = ''; const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; for (let i = 0; i < 4; i++) r += A[Math.floor(Math.random() * A.length)]; const d = new Date(); return 'GC-' + String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + '-' + r; }
  function seedData() {
    const now = Date.now(), D = 86400000, iso = ms => new Date(now - ms).toISOString();
    const rows = [
      { roll: "GCB2024001", cat: "EMI & Payment", dept: "Finance", brief: "Paid 2nd EMI but it still shows as pending", detail: "I paid my second EMI of Rs.18,000 via UPI three days ago but my dashboard still shows it as due.", status: "In Progress", sub: 5 * D, upd: 1 * D },
      { roll: "GCB2024002", cat: "Batch Schedule", dept: "Operations", brief: "Unable to join the live German class link", detail: "The Google Meet link in the GC Buddy app throws a 'you can't join this call' error since Monday. I've missed two classes.", status: "Awaiting Student Response", sub: 4 * D, upd: 2 * D },
      { roll: "GCB2024003", cat: "Course & Curriculum", dept: "Academics", brief: "UK pathway PDFs not downloading", detail: "The downloadable study material for Module 3 of the UK Healthcare Pathway shows a blank page when I tap download.", status: "Resolved", sub: 9 * D, upd: 6 * D, res: 6 * D },
      { roll: "GCB2024004", cat: "GC Buddy App", dept: "Tech Support", brief: "AI Tutor not responding to speaking practice", detail: "When I try the Listening & Speaking practice, the AI Tutor records but never gives feedback. App version is latest.", status: "Submitted", sub: 1 * D, upd: 1 * D },
      { roll: "GCB2024005", cat: "Call Back Request", dept: "Operations", brief: "Need guidance on Canada vs Germany pathway", detail: "I'm enrolled in the Canada Nursing Pathway but want to understand if switching to Germany is better for my profile.", status: "Resolved", sub: 12 * D, upd: 8 * D, res: 8 * D, cb: { date: new Date(now - 9 * D).toISOString().slice(0, 10), slot: "03:00-05:00 PM", num: "+91 97654 32109" } }
    ];
    const map = {};
    rows.forEach(d => {
      const st = MOCK_STUDENTS[d.roll], id = rid(), sub = iso(d.sub), upd = iso(d.upd);
      const audit = [{ at: sub, by: st.name, action: 'Grievance submitted', to: 'Submitted', student: true, text: 'Your grievance has been received. Our ' + d.dept + ' team will review it shortly.' }];
      if (d.status !== 'Submitted') audit.push({ at: upd, by: 'Global Careers Admin', action: 'Status updated', to: d.status, student: true, kind: d.status === 'Resolved' ? 'ok' : 'warn', text: ({ 'In Progress': 'Good news - our team is actively working on your issue.', 'Awaiting Student Response': 'We need some more information from you. Please check and respond.', 'Resolved': 'Your grievance has been resolved and this ticket is now closed. We hope it helped!' })[d.status] || '' });
      map[id] = {
        id, roll: d.roll, studentName: st.name, course: st.course, batch: st.batch, mobile: st.mobile,
        category: d.cat, issueType: '', brief: d.brief, detail: d.detail, preferred: '', callback: d.cb || null, attachment: null,
        status: d.status, dept: d.dept, assignee: '', submittedAt: sub, updatedAt: upd, resolvedAt: d.res ? iso(d.res) : null, reopened: false,
        lastStudentMsg: { text: d.detail, at: sub }, notes: [],
        remarks: d.status === 'Resolved' ? [{ by: 'Global Careers Admin', at: upd, text: 'This has been resolved on our end. Please reach out again if it recurs.' }] : [],
        audit
      };
    });
    return map;
  }

  return { init, subscribe, create, update, refresh, lookupStudent, adminLogin };
})();
