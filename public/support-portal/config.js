/* ============================================================
   GC Support Portal — runtime configuration
   Edit these values; no build step required.
   ============================================================ */
window.GC_CONFIG = {
  // true  = in-browser demo data (localStorage), works with NO backend.
  // false = talk to your live backend via the REST endpoints in api.js.
  useMockData: true,

  // Base URL of your backend API (no trailing slash).
  // e.g. "https://api.globalcareers.testbook.com"
  apiBaseUrl: "",

  // SLA target in days — grievances open longer than this are flagged "overdue".
  slaDays: 3
};
