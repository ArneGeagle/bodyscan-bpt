const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db/connection');
const { requireAuth } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  try {
    const [rows] = await db.query(
      'SELECT id, email, password_hash, role, first_name, last_name FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );
    if (!rows.length) return res.status(401).json({ error: 'Invalid credentials' });

    const user = rows[0];
    const ok   = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = {
      id:        user.id,
      email:     user.email,
      role:      user.role,
      firstName: user.first_name,
      lastName:  user.last_name,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

// POST /api/auth/register  (for future use / admin invite flow)
router.post('/register', async (req, res) => {
  const { email, password, role, firstName, lastName } = req.body;
  if (!email || !password || !role || !firstName || !lastName) {
    return res.status(400).json({ error: 'All fields required' });
  }
  if (!['client', 'coach'].includes(role)) {
    return res.status(400).json({ error: 'Role must be client or coach' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }
  try {
    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, role, first_name, last_name) VALUES (?,?,?,?,?)',
      [email.toLowerCase().trim(), hash, role, firstName, lastName]
    );
    const userId = result.insertId;

    if (role === 'coach') {
      await db.query('INSERT INTO coaches (user_id, specialty) VALUES (?,?)', [userId, '']);
    } else {
      await db.query('INSERT INTO clients (user_id, joined_at) VALUES (?, CURRENT_DATE)', [userId]);
      await db.query('INSERT INTO goals (client_id) VALUES (?)',
        [(await db.query('SELECT id FROM clients WHERE user_id=?', [userId]))[0][0].id]);
    }

    res.status(201).json({ message: 'User created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email already in use' });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
