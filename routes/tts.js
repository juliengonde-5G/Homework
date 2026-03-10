/**
 * TTS Server-Side - Génère des URLs audio via Google TTS
 * Voix natives anglaises et françaises de haute qualité
 * Retourne des segments audio pour le lecteur HTML5
 */
const express = require('express');
const router = express.Router();
const googleTTS = require('google-tts-api');
const https = require('https');

// Cache en mémoire pour éviter de re-générer les mêmes audio
const audioCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// POST /api/tts/generate - Générer les URLs audio pour un texte
router.post('/generate', (req, res) => {
  const { text, lang } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Texte requis' });
  }

  const language = lang === 'en' ? 'en-US' : 'fr';

  try {
    // google-tts-api supporte les textes longs en les découpant automatiquement
    const urls = googleTTS.getAllAudioUrls(text, {
      lang: language,
      slow: false,
      host: 'https://translate.google.com',
    });

    res.json({
      segments: urls.map((u, i) => ({
        url: `/api/tts/proxy?url=${encodeURIComponent(u.url)}`,
        index: i,
        text: u.shortText
      })),
      lang: language,
      totalSegments: urls.length
    });
  } catch (err) {
    console.error('TTS generate error:', err.message);
    res.status(500).json({ error: 'Erreur de génération audio' });
  }
});

// GET /api/tts/proxy - Proxy l'audio de Google TTS pour éviter les problèmes CORS
router.get('/proxy', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL requise');

  // Vérifier le cache
  const cacheKey = url;
  if (audioCache.has(cacheKey)) {
    const cached = audioCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      res.set('Content-Type', 'audio/mpeg');
      res.set('Cache-Control', 'public, max-age=1800');
      return res.send(cached.data);
    }
    audioCache.delete(cacheKey);
  }

  // Télécharger l'audio depuis Google
  https.get(url, (googleRes) => {
    const chunks = [];
    googleRes.on('data', chunk => chunks.push(chunk));
    googleRes.on('end', () => {
      const buffer = Buffer.concat(chunks);

      // Mettre en cache
      audioCache.set(cacheKey, { data: buffer, timestamp: Date.now() });

      // Nettoyer le cache si trop gros (max 100 entrées)
      if (audioCache.size > 100) {
        const oldest = [...audioCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp);
        for (let i = 0; i < 20; i++) audioCache.delete(oldest[i][0]);
      }

      res.set('Content-Type', 'audio/mpeg');
      res.set('Cache-Control', 'public, max-age=1800');
      res.send(buffer);
    });
    googleRes.on('error', () => {
      res.status(500).send('Erreur de téléchargement audio');
    });
  }).on('error', () => {
    res.status(500).send('Erreur de connexion audio');
  });
});

// GET /api/tts/single - Générer un seul fichier audio (pour les textes courts)
router.get('/single', (req, res) => {
  const { text, lang } = req.query;
  if (!text) return res.status(400).json({ error: 'Texte requis' });

  const language = lang === 'en' ? 'en-US' : 'fr';

  try {
    const url = googleTTS.getAudioUrl(text.substring(0, 200), {
      lang: language,
      slow: false,
      host: 'https://translate.google.com',
    });

    // Rediriger vers le proxy
    res.redirect(`/api/tts/proxy?url=${encodeURIComponent(url)}`);
  } catch (err) {
    res.status(500).json({ error: 'Erreur audio' });
  }
});

module.exports = router;
