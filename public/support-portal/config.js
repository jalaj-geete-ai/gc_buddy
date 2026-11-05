/* ============================================================
   GC Support Portal — runtime configuration
   Edit these values; no build step required.
   ============================================================ */
window.GC_CONFIG = {
  // true  = in-browser demo data (localStorage), isolated per browser.
  // false = shared Supabase backend (student submissions reach the admin
  //         across browsers/devices). This is the live mode.
  useMockData: false,

  // ---- Supabase (shared backend) --------------------------------------
  // Used when useMockData = false. The anon key is PUBLIC by design and is
  // protected by Row-Level Security on the server — safe to ship in the browser.
  supabaseUrl: "https://uxdrldreaockdloqvojs.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4ZHJsZHJlYW9ja2Rsb3F2b2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MzE2MjIsImV4cCI6MjA4OTQwNzYyMn0.swqYBfGzHP5qSDPnZ_AivFE0zljyK33Kq-_ephz4Ybc",

  // Optional generic REST base URL (unused when Supabase is configured).
  apiBaseUrl: "",

  // SLA target in days — grievances open longer than this are flagged "overdue".
  slaDays: 3
};
