import { sb, parseBatchCode, monthName } from "./supabaseClient.js";

// ---------- tiny helpers ----------------------------------------------------
const $ = (sel, el = document) => el.querySelector(sel);
const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const today = () => new Date().toISOString().slice(0, 10);

let toastTimer;
function toast(msg, isErr = false) {
  const t = $("#toast");
  t.textContent = msg; t.className = "toast show" + (isErr ? " err" : "");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.className = "toast"), 2600);
}

// faculty identity (dev): stored locally, written as marked_by
const facultyInput = $("#facultyEmail");
facultyInput.value = localStorage.getItem("gc_faculty") || "";
facultyInput.addEventListener("change", () => localStorage.setItem("gc_faculty", facultyInput.value.trim()));
const facultyEmail = () => facultyInput.value.trim() || null;

// ---------- tab routing -----------------------------------------------------
const tabs = { mark: renderMark, report: renderReport, student: renderStudent, admin: renderAdmin };
document.querySelectorAll("nav.tabs button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("nav.tabs button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    Object.keys(tabs).forEach(k => $("#tab-" + k).hidden = (k !== btn.dataset.tab));
    tabs[btn.dataset.tab]();
  });
});

// ---------- shared data -----------------------------------------------------
async function getBatches() {
  const { data, error } = await sb.from("batches").select("*").order("start_year", { ascending: false }).order("start_month", { ascending: false }).order("seq");
  if (error) { toast(error.message, true); return []; }
  return data || [];
}
function slotsFor(batch) { return batch?.is_dual_slot ? ["Morning", "Evening"] : ["Single"]; }

// ============================================================================
// TAB 1 — MARK ATTENDANCE
// ============================================================================
async function renderMark() {
  const root = $("#tab-mark");
  root.innerHTML = `<div class="card">
    <div class="row">
      <div class="field"><label>Batch</label><select id="mBatch"></select></div>
      <div class="field" id="mSlotWrap"><label>Slot</label><select id="mSlot"></select></div>
      <div class="field"><label>Date</label><input type="date" id="mDate" value="${today()}"></div>
      <div class="field" style="flex:1"><label>Topic (optional)</label><input type="text" id="mTopic" placeholder="e.g. Dative prepositions"></div>
    </div>
    <div class="hint">Tip: everyone defaults to <b>Present</b> — just flip the absentees, then Save.</div>
  </div>
  <div class="card" id="mRoster"><div class="spinner">Pick a batch to load its roster…</div></div>`;

  const batches = await getBatches();
  const bSel = $("#mBatch");
  if (!batches.length) { $("#mRoster").innerHTML = `<div class="spinner">No batches yet. Create one in <b>Batches &amp; Students</b>.</div>`; bSel.innerHTML = `<option>—</option>`; return; }
  bSel.innerHTML = batches.map(b => `<option value="${esc(b.batch_name)}">${esc(b.batch_name)}</option>`).join("");

  const refreshSlots = () => {
    const b = batches.find(x => x.batch_name === bSel.value);
    const slots = slotsFor(b);
    $("#mSlotWrap").style.display = b.is_dual_slot ? "" : "none";
    $("#mSlot").innerHTML = slots.map(s => `<option>${s}</option>`).join("");
  };
  const loadRoster = () => loadMarkRoster(bSel.value, $("#mSlot").value, $("#mDate").value);
  bSel.addEventListener("change", () => { refreshSlots(); loadRoster(); });
  $("#mSlot").addEventListener("change", loadRoster);
  $("#mDate").addEventListener("change", loadRoster);
  refreshSlots(); loadRoster();
}

async function loadMarkRoster(batch, slot, date) {
  const box = $("#mRoster");
  box.innerHTML = `<div class="spinner">Loading roster…</div>`;
  const { data: enr, error } = await sb.from("batch_enrollments")
    .select("roll_number, slot, approved_students(name)")
    .eq("batch_name", batch).eq("slot", slot).eq("is_active", true);
  if (error) { box.innerHTML = `<div class="spinner">${esc(error.message)}</div>`; return; }
  if (!enr.length) { box.innerHTML = `<div class="spinner">No students enrolled for <b>${esc(batch)} · ${esc(slot)}</b>. Add them in <b>Batches &amp; Students</b>.</div>`; return; }

  const { data: existing } = await sb.from("attendance_records")
    .select("roll_number, status").eq("batch_name", batch).eq("date", date).eq("class_type", slot);
  const prior = Object.fromEntries((existing || []).map(r => [r.roll_number, r.status]));

  enr.sort((a, b) => (a.approved_students?.name || "").localeCompare(b.approved_students?.name || ""));
  const rows = enr.map((e, i) => {
    const status = prior[e.roll_number] || "Present";
    return `<tr data-roll="${esc(e.roll_number)}" data-name="${esc(e.approved_students?.name || "")}">
      <td>${i + 1}</td>
      <td>${esc(e.approved_students?.name || "(no name)")}</td>
      <td class="muted">${esc(e.roll_number)}</td>
      <td><div class="att-toggle">
        <button class="p ${status === "Present" ? "on" : ""}" data-v="Present">Present</button>
        <button class="a ${status === "Absent" ? "on" : ""}" data-v="Absent">Absent</button>
      </div></td></tr>`;
  }).join("");

  box.innerHTML = `<div class="row" style="justify-content:space-between;margin-bottom:10px">
      <div><b>${enr.length}</b> students · ${esc(batch)} · ${esc(slot)} · ${esc(date)}
        ${existing?.length ? `<span class="pill muted">already saved — editing</span>` : ""}</div>
      <button class="btn" id="mSave">Save attendance</button>
    </div>
    <table><thead><tr><th>#</th><th>Name</th><th>Roll no.</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`;

  box.querySelectorAll(".att-toggle button").forEach(b => b.addEventListener("click", () => {
    const wrap = b.parentElement;
    wrap.querySelectorAll("button").forEach(x => x.classList.remove("on"));
    b.classList.add("on");
  }));

  $("#mSave").addEventListener("click", async () => {
    const records = [...box.querySelectorAll("tbody tr")].map(tr => ({
      batch_name: batch, date, class_type: slot,
      roll_number: tr.dataset.roll, name: tr.dataset.name,
      status: tr.querySelector(".att-toggle .on")?.dataset.v || "Present",
      topic: $("#mTopic").value.trim() || null, marked_by: facultyEmail(),
    }));
    $("#mSave").disabled = true;
    const { error } = await sb.from("attendance_records")
      .upsert(records, { onConflict: "batch_name,date,roll_number,class_type" });
    $("#mSave").disabled = false;
    if (error) toast(error.message, true);
    else toast(`Saved ${records.length} marks ✓`);
  });
}

// ============================================================================
// TAB 2 — REPORTS (per batch)
// ============================================================================
async function renderReport() {
  const root = $("#tab-report");
  root.innerHTML = `<div class="card"><div class="row">
      <div class="field"><label>Batch</label><select id="rBatch"></select></div>
      <div class="field" id="rSlotWrap"><label>Slot</label><select id="rSlot"></select></div>
    </div></div>
    <div class="card" id="rBody"><div class="spinner">Pick a batch…</div></div>`;
  const batches = await getBatches();
  const bSel = $("#rBatch");
  if (!batches.length) { $("#rBody").innerHTML = `<div class="spinner">No batches yet.</div>`; return; }
  bSel.innerHTML = batches.map(b => `<option value="${esc(b.batch_name)}">${esc(b.batch_name)}</option>`).join("");
  const refreshSlots = () => {
    const b = batches.find(x => x.batch_name === bSel.value);
    $("#rSlotWrap").style.display = b.is_dual_slot ? "" : "none";
    $("#rSlot").innerHTML = slotsFor(b).map(s => `<option>${s}</option>`).join("");
  };
  const load = () => loadBatchReport(bSel.value, $("#rSlot").value);
  bSel.addEventListener("change", () => { refreshSlots(); load(); });
  $("#rSlot").addEventListener("change", load);
  refreshSlots(); load();
}

async function loadBatchReport(batch, slot) {
  const box = $("#rBody");
  box.innerHTML = `<div class="spinner">Crunching numbers…</div>`;
  const { data, error } = await sb.from("v_batch_attendance").select("*").eq("batch_name", batch).eq("slot", slot);
  if (error) { box.innerHTML = `<div class="spinner">${esc(error.message)}</div>`; return; }
  if (!data.length) { box.innerHTML = `<div class="spinner">No students enrolled here yet.</div>`; return; }
  data.sort((a, b) => (a.pct ?? -1) - (b.pct ?? -1)); // lowest attendance first (at-risk on top)
  const avg = Math.round(data.reduce((s, r) => s + (r.pct || 0), 0) / data.length);
  const atRisk = data.filter(r => (r.pct ?? 100) < 75).length;
  const rows = data.map((r, i) => {
    const p = r.pct;
    const pill = p == null ? `<span class="pill muted">no data</span>`
      : p < 75 ? `<span class="pill no">${p}%</span>`
      : p < 85 ? `<span class="pill warn">${p}%</span>`
      : `<span class="pill ok">${p}%</span>`;
    return `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td class="muted">${esc(r.roll_number)}</td>
      <td>${r.present}/${r.total}</td><td>${pill}${(p != null && p < 75) ? " ⚠️" : ""}</td></tr>`;
  }).join("");
  box.innerHTML = `<div class="row" style="margin-bottom:14px">
      <div class="stat"><div class="muted">Students</div><div class="big">${data.length}</div></div>
      <div class="stat"><div class="muted">Avg attendance</div><div class="big">${avg}%</div></div>
      <div class="stat"><div class="muted">Below 75%</div><div class="big">${atRisk}</div></div>
    </div>
    <table><thead><tr><th>#</th><th>Name</th><th>Roll no.</th><th>Present/Total</th><th>Attendance</th></tr></thead>
    <tbody>${rows}</tbody></table>`;
}

// ============================================================================
// TAB 3 — STUDENT LOOKUP (the "one place" profile)
// ============================================================================
async function renderStudent() {
  const root = $("#tab-student");
  root.innerHTML = `<div class="card"><div class="row">
      <div class="field" style="flex:1"><label>Search by name or roll number</label>
        <input type="text" id="sQ" placeholder="e.g. Supriya  or  GCT26315"></div>
      <button class="btn" id="sGo">Search</button>
    </div></div>
    <div id="sBody"></div>`;
  const go = () => searchStudents($("#sQ").value.trim());
  $("#sGo").addEventListener("click", go);
  $("#sQ").addEventListener("keydown", e => { if (e.key === "Enter") go(); });
}

async function searchStudents(q) {
  const box = $("#sBody");
  if (!q) { box.innerHTML = ""; return; }
  box.innerHTML = `<div class="card spinner">Searching…</div>`;
  let query = sb.from("v_student_overview").select("*").limit(25);
  query = /^GCT/i.test(q) ? query.ilike("roll_number", `%${q}%`) : query.ilike("name", `%${q}%`);
  const { data, error } = await query;
  if (error) { box.innerHTML = `<div class="card spinner">${esc(error.message)}</div>`; return; }
  if (!data.length) { box.innerHTML = `<div class="card spinner">No students matched “${esc(q)}”.</div>`; return; }
  box.innerHTML = data.map(s => {
    const att = s.att_total ? `${s.att_pct}% <span class="muted">(${s.att_present}/${s.att_total})</span>` : `<span class="muted">—</span>`;
    const tst = s.tests_taken ? `${s.avg_test_pct}% <span class="muted">(${s.tests_taken} tests)</span>` : `<span class="muted">—</span>`;
    return `<div class="card">
      <div class="row" style="justify-content:space-between">
        <div><b style="font-size:16px">${esc(s.name || "(no name)")}</b>
          <span class="pill muted">${esc(s.roll_number)}</span>
          ${s.current_level ? `<span class="pill muted">Level ${esc(s.current_level)}</span>` : ""}</div>
      </div>
      <div class="row" style="margin-top:12px">
        <div class="stat"><div class="muted">Attendance</div><div class="big">${att}</div></div>
        <div class="stat"><div class="muted">GC Buddy tests avg</div><div class="big">${tst}</div></div>
        <div class="stat"><div class="muted">GC Buddy usage events</div><div class="big">${s.usage_events || 0}</div></div>
        <div class="stat"><div class="muted">Last active</div><div class="big" style="font-size:15px">${s.last_used ? esc(String(s.last_used).slice(0,10)) : "—"}</div></div>
      </div>
      <div class="hint">GATE test marks will appear here once that data is connected (same roll number).</div>
    </div>`;
  }).join("");
}

// ============================================================================
// TAB 4 — BATCHES & STUDENTS (admin: create batch, enroll students)
// ============================================================================
async function renderAdmin() {
  const root = $("#tab-admin");
  root.innerHTML = `
    <div class="card">
      <h3 style="margin:0 0 10px">Create a batch</h3>
      <div class="row">
        <div class="field"><label>Batch code</label><input type="text" id="aCode" placeholder="A1_OCT_01" size="16"></div>
        <div class="field"><label>Year</label><input type="text" id="aYear" value="${new Date().getFullYear()}" size="6"></div>
        <div class="field"><label><input type="checkbox" id="aDual"> Dual slot (Morning + Evening)</label>
          <span class="hint">On for batches from A1_JUL_02 onward.</span></div>
        <button class="btn" id="aCreate">Create batch</button>
      </div>
      <div id="aParse" class="hint"></div>
    </div>
    <div class="card">
      <h3 style="margin:0 0 10px">Add students to a batch</h3>
      <div class="row">
        <div class="field"><label>Batch</label><select id="aBatch"></select></div>
        <div class="field" id="aSlotWrap"><label>Slot</label><select id="aSlot"></select></div>
      </div>
      <div class="field" style="margin-top:10px"><label>Paste student names or roll numbers (one per line)</label>
        <textarea id="aNames" placeholder="Supriya Pramanik&#10;GCT26316&#10;kavita"></textarea></div>
      <div class="row"><button class="btn ghost" id="aMatch">Match against roster</button></div>
      <div id="aPreview"></div>
    </div>
    <div class="card"><h3 style="margin:0 0 10px">Existing batches</h3><div id="aList"><div class="spinner">Loading…</div></div></div>`;

  // live parse preview
  $("#aCode").addEventListener("input", () => {
    const p = parseBatchCode($("#aCode").value);
    $("#aParse").innerHTML = p
      ? `→ level <b>${p.level}</b>, month <b>${p.monthName}</b> (${p.month}), batch #<b>${p.seq}</b> of that month`
      : ($("#aCode").value ? `<span class="match-no">Doesn't match &lt;LEVEL&gt;_&lt;MON&gt;_&lt;NN&gt; (e.g. A1_OCT_01)</span>` : "");
  });

  $("#aCreate").addEventListener("click", createBatch);
  $("#aMatch").addEventListener("click", matchStudents);

  await refreshBatchPickers();
  await loadBatchList();
}

async function refreshBatchPickers() {
  const batches = await getBatches();
  const sel = $("#aBatch");
  if (sel) {
    sel.innerHTML = batches.length ? batches.map(b => `<option value="${esc(b.batch_name)}" data-dual="${b.is_dual_slot}">${esc(b.batch_name)}</option>`).join("") : `<option value="">— none —</option>`;
    const refreshSlots = () => {
      const opt = sel.selectedOptions[0];
      const dual = opt?.dataset.dual === "true";
      $("#aSlotWrap").style.display = dual ? "" : "none";
      $("#aSlot").innerHTML = (dual ? ["Morning", "Evening"] : ["Single"]).map(s => `<option>${s}</option>`).join("");
    };
    sel.addEventListener("change", refreshSlots); refreshSlots();
  }
  return batches;
}

async function createBatch() {
  const p = parseBatchCode($("#aCode").value);
  if (!p) { toast("Enter a valid batch code like A1_OCT_01", true); return; }
  const year = parseInt($("#aYear").value, 10) || new Date().getFullYear();
  const { error } = await sb.from("batches").insert({
    batch_name: p.batch_name, level: p.level, start_month: p.month, start_year: year,
    seq: p.seq, is_dual_slot: $("#aDual").checked,
  });
  if (error) { toast(error.message.includes("duplicate") ? "That batch already exists." : error.message, true); return; }
  toast(`Batch ${p.batch_name} created ✓`);
  $("#aCode").value = ""; $("#aParse").innerHTML = "";
  await refreshBatchPickers(); await loadBatchList();
}

async function matchStudents() {
  const box = $("#aPreview");
  const lines = $("#aNames").value.split("\n").map(s => s.trim()).filter(Boolean);
  if (!lines.length) { box.innerHTML = ""; return; }
  box.innerHTML = `<div class="spinner">Matching…</div>`;

  const results = [];
  for (const line of lines) {
    const isRoll = /^GCT/i.test(line);
    let q = sb.from("approved_students").select("roll_number, name");
    q = isRoll ? q.ilike("roll_number", line) : q.ilike("name", line);
    const { data } = await q.limit(5);
    if (!data || data.length === 0) results.push({ input: line, status: "none" });
    else if (data.length === 1) results.push({ input: line, status: "ok", roll: data[0].roll_number, name: data[0].name });
    else results.push({ input: line, status: "dup", options: data });
  }

  const rows = results.map((r, i) => {
    if (r.status === "ok")
      return `<tr data-roll="${esc(r.roll)}" data-name="${esc(r.name)}"><td>${i+1}</td><td>${esc(r.input)}</td>
        <td class="match-ok">✓ ${esc(r.name)} · ${esc(r.roll)}</td></tr>`;
    if (r.status === "none")
      return `<tr><td>${i+1}</td><td>${esc(r.input)}</td><td class="match-no">✗ not found in roster</td></tr>`;
    const opts = r.options.map(o => `<option value="${esc(o.roll_number)}|${esc(o.name)}">${esc(o.name)} · ${esc(o.roll_number)}</option>`).join("");
    return `<tr data-dup="1"><td>${i+1}</td><td>${esc(r.input)}</td>
      <td class="match-dup">multiple — pick: <select class="dupSel">${opts}</select></td></tr>`;
  }).join("");

  const okCount = results.filter(r => r.status === "ok").length;
  box.innerHTML = `<div class="hint" style="margin-top:12px">${okCount} matched, ${results.filter(r=>r.status==="dup").length} need a choice, ${results.filter(r=>r.status==="none").length} not found.</div>
    <table><thead><tr><th>#</th><th>Input</th><th>Match</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="row" style="margin-top:12px"><button class="btn" id="aEnroll">Enroll matched students</button></div>`;
  $("#aEnroll").addEventListener("click", enrollMatched);
}

async function enrollMatched() {
  const batch = $("#aBatch").value;
  const slot = $("#aSlot").value || "Single";
  if (!batch) { toast("Pick a batch first.", true); return; }
  const rows = [...$("#aPreview").querySelectorAll("tbody tr")];
  const payload = [];
  for (const tr of rows) {
    if (tr.dataset.roll) payload.push({ batch_name: batch, roll_number: tr.dataset.roll, slot });
    else if (tr.dataset.dup) {
      const [roll] = tr.querySelector(".dupSel").value.split("|");
      payload.push({ batch_name: batch, roll_number: roll, slot });
    }
  }
  if (!payload.length) { toast("Nothing to enroll.", true); return; }
  const { error } = await sb.from("batch_enrollments").upsert(payload, { onConflict: "batch_name,roll_number,slot", ignoreDuplicates: true });
  if (error) { toast(error.message, true); return; }
  toast(`Enrolled ${payload.length} students into ${batch} · ${slot} ✓`);
  $("#aNames").value = ""; $("#aPreview").innerHTML = "";
  await loadBatchList();
}

async function loadBatchList() {
  const box = $("#aList");
  const { data: batches, error } = await sb.from("batches").select("*").order("start_year", { ascending: false }).order("start_month", { ascending: false }).order("seq");
  if (error) { box.innerHTML = `<div class="spinner">${esc(error.message)}</div>`; return; }
  if (!batches.length) { box.innerHTML = `<div class="spinner">No batches yet.</div>`; return; }
  const { data: counts } = await sb.from("batch_enrollments").select("batch_name, slot").eq("is_active", true);
  const byBatch = {};
  (counts || []).forEach(c => { (byBatch[c.batch_name] ??= {}); byBatch[c.batch_name][c.slot] = (byBatch[c.batch_name][c.slot] || 0) + 1; });
  const rows = batches.map(b => {
    const cts = byBatch[b.batch_name] || {};
    const total = Object.values(cts).reduce((a, c) => a + c, 0);
    const breakdown = b.is_dual_slot ? `M:${cts.Morning || 0} / E:${cts.Evening || 0}` : `${cts.Single || 0}`;
    return `<tr><td><b>${esc(b.batch_name)}</b></td><td>${esc(b.level)}</td>
      <td>${monthName(b.start_month)} ${b.start_year || ""}</td>
      <td>${b.is_dual_slot ? "Morning + Evening" : "Single"}</td>
      <td>${total} <span class="muted">(${breakdown})</span></td></tr>`;
  }).join("");
  box.innerHTML = `<table><thead><tr><th>Batch</th><th>Start level</th><th>Started</th><th>Slots</th><th>Enrolled</th></tr></thead><tbody>${rows}</tbody></table>`;
}

// ---------- boot ------------------------------------------------------------
renderMark();
