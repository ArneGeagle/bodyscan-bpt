// Run with: node scripts/seed.js
// Populates the DB with the demo accounts from the design.
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

async function seed() {
  const db = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     process.env.DB_PORT     || 3306,
    database: process.env.DB_NAME     || 'kelp',
    user:     process.env.DB_USER     || 'kelp',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  console.log('Connected to DB. Seeding…');

  const hash = async (pw) => bcrypt.hash(pw, 12);

  // ── Users ───────────────────────────────────────────────
  const users = [
    { email: 'marcus@studio.fit', pw: 'demo123', role: 'coach', first: 'Marcus', last: 'Bell' },
    { email: 'sofia@studio.fit',  pw: 'demo123', role: 'coach', first: 'Sofia',  last: 'Ruiz' },
    { email: 'tom@studio.fit',    pw: 'demo123', role: 'coach', first: 'Tom',    last: 'Achterberg' },
    { email: 'emma@hey.com',      pw: 'demo123', role: 'client',first: 'Emma',   last: 'Larsen' },
  ];

  const userIds = {};
  for (const u of users) {
    const [r] = await db.query(
      'INSERT IGNORE INTO users (email, password_hash, role, first_name, last_name) VALUES (?,?,?,?,?)',
      [u.email, await hash(u.pw), u.role, u.first, u.last]
    );
    if (r.insertId) {
      userIds[u.email] = r.insertId;
    } else {
      const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [u.email]);
      userIds[u.email] = existing[0].id;
    }
    console.log(`  user ${u.email} → id ${userIds[u.email]}`);
  }

  // ── Coaches ─────────────────────────────────────────────
  const coachDefs = [
    { email: 'marcus@studio.fit', specialty: 'Head coach · Strength', isHead: true },
    { email: 'sofia@studio.fit',  specialty: 'Nutrition',              isHead: false },
    { email: 'tom@studio.fit',    specialty: 'Mobility',               isHead: false },
  ];
  const coachIds = {};
  for (const c of coachDefs) {
    const uid = userIds[c.email];
    const [r] = await db.query(
      'INSERT IGNORE INTO coaches (user_id, specialty, is_head) VALUES (?,?,?)',
      [uid, c.specialty, c.isHead]
    );
    if (r.insertId) {
      coachIds[c.email] = r.insertId;
    } else {
      const [existing] = await db.query('SELECT id FROM coaches WHERE user_id = ?', [uid]);
      coachIds[c.email] = existing[0].id;
    }
    console.log(`  coach ${c.email} → id ${coachIds[c.email]}`);
  }

  // ── Client: Emma ─────────────────────────────────────────
  const emmaUserId = userIds['emma@hey.com'];
  const marcusCoachId = coachIds['marcus@studio.fit'];

  let [clientRows] = await db.query('SELECT id FROM clients WHERE user_id = ?', [emmaUserId]);
  let emmaClientId;
  if (!clientRows.length) {
    const [r] = await db.query(
      "INSERT INTO clients (user_id, height_cm, date_of_birth, head_coach_id, joined_at) VALUES (?,168,'1993-07-14',?,?)",
      [emmaUserId, marcusCoachId, '2025-11-04']
    );
    emmaClientId = r.insertId;
  } else {
    emmaClientId = clientRows[0].id;
  }
  console.log(`  client Emma → id ${emmaClientId}`);

  // ── Goals ─────────────────────────────────────────────────
  await db.query(
    'INSERT IGNORE INTO goals (client_id, weight_kg, body_fat_pct, muscle_mass_kg, water_pct) VALUES (?,64,22,27,55)',
    [emmaClientId]
  );

  // ── client_coaches links ─────────────────────────────────
  for (const [email, since] of [
    ['marcus@studio.fit', '2025-11-04'],
    ['sofia@studio.fit',  '2026-01-12'],
    ['tom@studio.fit',    '2026-02-28'],
  ]) {
    await db.query(
      'INSERT IGNORE INTO client_coaches (client_id, coach_id, since) VALUES (?,?,?)',
      [emmaClientId, coachIds[email], since]
    );
  }

  // ── Scans ──────────────────────────────────────────────────
  const today = new Date('2026-05-18');
  const daysAgo = (d) => {
    const x = new Date(today);
    x.setDate(x.getDate() - d);
    return x.toISOString().slice(0, 10);
  };

  const scanData = [
    { days: 168, wt: 71.4, bf: 31.2, mm: 24.1, vf: 7, wp: 49.8, ma: 36, coach: 'marcus@studio.fit',
      notes: "Baseline scan after intake. Strong frame, good resting HR. We'll start with 3× lifts + 2× mobility per week." },
    { days: 140, wt: 70.6, bf: 30.1, mm: 24.4, vf: 6, wp: 50.3, ma: 35, coach: 'marcus@studio.fit',
      notes: "Two weeks in and sleeping better. Bumped protein target to 110g — Sofia will follow up on this." },
    { days: 98,  wt: 69.2, bf: 28.4, mm: 25.0, vf: 6, wp: 51.4, ma: 33, coach: 'sofia@studio.fit',
      notes: "Body fat trending the right way without losing muscle. Great consistency. Hold the current calorie target for another block." },
    { days: 56,  wt: 67.8, bf: 26.1, mm: 25.7, vf: 5, wp: 52.6, ma: 31, coach: 'marcus@studio.fit',
      notes: "Visceral fat dropped a full point. Squat 1RM up ~8kg from baseline. Mobility is the limiter — Tom to take the wheel next block." },
    { days: 14,  wt: 66.5, bf: 24.8, mm: 26.3, vf: 5, wp: 53.4, ma: 30, coach: 'tom@studio.fit',
      notes: "Hip internal rotation finally past 30°. We can deload one strength session and add a Pilates-style core circuit." },
  ];

  for (const s of scanData) {
    const coachId = coachIds[s.coach];
    const date    = daysAgo(s.days);
    await db.query(
      `INSERT IGNORE INTO scans (client_id, coach_id, scan_date, weight_kg, body_fat_pct,
        muscle_mass_kg, visceral_fat, water_pct, metabolic_age, notes)
       SELECT ?,?,?,?,?,?,?,?,?,?
       WHERE NOT EXISTS (SELECT 1 FROM scans WHERE client_id=? AND scan_date=?)`,
      [emmaClientId, coachId, date, s.wt, s.bf, s.mm, s.vf, s.wp, s.ma, s.notes,
       emmaClientId, date]
    );
    console.log(`  scan ${date} (${s.wt}kg)`);
  }

  // ── Demo messages ─────────────────────────────────────────
  const emmaUsId  = userIds['emma@hey.com'];
  const marcusUsId = userIds['marcus@studio.fit'];
  const sofiaUsId  = userIds['sofia@studio.fit'];

  const msgs = [
    { from: emmaUsId,   to: marcusUsId, body: "Hip mobility felt amazing this morning — Tom's sequence is working." },
    { from: sofiaUsId,  to: marcusUsId, body: "Bumped Emma's protein target to 110g/day — can you confirm with her at the next session?" },
  ];
  for (const m of msgs) {
    await db.query(
      'INSERT IGNORE INTO messages (sender_id, receiver_id, body) SELECT ?,?,? WHERE NOT EXISTS (SELECT 1 FROM messages WHERE sender_id=? AND receiver_id=? AND body=?)',
      [m.from, m.to, m.body, m.from, m.to, m.body]
    );
  }

  console.log('\n✓ Seed complete. Demo accounts:');
  console.log('  emma@hey.com       / demo123  (client)');
  console.log('  marcus@studio.fit  / demo123  (coach)');
  console.log('  sofia@studio.fit   / demo123  (coach)');
  console.log('  tom@studio.fit     / demo123  (coach)');

  await db.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
