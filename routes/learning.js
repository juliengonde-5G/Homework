const express = require('express');
const router = express.Router();

function requireParentOrParentUser(req, res, next) {
  if (req.session.isParent) return next();
  // Autoriser aussi les utilisateurs avec role=parent
  if (req.session.userId) {
    const db = req.app.locals.db;
    const user = db.prepare("SELECT role FROM users WHERE id = ?").get(req.session.userId);
    if (user && user.role === 'parent') return next();
  }
  return res.status(403).json({ error: 'Accès requis' });
}

// GET /api/learning/paths - Liste des parcours
router.get('/paths', requireParentOrParentUser, (req, res) => {
  const db = req.app.locals.db;

  const paths = db.prepare('SELECT * FROM learning_paths ORDER BY id').all();

  const result = paths.map(p => {
    const lessons = db.prepare('SELECT id FROM audio_lessons WHERE path_id = ?').all(p.id);
    const completed = db.prepare(`
      SELECT COUNT(*) as count FROM learning_progress
      WHERE user_id = ? AND lesson_id IN (SELECT id FROM audio_lessons WHERE path_id = ?) AND status = 'completed'
    `).get(p.user_id, p.id);

    return {
      ...p,
      totalLessons: lessons.length,
      completedLessons: completed.count,
      progress: lessons.length > 0 ? Math.round(completed.count / lessons.length * 100) : 0
    };
  });

  res.json(result);
});

// GET /api/learning/path/:slug - Détail d'un parcours avec ses leçons
router.get('/path/:slug', requireParentOrParentUser, (req, res) => {
  const db = req.app.locals.db;
  const { slug } = req.params;

  const path = db.prepare('SELECT * FROM learning_paths WHERE slug = ?').get(slug);
  if (!path) return res.status(404).json({ error: 'Parcours non trouvé' });

  const lessons = db.prepare(`
    SELECT al.*, lp.status, lp.listened_count, lp.quiz_score, lp.notes, lp.completed_at
    FROM audio_lessons al
    LEFT JOIN learning_progress lp ON al.id = lp.lesson_id AND lp.user_id = ?
    WHERE al.path_id = ?
    ORDER BY al.order_index, al.module_number
  `).all(path.user_id, path.id);

  res.json({
    path,
    lessons: lessons.map(l => ({
      ...l,
      key_points: JSON.parse(l.key_points || '[]'),
      vocabulary: JSON.parse(l.vocabulary || '[]'),
      quiz_questions: JSON.parse(l.quiz_questions || '[]'),
      status: l.status || 'not_started'
    }))
  });
});

// POST /api/learning/lesson/:id/progress - Mettre à jour la progression
router.post('/lesson/:id/progress', requireParentOrParentUser, (req, res) => {
  const db = req.app.locals.db;
  const lessonId = req.params.id;
  const { status, quiz_score, notes } = req.body;

  const lesson = db.prepare('SELECT al.*, lp.user_id FROM audio_lessons al JOIN learning_paths lp ON al.path_id = lp.id WHERE al.id = ?').get(lessonId);
  if (!lesson) return res.status(404).json({ error: 'Leçon non trouvée' });

  db.prepare(`
    INSERT INTO learning_progress (user_id, lesson_id, status, listened_count, quiz_score, notes, completed_at)
    VALUES (?, ?, ?, 1, ?, ?, CASE WHEN ? = 'completed' THEN CURRENT_TIMESTAMP ELSE NULL END)
    ON CONFLICT(user_id, lesson_id) DO UPDATE SET
      status = excluded.status,
      listened_count = learning_progress.listened_count + 1,
      quiz_score = COALESCE(excluded.quiz_score, learning_progress.quiz_score),
      notes = COALESCE(excluded.notes, learning_progress.notes),
      completed_at = CASE WHEN excluded.status = 'completed' THEN CURRENT_TIMESTAMP ELSE learning_progress.completed_at END
  `).run(lesson.user_id, lessonId, status || 'in_progress', quiz_score || null, notes || null, status || 'in_progress');

  res.json({ ok: true });
});

module.exports = router;
