require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express     = require('express');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');
const path        = require('path');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json());

// Rate limit: 100 req / 15 min per IP
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

// Tighter limit on login endpoint
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
}));

// ── API routes ─────────────────────────────────────────────
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/client', require('./routes/client'));
app.use('/api/coach',  require('./routes/coach'));

// ── Serve frontend ─────────────────────────────────────────
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));
// SPA fallback — all non-API routes serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// ── Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`kelp backend running on port ${PORT}`);
});
