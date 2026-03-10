/**
 * Culture Générale - Géopolitique, Civilisations, Société, Économie
 * Orienté Ilan (4ème, passionné géopolitique et football)
 * + Cours 6ème pour Sacha/Adan
 */

function seedCulture(db) {
  const existing = db.prepare("SELECT COUNT(*) as count FROM courses WHERE subject = 'culture'").get();
  if (existing.count > 0) return;

  const insertCourse = db.prepare(`
    INSERT INTO courses (subject, title, content, level, difficulty, order_index, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertExercise = db.prepare(`
    INSERT INTO exercises (course_id, subject, title, type, question, options, correct_answer, explanation, level, difficulty, points, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let courseId;

  // ========================================
  // GÉOPOLITIQUE - 4ème
  // ========================================

  courseId = insertCourse.run('culture', 'Géopolitique : les grandes puissances mondiales',
    `<h3>Qu'est-ce que la géopolitique ?</h3>
    <p>La géopolitique étudie les <strong>rapports de pouvoir entre les pays</strong> et comment la géographie influence la politique mondiale.</p>

    <h3>Les grandes puissances actuelles</h3>
    <ul>
      <li><strong>🇺🇸 États-Unis</strong> : 1ère puissance économique et militaire, siège de l'ONU à New York, dollar = monnaie de référence mondiale</li>
      <li><strong>🇨🇳 Chine</strong> : 2ème économie mondiale, 1,4 milliard d'habitants, "atelier du monde", puissance montante</li>
      <li><strong>🇷🇺 Russie</strong> : plus grand pays du monde, puissance nucléaire, ressources en gaz et pétrole</li>
      <li><strong>🇪🇺 Union Européenne</strong> : 27 pays, 1er marché commercial mondial, soft power culturel</li>
      <li><strong>🇮🇳 Inde</strong> : pays le plus peuplé (2024), puissance technologique émergente</li>
    </ul>

    <h3>Les organisations internationales</h3>
    <ul>
      <li><strong>ONU</strong> : 193 pays membres, maintien de la paix, droits de l'homme</li>
      <li><strong>OTAN</strong> : alliance militaire occidentale (31 pays)</li>
      <li><strong>G7 / G20</strong> : réunion des pays les plus riches / influents</li>
      <li><strong>BRICS</strong> : Brésil, Russie, Inde, Chine, Afrique du Sud + nouveaux membres</li>
    </ul>

    <div class="tip">
      💡 <strong>Lien avec le foot :</strong> La FIFA, c'est aussi de la géopolitique ! L'attribution des Coupes du Monde (Qatar 2022, USA-Canada-Mexique 2026) reflète les jeux de pouvoir mondiaux.
    </div>`,
    '4ème', 2, 1, JSON.stringify(['géopolitique', 'puissances mondiales'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Première puissance économique', 'qcm',
    'Quel pays est actuellement la 1ère puissance économique mondiale ?',
    JSON.stringify(['La Chine', 'Les États-Unis', 'Le Japon', 'L\'Allemagne']),
    'Les États-Unis',
    'Les États-Unis sont la 1ère puissance économique (PIB), suivis de la Chine.',
    '4ème', 1, 10, JSON.stringify(['géopolitique']));

  insertExercise.run(courseId, 'culture', 'Pays le plus peuplé', 'qcm',
    'Quel est le pays le plus peuplé du monde en 2024 ?',
    JSON.stringify(['La Chine', 'Les États-Unis', 'L\'Inde', 'L\'Indonésie']),
    'L\'Inde',
    'L\'Inde a dépassé la Chine en 2023 pour devenir le pays le plus peuplé (1,44 milliard).',
    '4ème', 1, 10, JSON.stringify(['géopolitique']));

  insertExercise.run(courseId, 'culture', 'BRICS', 'qcm',
    'Que signifie BRICS ?',
    JSON.stringify(['5 pays émergents', 'Une alliance militaire', 'Un accord commercial européen', 'Une organisation sportive']),
    '5 pays émergents',
    'BRICS = Brésil, Russie, Inde, Chine, Afrique du Sud. Ce sont des puissances émergentes.',
    '4ème', 1, 10, JSON.stringify(['géopolitique']));

  insertExercise.run(courseId, 'culture', 'Siège de l\'ONU', 'fill',
    'Dans quelle ville se trouve le siège principal de l\'ONU ?',
    JSON.stringify([]), 'New York',
    'Le siège de l\'ONU est à New York, aux États-Unis.',
    '4ème', 1, 10, JSON.stringify(['géopolitique']));

  // L'Union Européenne
  courseId = insertCourse.run('culture', 'L\'Union Européenne : construction et fonctionnement',
    `<h3>L'histoire de la construction européenne</h3>
    <ul>
      <li><strong>1951</strong> : CECA (Communauté Européenne du Charbon et de l'Acier) - 6 pays fondateurs</li>
      <li><strong>1957</strong> : Traité de Rome → CEE (Communauté Économique Européenne)</li>
      <li><strong>1992</strong> : Traité de Maastricht → naissance de l'Union Européenne</li>
      <li><strong>2002</strong> : Mise en circulation de l'<strong>euro</strong> (€)</li>
      <li><strong>2020</strong> : <strong>Brexit</strong> - Le Royaume-Uni quitte l'UE</li>
    </ul>

    <h3>Les 6 pays fondateurs</h3>
    <p>🇫🇷 France · 🇩🇪 Allemagne · 🇮🇹 Italie · 🇧🇪 Belgique · 🇳🇱 Pays-Bas · 🇱🇺 Luxembourg</p>

    <h3>Comment ça fonctionne ?</h3>
    <ul>
      <li><strong>Commission européenne</strong> : propose les lois (Bruxelles)</li>
      <li><strong>Parlement européen</strong> : vote les lois (Strasbourg)</li>
      <li><strong>Conseil de l'UE</strong> : représente les gouvernements</li>
    </ul>

    <h3>Valeurs et principes</h3>
    <p>Libre circulation des <strong>personnes</strong>, des <strong>marchandises</strong>, des <strong>capitaux</strong> et des <strong>services</strong> (les 4 libertés).</p>

    <div class="tip">
      💡 <strong>Foot et Europe :</strong> La Ligue des Champions de l'UEFA existe grâce à cette Europe unie ! Les joueurs circulent librement entre les clubs des pays membres.
    </div>`,
    '4ème', 2, 2, JSON.stringify(['géopolitique', 'europe', 'histoire'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Pays fondateurs UE', 'qcm',
    'Combien de pays ont fondé la construction européenne en 1951 ?',
    JSON.stringify(['4', '6', '12', '27']),
    '6',
    '6 pays fondateurs : France, Allemagne, Italie, Belgique, Pays-Bas, Luxembourg.',
    '4ème', 1, 10, JSON.stringify(['europe']));

  insertExercise.run(courseId, 'culture', 'Date de l\'euro', 'qcm',
    'En quelle année l\'euro est-il entré en circulation ?',
    JSON.stringify(['1992', '1999', '2002', '2005']),
    '2002',
    'L\'euro a été mis en circulation le 1er janvier 2002 dans 12 pays.',
    '4ème', 1, 10, JSON.stringify(['europe']));

  insertExercise.run(courseId, 'culture', 'Brexit', 'qcm',
    'Le Brexit, c\'est :',
    JSON.stringify(['La France qui quitte l\'OTAN', 'Le Royaume-Uni qui quitte l\'UE', 'L\'Allemagne qui rejoint les BRICS', 'L\'Italie qui adopte le dollar']),
    'Le Royaume-Uni qui quitte l\'UE',
    'Brexit = Britain + Exit. Le Royaume-Uni a quitté l\'UE en 2020.',
    '4ème', 1, 10, JSON.stringify(['europe']));

  insertExercise.run(courseId, 'culture', 'Parlement européen', 'fill',
    'Le Parlement européen siège à ...',
    JSON.stringify([]), 'Strasbourg',
    'Le Parlement européen siège à Strasbourg (France).',
    '4ème', 1, 10, JSON.stringify(['europe']));

  // Les conflits contemporains
  courseId = insertCourse.run('culture', 'Les grands enjeux géopolitiques actuels',
    `<h3>Les tensions dans le monde</h3>
    <p>Le monde actuel fait face à de nombreux défis géopolitiques :</p>

    <h3>Les enjeux majeurs</h3>
    <ul>
      <li><strong>La rivalité USA-Chine</strong> : guerre commerciale, technologique (5G, IA), influence en Asie et en Afrique</li>
      <li><strong>Le changement climatique</strong> : accords de Paris (2015), transition énergétique, montée des eaux</li>
      <li><strong>Les migrations</strong> : crises humanitaires, réfugiés, frontières</li>
      <li><strong>Le terrorisme</strong> : menace mondiale, coopération internationale</li>
      <li><strong>La cybersécurité</strong> : espionnage, fake news, protection des données</li>
    </ul>

    <h3>L'Afrique : continent d'avenir</h3>
    <ul>
      <li>Population jeune en forte croissance</li>
      <li>Ressources naturelles abondantes</li>
      <li>Compétition entre Chine, Russie et pays occidentaux pour l'influence</li>
      <li>Développement du numérique et de l'innovation</li>
    </ul>

    <h3>Le rôle du sport dans la géopolitique</h3>
    <p>Les grands événements sportifs sont des <strong>outils de soft power</strong> : JO, Coupe du Monde, tournois internationaux servent à montrer la puissance d'un pays.</p>

    <div class="tip">
      💡 <strong>Réfléchis :</strong> Pourquoi le Qatar a-t-il organisé la Coupe du Monde 2022 ? Pour montrer sa puissance et son influence au monde entier !
    </div>`,
    '4ème', 2, 3, JSON.stringify(['géopolitique', 'conflits', 'actualité'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Rivalité technologique', 'qcm',
    'Quels sont les deux pays principaux dans la rivalité technologique mondiale ?',
    JSON.stringify(['France et Allemagne', 'USA et Chine', 'Russie et Japon', 'Inde et Brésil']),
    'USA et Chine',
    'Les États-Unis et la Chine sont en compétition dans la tech (IA, 5G, semi-conducteurs).',
    '4ème', 1, 10, JSON.stringify(['géopolitique']));

  insertExercise.run(courseId, 'culture', 'Accords de Paris', 'qcm',
    'Les accords de Paris (2015) concernent :',
    JSON.stringify(['Le commerce international', 'Le changement climatique', 'La paix au Moyen-Orient', 'Les droits de l\'homme']),
    'Le changement climatique',
    'Les accords de Paris (COP21, 2015) visent à limiter le réchauffement climatique.',
    '4ème', 1, 10, JSON.stringify(['géopolitique']));

  insertExercise.run(courseId, 'culture', 'Soft power sportif', 'truefalse',
    'Les grands événements sportifs (JO, Coupe du Monde) sont des outils de soft power géopolitique.',
    JSON.stringify(['Vrai', 'Faux']),
    'Vrai',
    'Le soft power sportif permet aux pays de montrer leur puissance sans force militaire.',
    '4ème', 1, 10, JSON.stringify(['géopolitique']));

  // ========================================
  // CIVILISATIONS - 4ème
  // ========================================

  courseId = insertCourse.run('culture', 'Les grandes civilisations antiques',
    `<h3>Les berceaux de l'humanité</h3>

    <h3>🏛️ La Grèce antique (-800 à -146)</h3>
    <ul>
      <li>Invention de la <strong>démocratie</strong> à Athènes (Périclès)</li>
      <li>Les Jeux Olympiques antiques (776 av. J.-C.)</li>
      <li>Philosophes : Socrate, Platon, Aristote</li>
      <li>Architecture : le Parthénon, les temples</li>
    </ul>

    <h3>🏺 L'Empire romain (-27 à 476)</h3>
    <ul>
      <li>Le plus grand empire d'Europe : de la Grande-Bretagne à l'Égypte</li>
      <li>Routes, aqueducs, droit romain (base de nos lois)</li>
      <li>Gladiateurs et Colisée</li>
      <li>Chute en 476 (invasions barbares)</li>
    </ul>

    <h3>🐫 L'Égypte ancienne (-3100 à -30)</h3>
    <ul>
      <li>Pyramides de Gizeh, pharaons, hiéroglyphes</li>
      <li>Le Nil : source de vie pour toute la civilisation</li>
      <li>Toutânkhamon, Cléopâtre, Ramsès II</li>
    </ul>

    <h3>🏯 La Chine ancienne</h3>
    <ul>
      <li>La Grande Muraille, la Route de la Soie</li>
      <li>Inventions : papier, boussole, poudre à canon, imprimerie</li>
      <li>Confucius et sa philosophie</li>
    </ul>

    <div class="tip">
      💡 <strong>Le savais-tu ?</strong> Les premiers Jeux Olympiques datent de 776 av. J.-C. à Olympie en Grèce. Le foot n'existait pas encore, mais la course à pied, oui !
    </div>`,
    '4ème', 1, 4, JSON.stringify(['civilisations', 'antiquité', 'histoire'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Démocratie athénienne', 'qcm',
    'Quelle cité grecque a inventé la démocratie ?',
    JSON.stringify(['Sparte', 'Athènes', 'Rome', 'Alexandrie']),
    'Athènes',
    'La démocratie est née à Athènes au Ve siècle av. J.-C., sous Périclès.',
    '4ème', 1, 10, JSON.stringify(['civilisations']));

  insertExercise.run(courseId, 'culture', 'Chute de Rome', 'qcm',
    'En quelle année l\'Empire romain d\'Occident est-il tombé ?',
    JSON.stringify(['27 av. J.-C.', '476', '1453', '1789']),
    '476',
    'L\'Empire romain d\'Occident chute en 476, sous les invasions barbares.',
    '4ème', 1, 10, JSON.stringify(['civilisations']));

  insertExercise.run(courseId, 'culture', 'Inventions chinoises', 'qcm',
    'Laquelle de ces inventions ne vient PAS de Chine ?',
    JSON.stringify(['Le papier', 'La boussole', 'La démocratie', 'L\'imprimerie']),
    'La démocratie',
    'La démocratie vient de Grèce. Le papier, la boussole et l\'imprimerie sont des inventions chinoises.',
    '4ème', 1, 10, JSON.stringify(['civilisations']));

  insertExercise.run(courseId, 'culture', 'Premiers JO', 'fill',
    'Les premiers Jeux Olympiques ont eu lieu en ... av. J.-C.',
    JSON.stringify([]), '776',
    'Les premiers Jeux Olympiques datent de 776 av. J.-C. à Olympie, en Grèce.',
    '4ème', 1, 10, JSON.stringify(['civilisations']));

  // Moyen Âge et Renaissance
  courseId = insertCourse.run('culture', 'Du Moyen Âge à la Renaissance',
    `<h3>Le Moyen Âge (476-1492)</h3>

    <h3>La société féodale</h3>
    <ul>
      <li><strong>Le roi</strong> : au sommet de la pyramide</li>
      <li><strong>Les seigneurs</strong> : possèdent les terres (fiefs)</li>
      <li><strong>Les chevaliers</strong> : protègent et combattent</li>
      <li><strong>Les paysans / serfs</strong> : travaillent la terre</li>
      <li><strong>Le clergé</strong> : l'Église très puissante</li>
    </ul>

    <h3>Les Croisades (1095-1291)</h3>
    <p>Expéditions militaires et religieuses en Terre Sainte. Elles ont permis des échanges culturels entre Orient et Occident.</p>

    <h3>La Renaissance (XVe-XVIe siècle)</h3>
    <ul>
      <li>Née en <strong>Italie</strong> (Florence, Rome, Venise)</li>
      <li><strong>Léonard de Vinci</strong> : artiste, inventeur, génie universel</li>
      <li><strong>Michel-Ange</strong> : plafond de la Chapelle Sixtine</li>
      <li><strong>Gutenberg</strong> : invention de l'imprimerie (~1450)</li>
      <li><strong>Grandes découvertes</strong> : Christophe Colomb (1492), Magellan</li>
    </ul>

    <h3>L'imprimerie : une révolution</h3>
    <p>Avant Gutenberg, les livres étaient copiés à la main. L'imprimerie a permis de diffuser le savoir à grande échelle, un peu comme Internet aujourd'hui !</p>

    <div class="tip">
      💡 <strong>Fun fact :</strong> Le football moderne est né en Angleterre au XIXe siècle, mais on jouait déjà à des jeux de balle au Moyen Âge ! Le "soule" était un ancêtre du foot.
    </div>`,
    '4ème', 1, 5, JSON.stringify(['histoire', 'moyen-âge', 'renaissance'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Société féodale', 'qcm',
    'Dans la société féodale, qui est au sommet de la pyramide ?',
    JSON.stringify(['Le pape', 'Le roi', 'Le seigneur', 'Le chevalier']),
    'Le roi',
    'Le roi est au sommet de la pyramide féodale, suivi des seigneurs.',
    '4ème', 1, 10, JSON.stringify(['histoire']));

  insertExercise.run(courseId, 'culture', 'Renaissance italienne', 'qcm',
    'Dans quel pays la Renaissance est-elle née ?',
    JSON.stringify(['France', 'Angleterre', 'Italie', 'Espagne']),
    'Italie',
    'La Renaissance est née en Italie au XVe siècle, dans des villes comme Florence.',
    '4ème', 1, 10, JSON.stringify(['histoire']));

  insertExercise.run(courseId, 'culture', 'Imprimerie', 'fill',
    'L\'invention de l\'imprimerie est attribuée à ...',
    JSON.stringify([]), 'Gutenberg',
    'Johannes Gutenberg a inventé l\'imprimerie à caractères mobiles vers 1450.',
    '4ème', 1, 10, JSON.stringify(['histoire']));

  insertExercise.run(courseId, 'culture', 'Christophe Colomb', 'qcm',
    'En quelle année Christophe Colomb a-t-il découvert l\'Amérique ?',
    JSON.stringify(['1453', '1492', '1515', '1610']),
    '1492',
    'Christophe Colomb a atteint l\'Amérique le 12 octobre 1492.',
    '4ème', 1, 10, JSON.stringify(['histoire']));

  // Les Lumières et la Révolution
  courseId = insertCourse.run('culture', 'Les Lumières et la Révolution française',
    `<h3>Le siècle des Lumières (XVIIIe siècle)</h3>
    <p>Des penseurs qui veulent éclairer le monde par la <strong>raison</strong> et combattre l'ignorance.</p>

    <h3>Les grands philosophes</h3>
    <ul>
      <li><strong>Voltaire</strong> : tolérance religieuse, liberté d'expression</li>
      <li><strong>Rousseau</strong> : souveraineté du peuple, éducation</li>
      <li><strong>Montesquieu</strong> : séparation des pouvoirs (législatif, exécutif, judiciaire)</li>
      <li><strong>Diderot</strong> : l'Encyclopédie, diffuser le savoir</li>
    </ul>

    <h3>La Révolution française (1789)</h3>
    <ul>
      <li><strong>14 juillet 1789</strong> : prise de la Bastille</li>
      <li><strong>26 août 1789</strong> : Déclaration des Droits de l'Homme et du Citoyen</li>
      <li><strong>Devise</strong> : Liberté, Égalité, Fraternité</li>
      <li><strong>Abolition de la monarchie</strong> → proclamation de la République (1792)</li>
    </ul>

    <h3>L'héritage dans notre quotidien</h3>
    <p>Les Lumières et la Révolution nous ont donné : la démocratie, les droits de l'homme, la séparation des pouvoirs, la laïcité, l'école publique...</p>

    <div class="tip">
      💡 <strong>Réfléchis :</strong> La devise "Liberté, Égalité, Fraternité" s'applique aussi dans le sport : liberté de jouer, égalité des chances, fraternité entre joueurs !
    </div>`,
    '4ème', 2, 6, JSON.stringify(['histoire', 'lumières', 'révolution'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Séparation des pouvoirs', 'qcm',
    'Quel philosophe a théorisé la séparation des pouvoirs ?',
    JSON.stringify(['Voltaire', 'Rousseau', 'Montesquieu', 'Diderot']),
    'Montesquieu',
    'Montesquieu a théorisé la séparation des pouvoirs dans "L\'Esprit des lois".',
    '4ème', 1, 10, JSON.stringify(['histoire']));

  insertExercise.run(courseId, 'culture', 'Prise de la Bastille', 'qcm',
    'La prise de la Bastille a eu lieu le :',
    JSON.stringify(['14 juillet 1789', '26 août 1789', '1er janvier 1792', '21 janvier 1793']),
    '14 juillet 1789',
    'La Bastille a été prise le 14 juillet 1789, date de notre fête nationale.',
    '4ème', 1, 10, JSON.stringify(['histoire']));

  insertExercise.run(courseId, 'culture', 'Devise de la France', 'fill',
    'La devise de la France est : Liberté, ..., Fraternité',
    JSON.stringify([]), 'Égalité',
    'Liberté, Égalité, Fraternité : la devise de la République française.',
    '4ème', 1, 10, JSON.stringify(['histoire']));

  insertExercise.run(courseId, 'culture', 'L\'Encyclopédie', 'qcm',
    'Qui est le principal auteur de l\'Encyclopédie ?',
    JSON.stringify(['Voltaire', 'Rousseau', 'Montesquieu', 'Diderot']),
    'Diderot',
    'Diderot (avec d\'Alembert) a dirigé l\'Encyclopédie, une œuvre monumentale du savoir.',
    '4ème', 1, 10, JSON.stringify(['histoire']));

  // ========================================
  // ÉCONOMIE - 4ème
  // ========================================

  courseId = insertCourse.run('culture', 'Comprendre l\'économie : les bases',
    `<h3>C'est quoi l'économie ?</h3>
    <p>L'économie étudie comment les <strong>richesses sont produites, échangées et réparties</strong> dans une société.</p>

    <h3>Les concepts fondamentaux</h3>
    <ul>
      <li><strong>L'offre et la demande</strong> : si tout le monde veut un produit (forte demande) et qu'il est rare (faible offre), le prix monte !</li>
      <li><strong>Le PIB</strong> (Produit Intérieur Brut) : mesure la richesse produite par un pays en un an</li>
      <li><strong>L'inflation</strong> : quand les prix augmentent → ton argent vaut moins</li>
      <li><strong>Le chômage</strong> : quand des personnes ne trouvent pas de travail</li>
    </ul>

    <h3>Les secteurs d'activité</h3>
    <ul>
      <li><strong>Primaire</strong> : agriculture, pêche, mines</li>
      <li><strong>Secondaire</strong> : industrie, construction, fabrication</li>
      <li><strong>Tertiaire</strong> : services (commerce, santé, éducation, tech)</li>
    </ul>

    <h3>Exemples concrets</h3>
    <div class="example">
      Le maillot de foot : coton cultivé (primaire) → fabriqué en usine (secondaire) → vendu en magasin (tertiaire). C'est toute l'économie en un objet !
    </div>

    <div class="tip">
      💡 <strong>Transferts de foot :</strong> Quand un club achète un joueur 100M€, c'est l'offre et la demande ! Un joueur rare et très demandé = prix très élevé.
    </div>`,
    '4ème', 1, 7, JSON.stringify(['économie', 'bases'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Offre et demande', 'qcm',
    'Si un produit est très demandé mais rare, que se passe-t-il ?',
    JSON.stringify(['Le prix baisse', 'Le prix monte', 'Le prix ne change pas', 'Le produit disparaît']),
    'Le prix monte',
    'Forte demande + faible offre = le prix augmente. C\'est la loi de l\'offre et la demande.',
    '4ème', 1, 10, JSON.stringify(['économie']));

  insertExercise.run(courseId, 'culture', 'PIB', 'qcm',
    'Le PIB mesure :',
    JSON.stringify(['La population d\'un pays', 'La richesse produite par un pays en un an', 'Le nombre d\'entreprises', 'La dette d\'un pays']),
    'La richesse produite par un pays en un an',
    'PIB = Produit Intérieur Brut. C\'est la richesse totale produite par un pays sur un an.',
    '4ème', 1, 10, JSON.stringify(['économie']));

  insertExercise.run(courseId, 'culture', 'Secteurs d\'activité', 'qcm',
    'Un boulanger qui vend du pain travaille dans le secteur :',
    JSON.stringify(['Primaire', 'Secondaire', 'Tertiaire', 'Quaternaire']),
    'Tertiaire',
    'Vendre = commerce = secteur tertiaire (services).',
    '4ème', 1, 10, JSON.stringify(['économie']));

  insertExercise.run(courseId, 'culture', 'Inflation', 'fill',
    'Quand les prix augmentent de manière continue, on parle d\'...',
    JSON.stringify([]), 'inflation',
    'L\'inflation = hausse continue des prix. Ton argent perd de la valeur.',
    '4ème', 1, 10, JSON.stringify(['économie']));

  // La mondialisation
  courseId = insertCourse.run('culture', 'La mondialisation : un monde connecté',
    `<h3>Qu'est-ce que la mondialisation ?</h3>
    <p>La mondialisation, c'est l'<strong>interconnexion croissante</strong> des pays par le commerce, les technologies, la culture et les migrations.</p>

    <h3>Les aspects de la mondialisation</h3>
    <ul>
      <li><strong>Économique</strong> : entreprises multinationales (Apple, Nike, Google), commerce international</li>
      <li><strong>Culturelle</strong> : films américains, musique K-pop, cuisine du monde</li>
      <li><strong>Technologique</strong> : Internet, réseaux sociaux, smartphones</li>
      <li><strong>Humaine</strong> : migrations, tourisme, échanges étudiants</li>
    </ul>

    <h3>Les avantages</h3>
    <ul>
      <li>Accès à des produits du monde entier</li>
      <li>Diffusion du savoir et de la technologie</li>
      <li>Rencontres entre cultures</li>
    </ul>

    <h3>Les inconvénients</h3>
    <ul>
      <li>Délocalisations et pertes d'emploi</li>
      <li>Impact environnemental (transport, pollution)</li>
      <li>Uniformisation culturelle</li>
      <li>Creusement des inégalités</li>
    </ul>

    <div class="example">
      <strong>Le maillot du PSG :</strong> Conçu en France, fabriqué au Vietnam, vendu dans le monde entier via Internet. C'est la mondialisation !
    </div>

    <div class="tip">
      💡 <strong>Le foot est mondialisé :</strong> Joueurs de tous les pays, championnats suivis mondialement, transferts internationaux. Le foot EST la mondialisation !
    </div>`,
    '4ème', 2, 8, JSON.stringify(['économie', 'mondialisation', 'géographie'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Définition mondialisation', 'qcm',
    'La mondialisation, c\'est :',
    JSON.stringify(['La domination d\'un seul pays', 'L\'interconnexion croissante des pays', 'La fin du commerce', 'La fermeture des frontières']),
    'L\'interconnexion croissante des pays',
    'La mondialisation = mise en relation croissante des pays par le commerce, la culture, la tech.',
    '4ème', 1, 10, JSON.stringify(['mondialisation']));

  insertExercise.run(courseId, 'culture', 'Délocalisation', 'qcm',
    'Une délocalisation, c\'est quand :',
    JSON.stringify(['Un pays ferme ses frontières', 'Une entreprise déplace sa production dans un autre pays', 'Un produit est interdit', 'Un pays quitte l\'UE']),
    'Une entreprise déplace sa production dans un autre pays',
    'Délocaliser = déplacer la production vers un pays où les coûts sont plus bas.',
    '4ème', 1, 10, JSON.stringify(['mondialisation']));

  insertExercise.run(courseId, 'culture', 'Multinationale', 'truefalse',
    'Apple, Nike et Google sont des entreprises multinationales.',
    JSON.stringify(['Vrai', 'Faux']),
    'Vrai',
    'Ces entreprises opèrent dans de nombreux pays = multinationales.',
    '4ème', 1, 10, JSON.stringify(['mondialisation']));

  // ========================================
  // SOCIÉTÉ - 4ème
  // ========================================

  courseId = insertCourse.run('culture', 'La démocratie et la citoyenneté',
    `<h3>Les fondements de la démocratie</h3>
    <p>Le mot "démocratie" vient du grec : <strong>demos</strong> (peuple) + <strong>kratos</strong> (pouvoir) = le pouvoir au peuple.</p>

    <h3>Les principes démocratiques</h3>
    <ul>
      <li><strong>Le suffrage universel</strong> : tous les citoyens majeurs peuvent voter</li>
      <li><strong>La séparation des pouvoirs</strong> : législatif (faire les lois), exécutif (les appliquer), judiciaire (les juger)</li>
      <li><strong>Les libertés fondamentales</strong> : expression, presse, religion, réunion</li>
      <li><strong>L'État de droit</strong> : tout le monde est soumis à la loi</li>
    </ul>

    <h3>La République française</h3>
    <ul>
      <li><strong>Président</strong> : élu pour 5 ans au suffrage universel</li>
      <li><strong>Assemblée nationale</strong> : 577 députés, votent les lois</li>
      <li><strong>Sénat</strong> : 348 sénateurs, révisent les lois</li>
      <li><strong>Conseil constitutionnel</strong> : vérifie que les lois respectent la Constitution</li>
    </ul>

    <h3>Être citoyen, c'est quoi ?</h3>
    <ul>
      <li>Avoir des <strong>droits</strong> : voter, s'exprimer, être protégé</li>
      <li>Avoir des <strong>devoirs</strong> : respecter la loi, payer ses impôts, défendre la nation</li>
    </ul>

    <div class="tip">
      💡 <strong>Parallèle foot :</strong> Un club de foot, c'est comme une mini-démocratie : des règles (les lois du jeu), un arbitre (le pouvoir judiciaire), et les supporters qui "votent" avec leur abonnement !
    </div>`,
    '4ème', 2, 9, JSON.stringify(['société', 'démocratie', 'citoyenneté'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Étymologie démocratie', 'qcm',
    'Le mot "démocratie" signifie littéralement :',
    JSON.stringify(['Pouvoir du roi', 'Pouvoir du peuple', 'Pouvoir des riches', 'Pouvoir de l\'armée']),
    'Pouvoir du peuple',
    'Demos = peuple, kratos = pouvoir. La démocratie = le pouvoir du peuple.',
    '4ème', 1, 10, JSON.stringify(['société']));

  insertExercise.run(courseId, 'culture', 'Nombre de députés', 'qcm',
    'Combien de députés siègent à l\'Assemblée nationale ?',
    JSON.stringify(['348', '450', '577', '650']),
    '577',
    'L\'Assemblée nationale compte 577 députés, élus au suffrage universel.',
    '4ème', 1, 10, JSON.stringify(['société']));

  insertExercise.run(courseId, 'culture', 'Mandat présidentiel', 'fill',
    'En France, le président est élu pour ... ans.',
    JSON.stringify([]), '5',
    'Le mandat présidentiel est de 5 ans (quinquennat) depuis 2002.',
    '4ème', 1, 10, JSON.stringify(['société']));

  // Médias et information
  courseId = insertCourse.run('culture', 'Médias, information et esprit critique',
    `<h3>Les médias dans notre vie</h3>
    <p>Les médias sont les moyens de diffuser l'information : TV, radio, presse, Internet, réseaux sociaux.</p>

    <h3>Les types de médias</h3>
    <ul>
      <li><strong>Médias traditionnels</strong> : journaux (Le Monde, L'Équipe), TV (TF1, France 2), radio</li>
      <li><strong>Médias numériques</strong> : sites web, applications, podcasts</li>
      <li><strong>Réseaux sociaux</strong> : Instagram, TikTok, YouTube, X (Twitter)</li>
    </ul>

    <h3>Les fake news : comment les repérer ?</h3>
    <ul>
      <li><strong>Vérifier la source</strong> : qui a publié l'info ? Est-ce un média fiable ?</li>
      <li><strong>Croiser les sources</strong> : l'info est-elle reprise par d'autres médias ?</li>
      <li><strong>Analyser le titre</strong> : est-il sensationnaliste, exagéré ?</li>
      <li><strong>Vérifier la date</strong> : l'info est-elle récente ou ancienne ?</li>
      <li><strong>Chercher les preuves</strong> : y a-t-il des faits, des chiffres, des témoins ?</li>
    </ul>

    <h3>L'esprit critique</h3>
    <p>Avoir l'esprit critique, c'est ne pas croire tout ce qu'on lit/voit sans réfléchir. C'est se poser des questions !</p>

    <div class="tip">
      💡 <strong>Exemple foot :</strong> "Mbappé quitte le PSG pour 500M€" → Vérifie la source avant d'y croire ! Les rumeurs de transfert sont souvent fausses.
    </div>`,
    '4ème', 1, 10, JSON.stringify(['société', 'médias', 'esprit critique'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Repérer une fake news', 'qcm',
    'Quel est le premier réflexe pour repérer une fake news ?',
    JSON.stringify(['La partager pour avoir des avis', 'Vérifier la source', 'Regarder les commentaires', 'Faire confiance au titre']),
    'Vérifier la source',
    'Le premier réflexe : vérifier QUI a publié l\'information. Est-ce un média fiable ?',
    '4ème', 1, 10, JSON.stringify(['médias']));

  insertExercise.run(courseId, 'culture', 'Croiser les sources', 'truefalse',
    'Pour vérifier une information, il suffit de la lire sur un seul site.',
    JSON.stringify(['Vrai', 'Faux']),
    'Faux',
    'Il faut toujours croiser les sources : vérifier que l\'info est confirmée par plusieurs médias fiables.',
    '4ème', 1, 10, JSON.stringify(['médias']));

  insertExercise.run(courseId, 'culture', 'Types de médias', 'qcm',
    'TikTok est un :',
    JSON.stringify(['Média traditionnel', 'Journal en ligne', 'Réseau social', 'Podcast']),
    'Réseau social',
    'TikTok est un réseau social, un média numérique où les utilisateurs créent et partagent du contenu.',
    '4ème', 1, 10, JSON.stringify(['médias']));

  // Développement durable
  courseId = insertCourse.run('culture', 'Le développement durable et les enjeux écologiques',
    `<h3>Qu'est-ce que le développement durable ?</h3>
    <p>Un développement qui répond aux besoins du présent <strong>sans compromettre</strong> la capacité des générations futures à répondre aux leurs.</p>

    <h3>Les 3 piliers</h3>
    <ul>
      <li><strong>🌍 Environnemental</strong> : protéger la planète (climat, biodiversité, ressources)</li>
      <li><strong>👥 Social</strong> : bien-être des populations (santé, éducation, égalité)</li>
      <li><strong>💰 Économique</strong> : prospérité sans destruction</li>
    </ul>

    <h3>Les grands défis</h3>
    <ul>
      <li><strong>Le réchauffement climatique</strong> : +1,1°C depuis 1850, objectif = limiter à +1,5°C</li>
      <li><strong>La pollution plastique</strong> : 8 millions de tonnes dans les océans par an</li>
      <li><strong>La déforestation</strong> : l'Amazonie perd l'équivalent d'un terrain de foot toutes les 6 secondes</li>
      <li><strong>La biodiversité</strong> : 1 million d'espèces menacées d'extinction</li>
    </ul>

    <h3>Les solutions</h3>
    <ul>
      <li>Énergies renouvelables (solaire, éolien)</li>
      <li>Recyclage et économie circulaire</li>
      <li>Transports propres (vélo, transports en commun, électrique)</li>
      <li>Consommer responsable et local</li>
    </ul>

    <div class="tip">
      💡 <strong>Le foot se met au vert :</strong> De nombreux clubs réduisent leur empreinte carbone : Forest Green Rovers (Angleterre) est le club le plus écolo du monde !
    </div>`,
    '4ème', 2, 11, JSON.stringify(['société', 'écologie', 'développement durable'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', '3 piliers du DD', 'qcm',
    'Quels sont les 3 piliers du développement durable ?',
    JSON.stringify(['Air, eau, terre', 'Environnement, social, économique', 'Liberté, égalité, fraternité', 'Science, culture, sport']),
    'Environnement, social, économique',
    'Les 3 piliers : Environnemental, Social, Économique. Les 3 doivent être en équilibre.',
    '4ème', 1, 10, JSON.stringify(['écologie']));

  insertExercise.run(courseId, 'culture', 'Réchauffement climatique', 'qcm',
    'L\'objectif des accords de Paris est de limiter le réchauffement à :',
    JSON.stringify(['+0,5°C', '+1,5°C', '+3°C', '+5°C']),
    '+1,5°C',
    'L\'objectif est de limiter le réchauffement à +1,5°C par rapport à l\'ère préindustrielle.',
    '4ème', 1, 10, JSON.stringify(['écologie']));

  insertExercise.run(courseId, 'culture', 'Économie circulaire', 'truefalse',
    'L\'économie circulaire vise à réduire les déchets en réutilisant et recyclant les matériaux.',
    JSON.stringify(['Vrai', 'Faux']),
    'Vrai',
    'L\'économie circulaire s\'oppose au modèle linéaire (produire, consommer, jeter) en favorisant le recyclage.',
    '4ème', 1, 10, JSON.stringify(['écologie']));

  // Le monde du sport et la société
  courseId = insertCourse.run('culture', 'Le sport dans la société : pouvoir et valeurs',
    `<h3>Le sport, miroir de la société</h3>
    <p>Le sport reflète les enjeux de notre société : argent, politique, égalité, identité.</p>

    <h3>L'économie du sport</h3>
    <ul>
      <li><strong>Droits TV</strong> : les chaînes paient des milliards pour diffuser les matchs</li>
      <li><strong>Sponsoring</strong> : Nike, Adidas, Emirates investissent dans les clubs</li>
      <li><strong>Transferts</strong> : le marché des joueurs pèse des milliards d'euros</li>
      <li><strong>Merchandising</strong> : maillots, produits dérivés</li>
    </ul>

    <h3>Sport et politique</h3>
    <ul>
      <li><strong>JO Berlin 1936</strong> : Hitler voulait prouver la supériorité aryenne, Jesse Owens (athlète noir américain) a gagné 4 médailles d'or</li>
      <li><strong>Boycotts olympiques</strong> : USA en 1980 (Moscou), URSS en 1984 (Los Angeles)</li>
      <li><strong>Mandela et le rugby</strong> : la Coupe du Monde de rugby 1995 a uni l'Afrique du Sud post-apartheid</li>
    </ul>

    <h3>Sport et valeurs</h3>
    <ul>
      <li><strong>Fair-play</strong> : respect de l'adversaire</li>
      <li><strong>Dépassement de soi</strong> : aller au-delà de ses limites</li>
      <li><strong>Inclusion</strong> : Jeux Paralympiques, mixité</li>
      <li><strong>Lutte contre les discriminations</strong> : racisme, sexisme dans le sport</li>
    </ul>

    <div class="tip">
      💡 <strong>Le genou à terre :</strong> En 2020, les sportifs du monde entier ont posé un genou à terre contre le racisme, montrant que le sport peut être un vecteur de changement social.
    </div>`,
    '4ème', 2, 12, JSON.stringify(['société', 'sport', 'valeurs'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Jesse Owens', 'qcm',
    'Aux JO de Berlin 1936, qui a remporté 4 médailles d\'or face à la propagande nazie ?',
    JSON.stringify(['Usain Bolt', 'Jesse Owens', 'Carl Lewis', 'Mohamed Ali']),
    'Jesse Owens',
    'Jesse Owens, athlète noir américain, a remporté 4 médailles d\'or, contredisant la propagande d\'Hitler.',
    '4ème', 1, 10, JSON.stringify(['sport']));

  insertExercise.run(courseId, 'culture', 'Mandela et rugby', 'qcm',
    'Quel sport a permis à Mandela d\'unir l\'Afrique du Sud en 1995 ?',
    JSON.stringify(['Le football', 'Le rugby', 'Le cricket', 'L\'athlétisme']),
    'Le rugby',
    'La victoire des Springboks à la Coupe du Monde de rugby 1995 a uni la nation arc-en-ciel.',
    '4ème', 1, 10, JSON.stringify(['sport']));

  insertExercise.run(courseId, 'culture', 'Droits TV', 'truefalse',
    'Les droits TV sont une source majeure de revenus pour les clubs de football.',
    JSON.stringify(['Vrai', 'Faux']),
    'Vrai',
    'Les droits TV représentent souvent la principale source de revenus des clubs professionnels.',
    '4ème', 1, 10, JSON.stringify(['sport']));

  // ========================================
  // CULTURE - 6ème (pour Sacha et Adan aussi)
  // ========================================

  courseId = insertCourse.run('culture', 'Les grandes découvertes et explorations',
    `<h3>Pourquoi les Européens sont-ils partis explorer ?</h3>
    <ul>
      <li>Trouver de <strong>nouvelles routes commerciales</strong> vers l'Asie (épices, soie)</li>
      <li><strong>Curiosité</strong> et soif de découverte</li>
      <li>Recherche de <strong>richesses</strong> (or, argent)</li>
      <li>Diffuser la <strong>religion chrétienne</strong></li>
    </ul>

    <h3>Les grands explorateurs</h3>
    <ul>
      <li><strong>🇵🇹 Vasco de Gama</strong> (1498) : route maritime vers l'Inde en contournant l'Afrique</li>
      <li><strong>🇮🇹 Christophe Colomb</strong> (1492) : découvre l'Amérique (en croyant être en Inde !)</li>
      <li><strong>🇵🇹 Magellan</strong> (1519-1522) : premier tour du monde (il meurt en route, ses marins finissent)</li>
      <li><strong>🇬🇧 James Cook</strong> (1768) : explore le Pacifique, l'Australie</li>
    </ul>

    <h3>Les conséquences</h3>
    <ul>
      <li>Échanges de <strong>produits</strong> : tomate, pomme de terre, maïs, chocolat arrivent en Europe !</li>
      <li><strong>Colonisation</strong> : les Européens dominent d'autres peuples</li>
      <li>Maladies apportées aux populations locales</li>
    </ul>

    <div class="tip">
      💡 <strong>Fun fact :</strong> Sans Christophe Colomb, pas de chocolat ni de pommes de terre en France ! Et sans pommes de terre, pas de frites ! 🍟
    </div>`,
    '6ème', 1, 13, JSON.stringify(['histoire', 'explorations', 'découvertes'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Christophe Colomb', 'qcm',
    'Que cherchait Christophe Colomb quand il a découvert l\'Amérique ?',
    JSON.stringify(['L\'Amérique', 'L\'Australie', 'Une route vers l\'Inde', 'Le pôle Nord']),
    'Une route vers l\'Inde',
    'Colomb cherchait une route vers l\'Inde par l\'ouest. Il a trouvé l\'Amérique par hasard !',
    '6ème', 1, 10, JSON.stringify(['histoire']));

  insertExercise.run(courseId, 'culture', 'Premier tour du monde', 'fill',
    'Le premier tour du monde par bateau a été commencé par ...',
    JSON.stringify([]), 'Magellan',
    'Magellan a initié le premier tour du monde en 1519, achevé par son équipage en 1522.',
    '6ème', 1, 10, JSON.stringify(['histoire']));

  insertExercise.run(courseId, 'culture', 'Échanges colombiens', 'qcm',
    'Quel aliment est arrivé en Europe grâce aux grandes découvertes ?',
    JSON.stringify(['Le blé', 'La pomme de terre', 'Le riz', 'L\'olive']),
    'La pomme de terre',
    'La pomme de terre vient d\'Amérique du Sud et a été rapportée en Europe après 1492.',
    '6ème', 1, 10, JSON.stringify(['histoire']));

  // Géographie du monde - 6ème
  courseId = insertCourse.run('culture', 'Géographie : les continents et les océans',
    `<h3>Les 6 continents</h3>
    <ul>
      <li><strong>🌍 Afrique</strong> : 54 pays, 1,4 milliard d'habitants, le Sahara, la savane</li>
      <li><strong>🌏 Asie</strong> : le plus grand continent, 4,7 milliards d'habitants, Chine, Inde, Japon</li>
      <li><strong>🌎 Amérique</strong> : Nord (USA, Canada, Mexique) + Sud (Brésil, Argentine)</li>
      <li><strong>🌍 Europe</strong> : 46 pays, 750 millions d'habitants, diversité culturelle</li>
      <li><strong>🌏 Océanie</strong> : Australie, Nouvelle-Zélande, îles du Pacifique</li>
      <li><strong>🧊 Antarctique</strong> : continent gelé, inhabité (sauf scientifiques)</li>
    </ul>

    <h3>Les 5 océans</h3>
    <ul>
      <li><strong>Pacifique</strong> : le plus grand (plus grand que toutes les terres réunies !)</li>
      <li><strong>Atlantique</strong> : entre l'Europe/Afrique et les Amériques</li>
      <li><strong>Indien</strong> : au sud de l'Asie</li>
      <li><strong>Arctique</strong> : autour du pôle Nord (glacé)</li>
      <li><strong>Austral</strong> : autour de l'Antarctique</li>
    </ul>

    <h3>Quelques records</h3>
    <ul>
      <li>Plus haute montagne : <strong>Everest</strong> (8 849 m)</li>
      <li>Plus long fleuve : <strong>Nil</strong> (6 650 km) ou Amazone (débat !)</li>
      <li>Plus grande forêt : <strong>Amazonie</strong></li>
      <li>Plus grand désert : <strong>Sahara</strong></li>
    </ul>

    <div class="tip">
      💡 <strong>Le savais-tu ?</strong> La Coupe du Monde de foot a déjà été organisée sur 5 des 6 continents. Seule l'Antarctique n'a jamais accueilli l'événement... logique ! 🐧
    </div>`,
    '6ème', 1, 14, JSON.stringify(['géographie', 'continents', 'monde'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Plus grand continent', 'qcm',
    'Quel est le plus grand continent ?',
    JSON.stringify(['L\'Afrique', 'L\'Amérique', 'L\'Asie', 'L\'Europe']),
    'L\'Asie',
    'L\'Asie est le plus grand continent en superficie et en population.',
    '6ème', 1, 10, JSON.stringify(['géographie']));

  insertExercise.run(courseId, 'culture', 'Plus grand océan', 'qcm',
    'Quel est le plus grand océan ?',
    JSON.stringify(['L\'Atlantique', 'L\'Indien', 'Le Pacifique', 'L\'Arctique']),
    'Le Pacifique',
    'Le Pacifique est le plus grand océan, plus vaste que toutes les terres réunies !',
    '6ème', 1, 10, JSON.stringify(['géographie']));

  insertExercise.run(courseId, 'culture', 'Plus haute montagne', 'fill',
    'La plus haute montagne du monde est l\'...',
    JSON.stringify([]), 'Everest',
    'L\'Everest culmine à 8 849 mètres, dans l\'Himalaya (frontière Népal-Tibet).',
    '6ème', 1, 10, JSON.stringify(['géographie']));

  insertExercise.run(courseId, 'culture', 'Pays d\'Afrique', 'qcm',
    'Combien de pays compte le continent africain ?',
    JSON.stringify(['27', '38', '54', '72']),
    '54',
    'L\'Afrique compte 54 pays reconnus par l\'ONU.',
    '6ème', 1, 10, JSON.stringify(['géographie']));

  // Les religions du monde - 6ème
  courseId = insertCourse.run('culture', 'Les grandes religions du monde',
    `<h3>Les religions les plus pratiquées</h3>

    <h3>✝️ Le christianisme (~2,4 milliards)</h3>
    <ul>
      <li>Livre sacré : la <strong>Bible</strong></li>
      <li>Fondateur : <strong>Jésus-Christ</strong></li>
      <li>Branches : catholiques, protestants, orthodoxes</li>
      <li>Lieu de culte : l'<strong>église</strong></li>
    </ul>

    <h3>☪️ L'islam (~1,9 milliard)</h3>
    <ul>
      <li>Livre sacré : le <strong>Coran</strong></li>
      <li>Prophète : <strong>Mahomet</strong> (Muhammad)</li>
      <li>5 piliers : profession de foi, prière, aumône, jeûne, pèlerinage</li>
      <li>Lieu de culte : la <strong>mosquée</strong></li>
    </ul>

    <h3>🕉️ L'hindouisme (~1,2 milliard)</h3>
    <ul>
      <li>Principalement en <strong>Inde</strong></li>
      <li>Pas de fondateur unique, très ancienne</li>
      <li>Croyance en la réincarnation</li>
    </ul>

    <h3>☸️ Le bouddhisme (~500 millions)</h3>
    <ul>
      <li>Fondateur : <strong>Bouddha</strong> (Siddhartha Gautama)</li>
      <li>Recherche de l'<strong>éveil</strong> et la fin de la souffrance</li>
    </ul>

    <h3>✡️ Le judaïsme (~15 millions)</h3>
    <ul>
      <li>Livre sacré : la <strong>Torah</strong></li>
      <li>Plus ancienne religion monothéiste</li>
    </ul>

    <h3>La laïcité en France</h3>
    <p>En France, l'État est <strong>laïc</strong> (loi de 1905) : séparation de l'Église et de l'État. Chacun est libre de croire ou non.</p>

    <div class="tip">
      💡 <strong>Tolérance :</strong> Connaître les religions, c'est mieux comprendre les autres cultures et vivre ensemble dans le respect.
    </div>`,
    '6ème', 1, 15, JSON.stringify(['culture', 'religions', 'monde'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Religion la plus pratiquée', 'qcm',
    'Quelle est la religion la plus pratiquée dans le monde ?',
    JSON.stringify(['L\'islam', 'Le christianisme', 'L\'hindouisme', 'Le bouddhisme']),
    'Le christianisme',
    'Le christianisme est la religion la plus pratiquée avec environ 2,4 milliards de fidèles.',
    '6ème', 1, 10, JSON.stringify(['culture']));

  insertExercise.run(courseId, 'culture', 'Laïcité', 'qcm',
    'La laïcité en France, c\'est :',
    JSON.stringify(['L\'interdiction des religions', 'La séparation de l\'Église et de l\'État', 'L\'obligation d\'être athée', 'La supériorité d\'une religion']),
    'La séparation de l\'Église et de l\'État',
    'La laïcité = l\'État ne favorise aucune religion. Chacun est libre de croire ou non.',
    '6ème', 1, 10, JSON.stringify(['culture']));

  insertExercise.run(courseId, 'culture', 'Livre sacré de l\'islam', 'fill',
    'Le livre sacré de l\'islam est le ...',
    JSON.stringify([]), 'Coran',
    'Le Coran est le livre sacré de l\'islam, considéré comme la parole de Dieu.',
    '6ème', 1, 10, JSON.stringify(['culture']));

  // La France dans le monde - 6ème
  courseId = insertCourse.run('culture', 'La France dans le monde',
    `<h3>La France : une puissance mondiale</h3>

    <h3>Quelques chiffres</h3>
    <ul>
      <li><strong>68 millions</strong> d'habitants</li>
      <li><strong>7ème puissance économique</strong> mondiale</li>
      <li>Membre permanent du <strong>Conseil de sécurité de l'ONU</strong></li>
      <li>Puissance <strong>nucléaire</strong></li>
      <li>2ème plus grande zone maritime au monde (grâce aux DOM-TOM)</li>
    </ul>

    <h3>La France d'outre-mer</h3>
    <ul>
      <li><strong>Guadeloupe, Martinique</strong> : Caraïbes</li>
      <li><strong>Guyane</strong> : Amérique du Sud (base spatiale de Kourou !)</li>
      <li><strong>La Réunion, Mayotte</strong> : océan Indien</li>
      <li><strong>Nouvelle-Calédonie, Polynésie</strong> : Pacifique</li>
    </ul>

    <h3>Le soft power français</h3>
    <ul>
      <li><strong>Gastronomie</strong> : cuisine française au patrimoine mondial UNESCO</li>
      <li><strong>Culture</strong> : Tour Eiffel, Louvre, cinéma (Festival de Cannes)</li>
      <li><strong>Langue</strong> : le français parlé sur 5 continents (321 millions de francophones)</li>
      <li><strong>Sport</strong> : organisation de grandes compétitions (JO Paris 2024, Euro, Roland-Garros)</li>
      <li><strong>Luxe et mode</strong> : LVMH, Chanel, Dior</li>
    </ul>

    <div class="tip">
      💡 <strong>Grâce au foot :</strong> L'équipe de France "Black-Blanc-Beur" de 1998 a montré au monde l'image d'une France diverse et unie. Le sport comme vitrine !
    </div>`,
    '6ème', 1, 16, JSON.stringify(['géographie', 'france', 'monde'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'culture', 'Population de la France', 'qcm',
    'Combien d\'habitants compte la France ?',
    JSON.stringify(['45 millions', '58 millions', '68 millions', '82 millions']),
    '68 millions',
    'La France compte environ 68 millions d\'habitants (métropole + outre-mer).',
    '6ème', 1, 10, JSON.stringify(['france']));

  insertExercise.run(courseId, 'culture', 'DOM-TOM', 'qcm',
    'La base spatiale européenne de Kourou se trouve en :',
    JSON.stringify(['Guadeloupe', 'Martinique', 'Guyane', 'Réunion']),
    'Guyane',
    'La base spatiale de Kourou est en Guyane française, en Amérique du Sud.',
    '6ème', 1, 10, JSON.stringify(['france']));

  insertExercise.run(courseId, 'culture', 'Conseil de sécurité ONU', 'truefalse',
    'La France est membre permanent du Conseil de sécurité de l\'ONU.',
    JSON.stringify(['Vrai', 'Faux']),
    'Vrai',
    'La France est l\'un des 5 membres permanents du Conseil de sécurité (avec USA, Russie, Chine, Royaume-Uni).',
    '6ème', 1, 10, JSON.stringify(['france']));

  // Ajouter les stats culture pour tous les enfants
  const children = db.prepare("SELECT id FROM users WHERE role = 'child'").all();
  for (const child of children) {
    const statExists = db.prepare("SELECT COUNT(*) as count FROM user_stats WHERE user_id = ? AND subject = 'culture'").get(child.id);
    if (statExists.count === 0) {
      db.prepare("INSERT INTO user_stats (user_id, subject) VALUES (?, 'culture')").run(child.id);
    }
  }

  console.log('🌍 Contenu Culture Générale chargé ! (géopolitique, civilisations, économie, société)');
}

module.exports = { seedCulture };
