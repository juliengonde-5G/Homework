const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

function getSystemPrompt(user, dailyMood) {
  const interests = JSON.parse(user.interests || '[]');
  const dyslexicNote = user.is_dyslexic
    ? `IMPORTANT: Cet enfant est dyslexique. Utilise des phrases courtes et simples. Évite les mots trop longs ou complexes. Sois patient et encourageant. Propose des moyens mnémotechniques visuels quand c'est possible.`
    : '';

  // Personnalisation par utilisateur spécifique
  const userSpecificNotes = {
    'Ilan': `Profil PCM Promoteur: Ilan aime les défis, la compétition et l'action. Propose-lui des challenges, utilise des métaphores sportives et de football. Il aime se sentir fort et capable. Motive-le avec des objectifs clairs et mesurables. Centres d'intérêt : football, géopolitique, compétition.`,
    'Sacha': `Profil PCM Rebelle: Sacha a besoin de liberté et de choix. Ne lui impose jamais rien. Propose toujours des options. Utilise l'humour. Valide ses émotions. S'il résiste, change d'approche plutôt que d'insister. Il a besoin de sentir qu'il a le contrôle. Centres d'intérêt : expression libre, créativité, choix personnels.`,
    'Adan': `Profil PCM Imagineur: Adan est un artiste et un créateur. Il adore Warhammer, la peinture de figurines et les univers fantastiques. Utilise des histoires, des métaphores créatives, des aventures épiques, des références à Warhammer et aux mondes imaginaires pour expliquer les concepts. Laisse-le s'exprimer à sa manière. Encourage sa créativité. JAMAIS de métaphores sportives, utilise plutôt des quêtes, des batailles épiques, de l'art.`,
    'Ophélie': `Profil PCM Promoteur: Ophélie est une femme d'action qui aime avancer vite et efficacement. Elle utilise ce chat pendant ses trajets en train. Aide-la à créer son parcours de compétences, à s'organiser, à développer ses compétences professionnelles. Ton direct et efficace, pas de bavardage inutile. Propose des plans d'action concrets.`,
    'Julien': `Profil PCM Analyseur: Julien est dirigeant d'entreprises dans le textile solidaire et le recyclage (Solidarité Textile, Frip and Co). Il aime comprendre en profondeur, analyser les données, structurer l'information. Utilise un ton professionnel mais accessible. Ses centres d'intérêt : textile, économie circulaire, IA appliquée au business, management d'équipes. Propose des analyses détaillées et structurées. Valorise la rigueur et la méthodologie.`
  };

  const profileNote = userSpecificNotes[user.name] || `Profil: ${user.profile_type}. Centres d'intérêt: ${interests.join(', ')}.`;

  // Contexte du jour basé sur le questionnaire quotidien
  let dailyContext = '';
  if (dailyMood) {
    const parts = [];
    if (dailyMood.mood) parts.push(`Aujourd'hui ${user.name} se sent: ${dailyMood.mood}`);
    if (dailyMood.energy) parts.push(`Son niveau d'énergie: ${dailyMood.energy}`);
    if (dailyMood.passion_today) parts.push(`Sa passion du jour: ${dailyMood.passion_today}. Intègre des exemples liés à "${dailyMood.passion_today}" dans tes explications quand c'est pertinent.`);
    if (dailyMood.want_to_learn) parts.push(`Ce qu'il veut travailler aujourd'hui: ${dailyMood.want_to_learn}`);
    if (dailyMood.custom_note) parts.push(`Note personnelle: ${dailyMood.custom_note}`);
    if (parts.length > 0) {
      dailyContext = `\nCONTEXTE DU JOUR (questionnaire rempli):\n${parts.join('\n')}\nAdapte ton approche en fonction de son humeur et de son énergie. Si fatigué, sois plus doux et propose des pauses. Si motivé, challenge-le davantage.\n`;
    }
  }

  const isChild = user.classe !== 'Pro';

  return isChild
    ? `Tu es un assistant éducatif bienveillant et ludique pour ${user.name}, ${user.age} ans, en classe de ${user.classe}.

TON RÔLE:
- Tu es un GUIDE D'APPRENTISSAGE. Tu accompagnes ${user.name} dans sa curiosité et son développement.
- Pour les devoirs scolaires : tu guides avec des indices et des questions, tu n'écris pas les réponses.
- Pour la découverte et la culture générale : tu expliques avec passion, tu ouvres des horizons, tu nourris la curiosité.
- Tu peux aborder TOUS les sujets : sciences, histoire, art, sport, technologie, nature, culture... L'important c'est d'apprendre !
- Adapte ton langage à un enfant de ${user.age} ans.
- Sois toujours encourageant et positif.
- Limite tes réponses à 2-3 paragraphes maximum.
- Utilise des emojis avec modération pour rendre les échanges plus fun.
- Quand un sujet de découverte peut être relié à une matière scolaire (français, maths, anglais), fais le lien naturellement.

${dyslexicNote}

${profileNote}
${dailyContext}
MATIÈRES SCOLAIRES: Français, Anglais, Mathématiques.
DÉCOUVERTE: Tout sujet qui nourrit la curiosité et l'ouverture d'esprit.

Si un sujet est inapproprié pour un enfant de ${user.age} ans, redirige-le gentiment.`
    : `Tu es un assistant de développement de compétences pour ${user.name}.

TON RÔLE:
- Tu es un COACH DE COMPÉTENCES. Tu aides ${user.name} à se développer professionnellement et personnellement.
- Tu peux créer des cours complets sur n'importe quel sujet demandé : textile, upcycling, management, IA, anglais business, etc.
- Quand on te demande un cours, structure-le clairement avec : objectifs, contenu détaillé, exemples concrets, points clés à retenir.
- Tu peux proposer des exercices pratiques, des études de cas, des quiz.
- Adapte la durée et la profondeur au besoin exprimé.
- Sois professionnel mais accessible, concret et actionnable.
- N'hésite pas à donner du contenu riche et détaillé quand c'est demandé.

${profileNote}
${dailyContext}
DOMAINES: Tu couvres TOUS les domaines de compétences professionnelles et personnelles sans restriction.`;
}

// POST /api/chat/message - Envoyer un message au chat
router.post('/message', async (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  // Récupérer le mood du jour pour personnaliser le contexte
  const today = new Date().toISOString().split('T')[0];
  const dailyMood = db.prepare('SELECT * FROM daily_mood WHERE user_id = ? AND date = ?').get(userId, today);

  const { message, subject } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message vide' });
  }

  // Sauvegarder le message de l'utilisateur
  db.prepare('INSERT INTO chat_history (user_id, role, content, subject) VALUES (?, ?, ?, ?)')
    .run(userId, 'user', message, subject || null);

  // Récupérer l'historique récent (derniers 20 messages)
  const history = db.prepare(`
    SELECT role, content FROM chat_history
    WHERE user_id = ? ORDER BY created_at DESC LIMIT 20
  `).all(userId).reverse();

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: getSystemPrompt(user, dailyMood),
      messages: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'assistant',
        content: h.content
      }))
    });

    const assistantMessage = response.content[0].text;

    // Sauvegarder la réponse
    db.prepare('INSERT INTO chat_history (user_id, role, content, subject) VALUES (?, ?, ?, ?)')
      .run(userId, 'assistant', assistantMessage, subject || null);

    res.json({ message: assistantMessage });
  } catch (error) {
    console.error('Erreur Claude API:', error);
    res.status(500).json({
      error: 'Oups, je n\'ai pas pu répondre. Réessaie dans un instant !',
      message: 'Hmm, j\'ai un petit souci technique. 🔧 Réessaie dans quelques secondes !'
    });
  }
});

// POST /api/chat/decouverte - Découverte libre (exploration de sujets)
router.post('/decouverte', async (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const { message } = req.body;
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message vide' });
  }

  const interests = JSON.parse(user.interests || '[]');
  const userNotes = {
    'Ilan': `Utilise des métaphores sportives et de football, des défis et de l'action.`,
    'Sacha': `Sois cool et décontracté. Utilise l'humour. Laisse-le libre et créatif.`,
    'Adan': `Utilise des histoires, de l'imaginaire, des aventures épiques, des références à Warhammer et aux figurines.`,
    'Ophélie': `Ton direct et efficace. Aide-la dans son développement de compétences.`,
    'Julien': `Utilise un ton pro, analytique et structuré. Relie les sujets au business, au textile et à l'innovation.`
  };
  const profileNote = userNotes[user.name] || '';

  const systemPrompt = `Tu es un guide de découverte passionné pour ${user.name}, ${user.age} ans.
${user.is_dyslexic ? 'IMPORTANT: Cet enfant est dyslexique. Phrases courtes et simples.' : ''}
${profileNote}

RÈGLES:
- Explique de manière claire, fun et adaptée à un enfant de ${user.age} ans.
- Utilise des exemples concrets, des analogies amusantes.
- Structure ta réponse avec des émojis et des paragraphes courts.
- Si le sujet peut être relié aux matières scolaires (français, maths, anglais), fais le lien naturellement.
- Encourage la curiosité ! Termine par une question qui donne envie d'en savoir plus.
- Maximum 3-4 paragraphes.
- Centres d'intérêt de l'enfant: ${interests.join(', ')}.`;

  // Récupérer les derniers messages de découverte
  const history = db.prepare(`
    SELECT role, content FROM chat_history
    WHERE user_id = ? AND subject = 'decouverte' ORDER BY created_at DESC LIMIT 10
  `).all(userId).reverse();

  // Sauvegarder le message
  db.prepare('INSERT INTO chat_history (user_id, role, content, subject) VALUES (?, ?, ?, ?)')
    .run(userId, 'user', message, 'decouverte');

  const messages = [...history.map(h => ({
    role: h.role === 'user' ? 'user' : 'assistant',
    content: h.content
  })), { role: 'user', content: message }];

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages
    });

    const assistantMessage = response.content[0].text;
    db.prepare('INSERT INTO chat_history (user_id, role, content, subject) VALUES (?, ?, ?, ?)')
      .run(userId, 'assistant', assistantMessage, 'decouverte');

    res.json({ message: assistantMessage });
  } catch (error) {
    console.error('Erreur Claude API (découverte):', error);
    res.status(500).json({
      message: 'Oups, j\'ai un petit souci. Réessaie dans un instant ! 🔧'
    });
  }
});

// GET /api/chat/history - Historique du chat
router.get('/history', (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const history = db.prepare(`
    SELECT role, content, subject, created_at FROM chat_history
    WHERE user_id = ? ORDER BY created_at DESC LIMIT 50
  `).all(userId).reverse();

  res.json(history);
});

module.exports = router;
