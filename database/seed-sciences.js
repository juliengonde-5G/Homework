/**
 * Contenu Sciences & Technologie
 * Programme 6ème et 4ème - Éducation Nationale
 */

function seedSciences(db) {
  const existing = db.prepare("SELECT COUNT(*) as count FROM courses WHERE subject = 'sciences'").get();
  if (existing.count > 0) return;

  const insertCourse = db.prepare(`
    INSERT INTO courses (subject, title, content, level, difficulty, order_index, tags, video_url, duration_minutes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertExercise = db.prepare(`
    INSERT INTO exercises (course_id, subject, title, type, question, options, correct_answer, explanation, level, difficulty, points, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let courseId;

  // === SCIENCES 6ème ===

  courseId = insertCourse.run('sciences', 'La matière - États et changements',
    `<h3>Les 3 états de la matière</h3>
    <ul>
      <li><strong>Solide</strong> : forme propre, on peut le tenir (glace, bois, métal)</li>
      <li><strong>Liquide</strong> : prend la forme du récipient, coule (eau, lait, huile)</li>
      <li><strong>Gaz</strong> : invisible, remplit tout l'espace (air, vapeur d'eau)</li>
    </ul>
    <h3>Les changements d'état</h3>
    <ul>
      <li><strong>Fusion</strong> : solide → liquide (glace qui fond à 0°C)</li>
      <li><strong>Solidification</strong> : liquide → solide (eau qui gèle)</li>
      <li><strong>Vaporisation</strong> : liquide → gaz (eau qui bout à 100°C)</li>
      <li><strong>Condensation</strong> : gaz → liquide (buée sur une vitre froide)</li>
    </ul>
    <div class="tip">💡 <strong>L'eau</strong> est la seule substance qu'on rencontre facilement dans ses 3 états : glaçon, eau liquide, vapeur !</div>`,
    '6ème', 1, 1, JSON.stringify(['matière', 'états', 'changements']),
    'https://www.youtube.com/watch?v=BTqI-KlMN58', 10
  ).lastInsertRowid;

  insertExercise.run(courseId, 'sciences', 'État solide', 'qcm',
    'Un solide a...',
    JSON.stringify(['Une forme propre', 'La forme du récipient', 'Pas de forme', 'Une forme qui change']),
    'Une forme propre', 'Le solide garde sa forme propre. Le liquide prend la forme du récipient.',
    '6ème', 1, 10, JSON.stringify(['matière']));

  insertExercise.run(courseId, 'sciences', 'Fusion', 'qcm',
    'La fusion, c\'est le passage de...',
    JSON.stringify(['Liquide à gaz', 'Solide à liquide', 'Gaz à liquide', 'Liquide à solide']),
    'Solide à liquide', 'Fusion = solide → liquide. Exemple : un glaçon qui fond.',
    '6ème', 1, 10, JSON.stringify(['matière']));

  insertExercise.run(courseId, 'sciences', 'Température ébullition', 'fill',
    'À quelle température l\'eau bout-elle ? (en °C, juste le nombre)',
    JSON.stringify([]), '100', 'L\'eau bout à 100°C au niveau de la mer.',
    '6ème', 1, 10, JSON.stringify(['matière']));

  // Le système solaire
  courseId = insertCourse.run('sciences', 'Le système solaire',
    `<h3>Notre étoile : le Soleil</h3>
    <p>Le Soleil est une <strong>étoile</strong> : une boule de gaz brûlant. Il est 109 fois plus gros que la Terre !</p>
    <h3>Les 8 planètes (dans l'ordre)</h3>
    <ol>
      <li><strong>Mercure</strong> - la plus proche du Soleil, très chaude</li>
      <li><strong>Vénus</strong> - la plus chaude (effet de serre)</li>
      <li><strong>Terre</strong> - notre maison ! Avec de l'eau liquide</li>
      <li><strong>Mars</strong> - la planète rouge</li>
      <li><strong>Jupiter</strong> - la plus grosse (géante gazeuse)</li>
      <li><strong>Saturne</strong> - ses célèbres anneaux</li>
      <li><strong>Uranus</strong> - penche sur le côté</li>
      <li><strong>Neptune</strong> - la plus lointaine, très froide</li>
    </ol>
    <div class="example"><strong>Moyen mnémotechnique :</strong> "Me Voici Tout Mouillé, J'ai Suivi Un Nuage"</div>
    <div class="tip">💡 <strong>Pluton</strong> n'est plus une planète depuis 2006 ! C'est une "planète naine".</div>`,
    '6ème', 1, 2, JSON.stringify(['espace', 'système solaire', 'astronomie']),
    'https://www.youtube.com/watch?v=libKVRa01L8', 12
  ).lastInsertRowid;

  insertExercise.run(courseId, 'sciences', '3ème planète', 'qcm',
    'Quelle est la 3ème planète du système solaire ?',
    JSON.stringify(['Mars', 'Vénus', 'Terre', 'Jupiter']),
    'Terre', 'Mercure, Vénus, TERRE ! La 3ème en partant du Soleil.',
    '6ème', 1, 10, JSON.stringify(['espace']));

  insertExercise.run(courseId, 'sciences', 'Plus grosse planète', 'qcm',
    'Quelle est la plus grosse planète du système solaire ?',
    JSON.stringify(['Terre', 'Saturne', 'Jupiter', 'Neptune']),
    'Jupiter', 'Jupiter est la plus grosse : elle pourrait contenir 1300 Terres !',
    '6ème', 1, 10, JSON.stringify(['espace']));

  insertExercise.run(courseId, 'sciences', 'Nombre de planètes', 'fill',
    'Combien y a-t-il de planètes dans le système solaire ?',
    JSON.stringify([]), '8', '8 planètes depuis que Pluton a été reclassée en planète naine en 2006.',
    '6ème', 1, 10, JSON.stringify(['espace']));

  // L'énergie
  courseId = insertCourse.run('sciences', 'L\'énergie - Sources et formes',
    `<h3>C'est quoi l'énergie ?</h3>
    <p>L'énergie, c'est ce qui permet de <strong>faire quelque chose</strong> : bouger, chauffer, éclairer.</p>
    <h3>Les sources d'énergie</h3>
    <ul>
      <li><strong>Renouvelables</strong> (inépuisables) : solaire, éolien, hydraulique, biomasse</li>
      <li><strong>Non renouvelables</strong> (limitées) : pétrole, gaz, charbon, nucléaire</li>
    </ul>
    <h3>Les formes d'énergie</h3>
    <ul>
      <li><strong>Cinétique</strong> : énergie du mouvement (voiture qui roule)</li>
      <li><strong>Thermique</strong> : chaleur (radiateur)</li>
      <li><strong>Lumineuse</strong> : lumière (ampoule)</li>
      <li><strong>Électrique</strong> : courant (prise murale)</li>
      <li><strong>Chimique</strong> : stockée dans la matière (essence, nourriture)</li>
    </ul>
    <div class="tip">💡 <strong>Lien robotique :</strong> Ton robot Arduino utilise de l'énergie chimique (piles) transformée en énergie électrique puis en énergie cinétique (mouvement) !</div>`,
    '6ème', 1, 3, JSON.stringify(['énergie', 'sources', 'environnement']),
    'https://www.youtube.com/watch?v=yXNjpICSgFQ', 10
  ).lastInsertRowid;

  insertExercise.run(courseId, 'sciences', 'Énergie renouvelable', 'qcm',
    'Quelle source d\'énergie est renouvelable ?',
    JSON.stringify(['Le pétrole', 'Le charbon', 'Le solaire', 'Le gaz naturel']),
    'Le solaire', 'Le solaire est renouvelable : le soleil ne s\'épuise pas (pas avant des milliards d\'années) !',
    '6ème', 1, 10, JSON.stringify(['énergie']));

  insertExercise.run(courseId, 'sciences', 'Énergie cinétique', 'qcm',
    'L\'énergie cinétique est l\'énergie...',
    JSON.stringify(['De la chaleur', 'Du mouvement', 'De la lumière', 'De la nourriture']),
    'Du mouvement', 'Cinétique = mouvement. Une balle qui roule possède de l\'énergie cinétique.',
    '6ème', 1, 10, JSON.stringify(['énergie']));

  // === SCIENCES 4ème ===

  courseId = insertCourse.run('sciences', 'L\'atome et la molécule',
    `<h3>Tout est fait d'atomes</h3>
    <p>Tout ce qui existe (toi, l'air, ton téléphone) est composé de minuscules particules : les <strong>atomes</strong>.</p>
    <h3>Structure de l'atome</h3>
    <ul>
      <li><strong>Noyau</strong> au centre : protons (+) et neutrons</li>
      <li><strong>Électrons</strong> (-) qui tournent autour du noyau</li>
    </ul>
    <h3>Les molécules</h3>
    <p>Une molécule = plusieurs atomes liés ensemble.</p>
    <div class="example">
      <strong>H₂O</strong> (eau) = 2 atomes d'hydrogène + 1 atome d'oxygène<br>
      <strong>CO₂</strong> = 1 carbone + 2 oxygènes<br>
      <strong>O₂</strong> = 2 atomes d'oxygène
    </div>
    <div class="tip">💡 Il y a environ 100 types d'atomes différents : le tableau périodique des éléments !</div>`,
    '4ème', 1, 1, JSON.stringify(['atome', 'molécule', 'chimie']),
    'https://www.youtube.com/watch?v=EL5djPB8IjA', 12
  ).lastInsertRowid;

  insertExercise.run(courseId, 'sciences', 'Composition de l\'eau', 'qcm',
    'La molécule d\'eau (H₂O) est composée de...',
    JSON.stringify(['2 hydrogènes + 1 oxygène', '1 hydrogène + 2 oxygènes', '2 oxygènes', '3 hydrogènes']),
    '2 hydrogènes + 1 oxygène', 'H₂O : le 2 après H signifie 2 hydrogènes, et O signifie 1 oxygène.',
    '4ème', 1, 15, JSON.stringify(['atome']));

  insertExercise.run(courseId, 'sciences', 'Structure atome', 'qcm',
    'Au centre de l\'atome se trouve...',
    JSON.stringify(['Les électrons', 'Le noyau', 'Les molécules', 'Le vide']),
    'Le noyau', 'Le noyau (protons + neutrons) est au centre. Les électrons tournent autour.',
    '4ème', 1, 15, JSON.stringify(['atome']));

  // Ajout des stats sciences pour tous les enfants
  for (let userId = 1; userId <= 3; userId++) {
    const st = db.prepare("SELECT COUNT(*) as count FROM user_stats WHERE user_id = ? AND subject = 'sciences'").get(userId);
    if (st.count === 0) {
      db.prepare("INSERT INTO user_stats (user_id, subject) VALUES (?, 'sciences')").run(userId);
    }
  }

  console.log('🔬 Contenu Sciences chargé !');
}

module.exports = { seedSciences };
