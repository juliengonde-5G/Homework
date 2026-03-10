/**
 * Programme du jour - Génération adaptative
 * Génère un programme personnalisé basé sur :
 * - Le niveau et la classe de l'élève
 * - Ses performances passées (matières faibles prioritaires)
 * - Son humeur/énergie du jour
 * - Ses passions/centres d'intérêt
 * - Actualisation mensuelle du parcours
 */

const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

// GET /api/program/today - Récupérer ou générer le programme du jour
router.get('/today', async (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user || user.role === 'parent') {
    return res.json({ program: null, message: 'Pas de programme pour les adultes' });
  }

  const today = new Date().toISOString().split('T')[0];

  // Vérifier si un programme existe déjà pour aujourd'hui
  let program = db.prepare('SELECT * FROM daily_programs WHERE user_id = ? AND date = ?').get(userId, today);

  if (program) {
    program.blocks = JSON.parse(program.blocks);
    return res.json({ program });
  }

  // Générer un nouveau programme
  try {
    const blocks = await generateDailyProgram(db, user, today);
    db.prepare(`
      INSERT INTO daily_programs (user_id, date, blocks, status, current_block)
      VALUES (?, ?, ?, 'active', 0)
    `).run(userId, today, JSON.stringify(blocks));

    program = db.prepare('SELECT * FROM daily_programs WHERE user_id = ? AND date = ?').get(userId, today);
    program.blocks = JSON.parse(program.blocks);
    res.json({ program });
  } catch (e) {
    console.error('Erreur génération programme:', e);
    // Fallback : programme statique
    const blocks = generateFallbackProgram(db, user);
    db.prepare(`
      INSERT INTO daily_programs (user_id, date, blocks, status, current_block)
      VALUES (?, ?, ?, 'active', 0)
    `).run(userId, today, JSON.stringify(blocks));

    program = db.prepare('SELECT * FROM daily_programs WHERE user_id = ? AND date = ?').get(userId, today);
    program.blocks = JSON.parse(program.blocks);
    res.json({ program });
  }
});

// POST /api/program/advance - Avancer d'un bloc dans le programme
router.post('/advance', (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const today = new Date().toISOString().split('T')[0];
  const program = db.prepare('SELECT * FROM daily_programs WHERE user_id = ? AND date = ?').get(userId, today);
  if (!program) return res.status(404).json({ error: 'Pas de programme aujourd\'hui' });

  const blocks = JSON.parse(program.blocks);
  const nextBlock = program.current_block + 1;

  if (nextBlock >= blocks.length) {
    db.prepare("UPDATE daily_programs SET status = 'completed', current_block = ? WHERE id = ?")
      .run(nextBlock, program.id);
    return res.json({ completed: true, message: 'Programme terminé ! Bravo !' });
  }

  db.prepare("UPDATE daily_programs SET current_block = ? WHERE id = ?").run(nextBlock, program.id);
  res.json({ completed: false, currentBlock: nextBlock, block: blocks[nextBlock] });
});

// GET /api/program/curriculum-status - État du parcours et prochaine mise à jour
router.get('/curriculum-status', (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').all(userId);

  // Vérifier si on doit mettre à jour le curriculum (1er du mois)
  const now = new Date();
  const isRefreshDay = now.getDate() <= 3; // Les 3 premiers jours du mois

  // Vérifier changement de classe (septembre)
  const isNewSchoolYear = now.getMonth() === 8; // Septembre = mois 8
  const gradeMap = { '6ème': '5ème', '5ème': '4ème', '4ème': '3ème', '3ème': '2nde' };

  let gradeTransition = null;
  if (isNewSchoolYear && gradeMap[user.classe]) {
    gradeTransition = {
      current: user.classe,
      next: gradeMap[user.classe],
      message: `Bientôt en ${gradeMap[user.classe]} ! Le programme s'adaptera automatiquement.`
    };
  }

  // Calcul du score global et des priorités
  const priorities = stats.map(s => ({
    subject: s.subject,
    totalExercises: s.total_exercises,
    successRate: s.total_exercises > 0 ? Math.round(s.correct_answers / s.total_exercises * 100) : 0,
    level: s.current_level,
    needsWork: s.total_exercises > 0 && (s.correct_answers / s.total_exercises) < 0.6
  })).sort((a, b) => a.successRate - b.successRate);

  res.json({
    user: { name: user.name, classe: user.classe },
    stats: priorities,
    refreshAvailable: isRefreshDay,
    gradeTransition,
    lastUpdate: now.toISOString()
  });
});

// POST /api/program/refresh-curriculum - Rafraîchir le curriculum (mensuel)
router.post('/refresh-curriculum', async (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').all(userId);

  // Utiliser Claude pour générer des recommandations personnalisées
  try {
    const prompt = buildCurriculumRefreshPrompt(user, stats);
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: 'Tu es un conseiller pédagogique. Analyse les performances de l\'élève et recommande un plan de travail pour le mois suivant. Réponds en JSON.',
      messages: [{ role: 'user', content: prompt }]
    });

    const recommendations = response.content[0].text;
    res.json({ recommendations, refreshedAt: new Date().toISOString() });
  } catch (e) {
    console.error('Erreur refresh curriculum:', e);
    res.json({
      recommendations: generateDefaultRecommendations(stats),
      refreshedAt: new Date().toISOString()
    });
  }
});

// POST /api/program/upgrade-grade - Changer de classe (transition d'année)
router.post('/upgrade-grade', (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const { newGrade } = req.body;
  const validGrades = ['6ème', '5ème', '4ème', '3ème', '2nde'];
  if (!validGrades.includes(newGrade)) {
    return res.status(400).json({ error: 'Classe invalide' });
  }

  db.prepare('UPDATE users SET classe = ? WHERE id = ?').run(newGrade, userId);
  res.json({ success: true, newGrade });
});

// === Fonctions de génération ===

async function generateDailyProgram(db, user, today) {
  const stats = db.prepare('SELECT * FROM user_stats WHERE user_id = ?').all(user.id);
  const mood = db.prepare('SELECT * FROM daily_mood WHERE user_id = ? AND date = ?').get(user.id, today);
  const interests = JSON.parse(user.interests || '[]');

  // Trouver les matières faibles (< 60% sur min 3 exercices)
  const weakSubjects = stats
    .filter(s => s.total_exercises > 3 && (s.correct_answers / s.total_exercises) < 0.6)
    .map(s => s.subject);

  // Trouver les matières fortes (>= 80% sur min 3 exercices)
  const strongSubjects = stats
    .filter(s => s.total_exercises > 3 && (s.correct_answers / s.total_exercises) >= 0.8)
    .map(s => s.subject);

  // Adapter selon l'énergie
  const energy = mood?.energy || 'moyen';
  const sessionMinutes = energy === 'a fond' ? 45 : energy === 'tranquille' ? 30 : 40;

  // Adapter la difficulté selon l'humeur
  const moodState = mood?.mood || 'bien';
  const difficultyModifier = moodState === 'fatigue' ? -1 : moodState === 'super bien' ? 1 : 0;

  // Matière demandée par l'élève au questionnaire
  const wantedSubject = mood?.want_to_learn;
  const hasSpecificRequest = wantedSubject && wantedSubject !== 'un peu de tout';

  // Construire les blocs
  const blocks = [];

  // Bloc 1 : Si l'élève a demandé une matière, on la met en premier (respect du choix)
  let startSubject;
  if (hasSpecificRequest) {
    startSubject = wantedSubject;
  } else if (strongSubjects.length > 0) {
    startSubject = strongSubjects[Math.floor(Math.random() * strongSubjects.length)];
  } else {
    startSubject = getDefaultSubjects(user)[0];
  }

  blocks.push({
    type: 'lesson',
    subject: startSubject,
    title: hasSpecificRequest ? 'Ton choix du jour' : 'Échauffement',
    description: hasSpecificRequest
      ? `Tu as choisi ${getSubjectName(startSubject)}, c'est parti !`
      : `On commence en douceur avec ${getSubjectName(startSubject)}`,
    duration: moodState === 'fatigue' ? 8 : 10,
    icon: getSubjectIcon(startSubject),
    difficulty: difficultyModifier
  });

  // Bloc 2 : Exercices de la matière choisie/forte
  blocks.push({
    type: 'exercises',
    subject: startSubject,
    title: 'Exercices rapides',
    description: moodState === 'fatigue' ? 'Quelques exercices tranquilles' : 'Montre ce que tu sais !',
    duration: moodState === 'fatigue' ? 6 : 8,
    icon: '✏️',
    difficulty: difficultyModifier
  });

  // Bloc 3 : Matière faible (ou 2ème matière) - sauf si fatigué et session courte
  let focusSubject;
  if (hasSpecificRequest && weakSubjects.length > 0) {
    // L'élève a déjà son choix en bloc 1, on ajoute la matière faible
    focusSubject = weakSubjects[0];
  } else if (weakSubjects.length > 0) {
    focusSubject = weakSubjects[0];
  } else {
    const defaults = getDefaultSubjects(user);
    focusSubject = defaults.find(s => s !== startSubject) || defaults[1];
  }

  if (sessionMinutes >= 30) {
    blocks.push({
      type: 'lesson',
      subject: focusSubject,
      title: 'Focus du jour',
      description: `On progresse ensemble en ${getSubjectName(focusSubject)}`,
      duration: moodState === 'fatigue' ? 8 : 12,
      icon: getSubjectIcon(focusSubject),
      difficulty: difficultyModifier
    });

    // Bloc 4 : Exercices focus
    blocks.push({
      type: 'exercises',
      subject: focusSubject,
      title: 'Entraînement',
      description: 'Des exercices adaptés à ton niveau',
      duration: moodState === 'fatigue' ? 7 : 10,
      icon: '💪',
      difficulty: difficultyModifier
    });
  }

  // Bloc 5 : Découverte / Passion (si énergie suffisante)
  if (sessionMinutes >= 35) {
    const passion = mood?.passion_today || interests[0] || 'robotique';
    blocks.push({
      type: 'discovery',
      subject: 'decouverte',
      title: 'Bonus découverte',
      description: `Explore un sujet qui te plaît : ${passion}`,
      duration: 5,
      icon: '🔭',
      passion: passion
    });
  }

  // Blocs spéciaux par enfant (seulement si énergie le permet)
  if (user.name === 'Sacha' && sessionMinutes >= 35) {
    blocks.push({
      type: 'lesson',
      subject: 'informatique',
      title: 'Informatique du jour',
      description: 'Logique, code et architecture !',
      duration: moodState === 'fatigue' ? 7 : 10,
      icon: '💻'
    });
    blocks.push({
      type: 'lesson',
      subject: 'techno',
      title: 'Robotique du jour',
      description: 'Continue ton parcours robot !',
      duration: moodState === 'fatigue' ? 7 : 10,
      icon: '🤖'
    });
  }

  if (user.name === 'Adan' && sessionMinutes >= 35) {
    blocks.push({
      type: 'lesson',
      subject: 'arts',
      title: 'Atelier créatif',
      description: 'Peinture, sculpture, décors !',
      duration: moodState === 'fatigue' ? 7 : 10,
      icon: '🎨'
    });
  }

  if (user.name === 'Ilan' && sessionMinutes >= 35) {
    blocks.push({
      type: 'lesson',
      subject: 'culture',
      title: 'Culture du jour',
      description: 'Géopolitique, histoire, société !',
      duration: moodState === 'fatigue' ? 7 : 10,
      icon: '🌍'
    });
  }

  return blocks;
}

function generateFallbackProgram(db, user) {
  const subjects = getDefaultSubjects(user);
  return [
    { type: 'lesson', subject: subjects[0], title: 'Leçon du jour', description: `${getSubjectName(subjects[0])}`, duration: 10, icon: getSubjectIcon(subjects[0]) },
    { type: 'exercises', subject: subjects[0], title: 'Exercices', description: 'Entraîne-toi !', duration: 10, icon: '✏️' },
    { type: 'lesson', subject: subjects[1], title: 'Deuxième leçon', description: `${getSubjectName(subjects[1])}`, duration: 10, icon: getSubjectIcon(subjects[1]) },
    { type: 'exercises', subject: subjects[1], title: 'Exercices', description: 'Continue !', duration: 10, icon: '💪' }
  ];
}

function getDefaultSubjects(user) {
  if (user.name === 'Sacha') return ['informatique', 'techno', 'maths', 'francais'];
  if (user.name === 'Adan') return ['arts', 'francais', 'maths', 'anglais'];
  if (user.name === 'Ilan') return ['culture', 'maths', 'anglais', 'francais'];
  return ['francais', 'maths', 'anglais'];
}

function getSubjectName(s) {
  const names = { francais: 'Français', anglais: 'Anglais', maths: 'Maths', techno: 'Techno & Robotique', sciences: 'Sciences', culture: 'Culture & Géo', arts: 'Arts Créatifs', informatique: 'Informatique', decouverte: 'Découverte' };
  return names[s] || s;
}

function getSubjectIcon(s) {
  const icons = { francais: '📝', anglais: '🇬🇧', maths: '🔢', techno: '🤖', sciences: '🔬', culture: '🌍', arts: '🎨', informatique: '💻', decouverte: '🔭' };
  return icons[s] || '📚';
}

function buildCurriculumRefreshPrompt(user, stats) {
  const statsSummary = stats.map(s => {
    const rate = s.total_exercises > 0 ? Math.round(s.correct_answers / s.total_exercises * 100) : 0;
    return `${s.subject}: ${s.total_exercises} exercices, ${rate}% réussite, niveau ${s.current_level}`;
  }).join('\n');

  return `Élève: ${user.name}, ${user.age} ans, classe: ${user.classe}
Profil: ${user.profile_type}, Dyslexique: ${user.is_dyslexic ? 'oui' : 'non'}
Centres d'intérêt: ${user.interests}

Statistiques du mois :
${statsSummary}

Génère un plan de travail pour le mois suivant en JSON avec :
- subjects_priority: liste ordonnée des matières à travailler en priorité
- weekly_focus: un thème par semaine
- goals: objectifs mesurables
- difficulty_adjustment: faut-il augmenter ou baisser la difficulté par matière`;
}

function generateDefaultRecommendations(stats) {
  const weak = stats.filter(s => s.total_exercises > 0 && s.correct_answers / s.total_exercises < 0.6);
  return {
    subjects_priority: weak.length > 0 ? weak.map(s => s.subject) : ['francais', 'maths'],
    message: 'Continue ton super travail ! Concentre-toi sur les matières où tu as le plus de marge de progression.'
  };
}

module.exports = router;
