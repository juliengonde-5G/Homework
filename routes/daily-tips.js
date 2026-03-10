/**
 * Mot du jour & Actu du jour pour les profils adultes
 * Personnalisé pour Solidarité Textile & Frip and Co
 */

const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

// Cache en mémoire pour éviter les appels API répétés
const dailyCache = {};

// GET /api/daily-tips/word - Mot du jour (business english)
router.get('/word', async (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `word_${userId}_${today}`;

  // Vérifier le cache
  if (dailyCache[cacheKey]) {
    return res.json(dailyCache[cacheKey]);
  }

  // Vérifier en base de données
  const existing = db.prepare(
    "SELECT * FROM daily_tips WHERE user_id = ? AND date = ? AND type = 'word'"
  ).get(userId, today);

  if (existing) {
    const data = JSON.parse(existing.content);
    dailyCache[cacheKey] = data;
    return res.json(data);
  }

  try {
    const isJulien = user.name === 'Julien';
    const prompt = isJulien
      ? `Donne-moi le mot du jour en anglais des affaires, lié au textile, à la mode durable, au recyclage ou à l'économie circulaire. Le mot doit être utile pour un dirigeant de PME dans le secteur textile/recyclage (Solidarité Textile, Frip and Co).

Format JSON strict:
{"word": "le mot en anglais", "pronunciation": "prononciation phonétique", "definition_en": "définition en anglais", "definition_fr": "traduction et définition en français", "example_en": "phrase d'exemple en anglais dans le contexte textile/recyclage", "example_fr": "traduction de l'exemple", "tip": "un conseil d'utilisation professionnelle"}`
      : `Donne-moi le mot du jour en français, lié au développement personnel, à l'organisation ou aux compétences professionnelles.

Format JSON strict:
{"word": "le mot", "definition": "définition claire", "example": "phrase d'exemple", "tip": "comment l'utiliser au quotidien"}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: 'Tu es un expert en vocabulaire professionnel. Réponds UNIQUEMENT en JSON valide, sans markdown.',
      messages: [{ role: 'user', content: prompt }]
    });

    let data;
    try {
      const text = response.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      data = JSON.parse(text);
    } catch (e) {
      data = getDefaultWord(user.name);
    }

    // Sauvegarder en base
    db.prepare(
      "INSERT OR REPLACE INTO daily_tips (user_id, date, type, content) VALUES (?, ?, 'word', ?)"
    ).run(userId, today, JSON.stringify(data));

    dailyCache[cacheKey] = data;
    res.json(data);
  } catch (e) {
    console.error('Erreur mot du jour:', e);
    res.json(getDefaultWord(user.name));
  }
});

// GET /api/daily-tips/news - Actu du jour (textile / recyclage / mode durable)
router.get('/news', async (req, res) => {
  const db = req.app.locals.db;
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ error: 'Non connecté' });

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `news_${userId}_${today}`;

  if (dailyCache[cacheKey]) {
    return res.json(dailyCache[cacheKey]);
  }

  const existing = db.prepare(
    "SELECT * FROM daily_tips WHERE user_id = ? AND date = ? AND type = 'news'"
  ).get(userId, today);

  if (existing) {
    const data = JSON.parse(existing.content);
    dailyCache[cacheKey] = data;
    return res.json(data);
  }

  try {
    const prompt = `Génère une actu/info du jour pertinente pour un dirigeant de PME dans le secteur du textile solidaire et du recyclage textile en France (entreprises : Solidarité Textile - collecte et recyclage de textiles usagés, Frip and Co - entreprise d'insertion par le tri de vêtements de seconde main).

L'actu peut concerner : réglementation textile, économie circulaire, RSE, filière REP textile, innovation recyclage, mode durable, inclusion/insertion professionnelle, subventions, etc.

Format JSON strict :
{"title": "titre court de l'actu", "summary": "résumé en 2-3 phrases", "relevance": "en quoi c'est pertinent pour Solidarité Textile / Frip and Co", "action": "une action concrète à envisager", "category": "réglementation|innovation|marché|RSE|subvention"}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: `Tu es un veilleur sectoriel spécialisé dans le textile solidaire et l'économie circulaire en France. Date du jour: ${today}. Génère une info/actu pertinente et réaliste. Réponds UNIQUEMENT en JSON valide.`,
      messages: [{ role: 'user', content: prompt }]
    });

    let data;
    try {
      const text = response.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      data = JSON.parse(text);
    } catch (e) {
      data = getDefaultNews();
    }

    db.prepare(
      "INSERT OR REPLACE INTO daily_tips (user_id, date, type, content) VALUES (?, ?, 'news', ?)"
    ).run(userId, today, JSON.stringify(data));

    dailyCache[cacheKey] = data;
    res.json(data);
  } catch (e) {
    console.error('Erreur actu du jour:', e);
    res.json(getDefaultNews());
  }
});

function getDefaultWord(name) {
  const words = [
    { word: 'upcycling', pronunciation: '/ʌpˈsaɪklɪŋ/', definition_en: 'The process of transforming waste materials into new products of higher quality', definition_fr: 'Surcyclage : transformer des déchets en produits de valeur supérieure', example_en: 'Our upcycling workshop transforms old jeans into stylish bags.', example_fr: 'Notre atelier de surcyclage transforme les vieux jeans en sacs tendance.', tip: 'Utilisez ce terme dans vos présentations RSE pour montrer votre engagement environnemental.' },
    { word: 'circular economy', pronunciation: '/ˈsɜːrkjʊlər ɪˈkɒnəmi/', definition_en: 'An economic model that aims to minimize waste and maximize resource use', definition_fr: 'Économie circulaire : modèle économique qui minimise les déchets', example_en: 'Solidarité Textile is a key player in the circular economy.', example_fr: 'Solidarité Textile est un acteur clé de l\'économie circulaire.', tip: 'Mot clé pour les dossiers de subventions européennes.' },
    { word: 'sustainability', pronunciation: '/səˌsteɪnəˈbɪləti/', definition_en: 'The ability to maintain ecological balance and meet present needs without compromising future generations', definition_fr: 'Durabilité : capacité à répondre aux besoins actuels sans compromettre les générations futures', example_en: 'Sustainability is at the core of our business model.', example_fr: 'La durabilité est au cœur de notre modèle d\'affaires.', tip: 'Indispensable dans toute communication institutionnelle.' }
  ];
  return words[new Date().getDay() % words.length];
}

function getDefaultNews() {
  return {
    title: 'Filière REP textile : objectifs de collecte 2025',
    summary: 'La filière REP (Responsabilité Élargie du Producteur) textile renforce ses objectifs de collecte. Les opérateurs de tri comme Frip and Co sont au cœur de cette dynamique.',
    relevance: 'Solidarité Textile et Frip and Co peuvent bénéficier des nouveaux soutiens financiers de l\'éco-organisme Refashion.',
    action: 'Vérifier l\'éligibilité aux nouvelles aides Refashion pour les opérateurs de tri.',
    category: 'réglementation'
  };
}

module.exports = router;
