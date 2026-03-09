const express = require('express');
const router = express.Router();

// GET /api/daily-mood - Récupérer le mood du jour
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const today = new Date().toISOString().split('T')[0];
  const mood = db.prepare('SELECT * FROM daily_mood WHERE user_id = ? AND date = ?').get(userId, today);

  res.json({ mood: mood || null, filled: !!mood });
});

// POST /api/daily-mood - Enregistrer le mood du jour
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const today = new Date().toISOString().split('T')[0];
  const { mood, energy, passion_today, want_to_learn, custom_note } = req.body;

  db.prepare(`
    INSERT INTO daily_mood (user_id, date, mood, energy, passion_today, want_to_learn, custom_note)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
      mood = excluded.mood,
      energy = excluded.energy,
      passion_today = excluded.passion_today,
      want_to_learn = excluded.want_to_learn,
      custom_note = excluded.custom_note
  `).run(userId, today, mood || null, energy || null, passion_today || null, want_to_learn || null, custom_note || null);

  res.json({ ok: true });
});

// GET /api/daily-mood/history - Historique des moods (pour le dashboard parent)
router.get('/history/:userId', (req, res) => {
  const db = req.app.locals.db;
  if (!req.session.isParent) return res.status(403).json({ error: 'Accès parent requis' });

  const history = db.prepare(`
    SELECT * FROM daily_mood
    WHERE user_id = ?
    ORDER BY date DESC LIMIT 30
  `).all(req.params.userId);

  res.json(history);
});

module.exports = router;
