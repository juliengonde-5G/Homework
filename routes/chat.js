const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

function getSystemPrompt(user, dailyMood) {
  const interests = JSON.parse(user.interests || '[]');
  const dyslexicNote = user.is_dyslexic
    ? `IMPORTANT: Cet enfant est dyslexique. Utilise des phrases courtes et simples. Évite les mots trop longs ou complexes. Sois patient et encourageant. Propose des moyens mnémotechniques visuels quand c'est possible.`
    : '';

  const profileNotes = {
    promoteur: `Profil PCM Promoteur: ${user.name} aime les défis, la compétition et l'action. Propose-lui des challenges, utilise des métaphores sportives (football). Il aime se sentir fort et capable. Motive-le avec des objectifs clairs et mesurables.`,
    rebelle: `Profil PCM Rebelle: ${user.name} a besoin de liberté et de choix. Ne lui impose jamais rien. Propose toujours des options. Utilise l'humour. Valide ses émotions. S'il résiste, change d'approche plutôt que d'insister. Il a besoin de sentir qu'il a le contrôle.`,
    imagineur: `Profil PCM Imagineur: ${user.name} est un artiste et un créateur. Il adore Warhammer et l'imaginaire. Utilise des histoires, des métaphores créatives, des univers fantastiques pour expliquer les concepts. Laisse-le s'exprimer à sa manière. Encourage sa créativité.`
  };

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
      dailyContext = `\nCONTEXTE DU JOUR (questionnaire rempli par l'enfant):\n${parts.join('\n')}\nAdapte ton approche en fonction de son humeur et de son énergie. Si fatigué, sois plus doux et propose des pauses. Si motivé, challenge-le davantage.\n`;
    }
  }

  return `Tu es un assistant pédagogique bienveillant et ludique pour ${user.name}, ${user.age} ans, en classe de ${user.classe}.

RÈGLES ABSOLUES:
- Tu es un ASSISTANT AUX DEVOIRS, pas un remplaçant. Tu guides, tu n'écris pas les réponses à la place de l'enfant.
- Quand l'enfant te demande une réponse directe, guide-le avec des indices et des questions.
- Adapte ton langage à un enfant de ${user.age} ans.
- Sois toujours encourageant et positif. Ne dis JAMAIS qu'une réponse est "nulle" ou "bête".
- Utilise des exemples concrets tirés de ses centres d'intérêt: ${interests.join(', ')}.
- Limite tes réponses à 2-3 paragraphes maximum.
- Utilise des emojis avec modération pour rendre les échanges plus fun.

${dyslexicNote}

${profileNotes[user.profile_type] || ''}
${dailyContext}
MATIÈRES: Tu peux aider en Français, Anglais et Mathématiques.
- En Français: grammaire, conjugaison, orthographe, rédaction, compréhension de texte
- En Anglais: vocabulaire, grammaire, expression, compréhension
- En Mathématiques: calcul, géométrie, problèmes, fractions, algèbre

Si l'enfant demande de l'aide sur un sujet hors programme ou inapproprié, redirige-le gentiment vers ses devoirs.`;
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
  const profileNotes = {
    promoteur: `Utilise des métaphores sportives, des défis et de l'action.`,
    rebelle: `Sois cool et décontracté. Utilise l'humour. Laisse-le libre.`,
    imagineur: `Utilise des histoires, de l'imaginaire, des aventures épiques.`
  };

  const systemPrompt = `Tu es un guide de découverte passionné pour ${user.name}, ${user.age} ans.
${user.is_dyslexic ? 'IMPORTANT: Cet enfant est dyslexique. Phrases courtes et simples.' : ''}
${profileNotes[user.profile_type] || ''}

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
