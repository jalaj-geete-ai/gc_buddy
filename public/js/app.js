import { sb } from "./supabaseClient.js";

// ---------- helpers ----------------------------------------------------------
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fmtDate = (d) => { const [, m, day] = d.split("-"); return `${day}/${m}`; };
const weekday = (d) => WD[new Date(d + "T00:00:00").getDay()];

let toastTimer;
function toast(msg, isErr = false) {
  const t = $("#toast"); t.textContent = msg; t.className = "toast show" + (isErr ? " err" : "");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.className = "toast"), 2600);
}

// ---------- faculty session (no password; stored on device) ------------------
let ME = null;
try { ME = JSON.parse(localStorage.getItem("gc_faculty") || "null"); } catch { ME = null; }

async function boot() {
  if (ME && ME.name) return showApp();
  return showLogin();
}

async function showLogin() {
  $("#topbar").hidden = true; $("#tabsbar").hidden = true;
  $("#tab-mark").hidden = true; $("#tab-report").hidden = true;
  const box = $("#login");
  box.hidden = false;
  box.innerHTML = `<div class="login"><div class="card">
    <h2>🇩🇪 GC Attendance</h2>
    <p>Select your name to start marking attendance.</p>
    <select id="loginSel"><option value="">Loading…</option></select>
    <button class="btn" id="loginGo" disabled>Continue</button>
  </div></div>`;
  const { data, error } = await sb.from("faculty").select("id,name,is_admin").eq("is_active", true).order("name");
  const sel = $("#loginSel");
  if (error || !data?.length) { sel.innerHTML = `<option value="">No faculty found</option>`; return; }
  sel.innerHTML = `<option value="">— choose your name —</option>` +
    data.map(f => `<option value="${f.id}">${esc(f.name)}</option>`).join("");
  sel.addEventListener("change", () => { $("#loginGo").disabled = !sel.value; });
  $("#loginGo").addEventListener("click", () => {
    const f = data.find(x => String(x.id) === sel.value);
    if (!f) return;
    ME = { id: f.id, name: f.name, is_admin: !!f.is_admin };
    localStorage.setItem("gc_faculty", JSON.stringify(ME));
    showApp();
  });
}

async function showApp() {
  $("#login").hidden = true;
  $("#topbar").hidden = false; $("#tabsbar").hidden = false;
  // refresh admin flag (handles sessions saved before is_admin existed) + validate faculty
  try {
    const { data } = await sb.from("faculty").select("name,is_admin,is_active").eq("id", ME.id).single();
    if (data) { ME.is_admin = !!data.is_admin; ME.name = data.name; localStorage.setItem("gc_faculty", JSON.stringify(ME)); }
  } catch {}
  $("#whoName").textContent = ME.name;
  document.querySelectorAll("nav.tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === "mark"));
  $("#tab-mark").hidden = false; $("#tab-report").hidden = true;
  renderMark();
}

$("#switchBtn").addEventListener("click", () => {
  localStorage.removeItem("gc_faculty"); ME = null;
  $("#tab-mark").hidden = true; $("#tab-report").hidden = true;
  showLogin();
});

const tabs = { mark: renderMark, report: renderReport };
document.querySelectorAll("nav.tabs button").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll("nav.tabs button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  Object.keys(tabs).forEach(k => $("#tab-" + k).hidden = (k !== btn.dataset.tab));
  tabs[btn.dataset.tab]();
}));

// batches this faculty may mark. Admins (Jahanavi) see all; everyone else only their own.
async function myBatches() {
  if (!ME.is_admin) {
    const { data } = await sb.from("faculty_batches").select("batch_name").eq("faculty_id", ME.id);
    const mine = (data || []).map(r => r.batch_name);
    const { data: b } = await sb.from("batches").select("batch_name")
      .in("batch_name", mine.length ? mine : ["__none__"])
      .order("start_year").order("start_month").order("seq");
    return (b || []).map(x => x.batch_name);
  }
  const { data } = await sb.from("batches").select("batch_name").order("start_year").order("start_month").order("seq");
  return (data || []).map(x => x.batch_name);
}

// ============================================================================
// ATTENDANCE GRID
// ============================================================================
const G = { batch: null, roster: [], dates: [], marks: new Map(), topics: new Map(), changed: new Set(), showAll: false };
const key = (roll, d) => `${roll}|${d}`;

async function renderMark() {
  const root = $("#tab-mark");
  root.innerHTML = `<div class="card">
    <div class="row">
      <div class="field"><label>Batch</label><select id="gBatch"></select></div>
      <div class="field"><label>New class — date</label><input type="date" id="gDate" value="${today()}"></div>
      <div class="field"><label>Topic (optional)</label><input type="text" id="gTopic" placeholder="e.g. Dative prepositions"></div>
      <div class="field"><label>&nbsp;</label><button class="btn ghost" id="gAdd">+ Add class</button></div>
      <div style="flex:1"></div>
      <div class="field"><label>&nbsp;</label><button class="btn ghost" id="gExport">⭳ Excel</button></div>
      <button class="btn" id="gSave" disabled>Save changes</button>
    </div>
    <div class="legend">
      <span><span class="sw" style="background:var(--ok)"></span>Present</span>
      <span><span class="sw" style="background:var(--no)"></span>Absent</span>
      <span><span class="sw" style="background:#e3e6ea"></span>Not marked (blank)</span>
      <span><span class="sw" style="background:repeating-linear-gradient(45deg,#e9ebee,#e9ebee 3px,#f6f7f8 3px,#f6f7f8 6px)"></span>Not yet in batch</span>
      <span>Click a cell to cycle <b>P → A → blank</b>. Column buttons: ✓ all present · ✗ all absent · – clear. Attending morning <i>or</i> evening counts as present.</span>
    </div>
  </div>
  <div id="gGrid"><div class="spinner">Loading…</div></div>`;

  const sel = $("#gBatch");
  const fill = async () => {
    const batches = await myBatches();
    sel.innerHTML = batches.map(b => `<option>${esc(b)}</option>`).join("") || `<option>—</option>`;
    if (batches.length) loadGrid(sel.value); else $("#gGrid").innerHTML = `<div class="card spinner">No batches assigned to you.</div>`;
  };
  sel.addEventListener("change", () => loadGrid(sel.value));
  $("#gAdd").addEventListener("click", addClass);
  $("#gSave").addEventListener("click", saveGrid);
  $("#gExport").addEventListener("click", exportCsv);
  fill();
}

async function loadGrid(batch) {
  G.batch = batch; G.marks = new Map(); G.topics = new Map(); G.changed = new Set();
  $("#gSave").disabled = true;
  $("#gGrid").innerHTML = `<div class="card spinner">Loading roster…</div>`;

  const { data: enr, error } = await sb.from("batch_enrollments")
    .select("roll_number, start_date, approved_students(name)")
    .eq("batch_name", batch).eq("is_active", true);
  if (error) { $("#gGrid").innerHTML = `<div class="card spinner">${esc(error.message)}</div>`; return; }
  G.roster = (enr || []).map(e => ({ roll: e.roll_number, name: e.approved_students?.name || "(no name)", start: e.start_date }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const { data: att } = await sb.from("attendance_records")
    .select("date, roll_number, status, topic, class_type").eq("batch_name", batch);
  const dates = new Set();
  // combine Morning/Evening (and Day) per (student,date): present if present in EITHER session
  const acc = new Map();
  (att || []).forEach(r => {
    const k = key(r.roll_number, r.date);
    const cur = acc.get(k) || { p: false, a: false };
    if (r.status === "Present") cur.p = true; else if (r.status === "Absent") cur.a = true;
    acc.set(k, cur);
    dates.add(r.date);
    if (r.topic) G.topics.set(r.date, r.topic);
  });
  acc.forEach((v, k) => G.marks.set(k, v.p ? "Present" : v.a ? "Absent" : null));
  G.dates = [...dates].sort();
  drawGrid({ scrollToEnd: true });
}

function studentPct(roll, start) {
  let p = 0, t = 0;
  for (const d of G.dates) {
    if (start && d < start) continue;
    const s = G.marks.get(key(roll, d));
    if (s === "Present") { p++; t++; } else if (s === "Absent") t++;
  }
  return t ? Math.round(100 * p / t) : null;
}

function drawGrid(opts = {}) {
  const head = `<thead><tr>
    <th class="c-idx">#</th><th class="c-name">Student (${G.roster.length})</th>
    ${G.dates.map(d => `<th class="datehdr">${fmtDate(d)}<span class="dc">${weekday(d)}${G.topics.get(d) ? ` <span class="tpc" title="${esc(G.topics.get(d))}" aria-label="${esc(G.topics.get(d))}">&#9432;</span>` : ""}</span>
      <div class="colbtns"><button class="p" data-all="Present" data-d="${d}" title="All present">✓</button><button class="a" data-all="Absent" data-d="${d}" title="All absent">✗</button><button class="c" data-all="clear" data-d="${d}" title="Clear column">–</button></div></th>`).join("")}
    <th class="c-pct">%</th></tr></thead>`;

  const body = G.roster.map((st, i) => {
    const cells = G.dates.map(d => {
      if (st.start && d < st.start) return `<td class="cell na">–</td>`;
      const s = G.marks.get(key(st.roll, d));
      const cls = s === "Present" ? "p" : s === "Absent" ? "a" : "empty";
      const ch = G.changed.has(key(st.roll, d)) ? " changed" : "";
      const label = s === "Present" ? "P" : s === "Absent" ? "A" : "·";
      return `<td class="cell ${cls}${ch}" data-roll="${esc(st.roll)}" data-date="${d}">${label}</td>`;
    }).join("");
    const pct = studentPct(st.roll, st.start);
    const pctColor = pct == null ? "" : pct < 75 ? "color:var(--no)" : pct < 85 ? "color:var(--warn)" : "color:var(--ok)";
    return `<tr><td class="c-idx">${i + 1}</td><td class="c-name">${esc(st.name)}<span class="rollno">${esc(st.roll)}</span></td>${cells}
      <td class="c-pct" style="${pctColor}">${pct == null ? "–" : pct + "%"}</td></tr>`;
  }).join("");

  const note = G.dates.length ? "" : `<div class="hint" style="padding:14px">No classes yet. Pick a date and press <b>+ Add class</b>.</div>`;

  // preserve horizontal scroll across re-renders (marking shouldn't jump to the left)
  const oldWrap = document.querySelector("#gGrid .gridwrap");
  const savedLeft = oldWrap ? oldWrap.scrollLeft : null;
  const savedTop = oldWrap ? oldWrap.scrollTop : null;

  $("#gGrid").innerHTML = `<div class="gridwrap"><table class="grid">${head}<tbody>${body}</tbody></table></div>${note}`;

  const wrap = document.querySelector("#gGrid .gridwrap");
  if (wrap) {
    if (opts.scrollToEnd || savedLeft === null) wrap.scrollLeft = wrap.scrollWidth; // open on the latest class
    else { wrap.scrollLeft = savedLeft; wrap.scrollTop = savedTop; }
  }

  $("#gGrid").querySelectorAll("td.cell:not(.na)").forEach(td => td.addEventListener("click", () => cycleCell(td)));
  $("#gGrid").querySelectorAll(".colbtns button").forEach(b => b.addEventListener("click", () => markColumn(b.dataset.d, b.dataset.all)));
}

function setMark(roll, d, status) { G.marks.set(key(roll, d), status); G.changed.add(key(roll, d)); }

function cycleCell(td) {
  const roll = td.dataset.roll, d = td.dataset.date;
  const cur = G.marks.get(key(roll, d));
  // cycle Present -> Absent -> blank -> Present
  const next = cur === "Present" ? "Absent" : cur === "Absent" ? null : "Present";
  setMark(roll, d, next);
  // update only this cell — no full re-render, so the scroll position stays put
  td.classList.remove("p", "a", "empty");
  td.classList.add(next === "Present" ? "p" : next === "Absent" ? "a" : "empty", "changed");
  td.textContent = next === "Present" ? "P" : next === "Absent" ? "A" : "·";
  const st = G.roster.find(s => s.roll === roll);
  const pct = studentPct(roll, st && st.start);
  const pctCell = td.closest("tr").querySelector(".c-pct");
  if (pctCell) {
    pctCell.textContent = pct == null ? "–" : pct + "%";
    pctCell.style.color = pct == null ? "" : pct < 75 ? "var(--no)" : pct < 85 ? "var(--warn)" : "var(--ok)";
  }
  $("#gSave").disabled = G.changed.size === 0;
}

function markColumn(d, status) {
  const val = status === "clear" ? null : status;   // "clear" wipes the column to blank
  for (const st of G.roster) { if (st.start && d < st.start) continue; setMark(st.roll, d, val); }
  $("#gSave").disabled = G.changed.size === 0; drawGrid();
}

function addClass() {
  const d = $("#gDate").value;
  if (!d) { toast("Pick a date first.", true); return; }
  const topic = $("#gTopic").value.trim();
  if (!G.dates.includes(d)) { G.dates.push(d); G.dates.sort(); }
  if (topic) G.topics.set(d, topic);
  for (const st of G.roster) {
    if (st.start && d < st.start) continue;
    if (!G.marks.has(key(st.roll, d))) setMark(st.roll, d, "Present");
  }
  $("#gTopic").value = "";
  $("#gSave").disabled = G.changed.size === 0; drawGrid({ scrollToEnd: true });
  toast(`Class ${fmtDate(d)} added — everyone Present, flip absentees then Save.`);
}

async function saveGrid() {
  if (!G.changed.size) return;
  const byName = Object.fromEntries(G.roster.map(s => [s.roll, s.name]));
  const rows = [], clears = [];
  for (const k of G.changed) {
    const [roll, d] = k.split("|");
    const st = G.marks.get(k);
    if (st === "Present" || st === "Absent")
      rows.push({ batch_name: G.batch, date: d, roll_number: roll, name: byName[roll],
                  status: st, class_type: "Day", topic: G.topics.get(d) || null, marked_by: ME.name });
    else
      clears.push({ d, roll });   // blank -> remove any saved mark
  }
  $("#gSave").disabled = true;
  if (rows.length) {
    const { error } = await sb.from("attendance_records").upsert(rows, { onConflict: "batch_name,date,roll_number,class_type" });
    if (error) { toast(error.message, true); $("#gSave").disabled = false; return; }
  }
  for (const c of clears) {
    const { error } = await sb.from("attendance_records").delete()
      .eq("batch_name", G.batch).eq("date", c.d).eq("roll_number", c.roll).eq("class_type", "Day");
    if (error) { toast(error.message, true); $("#gSave").disabled = false; return; }
  }
  // audit log (timestamped) — best-effort, never blocks the save
  try {
    const touchedDates = [...new Set([...rows.map(r => r.date), ...clears.map(c => c.d)])].sort().join(", ");
    await sb.from("attendance_save_log").insert({
      faculty: ME.name, batch_name: G.batch, slot: "Day",
      marked: rows.length, cleared: clears.length, dates: touchedDates,
    });
  } catch (e) { /* logging failure shouldn't affect marking */ }
  G.changed.clear(); drawGrid();
  toast(`Saved ✓ ${rows.length} marked${clears.length ? ", " + clears.length + " cleared" : ""}`);
}

function exportCsv() {
  if (!G.roster.length) { toast("Nothing to export.", true); return; }
  const head = ["#", "Student", "Roll", ...G.dates.map(d => `${fmtDate(d)} (${weekday(d)})`), "Overall %"];
  const lines = [head.join(",")];
  G.roster.forEach((st, i) => {
    const cells = G.dates.map(d => (st.start && d < st.start) ? "" : ({ Present: "P", Absent: "A" }[G.marks.get(key(st.roll, d))] || ""));
    const pct = studentPct(st.roll, st.start);
    lines.push([i + 1, `"${st.name.replace(/"/g, '""')}"`, st.roll, ...cells, pct == null ? "" : pct + "%"].join(","));
  });
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = `${G.batch}_attendance.csv`;
  document.body.appendChild(a); a.click(); a.remove();
}

// ============================================================================
// SUMMARY
// ============================================================================
async function renderReport() {
  const root = $("#tab-report");
  root.innerHTML = `<div class="card"><div class="row">
      <div class="field"><label>Batch</label><select id="rBatch"></select></div>
    </div></div><div class="card" id="rBody"><div class="spinner">Pick a batch…</div></div>`;
  const sel = $("#rBatch");
  const fill = async () => {
    const batches = await myBatches();
    sel.innerHTML = batches.map(b => `<option>${esc(b)}</option>`).join("") || `<option>—</option>`;
    if (batches.length) loadReport(sel.value);
  };
  sel.addEventListener("change", () => loadReport(sel.value));
  fill();
}

async function loadReport(batch) {
  const box = $("#rBody");
  box.innerHTML = `<div class="spinner">Crunching…</div>`;
  const { data, error } = await sb.from("v_batch_attendance").select("*").eq("batch_name", batch);
  if (error) { box.innerHTML = `<div class="spinner">${esc(error.message)}</div>`; return; }
  if (!data.length) { box.innerHTML = `<div class="spinner">No students enrolled.</div>`; return; }
  // per-session (Morning/Evening) breakdown — present for dual-slot batches
  const { data: slots } = await sb.from("v_slot_attendance").select("*").eq("batch_name", batch);
  const slotMap = {}; let dual = false;
  (slots || []).forEach(s => {
    (slotMap[s.roll_number] = slotMap[s.roll_number] || {})[s.slot] = s.pct;
    if (s.slot === "Morning" || s.slot === "Evening") dual = true;
  });
  data.sort((a, b) => (a.pct ?? 999) - (b.pct ?? 999));
  const withData = data.filter(r => r.pct != null);
  const avg = withData.length ? Math.round(withData.reduce((s, r) => s + r.pct, 0) / withData.length) : 0;
  const atRisk = data.filter(r => (r.pct ?? 100) < 75).length;
  const fmtP = p => p == null ? "–" : p + "%";
  const rows = data.map((r, i) => {
    const p = r.pct;
    const pill = p == null ? `<span class="pill muted">no classes</span>`
      : p < 75 ? `<span class="pill no">${p}%</span>` : p < 85 ? `<span class="pill warn">${p}%</span>` : `<span class="pill ok">${p}%</span>`;
    const sm = slotMap[r.roll_number] || {};
    const slotCols = dual ? `<td class="muted">${fmtP(sm.Morning)}</td><td class="muted">${fmtP(sm.Evening)}</td>` : "";
    return `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td class="muted">${esc(r.roll_number)}</td>
      <td>${r.present}/${r.total}</td><td>${pill}${(p != null && p < 75) ? " ⚠️" : ""}</td>${slotCols}</tr>`;
  }).join("");
  box.innerHTML = `<div class="row" style="margin-bottom:14px">
      <div class="stat"><div class="muted">Students</div><div class="big">${data.length}</div></div>
      <div class="stat"><div class="muted">Avg attendance</div><div class="big">${avg}%</div></div>
      <div class="stat"><div class="muted">Below 75%</div><div class="big">${atRisk}</div></div></div>
    <table><thead><tr><th>#</th><th>Name</th><th>Roll no.</th><th>Present/Total</th><th>Attendance</th>${dual ? "<th>Morning %</th><th>Evening %</th>" : ""}</tr></thead>
    <tbody>${rows}</tbody></table>
    ${dual ? `<div class="hint">Morning % / Evening % are per-session; "Attendance" combines both sessions.</div>` : ""}`;
}

boot();
