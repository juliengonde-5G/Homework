# Plan de Refonte - Homework Buddy

## Problèmes actuels
1. Bug routage: `/api/exercises/` intercepte `/api/exercises/adaptive` → exercices jamais chargés
2. 12 cours statiques, ~46 exercices → insuffisant pour 45 min/jour
3. Nom utilisateur ne s'actualise pas correctement
4. Sélection manuelle des matières = peu engageant pour des enfants
5. Aucun contenu visuel (photos, vidéos)
6. Cours trop courts et superficiels

## Vision de la refonte

### Concept : "Programme du Jour" automatique
- Plus de choix de matière manuelle
- Chaque jour, un **programme personnalisé de 45 minutes** est généré
- Mix intelligent des 3 matières (Français, Anglais, Maths)
- Alternance : leçon enrichie → exercices → leçon → exercices → récap vidéo
- Contenu adapté au niveau réel de l'enfant (pas juste 6ème/4ème)

### Structure d'une session de 45 minutes
1. **Accueil motivant** (1 min) - message personnalisé + objectifs du jour
2. **Bloc 1** (~12 min) - Leçon enrichie + 5 exercices
3. **Bloc 2** (~12 min) - Leçon enrichie + 5 exercices
4. **Bloc 3** (~12 min) - Leçon enrichie + 5 exercices
5. **Bilan & Récompense** (~5 min) - Score, badges, vidéo éducative
6. **Bonus découverte** (3 min) - Contenu culturel lié aux intérêts de l'enfant

### Contenu des leçons enrichies
- Texte structuré avec explications claires
- **Images éducatives** via URLs (schémas, illustrations)
- **Vidéos YouTube éducatives** intégrées (chaînes françaises : Lumni, Les Bons Profs, etc.)
- Exemples concrets liés aux centres d'intérêt de l'enfant
- Astuces mémorisation adaptées PCM

### Exercices plus profonds
- Variété : QCM, texte à trous, vrai/faux, rédaction courte, association, ordonnancement
- 15 exercices par session (5 par bloc)
- Difficulté progressive au sein de la session
- Feedback immédiat avec explications détaillées

## Fichiers à modifier

### 1. Fix critique : routes/exercises.js
- Réordonner les routes (adaptive AVANT la route générique)

### 2. Refonte : database/seed-content.js
- Multiplier le contenu par 10x minimum
- Cours beaucoup plus longs et détaillés
- Ajouter champs: media_url, video_url, visual_content (JSON)
- Couvrir le vrai programme scolaire 6ème et 4ème

### 3. Refonte : database/init.js
- Ajouter colonnes: media_url, video_url aux tables courses et exercises
- Ajouter table daily_programs (programmes quotidiens générés)
- Ajouter table program_blocks (blocs de contenu dans un programme)

### 4. Refonte : routes/courses.js → routes/program.js
- Nouveau endpoint: GET /api/program/today - Programme du jour
- Génère automatiquement un programme de 45 min adapté
- Algo de sélection intelligent basé sur :
  - Matières pas vues récemment
  - Niveau de difficulté adaptatif
  - Cours pas encore terminés
  - Centres d'intérêt de l'enfant

### 5. Refonte : public/js/app.js
- Supprimer le sélecteur de matières
- Nouveau flow: Login → "Commencer ma session" → Bloc 1 → Bloc 2 → Bloc 3 → Bilan
- Affichage du nom utilisateur corrigé
- Intégration vidéos YouTube (iframe)
- Affichage images dans les leçons
- Barre de progression de la session (pas juste du bloc)

### 6. Refonte : public/index.html
- Nouvelle section "Programme du jour" remplace l'ancien sélecteur
- Zone vidéo intégrée dans les leçons
- Zone images dans les leçons
- Écran de bilan de session amélioré

### 7. Refonte : public/css/style.css
- Styles pour vidéos embedded
- Styles pour images de cours
- Styles pour la barre de progression session
- Styles pour l'écran programme du jour
