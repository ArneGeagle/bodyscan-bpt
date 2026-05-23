const router = require('express').Router();
const db     = require('../db/connection');
const { requireAuth, requireRole } = require('../middleware/auth');

const guard = [requireAuth, requireRole('client')];

// Helper: get client row for logged-in user
async function getClient(userId) {
  const [rows] = await db.query('SELECT id, height_cm, date_of_birth, head_coach_id, joined_at FROM clients WHERE user_id = ?', [userId]);
  return rows[0];
}

// GET /api/client/dashboard
router.get('/dashboard', ...guard, async (req, res) => {
  try {
    const client = await getClient(req.user.id);
    if (!client) return res.status(404).json({ error: 'Client profile not found' });

    const [scans] = await db.query(
      `SELECT s.id, s.scan_date, s.weight_kg, s.body_fat_pct, s.muscle_mass_kg,
              s.visceral_fat, s.water_pct, s.metabolic_age, s.notes,
              u.first_name AS coach_first, u.last_name AS coach_last,
              c.id AS coach_id
       FROM scans s
       JOIN coaches c ON s.coach_id = c.id
       JOIN users  u ON c.user_id  = u.id
       WHERE s.client_id = ?
       ORDER BY s.scan_date ASC`,
      [client.id]
    );

    const [coaches] = await db.query(
      `SELECT c.id, u.first_name, u.last_name, c.specialty, c.is_head,
              cc.since, u.email
       FROM client_coaches cc
       JOIN coaches c ON cc.coach_id = c.id
       JOIN users   u ON c.user_id   = u.id
       WHERE cc.client_id = ?
       ORDER BY c.is_head DESC, cc.since ASC`,
      [client.id]
    );

    const [goalRows] = await db.query('SELECT * FROM goals WHERE client_id = ?', [client.id]);
    const goals = goalRows[0] || {};

    res.json({ client, scans, coaches, goals });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/client/scans
router.get('/scans', ...guard, async (req, res) => {
  try {
    const client = await getClient(req.user.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });

    const [scans] = await db.query(
      `SELECT s.*, u.first_name AS coach_first, u.last_name AS coach_last
       FROM scans s
       JOIN coaches c ON s.coach_id = c.id
       JOIN users   u ON c.user_id  = u.id
       WHERE s.client_id = ?
       ORDER BY s.scan_date ASC`,
      [client.id]
    );
    res.json(scans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/client/goals
router.get('/goals', ...guard, async (req, res) => {
  try {
    const client = await getClient(req.user.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const [rows] = await db.query('SELECT * FROM goals WHERE client_id = ?', [client.id]);
    res.json(rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
