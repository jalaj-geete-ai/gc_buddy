// Builds the Piper job list for scripts/generate-audio.sh, or verifies that
// every phrase and word has a matching clip.
//
//   node scripts/audio-jobs.mjs <repoRoot>            -> JSONL on stdout
//   node scripts/audio-jobs.mjs <repoRoot> --verify   -> coverage report
//
// Phrases are read straight out of ListeningPage.jsx (the PH object is the
// single source of truth and is not exported), words out of public/vocab.json.

import fs from 'fs'
import path from 'path'

const root = process.argv[2] || '.'
const verify = process.argv.includes('--verify')

function phrases() {
  const src = fs.readFileSync(path.join(root, 'src/pages/ListeningPage.jsx'), 'utf8')
  const start = src.indexOf('const PH = {')
  const end = src.indexOf('\nexport default function')
  if (start < 0 || end < 0) throw new Error('Could not locate the PH object in ListeningPage.jsx')
  const body = src.slice(start, end).replace(/^const PH = /, '')
  const PH = eval('(' + body.slice(0, body.lastIndexOf('}') + 1) + ')')
  const out = []
  for (const [lvl, arr] of Object.entries(PH)) {
    arr.forEach((p, i) => out.push({ id: `ph/${lvl}-${i}`, text: p.de }))
  }
  return out
}

function words() {
  const bank = JSON.parse(fs.readFileSync(path.join(root, 'public/vocab.json'), 'utf8'))
  return bank.days.flatMap(d => d.w.map(w => ({ id: `w/${w.i}`, text: w.de })))
}

const jobs = [...phrases(), ...words()]

if (verify) {
  const missing = jobs.filter(j => !fs.existsSync(path.join(root, 'public/audio', j.id + '.mp3')))
  const onDisk = fs.existsSync(path.join(root, 'public/audio'))
    ? fs.readdirSync(path.join(root, 'public/audio'), { recursive: true }).filter(f => String(f).endsWith('.mp3')).length
    : 0
  console.log(`expected ${jobs.length} clips, found ${onDisk} on disk, ${missing.length} missing`)
  if (missing.length) console.log('missing:', missing.slice(0, 10).map(m => m.id).join(', '), missing.length > 10 ? '…' : '')
  process.exit(missing.length ? 1 : 0)
}

const outDir = path.join(process.env.TMPDIR || '/tmp', 'gcbuddy-tts', 'wav')
process.stdout.on('error', e => { if (e.code === 'EPIPE') process.exit(0); throw e })
for (const j of jobs) {
  process.stdout.write(JSON.stringify({ text: j.text, output_file: path.join(outDir, j.id + '.wav') }) + '\n')
}
