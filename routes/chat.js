const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

function getSystemPrompt(user) {
  const interests = JSON.parse(user.interests || '[]');
  const dyslexicNote = user.is_dyslexic
    ? `IMPORTANT: Cet enfant est dyslexique. Utilise des phrases courtes et simples. Évite les mots trop longs ou complexes. Sois patient et encourageant. Propose des moyens mnémotechniques visuels quand c'est possible.`
    : '';

  const profileNotes = {
    promoteur: `Profil PCM Promoteur: ${user.name} aime les défis, la compétition et l'action. Propose-lui des challenges, utilise des métaphores sportives (football). Il aime se sentir fort et capable. Motive-le avec des objectifs clairs et mesurables.`,
    rebelle: `Profil PCM Rebelle: ${user.name} a besoin de liberté et de choix. Ne lui impose jamais rien. Propose toujours des options. Utilise l'humour. Valide ses émotions. S'il résiste, change d'approche plutôt que d'insister. Il a besoin de sentir qu'il a le contrôle.`,
    imagineur: `Profil PCM Imagineur: ${user.name} est un artiste et un créateur. Il adore Warhammer et l'imaginaire. Utilise des histoires, des métaphores créatives, des univers fantastiques pour expliquer les concepts. Laisse-le s'exprimer à sa manière. Encourage sa créativité.`
  };

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
      system: getSystemPrompt(user),
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
