const express = require('express');
const router = express.Router();

// GET /api/courses/subjects/list - AVANT /:id pour éviter l'interception
router.get('/subjects/list', (req, res) => {
  const subjects = [
    { id: 'francais', name: 'Français', icon: '📝', color: '#4A90D9' },
    { id: 'anglais', name: 'Anglais', icon: '🇬🇧', color: '#E74C3C' },
    { id: 'maths', name: 'Mathématiques', icon: '🔢', color: '#2ECC71' },
    { id: 'techno', name: 'Techno & Robotique', icon: '🤖', color: '#FF6B35' },
    { id: 'sciences', name: 'Sciences', icon: '🔬', color: '#9B59B6' },
    { id: 'culture', name: 'Culture & Géopolitique', icon: '🌍', color: '#E67E22' },
    { id: 'arts', name: 'Arts Créatifs', icon: '🎨', color: '#E91E63' },
    { id: 'informatique', name: 'Informatique & Logique', icon: '💻', color: '#00BCD4' }
  ];
  res.json(subjects);
});

// GET /api/courses - Liste des cours par matière et niveau
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { subject, level } = req.query;

  let query = 'SELECT * FROM courses WHERE 1=1';
  const params = [];
  if (subject) { query += ' AND subject = ?'; params.push(subject); }
  if (level) { query += ' AND level = ?'; params.push(level); }
  query += ' ORDER BY order_index ASC';

  const courses = db.prepare(query).all(...params);

  // Ajouter la progression de l'utilisateur si connecté
  if (req.session.userId) {
    const progress = db.prepare(`
      SELECT course_id, status, score FROM user_progress
      WHERE user_id = ? AND course_id IS NOT NULL
    `).all(req.session.userId);

    const progressMap = {};
    progress.forEach(p => { progressMap[p.course_id] = p; });

    courses.forEach(c => {
      c.progress = progressMap[c.id] || { status: 'not_started', score: null };
      c.tags = JSON.parse(c.tags || '[]');
    });
  }

  res.json(courses);
});

// GET /api/courses/:id - Détail d'un cours
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!course) return res.status(404).json({ error: 'Cours non trouvé' });

  course.tags = JSON.parse(course.tags || '[]');

  // Marquer comme "en cours" si pas déjà fait
  if (req.session.userId) {
    const existing = db.prepare(
      'SELECT id FROM user_progress WHERE user_id = ? AND course_id = ?'
    ).get(req.session.userId, course.id);

    if (!existing) {
      db.prepare(
        'INSERT INTO user_progress (user_id, course_id, status) VALUES (?, ?, ?)'
      ).run(req.session.userId, course.id, 'in_progress');
    }
  }

  res.json(course);
});

module.exports = router;
