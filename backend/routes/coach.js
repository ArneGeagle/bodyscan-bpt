const router = require('express').Router();
const db     = require('../db/connection');
const { requireAuth, requireRole } = require('../middleware/auth');

const guard = [requireAuth, requireRole('coach')];

async function getCoach(userId) {
  const [rows] = await db.query('SELECT id, specialty, is_head FROM coaches WHERE user_id = ?', [userId]);
  return rows[0];
}

// GET /api/coach/roster
router.get('/roster', ...guard, async (req, res) => {
  try {
    const coach = await getCoach(req.user.id);
    if (!coach) return res.status(404).json({ error: 'Coach profile not found' });

    const [clients] = await db.query(
      `SELECT cl.id, u.first_name, u.last_name, u.email, cl.joined_at,
              MAX(s.scan_date) AS last_scan,
              COUNT(s.id)      AS scan_count
       FROM client_coaches cc
       JOIN clients cl ON cc.client_id = cl.id
       JOIN users   u  ON cl.user_id   = u.id
       LEFT JOIN scans s ON s.client_id = cl.id
       WHERE cc.coach_id = ?
       GROUP BY cl.id, u.first_name, u.last_name, u.email, cl.joined_at
       ORDER BY u.last_name ASC`,
      [coach.id]
    );
    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/coach/clients/:clientId
router.get('/clients/:clientId', ...guard, async (req, res) => {
  try {
    const coach = await getCoach(req.user.id);
    const { clientId } = req.params;

    // Verify this coach has access to this client
    const [access] = await db.query(
      'SELECT 1 FROM client_coaches WHERE coach_id = ? AND client_id = ?',
      [coach.id, clientId]
    );
    if (!access.length) return res.status(403).json({ error: 'No access to this client' });

    const [clientRows] = await db.query(
      `SELECT cl.id, cl.height_cm, cl.date_of_birth, cl.joined_at,
              u.first_name, u.last_name, u.email
       FROM clients cl JOIN users u ON cl.user_id = u.id
       WHERE cl.id = ?`,
      [clientId]
    );
    if (!clientRows.length) return res.status(404).json({ error: 'Client not found' });

    const [scans] = await db.query(
      `SELECT s.id, s.scan_date, s.weight_kg, s.body_fat_pct, s.muscle_mass_kg,
              s.visceral_fat, s.water_pct, s.metabolic_age, s.notes,
              u.first_name AS coach_first, u.last_name AS coach_last, c.id AS coach_id
       FROM scans s
       JOIN coaches c ON s.coach_id = c.id
       JOIN users   u ON c.user_id  = u.id
       WHERE s.client_id = ?
       ORDER BY s.scan_date ASC`,
      [clientId]
    );

    const [coaches] = await db.query(
      `SELECT c.id, u.first_name, u.last_name, c.specialty, c.is_head, cc.since
       FROM client_coaches cc
       JOIN coaches c ON cc.coach_id = c.id
       JOIN users   u ON c.user_id   = u.id
       WHERE cc.client_id = ?
       ORDER BY c.is_head DESC`,
      [clientId]
    );

    const [goalRows] = await db.query('SELECT * FROM goals WHERE client_id = ?', [clientId]);

    res.json({ client: clientRows[0], scans, coaches, goals: goalRows[0] || {} });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/coach/scans
router.post('/scans', ...guard, async (req, res) => {
  try {
    const coach = await getCoach(req.user.id);
    const { clientId, scanDate, weightKg, bodyFatPct, muscleMassKg, visceralFat, waterPct, metabolicAge, notes } = req.body;

    if (!clientId || !scanDate || !weightKg || !bodyFatPct || !muscleMassKg || !visceralFat || !waterPct || !metabolicAge) {
      return res.status(400).json({ error: 'All measurement fields required' });
    }

    const [access] = await db.query(
      'SELECT 1 FROM client_coaches WHERE coach_id = ? AND client_id = ?',
      [coach.id, clientId]
    );
    if (!access.length) return res.status(403).json({ error: 'No access to this client' });

    await db.query(
      `INSERT INTO scans (client_id, coach_id, scan_date, weight_kg, body_fat_pct,
        muscle_mass_kg, visceral_fat, water_pct, metabolic_age, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [clientId, coach.id, scanDate, weightKg, bodyFatPct, muscleMassKg, visceralFat, waterPct, metabolicAge, notes || null]
    );
    res.status(201).json({ message: 'Scan saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/coach/notes  — add/update note on last scan
router.post('/notes', ...guard, async (req, res) => {
  try {
    const coach = await getCoach(req.user.id);
    const { clientId, note } = req.body;
    if (!clientId || !note) return res.status(400).json({ error: 'clientId and note required' });

    const [access] = await db.query(
      'SELECT 1 FROM client_coaches WHERE coach_id = ? AND client_id = ?',
      [coach.id, clientId]
    );
    if (!access.length) return res.status(403).json({ error: 'No access' });

    // Update the most recent scan's notes
    await db.query(
      `UPDATE scans SET notes = ?
       WHERE client_id = ? AND id = (SELECT id FROM (SELECT id FROM scans WHERE client_id = ? ORDER BY scan_date DESC LIMIT 1) t)`,
      [note, clientId, clientId]
    );

    // Also notify as message from coach to client
    const [clientRows] = await db.query('SELECT user_id FROM clients WHERE id = ?', [clientId]);
    const [coachRows]  = await db.query('SELECT user_id FROM coaches WHERE id = ?', [coach.id]);
    if (clientRows.length && coachRows.length) {
      await db.query(
        'INSERT INTO messages (sender_id, receiver_id, body) VALUES (?,?,?)',
        [coachRows[0].user_id, clientRows[0].user_id, note]
      );
    }
    res.json({ message: 'Note saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/coach/messages
router.get('/messages', ...guard, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT m.id, m.body, m.created_at, m.read_at,
              su.first_name AS sender_first, su.last_name AS sender_last, su.role AS sender_role,
              ru.first_name AS recv_first,   ru.last_name  AS recv_last
       FROM messages m
       JOIN users su ON m.sender_id   = su.id
       JOIN users ru ON m.receiver_id = ru.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [req.user.id, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/coach/invite  — invite a coach to a client (head coach only)
router.post('/invite', ...guard, async (req, res) => {
  try {
    const coach = await getCoach(req.user.id);
    if (!coach.is_head) return res.status(403).json({ error: 'Only the head coach can invite others' });

    const { clientId, coachEmail } = req.body;
    const [userRows] = await db.query(
      "SELECT u.id, c.id AS coach_id FROM users u JOIN coaches c ON c.user_id = u.id WHERE u.email = ? AND u.role = 'coach'",
      [coachEmail]
    );
    if (!userRows.length) return res.status(404).json({ error: 'Coach not found' });

    const invitedCoachId = userRows[0].coach_id;
    await db.query(
      'INSERT IGNORE INTO client_coaches (client_id, coach_id, since) VALUES (?, ?, CURRENT_DATE)',
      [clientId, invitedCoachId]
    );
    res.json({ message: 'Coach invited' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
