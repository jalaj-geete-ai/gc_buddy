import { sb } from "./supabaseClient.js";

// ---------- helpers ----------------------------------------------------------
const $ = (s, el = document) => el.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function fmtDate(d) { const [y, m, day] = d.split("-"); return `${day}/${m}`; }
function weekday(d) { return WD[new Date(d + "T00:00:00").getDay()]; }

let toastTimer;
function toast(msg, isErr = false) {
  const t = $("#toast"); t.textContent = msg; t.className = "toast show" + (isErr ? " err" : "");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.className = "toast"), 2600);
}

const facultyInput = $("#facultyEmail");
facultyInput.value = localStorage.getItem("gc_faculty") || "";
facultyInput.addEventListener("change", () => localStorage.setItem("gc_faculty", facultyInput.value.trim()));
const facultyEmail = () => facultyInput.value.trim() || null;

const tabs = { mark: renderMark, report: renderReport };
document.querySelectorAll("nav.tabs button").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll("nav.tabs button").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  Object.keys(tabs).forEach(k => $("#tab-" + k).hidden = (k !== btn.dataset.tab));
  tabs[btn.dataset.tab]();
}));

async function getBatches() {
  const { data, error } = await sb.from("batches").select("batch_name")
    .order("start_year").order("start_month").order("seq");
  if (error) { toast(error.message, true); return []; }
  return (data || []).map(b => b.batch_name);
}

// ============================================================================
// ATTENDANCE GRID
// ============================================================================
const G = { batch: null, roster: [], dates: [], marks: new Map(), changed: new Set() };
const key = (roll, d) => `${roll}|${d}`;

async function renderMark() {
  const root = $("#tab-mark");
  root.innerHTML = `<div class="card">
    <div class="row">
      <div class="field"><label>Batch</label><select id="gBatch"></select></div>
      <div class="field"><label>Add a class</label>
        <div style="display:flex;gap:6px"><input type="date" id="gDate" value="${today()}">
        <button class="btn ghost" id="gAdd">+ Add</button></div></div>
      <div style="flex:1"></div>
      <button class="btn" id="gSave" disabled>Save changes</button>
    </div>
    <div class="legend">
      <span><span class="sw" style="background:var(--ok)"></span>Present</span>
      <span><span class="sw" style="background:var(--no)"></span>Absent</span>
      <span><span class="sw" style="background:#e3e6ea"></span>Not marked (click to mark)</span>
      <span><span class="sw" style="background:repeating-linear-gradient(45deg,#e9ebee,#e9ebee 3px,#f6f7f8 3px,#f6f7f8 6px)"></span>Not yet in batch</span>
      <span>Tip: a new class starts everyone <b>Present</b> — click a cell to flip to Absent.</span>
    </div>
  </div>
  <div id="gGrid"><div class="spinner">Loading…</div></div>`;

  const batches = await getBatches();
  const sel = $("#gBatch");
  sel.innerHTML = batches.map(b => `<option>${esc(b)}</option>`).join("") || `<option>—</option>`;
  sel.addEventListener("change", () => loadGrid(sel.value));
  $("#gAdd").addEventListener("click", addClass);
  $("#gSave").addEventListener("click", saveGrid);
  if (batches.length) loadGrid(sel.value);
  else $("#gGrid").innerHTML = `<div class="card spinner">No batches yet.</div>`;
}

async function loadGrid(batch) {
  G.batch = batch; G.marks = new Map(); G.changed = new Set();
  $("#gGrid").innerHTML = `<div class="card spinner">Loading roster…</div>`;

  const { data: enr, error } = await sb.from("batch_enrollments")
    .select("roll_number, start_date, approved_students(name)")
    .eq("batch_name", batch).eq("is_active", true);
  if (error) { $("#gGrid").innerHTML = `<div class="card spinner">${esc(error.message)}</div>`; return; }
  G.roster = (enr || []).map(e => ({ roll: e.roll_number, name: e.approved_students?.name || "(no name)", start: e.start_date }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const { data: att } = await sb.from("attendance_records")
    .select("date, roll_number, status").eq("batch_name", batch);
  const dates = new Set();
  (att || []).forEach(r => { G.marks.set(key(r.roll_number, r.date), r.status); dates.add(r.date); });
  G.dates = [...dates].sort();
  drawGrid();
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

function drawGrid() {
  const head = `<thead><tr>
    <th class="c-idx">#</th><th class="c-name">Student (${G.roster.length})</th>
    ${G.dates.map(d => `<th class="datehdr">${fmtDate(d)}<span class="dc">${weekday(d)}</span></th>`).join("")}
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
    const pctTxt = pct == null ? "–" : pct + "%";
    const pctColor = pct == null ? "" : pct < 75 ? "color:var(--no)" : pct < 85 ? "color:var(--warn)" : "color:var(--ok)";
    return `<tr><td class="c-idx">${i + 1}</td><td class="c-name">${esc(st.name)}</td>${cells}
      <td class="c-pct" style="${pctColor}">${pctTxt}</td></tr>`;
  }).join("");

  const emptyNote = G.dates.length ? "" : `<div class="hint" style="padding:14px">No classes yet. Pick a date and press <b>+ Add</b> to start marking.</div>`;
  $("#gGrid").innerHTML = `<div class="gridwrap"><table class="grid">${head}<tbody>${body}</tbody></table></div>${emptyNote}`;

  $("#gGrid").querySelectorAll("td.cell").forEach(td => {
    if (td.classList.contains("na")) return;
    td.addEventListener("click", () => cycleCell(td));
  });
}

function cycleCell(td) {
  const roll = td.dataset.roll, d = td.dataset.date, k = key(roll, d);
  const cur = G.marks.get(k);
  const next = cur === "Present" ? "Absent" : "Present"; // empty/absent -> present; present -> absent
  G.marks.set(k, next); G.changed.add(k);
  $("#gSave").disabled = G.changed.size === 0;
  drawGrid();
}

function addClass() {
  const d = $("#gDate").value;
  if (!d) { toast("Pick a date first.", true); return; }
  if (!G.dates.includes(d)) { G.dates.push(d); G.dates.sort(); }
  // default everyone enrolled by that date to Present (unless already marked)
  for (const st of G.roster) {
    if (st.start && d < st.start) continue;
    const k = key(st.roll, d);
    if (!G.marks.has(k)) { G.marks.set(k, "Present"); G.changed.add(k); }
  }
  $("#gSave").disabled = G.changed.size === 0;
  drawGrid();
  toast(`Class ${fmtDate(d)} added — everyone Present, flip absentees then Save.`);
}

async function saveGrid() {
  if (!G.changed.size) return;
  const byName = Object.fromEntries(G.roster.map(s => [s.roll, s.name]));
  const rows = [...G.changed].map(k => {
    const [roll, d] = k.split("|");
    return { batch_name: G.batch, date: d, roll_number: roll, name: byName[roll],
             status: G.marks.get(k), class_type: "Day", marked_by: facultyEmail() };
  });
  $("#gSave").disabled = true;
  const { error } = await sb.from("attendance_records")
    .upsert(rows, { onConflict: "batch_name,date,roll_number,class_type" });
  if (error) { toast(error.message, true); $("#gSave").disabled = false; return; }
  G.changed.clear(); drawGrid();
  toast(`Saved ${rows.length} marks ✓`);
}

// ============================================================================
// SUMMARY (per-batch attendance %)
// ============================================================================
async function renderReport() {
  const root = $("#tab-report");
  root.innerHTML = `<div class="card"><div class="row">
      <div class="field"><label>Batch</label><select id="rBatch"></select></div>
    </div></div><div class="card" id="rBody"><div class="spinner">Pick a batch…</div></div>`;
  const batches = await getBatches();
  const sel = $("#rBatch");
  sel.innerHTML = batches.map(b => `<option>${esc(b)}</option>`).join("") || `<option>—</option>`;
  sel.addEventListener("change", () => loadReport(sel.value));
  if (batches.length) loadReport(sel.value);
}

async function loadReport(batch) {
  const box = $("#rBody");
  box.innerHTML = `<div class="spinner">Crunching…</div>`;
  const { data, error } = await sb.from("v_batch_attendance").select("*").eq("batch_name", batch);
  if (error) { box.innerHTML = `<div class="spinner">${esc(error.message)}</div>`; return; }
  if (!data.length) { box.innerHTML = `<div class="spinner">No students enrolled.</div>`; return; }
  data.sort((a, b) => (a.pct ?? 999) - (b.pct ?? 999));
  const withData = data.filter(r => r.pct != null);
  const avg = withData.length ? Math.round(withData.reduce((s, r) => s + r.pct, 0) / withData.length) : 0;
  const atRisk = data.filter(r => (r.pct ?? 100) < 75).length;
  const rows = data.map((r, i) => {
    const p = r.pct;
    const pill = p == null ? `<span class="pill muted">no classes</span>`
      : p < 75 ? `<span class="pill no">${p}%</span>` : p < 85 ? `<span class="pill warn">${p}%</span>` : `<span class="pill ok">${p}%</span>`;
    return `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td class="muted">${esc(r.roll_number)}</td>
      <td>${r.present}/${r.total}</td><td>${pill}${(p != null && p < 75) ? " ⚠️" : ""}</td></tr>`;
  }).join("");
  box.innerHTML = `<div class="row" style="margin-bottom:14px">
      <div class="stat"><div class="muted">Students</div><div class="big">${data.length}</div></div>
      <div class="stat"><div class="muted">Avg attendance</div><div class="big">${avg}%</div></div>
      <div class="stat"><div class="muted">Below 75%</div><div class="big">${atRisk}</div></div></div>
    <table><thead><tr><th>#</th><th>Name</th><th>Roll no.</th><th>Present/Total</th><th>Attendance</th></tr></thead>
    <tbody>${rows}</tbody></table>`;
}

renderMark();
