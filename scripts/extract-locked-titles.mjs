// One-off helper: extract the first N locked item TITLES per level for the
// demo's gradient-blur rows (Curriculum, Daily Tests, Listening). Titles only —
// no lesson bodies, questions, answers or full phrases. Prints a JSON fragment
// to merge into src/demo/demoData.json.
import { readFileSync } from 'fs'
import { CURRICULUM } from '../src/lib/constants.js'
import { B1_TESTS } from '../src/lib/b1DailyTests.js'

const SHOW = 10          // rows rendered per level (matches BlurredRows maxShow)
const UNLOCKED_CURRIC = 2
const UNLOCKED_TESTS = 1
const UNLOCKED_LISTEN = 5

const out = { curriculum: {}, dailytests: {}, listening: {} }

// --- Curriculum: topics beyond the first 2 unlocked ---
for (const lv of ['A1', 'A2', 'B1', 'B2']) {
  const topics = CURRICULUM[lv] || []
  out.curriculum[lv] = topics.slice(UNLOCKED_CURRIC, UNLOCKED_CURRIC + SHOW).map(t => t.title)
}

// --- Daily tests: A1/A2 from DailyTestPage TESTS, B1 from B1_TESTS ---
const dtSrc = readFileSync(new URL('../src/pages/DailyTestPage.jsx', import.meta.url), 'utf8')
const testRe = /name:\s*"((?:[^"\\]|\\.)*)"[\s\S]*?level:\s*'(A1|A2|B1|B2)'/g
const byLevel = { A1: [], A2: [], B1: [], B2: [] }
let m
while ((m = testRe.exec(dtSrc)) !== null) {
  const name = m[1].replace(/\\"/g, '"')
  byLevel[m[2]].push(name)
}
byLevel.B1 = B1_TESTS.map(t => t.name)
for (const lv of ['A1', 'A2', 'B1']) {
  out.dailytests[lv] = byLevel[lv].slice(UNLOCKED_TESTS, UNLOCKED_TESTS + SHOW)
}

// --- Listening: phrases beyond the first 5 unlocked (the German line is the "name") ---
const lsSrc = readFileSync(new URL('../src/pages/ListeningPage.jsx', import.meta.url), 'utf8')
for (const lv of ['A1', 'A2', 'B1', 'B2']) {
  // isolate this level's array up to the next top-level "XX:[" or end of PH
  const start = lsSrc.indexOf(`${lv}:[`)
  const rest = lsSrc.slice(start)
  const deRe = /de:\s*"((?:[^"\\]|\\.)*)"/g
  const phrases = []
  let mm
  while ((mm = deRe.exec(rest)) !== null && phrases.length < UNLOCKED_LISTEN + SHOW) {
    phrases.push(mm[1].replace(/\\"/g, '"'))
  }
  out.listening[lv] = phrases.slice(UNLOCKED_LISTEN, UNLOCKED_LISTEN + SHOW)
}

// sanity counts
for (const lv of ['A1', 'A2', 'B1', 'B2']) {
  console.error(`curric ${lv}: ${out.curriculum[lv].length}, listen ${lv}: ${out.listening[lv].length}`)
}
for (const lv of ['A1', 'A2', 'B1']) console.error(`dailytest ${lv}: ${out.dailytests[lv].length}`)
console.log(JSON.stringify(out, null, 0))
