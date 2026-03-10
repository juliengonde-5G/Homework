/**
 * Génération dynamique de cours et exercices via Claude AI
 * Permet de créer de nouveaux modules à la volée selon les besoins
 */
const express = require('express');
const router = express.Router();

// POST /api/generate/course - Générer un nouveau cours dynamiquement
router.post('/course', async (req, res) => {
  const db = req.app.locals.db;
  const { subject, topic, level, interests } = req.body;

  if (!subject || !topic || !level) {
    return res.status(400).json({ error: 'subject, topic et level sont requis' });
  }

  // Vérifier si un cours similaire existe déjà
  const existing = db.prepare(
    "SELECT id FROM courses WHERE subject = ? AND title LIKE ? AND level = ?"
  ).get(subject, `%${topic}%`, level);

  if (existing) {
    return res.json({ courseId: existing.id, existing: true });
  }

  try {
    const Anthropic = require('@anthropic-ai/sdk');
    const client = new Anthropic();

    const subjectNames = {
      francais: 'Français', anglais: 'Anglais', maths: 'Mathématiques',
      techno: 'Techno & Robotique', sciences: 'Sciences', culture: 'Culture Générale',
      arts: 'Arts Créatifs', informatique: 'Informatique & Logique'
    };

    const prompt = `Tu es un professeur expert qui crée des cours interactifs pour des enfants/adolescents.
    
Crée un cours complet sur le sujet suivant :
- Matière : ${subjectNames[subject] || subject}
- Thème : ${topic}
- Niveau : ${level}
${interests ? `- Centres d'intérêt de l'élève : ${interests.join(', ')}` : ''}

Le cours doit :
1. Être adapté au niveau ${level} (programme Éducation Nationale française)
2. Utiliser un langage simple et accessible${interests ? `, avec des références aux intérêts de l'élève (${interests.join(', ')})` : ''}
3. Inclure des exemples concrets et des astuces mémorisation

Réponds UNIQUEMENT avec un objet JSON valide (pas de texte autour, pas de markdown) :
{
  "title": "Titre du cours",
  "content": "<h3>...</h3><p>...</p>... (contenu HTML du cours avec h3, p, ul, li, div class=example, div class=tip)",
  "tags": ["tag1", "tag2"],
  "exercises": [
    {
      "title": "Titre exercice",
      "type": "qcm",
      "question": "La question ?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option B",
      "explanation": "Explication de la bonne réponse"
    },
    {
      "title": "Titre exercice 2",
      "type": "fill",
      "question": "Complète : ...",
      "options": [],
      "correct_answer": "réponse",
      "explanation": "Explication"
    },
    {
      "title": "Titre exercice 3",
      "type": "truefalse",
      "question": "Affirmation. Vrai ou faux ?",
      "options": ["Vrai", "Faux"],
      "correct_answer": "Vrai",
      "explanation": "Explication"
    }
  ]
}

Génère exactement 4 exercices variés (mix de qcm, fill, truefalse).`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text.trim();
    let courseData;

    try {
      courseData = JSON.parse(responseText);
    } catch (e) {
      // Essayer d'extraire le JSON du texte
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        courseData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Impossible de parser la réponse AI');
      }
    }

    // Déterminer le prochain order_index
    const maxOrder = db.prepare(
      "SELECT COALESCE(MAX(order_index), 0) + 1 as next FROM courses WHERE subject = ?"
    ).get(subject);

    // Insérer le cours
    const courseResult = db.prepare(`
      INSERT INTO courses (subject, title, content, level, difficulty, order_index, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(subject, courseData.title, courseData.content, level, 1, maxOrder.next,
           JSON.stringify(courseData.tags || []));

    const courseId = courseResult.lastInsertRowid;

    // Insérer les exercices
    const insertEx = db.prepare(`
      INSERT INTO exercises (course_id, subject, title, type, question, options, correct_answer, explanation, level, difficulty, points, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ex of courseData.exercises || []) {
      insertEx.run(
        courseId, subject, ex.title, ex.type, ex.question,
        JSON.stringify(ex.options || []), ex.correct_answer,
        ex.explanation || '', level, 1, 10,
        JSON.stringify(courseData.tags || [])
      );
    }

    res.json({
      courseId,
      title: courseData.title,
      exerciseCount: (courseData.exercises || []).length,
      generated: true
    });

  } catch (err) {
    console.error('Erreur génération cours:', err.message);
    res.status(500).json({ error: 'Impossible de générer le cours', details: err.message });
  }
});

// POST /api/generate/batch - Générer plusieurs cours pour une matière
router.post('/batch', async (req, res) => {
  const db = req.app.locals.db;
  const { subject, level, topics, interests } = req.body;

  if (!subject || !level || !topics || !Array.isArray(topics)) {
    return res.status(400).json({ error: 'subject, level et topics (array) sont requis' });
  }

  const results = [];

  for (const topic of topics.slice(0, 5)) { // Max 5 cours à la fois
    try {
      // Appeler l'endpoint course pour chaque topic
      const existing = db.prepare(
        "SELECT id FROM courses WHERE subject = ? AND title LIKE ? AND level = ?"
      ).get(subject, `%${topic}%`, level);

      if (existing) {
        results.push({ topic, courseId: existing.id, existing: true });
        continue;
      }

      // Génération simplifiée pour le batch (sans appel API pour chaque)
      results.push({ topic, status: 'queued' });
    } catch (err) {
      results.push({ topic, error: err.message });
    }
  }

  res.json({ results, message: `${results.length} cours traités` });
});

// GET /api/generate/suggestions - Suggérer des cours manquants pour un élève
router.get('/suggestions', (req, res) => {
  const db = req.app.locals.db;
  const { userId, subject } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId requis' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  const interests = JSON.parse(user.interests || '[]');
  const level = user.classe;

  // Cours déjà terminés
  const completed = db.prepare(`
    SELECT DISTINCT c.subject, c.tags FROM courses c
    JOIN user_progress up ON up.course_id = c.id
    WHERE up.user_id = ? AND up.status = 'completed'
  `).all(userId);

  const completedTags = new Set();
  completed.forEach(c => {
    JSON.parse(c.tags || '[]').forEach(t => completedTags.add(t));
  });

  // Suggestions basées sur les intérêts et le profil
  const suggestions = [];

  const suggestionBank = {
    culture: {
      '4ème': [
        'Les révolutions industrielles', 'Le colonialisme et la décolonisation',
        'La Guerre Froide', 'Les droits de l\'homme dans le monde',
        'L\'ONU et la diplomatie', 'Les systèmes politiques comparés',
        'L\'économie du sport professionnel', 'Les migrations dans le monde',
        'La Coupe du Monde : histoire et enjeux', 'Les empires historiques'
      ],
      '6ème': [
        'L\'Égypte ancienne en détail', 'La mythologie grecque',
        'Les Vikings : explorateurs du Nord', 'La Route de la Soie',
        'Les inventions qui ont changé le monde', 'Les fêtes et traditions du monde'
      ]
    },
    arts: {
      '6ème': [
        'Le Street Art et Banksy', 'Créer un manga : bases du dessin',
        'La photographie : cadrage et lumière', 'L\'art numérique et le pixel art',
        'Customiser ses figurines : conversions avancées', 'Les techniques de weathering',
        'Créer un livre d\'art / portfolio', 'L\'animation stop-motion avec figurines',
        'La calligraphie et le lettering', 'Construire un diorama de bataille'
      ]
    },
    informatique: {
      '6ème': [
        'Créer son premier site web (HTML/CSS)', 'Les bases de données expliquées',
        'Comment fonctionne un jeu vidéo', 'La cryptographie : messages secrets',
        'Git : sauvegarder son code', 'Les capteurs et l\'IoT (Internet des Objets)',
        'Programmer un chatbot simple', 'L\'impression 3D : du fichier à l\'objet',
        'Les algorithmes de pathfinding (pour le robot)', 'Introduction à Scratch'
      ]
    },
    anglais: {
      '6ème': [
        'Prepositions of place', 'Possessive adjectives',
        'Countable and uncountable nouns', 'The weather vocabulary',
        'Describing your house', 'Food and cooking vocabulary'
      ],
      '4ème': [
        'Conditional sentences (If...)', 'Passive voice',
        'Phrasal verbs essentials', 'Writing an email in English',
        'British vs American English', 'Debate vocabulary'
      ]
    },
    francais: {
      '6ème': [
        'La poésie : rimes et vers', 'Le conte merveilleux',
        'L\'accord du participe passé', 'Les types de phrases'
      ],
      '4ème': [
        'Le récit fantastique', 'L\'argumentation',
        'Les connecteurs logiques', 'La presse et le journalisme'
      ]
    },
    maths: {
      '6ème': [
        'Les nombres décimaux', 'Le périmètre et l\'aire',
        'La symétrie axiale', 'Les proportionnalités'
      ],
      '4ème': [
        'Les puissances', 'Le calcul avec les fractions',
        'Les transformations géométriques', 'Les probabilités'
      ]
    },
    sciences: {
      '6ème': [
        'Le cycle de l\'eau', 'Les êtres vivants et leur environnement',
        'L\'électricité simple', 'Le système solaire en détail'
      ]
    }
  };

  const subjectSuggestions = subject
    ? { [subject]: suggestionBank[subject] }
    : suggestionBank;

  for (const [subj, levels] of Object.entries(subjectSuggestions)) {
    const levelSuggestions = levels?.[level] || levels?.['6ème'] || [];
    for (const topic of levelSuggestions) {
      // Vérifier si le cours existe déjà
      const exists = db.prepare(
        "SELECT id FROM courses WHERE subject = ? AND title LIKE ?"
      ).get(subj, `%${topic}%`);

      if (!exists) {
        suggestions.push({
          subject: subj,
          topic,
          level,
          relevance: interests.some(i => topic.toLowerCase().includes(i.toLowerCase())) ? 'high' : 'normal'
        });
      }
    }
  }

  // Trier : haute pertinence en premier
  suggestions.sort((a, b) => {
    if (a.relevance === 'high' && b.relevance !== 'high') return -1;
    if (b.relevance === 'high' && a.relevance !== 'high') return 1;
    return 0;
  });

  res.json(suggestions.slice(0, 15));
});

module.exports = router;
