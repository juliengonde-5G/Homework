const express = require('express');
const router = express.Router();

function requireParent(req, res, next) {
  if (!req.session.isParent) return res.status(403).json({ error: 'Accès parent requis' });
  next();
}

// GET /api/parent/dashboard - Vue d'ensemble pour le parent
router.get('/dashboard', requireParent, (req, res) => {
  const db = req.app.locals.db;

  const children = db.prepare('SELECT id, name, avatar, age, classe, profile_type, is_dyslexic FROM users').all();

  const dashboard = children.map(child => {
    // Stats par matière
    const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').all(child.id);

    // Sessions récentes (7 derniers jours)
    const recentSessions = db.prepare(`
      SELECT DATE(started_at) as date, SUM(duration_minutes) as total_minutes, COUNT(*) as session_count
      FROM sessions_log
      WHERE user_id = ? AND started_at >= DATE('now', '-7 days')
      GROUP BY DATE(started_at)
      ORDER BY date DESC
    `).all(child.id);

    // Dernière connexion
    const lastSession = db.prepare(`
      SELECT started_at, duration_minutes FROM sessions_log
      WHERE user_id = ? ORDER BY started_at DESC LIMIT 1
    `).get(child.id);

    // Badges gagnés
    const badges = db.prepare(`
      SELECT b.name, b.icon, ub.earned_at FROM badges b
      JOIN user_badges ub ON b.id = ub.badge_id
      WHERE ub.user_id = ?
      ORDER BY ub.earned_at DESC LIMIT 5
    `).all(child.id);

    // Exercices récents
    const recentExercises = db.prepare(`
      SELECT e.subject, e.title, e.difficulty, up.score, up.status, up.completed_at
      FROM user_progress up
      JOIN exercises e ON up.exercise_id = e.id
      WHERE up.user_id = ? AND up.exercise_id IS NOT NULL
      ORDER BY up.completed_at DESC LIMIT 10
    `).all(child.id);

    // Points forts et faibles
    const strengths = [];
    const weaknesses = [];
    stats.forEach(s => {
      if (s.total_exercises >= 3) {
        const rate = s.correct_answers / s.total_exercises;
        if (rate >= 0.7) strengths.push(s.subject);
        else if (rate < 0.5) weaknesses.push(s.subject);
      }
    });

    return {
      child,
      stats,
      recentSessions,
      lastSession,
      badges,
      recentExercises,
      strengths,
      weaknesses,
      totalPoints: stats.reduce((sum, s) => sum + s.total_points, 0)
    };
  });

  res.json(dashboard);
});

// GET /api/parent/chat-history/:userId - Historique du chat d'un enfant
router.get('/chat-history/:userId', requireParent, (req, res) => {
  const db = req.app.locals.db;
  const { userId } = req.params;
  const { days } = req.query;

  let query = `
    SELECT role, content, subject, created_at FROM chat_history
    WHERE user_id = ?
  `;
  const params = [userId];

  if (days) {
    query += ` AND created_at >= DATE('now', '-' || ? || ' days')`;
    params.push(days);
  }

  query += ' ORDER BY created_at DESC LIMIT 100';

  const history = db.prepare(query).all(...params).reverse();
  res.json(history);
});

// GET /api/parent/weekly-report - Rapport hebdomadaire
router.get('/weekly-report', requireParent, (req, res) => {
  const db = req.app.locals.db;

  const children = db.prepare('SELECT id, name FROM users').all();
  const report = children.map(child => {
    const weekStats = db.prepare(`
      SELECT
        COUNT(DISTINCT DATE(up.completed_at)) as active_days,
        COUNT(up.id) as exercises_done,
        SUM(CASE WHEN up.score = 100 THEN 1 ELSE 0 END) as correct,
        GROUP_CONCAT(DISTINCT e.subject) as subjects_practiced
      FROM user_progress up
      JOIN exercises e ON up.exercise_id = e.id
      WHERE up.user_id = ? AND up.completed_at >= DATE('now', '-7 days')
    `).get(child.id);

    const totalTime = db.prepare(`
      SELECT COALESCE(SUM(duration_minutes), 0) as total
      FROM sessions_log
      WHERE user_id = ? AND started_at >= DATE('now', '-7 days')
    `).get(child.id);

    return {
      name: child.name,
      ...weekStats,
      totalMinutes: totalTime.total,
      subjects_practiced: weekStats.subjects_practiced ? weekStats.subjects_practiced.split(',') : []
    };
  });

  res.json(report);
});

module.exports = router;
