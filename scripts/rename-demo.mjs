// The demo build emits dist/demo/demo.html; rename it to index.html so the
// standalone demo resolves at /demo/ on Cloudflare Pages.
import { renameSync, existsSync } from 'fs'
const from = 'dist/demo/demo.html'
const to = 'dist/demo/index.html'
if (existsSync(from)) { renameSync(from, to); console.log('renamed', from, '->', to) }
else console.warn('demo build output not found at', from)
