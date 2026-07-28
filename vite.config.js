import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// VITE_* env vars are inlined at BUILD time from the Cloudflare Pages
// environment (Settings → Variables and Secrets → Production). A missing var
// there ships a broken bundle regardless of any local .env — see HANDOVER §3.1.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  }
})
