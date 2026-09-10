// Cloudflare Pages is configured to publish a `dist/` directory, but this is a
// no-build static site whose files live in `public/`. So the "build" simply
// copies public/ -> dist/. (Local dev still serves public/ directly via serve.ps1.)
import { cpSync, rmSync, existsSync } from "node:fs";

if (existsSync("dist")) rmSync("dist", { recursive: true, force: true });
cpSync("public", "dist", { recursive: true });
console.log("Copied public/ -> dist/ for deployment.");
