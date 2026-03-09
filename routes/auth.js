const express = require('express');
const router = express.Router();

// GET /api/auth/users - Liste des profils enfants
router.get('/users', (req, res) => {
  const db = req.app.locals.db;
  const users = db.prepare('SELECT id, name, avatar, age, classe, profile_type, theme, is_dyslexic, interests FROM users').all();
  res.json(users.map(u => ({ ...u, interests: JSON.parse(u.interests || '[]') })));
});

// POST /api/auth/login - Connexion enfant
router.post('/login', (req, res) => {
  const db = req.app.locals.db;
  const { userId } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  // Vérifier le temps restant aujourd'hui
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = db.prepare(`
    SELECT COALESCE(SUM(duration_minutes), 0) as total
    FROM sessions_log
    WHERE user_id = ? AND DATE(started_at) = ?
  `).get(userId, today);

  const remainingMinutes = Math.max(0, user.daily_limit_minutes - todaySessions.total);

  // Créer une nouvelle session
  const sessionResult = db.prepare(`
    INSERT INTO sessions_log (user_id) VALUES (?)
  `).run(userId);

  req.session.userId = userId;
  req.session.sessionLogId = sessionResult.lastInsertRowid;
  req.session.loginTime = Date.now();

  res.json({
    user: { ...user, interests: JSON.parse(user.interests || '[]') },
    remainingMinutes,
    sessionLogId: sessionResult.lastInsertRowid
  });
});

// POST /api/auth/logout - Déconnexion
router.post('/logout', (req, res) => {
  const db = req.app.locals.db;
  if (req.session.sessionLogId && req.session.loginTime) {
    const duration = Math.round((Date.now() - req.session.loginTime) / 60000);
    db.prepare(`
      UPDATE sessions_log SET ended_at = CURRENT_TIMESTAMP, duration_minutes = ? WHERE id = ?
    `).run(duration, req.session.sessionLogId);
  }
  req.session.destroy();
  res.json({ ok: true });
});

// POST /api/auth/heartbeat - Mise à jour du temps de session
router.post('/heartbeat', (req, res) => {
  const db = req.app.locals.db;
  if (!req.session.userId) return res.status(401).json({ error: 'Non connecté' });

  const user = db.prepare('SELECT daily_limit_minutes FROM users WHERE id = ?').get(req.session.userId);
  const today = new Date().toISOString().split('T')[0];

  // Mettre à jour durée session courante
  if (req.session.sessionLogId && req.session.loginTime) {
    const duration = Math.round((Date.now() - req.session.loginTime) / 60000);
    db.prepare('UPDATE sessions_log SET duration_minutes = ? WHERE id = ?').run(duration, req.session.sessionLogId);
  }

  const todaySessions = db.prepare(`
    SELECT COALESCE(SUM(duration_minutes), 0) as total
    FROM sessions_log
    WHERE user_id = ? AND DATE(started_at) = ?
  `).get(req.session.userId, today);

  const remainingMinutes = Math.max(0, user.daily_limit_minutes - todaySessions.total);
  res.json({ remainingMinutes });
});

// POST /api/auth/parent-login - Connexion parent
router.post('/parent-login', (req, res) => {
  const { password } = req.body;
  if (password === (process.env.PARENT_PASSWORD || 'papa2024')) {
    req.session.isParent = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Mot de passe incorrect' });
  }
});

module.exports = router;
