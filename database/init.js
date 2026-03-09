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
      birthday TEXT,
      role TEXT DEFAULT 'child',
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

    CREATE TABLE IF NOT EXISTS learning_paths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT DEFAULT '📚',
      total_modules INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, slug)
    );

    CREATE TABLE IF NOT EXISTS audio_lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path_id INTEGER NOT NULL,
      module_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      content_text TEXT NOT NULL,
      key_points TEXT DEFAULT '[]',
      vocabulary TEXT DEFAULT '[]',
      quiz_questions TEXT DEFAULT '[]',
      duration_estimate INTEGER DEFAULT 10,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (path_id) REFERENCES learning_paths(id)
    );

    CREATE TABLE IF NOT EXISTS learning_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      status TEXT DEFAULT 'not_started',
      listened_count INTEGER DEFAULT 0,
      quiz_score INTEGER,
      notes TEXT,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (lesson_id) REFERENCES audio_lessons(id),
      UNIQUE(user_id, lesson_id)
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

  // Migration: ajouter les colonnes birthday et role si manquantes
  const columns = db.pragma('table_info(users)').map(c => c.name);
  if (!columns.includes('birthday')) {
    db.exec("ALTER TABLE users ADD COLUMN birthday TEXT");
  }
  if (!columns.includes('role')) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'child'");
  }

  // Ajouter les profils parents si absents
  const parentCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'parent'").get();
  if (parentCount.count === 0) {
    const existingPro = db.prepare("SELECT COUNT(*) as count FROM users WHERE classe = 'Pro'").get();
    if (existingPro.count === 0) {
      db.prepare(`INSERT INTO users (name, avatar, age, classe, profile_type, theme, is_dyslexic, interests, daily_limit_minutes, birthday, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        'Ophélie', '👩', 40, 'Pro', 'promoteur', 'ophelie', 0,
        JSON.stringify(['train', 'développement personnel', 'compétences']), 999, null, 'parent');
      db.prepare(`INSERT INTO users (name, avatar, age, classe, profile_type, theme, is_dyslexic, interests, daily_limit_minutes, birthday, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        'Julien', '👨', 40, 'Pro', 'analyseur', 'entrepreneur', 0,
        JSON.stringify(['textile', 'recyclage', 'IA', 'management']), 999, null, 'parent');
    } else {
      // Mettre à jour les profils Pro existants
      db.exec("UPDATE users SET role = 'parent' WHERE classe = 'Pro'");
    }
  }

  // Seed users si vide
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount.count === 0) {
    const insertUserFull = db.prepare(`
      INSERT INTO users (name, avatar, age, classe, profile_type, theme, is_dyslexic, interests, daily_limit_minutes, birthday, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUserFull.run('Ilan', '⚽', 14, '4ème', 'promoteur', 'football', 0,
      JSON.stringify(['football', 'géopolitique', 'compétition']), 45, null, 'child');
    insertUserFull.run('Sacha', '🎭', 11, '6ème', 'rebelle', 'creative', 1,
      JSON.stringify(['liberté', 'choix', 'expression']), 45, null, 'child');
    insertUserFull.run('Adan', '🎨', 11, '6ème', 'imagineur', 'warhammer', 1,
      JSON.stringify(['warhammer', 'art', 'imagination', 'création']), 45, null, 'child');
    insertUserFull.run('Ophélie', '👩', 40, 'Pro', 'promoteur', 'ophelie', 0,
      JSON.stringify(['train', 'développement personnel', 'compétences']), 999, null, 'parent');
    insertUserFull.run('Julien', '👨', 40, 'Pro', 'analyseur', 'entrepreneur', 0,
      JSON.stringify(['textile', 'recyclage', 'IA', 'management']), 999, null, 'parent');

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
