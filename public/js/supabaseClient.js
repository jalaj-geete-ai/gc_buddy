import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// --- batch code helpers -----------------------------------------------------
const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

// Parse "<LEVEL>_<MON>_<NN>" e.g. A1_SEP_01 -> {level, month, seq}
export function parseBatchCode(code) {
  const raw = (code || "").trim().toUpperCase().replace(/\s+/g, "");
  const m = raw.match(/^([A-C][12])_([A-Z]{3})_(\d{1,2})$/);
  if (!m) return null;
  const monthIdx = MONTHS.indexOf(m[2]);
  if (monthIdx === -1) return null;
  return { batch_name: raw, level: m[1], month: monthIdx + 1, monthName: m[2], seq: parseInt(m[3], 10) };
}

export function monthName(n) { return MONTHS[n - 1] || ""; }
