const express = require('express');
const router = express.Router();

function requireParent(req, res, next) {
  if (!req.session.isParent) return res.status(403).json({ error: 'Accès parent requis' });
  next();
}

// GET /api/parent/dashboard - Vue d'ensemble pour le parent
router.get('/dashboard', requireParent, (req, res) => {
  const db = req.app.locals.db;

  const children = db.prepare("SELECT id, name, avatar, age, classe, profile_type, is_dyslexic FROM users WHERE classe != 'Pro'").all();

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

    // Historique des humeurs (7 derniers jours)
    const recentMoods = db.prepare(`
      SELECT date, mood, energy, passion_today, want_to_learn
      FROM daily_mood
      WHERE user_id = ?
      ORDER BY date DESC LIMIT 7
    `).all(child.id);

    return {
      child,
      stats,
      recentSessions,
      lastSession,
      badges,
      recentExercises,
      recentMoods,
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

  const children = db.prepare("SELECT id, name FROM users WHERE classe != 'Pro'").all();
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

// GET /api/parent/family - Tous les membres de la famille avec anniversaires
router.get('/family', requireParent, (req, res) => {
  const db = req.app.locals.db;
  const members = db.prepare("SELECT id, name, avatar, age, classe, role, birthday FROM users ORDER BY role ASC, id ASC").all();
  res.json(members);
});

// PUT /api/parent/birthday/:userId - Mettre à jour l'anniversaire
router.put('/birthday/:userId', requireParent, (req, res) => {
  const db = req.app.locals.db;
  const { userId } = req.params;
  const { birthday } = req.body;
  db.prepare("UPDATE users SET birthday = ? WHERE id = ?").run(birthday, userId);
  res.json({ ok: true });
});

// GET /api/parent/birthdays - Prochains anniversaires (public pour banner login)
router.get('/birthdays', (req, res) => {
  const db = req.app.locals.db;
  const members = db.prepare("SELECT id, name, avatar, birthday FROM users WHERE birthday IS NOT NULL").all();

  const today = new Date();
  const results = members.map(m => {
    const [month, day] = m.birthday.split('-').slice(1).map(Number);
    const thisYear = new Date(today.getFullYear(), month - 1, day);
    let nextBirthday = thisYear;
    if (thisYear < today) {
      nextBirthday = new Date(today.getFullYear() + 1, month - 1, day);
    }
    const daysUntil = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
    return { ...m, daysUntil, nextBirthday: nextBirthday.toISOString().split('T')[0] };
  }).sort((a, b) => a.daysUntil - b.daysUntil);

  res.json(results);
});

// GET /api/parent/competencies/:userId - Suivi des compétences par matière
router.get('/competencies/:userId', requireParent, (req, res) => {
  const db = req.app.locals.db;
  const { userId } = req.params;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  // Stats par matière avec détail des tags/compétences
  const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').all(userId);

  // Cours complétés avec tags (= compétences)
  const completedCourses = db.prepare(`
    SELECT c.id, c.subject, c.title, c.level, c.difficulty, c.tags, c.order_index,
           up.status, up.completed_at, up.score
    FROM courses c
    LEFT JOIN user_progress up ON up.course_id = c.id AND up.user_id = ?
    WHERE c.level = ? OR c.level IS NULL
    ORDER BY c.subject, c.order_index
  `).all(userId, user.classe);

  // Exercices par tag (compétences granulaires)
  const exercisesByTag = db.prepare(`
    SELECT e.subject, e.tags, e.difficulty,
           up.score, up.status
    FROM exercises e
    LEFT JOIN user_progress up ON up.exercise_id = e.id AND up.user_id = ?
    WHERE e.level = ? OR e.level IS NULL
  `).all(userId, user.classe);

  // Calculer les compétences par matière et par tag
  const competencies = {};
  exercisesByTag.forEach(ex => {
    const tags = JSON.parse(ex.tags || '[]');
    if (!competencies[ex.subject]) competencies[ex.subject] = {};

    tags.forEach(tag => {
      if (!competencies[ex.subject][tag]) {
        competencies[ex.subject][tag] = { total: 0, done: 0, correct: 0 };
      }
      competencies[ex.subject][tag].total++;
      if (ex.status === 'completed') {
        competencies[ex.subject][tag].done++;
        if (ex.score === 100) competencies[ex.subject][tag].correct++;
      }
    });
  });

  // Organiser les cours par matière
  const coursesBySubject = {};
  completedCourses.forEach(c => {
    if (!coursesBySubject[c.subject]) coursesBySubject[c.subject] = [];
    coursesBySubject[c.subject].push({
      id: c.id,
      title: c.title,
      difficulty: c.difficulty,
      status: c.status || 'not_started',
      completedAt: c.completed_at,
      score: c.score,
      tags: JSON.parse(c.tags || '[]')
    });
  });

  res.json({
    child: { id: user.id, name: user.name, avatar: user.avatar, classe: user.classe },
    stats,
    competencies,
    coursesBySubject
  });
});

// GET /api/parent/course-history/:userId - Historique complet des parcours suivis
router.get('/course-history/:userId', requireParent, (req, res) => {
  const db = req.app.locals.db;
  const { userId } = req.params;

  // Tous les exercices faits avec détails
  const history = db.prepare(`
    SELECT e.subject, e.title, e.type, e.difficulty, e.tags,
           c.title as course_title,
           up.score, up.status, up.completed_at,
           up.attempts
    FROM user_progress up
    JOIN exercises e ON up.exercise_id = e.id
    LEFT JOIN courses c ON e.course_id = c.id
    WHERE up.user_id = ?
    ORDER BY up.completed_at DESC
    LIMIT 100
  `).all(userId);

  // Progression par semaine
  const weeklyProgress = db.prepare(`
    SELECT
      strftime('%Y-W%W', up.completed_at) as week,
      e.subject,
      COUNT(*) as exercises_done,
      SUM(CASE WHEN up.score = 100 THEN 1 ELSE 0 END) as correct
    FROM user_progress up
    JOIN exercises e ON up.exercise_id = e.id
    WHERE up.user_id = ? AND up.completed_at IS NOT NULL
    GROUP BY week, e.subject
    ORDER BY week DESC
    LIMIT 50
  `).all(userId);

  res.json({ history, weeklyProgress });
});

module.exports = router;
