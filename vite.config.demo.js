import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Standalone build for the public demo page (demo.html → src/demo/*).
// Output goes to dist/demo/ so Cloudflare Pages serves it at /demo alongside
// the main app. publicDir is disabled so we don't duplicate the ~31 MB of audio
// into dist/demo — the demo references /audio and /mascot*.png from the site root
// (produced by the main build). A post-build step renames demo.html → index.html
// (see scripts/rename-demo.mjs) so /demo/ resolves.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  publicDir: false,
  build: {
    outDir: 'dist/demo',
    emptyOutDir: true,
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: { input: resolve(process.cwd(), 'demo.html') },
  },
})
