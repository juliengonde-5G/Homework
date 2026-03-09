const express = require('express');
const router = express.Router();

// GET /api/exercises - Exercices adaptés au niveau
router.get('/', (req, res) => {
  const db = req.app.locals.db;
  const { subject, level, difficulty, limit } = req.query;
  const userId = req.session.userId;

  let query = 'SELECT * FROM exercises WHERE 1=1';
  const params = [];
  if (subject) { query += ' AND subject = ?'; params.push(subject); }
  if (level) { query += ' AND level = ?'; params.push(level); }
  if (difficulty) { query += ' AND difficulty = ?'; params.push(parseInt(difficulty)); }
  query += ' ORDER BY RANDOM()';
  if (limit) { query += ' LIMIT ?'; params.push(parseInt(limit)); }

  const exercises = db.prepare(query).all(...params);

  // Enrichir avec la progression
  if (userId) {
    const progress = db.prepare(`
      SELECT exercise_id, status, score, attempts FROM user_progress
      WHERE user_id = ? AND exercise_id IS NOT NULL
    `).all(userId);
    const progressMap = {};
    progress.forEach(p => { progressMap[p.exercise_id] = p; });
    exercises.forEach(e => {
      e.progress = progressMap[e.id] || null;
      e.options = JSON.parse(e.options || '[]');
      e.tags = JSON.parse(e.tags || '[]');
    });
  } else {
    exercises.forEach(e => {
      e.options = JSON.parse(e.options || '[]');
      e.tags = JSON.parse(e.tags || '[]');
    });
  }

  res.json(exercises);
});

// GET /api/exercises/adaptive - Exercices adaptatifs basés sur le niveau détecté
router.get('/adaptive', (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  const { subject } = req.query;

  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const level = user.classe;

  // Récupérer les stats du user pour cette matière
  const stats = db.prepare(
    'SELECT * FROM user_stats WHERE user_id = ? AND subject = ?'
  ).get(userId, subject);

  // Calculer la difficulté adaptée
  let targetDifficulty = 1;
  if (stats && stats.total_exercises > 0) {
    const successRate = stats.correct_answers / stats.total_exercises;
    if (successRate > 0.8 && stats.total_exercises >= 5) targetDifficulty = Math.min(3, stats.current_level);
    else if (successRate > 0.6) targetDifficulty = Math.max(1, stats.current_level);
    else targetDifficulty = Math.max(1, stats.current_level - 1);
  }

  // Récupérer les exercices non faits ou échoués en priorité
  const exercises = db.prepare(`
    SELECT e.* FROM exercises e
    LEFT JOIN user_progress up ON e.id = up.exercise_id AND up.user_id = ?
    WHERE e.subject = ? AND e.level = ?
    AND e.difficulty <= ?
    AND (up.id IS NULL OR up.status != 'completed' OR up.score < 100)
    ORDER BY
      CASE WHEN up.id IS NULL THEN 0 ELSE 1 END,
      e.difficulty ASC,
      RANDOM()
    LIMIT 5
  `).all(userId, subject, level, targetDifficulty + 1);

  exercises.forEach(e => {
    e.options = JSON.parse(e.options || '[]');
    e.tags = JSON.parse(e.tags || '[]');
  });

  res.json({
    exercises,
    adaptiveInfo: {
      targetDifficulty,
      currentLevel: stats ? stats.current_level : 1,
      successRate: stats && stats.total_exercises > 0
        ? Math.round((stats.correct_answers / stats.total_exercises) * 100)
        : 0
    }
  });
});

// POST /api/exercises/:id/answer - Soumettre une réponse
router.post('/:id/answer', (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const exercise = db.prepare('SELECT * FROM exercises WHERE id = ?').get(req.params.id);
  if (!exercise) return res.status(404).json({ error: 'Exercice non trouvé' });

  const { answer } = req.body;
  const isCorrect = answer.toString().trim().toLowerCase() === exercise.correct_answer.trim().toLowerCase();
  const score = isCorrect ? 100 : 0;
  const points = isCorrect ? exercise.points : 0;

  // Enregistrer ou mettre à jour la progression
  const existing = db.prepare(
    'SELECT * FROM user_progress WHERE user_id = ? AND exercise_id = ?'
  ).get(userId, exercise.id);

  if (existing) {
    db.prepare(`
      UPDATE user_progress SET status = ?, score = ?, attempts = attempts + 1, completed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(isCorrect ? 'completed' : 'failed', score, existing.id);
  } else {
    db.prepare(`
      INSERT INTO user_progress (user_id, exercise_id, status, score, attempts, completed_at)
      VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
    `).run(userId, exercise.id, isCorrect ? 'completed' : 'failed', score);
  }

  // Mettre à jour les stats
  const stats = db.prepare(
    'SELECT * FROM user_stats WHERE user_id = ? AND subject = ?'
  ).get(userId, exercise.subject);

  if (stats) {
    const newStreak = isCorrect ? stats.current_streak + 1 : 0;
    const bestStreak = Math.max(stats.best_streak, newStreak);
    const newLevel = Math.max(1, Math.min(3,
      Math.floor((stats.correct_answers + (isCorrect ? 1 : 0)) / Math.max(1, stats.total_exercises + 1) * 3) + 1
    ));

    db.prepare(`
      UPDATE user_stats SET
        total_exercises = total_exercises + 1,
        correct_answers = correct_answers + ?,
        current_streak = ?,
        best_streak = ?,
        total_points = total_points + ?,
        current_level = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND subject = ?
    `).run(isCorrect ? 1 : 0, newStreak, bestStreak, points, newLevel, userId, exercise.subject);

    // Vérifier les badges
    checkBadges(db, userId, stats.total_exercises + 1, newStreak);
  }

  res.json({
    correct: isCorrect,
    correctAnswer: exercise.correct_answer,
    explanation: exercise.explanation,
    points,
    score
  });
});

function checkBadges(db, userId, totalExercises, streak) {
  const badges = db.prepare('SELECT * FROM badges').all();
  const earned = db.prepare('SELECT badge_id FROM user_badges WHERE user_id = ?').all(userId);
  const earnedIds = new Set(earned.map(b => b.badge_id));

  const newBadges = [];
  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue;
    let earned = false;
    if (badge.condition_type === 'exercises_completed' && totalExercises >= badge.condition_value) earned = true;
    if (badge.condition_type === 'streak' && streak >= badge.condition_value) earned = true;
    if (earned) {
      db.prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(userId, badge.id);
      newBadges.push(badge);
    }
  }
  return newBadges;
}

module.exports = router;
