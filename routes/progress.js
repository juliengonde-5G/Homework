const express = require('express');
const router = express.Router();

// GET /api/progress/stats - Stats de l'utilisateur connecté
router.get('/stats', (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').all(userId);
  const badges = db.prepare(`
    SELECT b.* FROM badges b
    JOIN user_badges ub ON b.id = ub.badge_id
    WHERE ub.user_id = ?
    ORDER BY ub.earned_at DESC
  `).all(userId);

  const totalPoints = stats.reduce((sum, s) => sum + s.total_points, 0);
  const totalExercises = stats.reduce((sum, s) => sum + s.total_exercises, 0);
  const totalCorrect = stats.reduce((sum, s) => sum + s.correct_answers, 0);

  res.json({
    bySubject: stats,
    badges,
    totals: {
      points: totalPoints,
      exercises: totalExercises,
      correct: totalCorrect,
      successRate: totalExercises > 0 ? Math.round((totalCorrect / totalExercises) * 100) : 0
    }
  });
});

// GET /api/progress/badges - Tous les badges (gagnés et non gagnés)
router.get('/badges', (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const allBadges = db.prepare('SELECT * FROM badges').all();
  const earnedBadges = db.prepare('SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?').all(userId);
  const earnedMap = {};
  earnedBadges.forEach(b => { earnedMap[b.badge_id] = b.earned_at; });

  res.json(allBadges.map(b => ({
    ...b,
    earned: !!earnedMap[b.id],
    earnedAt: earnedMap[b.id] || null
  })));
});

module.exports = router;
