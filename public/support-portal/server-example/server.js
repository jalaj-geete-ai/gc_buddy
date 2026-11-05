/* Reference backend for the GC Support Portal — framework-agnostic contract.
   Replace the in-memory Map with your database, wire /students/:roll to GC Buddy,
   and implement real admin auth (JWT). Run: npm install && npm start  (port 4000). */
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const grievances = new Map(); // id -> grievance

// --- Grievances ---
app.get('/grievances', (req, res) => res.json([...grievances.values()]));
app.get('/grievances/:id', (req, res) => grievances.has(req.params.id) ? res.json(grievances.get(req.params.id)) : res.status(404).end());
app.post('/grievances', (req, res) => { const g = req.body; grievances.set(g.id, g); res.json(g); });
app.put('/grievances/:id', (req, res) => { grievances.set(req.params.id, req.body); res.json(req.body); });

// --- Student lookup (INTEGRATION POINT 1: call GC Buddy here) ---
app.get('/students/:roll', async (req, res) => {
  // const student = await gcBuddy.getByRoll(req.params.roll);
  // return student ? res.json(student) : res.status(404).end();
  res.status(404).end(); // not found by default until wired
});

// --- Admin auth (INTEGRATION POINT 2: verify + issue a JWT) ---
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === 'admin' && password === 'gc@admin') {
    return res.json({ token: 'demo-token', admin: { name: 'Global Careers Admin', role: 'Administrator', dept: 'All', superadmin: true } });
  }
  res.status(401).json({ error: 'invalid credentials' });
});

app.listen(4000, () => console.log('GC Support Portal API on http://localhost:4000'));
