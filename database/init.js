const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

function initDatabase() {
  const db = new Database(path.join(__dirname, '..', 'homework.db'));

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Création des tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      avatar TEXT DEFAULT '🎓',
      age INTEGER NOT NULL,
      classe TEXT NOT NULL,
      profile_type TEXT DEFAULT 'standard',
      theme TEXT DEFAULT 'default',
      is_dyslexic INTEGER DEFAULT 0,
      interests TEXT DEFAULT '[]',
      daily_limit_minutes INTEGER DEFAULT 45,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      duration_minutes INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      level TEXT NOT NULL,
      difficulty INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER,
      subject TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT,
      correct_answer TEXT NOT NULL,
      explanation TEXT,
      level TEXT NOT NULL,
      difficulty INTEGER DEFAULT 1,
      points INTEGER DEFAULT 10,
      tags TEXT DEFAULT '[]',
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER,
      exercise_id INTEGER,
      status TEXT DEFAULT 'not_started',
      score INTEGER,
      attempts INTEGER DEFAULT 0,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (exercise_id) REFERENCES exercises(id)
    );

    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      subject TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      condition_type TEXT NOT NULL,
      condition_value INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_id INTEGER NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (badge_id) REFERENCES badges(id)
    );

    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      total_exercises INTEGER DEFAULT 0,
      correct_answers INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      total_points INTEGER DEFAULT 0,
      current_level INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, subject)
    );

    CREATE TABLE IF NOT EXISTS skill_assessment (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      skill TEXT NOT NULL,
      mastery_level REAL DEFAULT 0.0,
      last_assessed DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, subject, skill)
    );

    CREATE TABLE IF NOT EXISTS daily_mood (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      mood TEXT,
      energy TEXT,
      passion_today TEXT,
      want_to_learn TEXT,
      custom_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, date)
    );
  `);

  // Seed users si vide
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (name, avatar, age, classe, profile_type, theme, is_dyslexic, interests, daily_limit_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run('Ilan', '⚽', 14, '4ème', 'promoteur', 'football', 0,
      JSON.stringify(['football', 'géopolitique', 'compétition']), 45);
    insertUser.run('Sacha', '🎭', 11, '6ème', 'rebelle', 'creative', 1,
      JSON.stringify(['liberté', 'choix', 'expression']), 45);
    insertUser.run('Adam', '🎨', 11, '6ème', 'imagineur', 'warhammer', 1,
      JSON.stringify(['warhammer', 'art', 'imagination', 'création']), 45);

    // Stats initiales pour chaque enfant et matière
    const insertStats = db.prepare(`
      INSERT INTO user_stats (user_id, subject) VALUES (?, ?)
    `);
    for (let userId = 1; userId <= 3; userId++) {
      for (const subject of ['francais', 'anglais', 'maths']) {
        insertStats.run(userId, subject);
      }
    }
  }

  // Seed badges si vide
  const badgeCount = db.prepare('SELECT COUNT(*) as count FROM badges').get();
  if (badgeCount.count === 0) {
    const insertBadge = db.prepare(`
      INSERT INTO badges (name, description, icon, condition_type, condition_value) VALUES (?, ?, ?, ?, ?)
    `);
    insertBadge.run('Premier pas', 'Complète ton premier exercice', '🌟', 'exercises_completed', 1);
    insertBadge.run('En route', '10 exercices complétés', '🚀', 'exercises_completed', 10);
    insertBadge.run('Persévérant', '25 exercices complétés', '💪', 'exercises_completed', 25);
    insertBadge.run('Champion', '50 exercices complétés', '🏆', 'exercises_completed', 50);
    insertBadge.run('Série de 3', '3 bonnes réponses d\'affilée', '🔥', 'streak', 3);
    insertBadge.run('Série de 5', '5 bonnes réponses d\'affilée', '⚡', 'streak', 5);
    insertBadge.run('Série de 10', '10 bonnes réponses d\'affilée', '🌈', 'streak', 10);
    insertBadge.run('Explorateur', 'Essaie les 3 matières', '🧭', 'subjects_tried', 3);
    insertBadge.run('Régulier', 'Connecte-toi 5 jours de suite', '📅', 'daily_streak', 5);
    insertBadge.run('Curieux', 'Pose 10 questions au chat', '❓', 'chat_questions', 10);
  }

  return db;
}

module.exports = { initDatabase };
