/**
 * Arts Créatifs - Peinture, Collage, Sculpture, Soudure, Warhammer
 * Orienté Adan (6ème, passionné Warhammer, art, imagination, dyslexique)
 * Techniques pratiques + histoire de l'art
 */

function seedArts(db) {
  const existing = db.prepare("SELECT COUNT(*) as count FROM courses WHERE subject = 'arts'").get();
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
  // TECHNIQUES DE PEINTURE
  // ========================================

  courseId = insertCourse.run('arts', 'Les bases de la peinture : couleurs et mélanges',
    `<h3>La roue des couleurs</h3>

    <h3>Les couleurs primaires</h3>
    <p>Ce sont les 3 couleurs qu'on ne peut pas fabriquer en mélangeant d'autres couleurs :</p>
    <ul>
      <li>🔴 <strong>Rouge</strong></li>
      <li>🔵 <strong>Bleu</strong></li>
      <li>🟡 <strong>Jaune</strong></li>
    </ul>

    <h3>Les couleurs secondaires</h3>
    <p>On les obtient en mélangeant 2 primaires :</p>
    <ul>
      <li>🔴 + 🟡 = 🟠 <strong>Orange</strong></li>
      <li>🔵 + 🟡 = 🟢 <strong>Vert</strong></li>
      <li>🔴 + 🔵 = 🟣 <strong>Violet</strong></li>
    </ul>

    <h3>Couleurs chaudes vs froides</h3>
    <ul>
      <li><strong>Chaudes</strong> : rouge, orange, jaune → énergie, puissance, feu</li>
      <li><strong>Froides</strong> : bleu, vert, violet → calme, eau, nature</li>
    </ul>

    <h3>Les types de peinture</h3>
    <ul>
      <li><strong>Acrylique</strong> : sèche vite, facile à utiliser, se nettoie à l'eau. Idéal pour débuter et pour peindre les figurines !</li>
      <li><strong>Aquarelle</strong> : transparente, effets de lumière, délicate</li>
      <li><strong>Gouache</strong> : opaque, couvrante, couleurs vives</li>
      <li><strong>Huile</strong> : sèche lentement, couleurs riches (utilisée par les grands maîtres)</li>
    </ul>

    <div class="tip">
      💡 <strong>Pour Warhammer :</strong> La peinture acrylique Citadel est spécialement conçue pour les figurines. Les techniques : base coat, wash, dry brush, highlights !
    </div>`,
    '6ème', 1, 1, JSON.stringify(['peinture', 'couleurs', 'bases'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'arts', 'Couleurs primaires', 'qcm',
    'Quelles sont les 3 couleurs primaires ?',
    JSON.stringify(['Rouge, vert, bleu', 'Rouge, jaune, bleu', 'Rouge, orange, violet', 'Jaune, vert, orange']),
    'Rouge, jaune, bleu',
    'Les 3 primaires : rouge, jaune, bleu. En les mélangeant, on obtient toutes les autres !',
    '6ème', 1, 10, JSON.stringify(['peinture']));

  insertExercise.run(courseId, 'arts', 'Mélange rouge+jaune', 'fill',
    'Quel couleur obtient-on en mélangeant rouge et jaune ?',
    JSON.stringify([]), 'orange',
    'Rouge + jaune = orange. C\'est une couleur secondaire.',
    '6ème', 1, 10, JSON.stringify(['peinture']));

  insertExercise.run(courseId, 'arts', 'Type de peinture figurines', 'qcm',
    'Quelle peinture est la plus adaptée pour les figurines Warhammer ?',
    JSON.stringify(['Huile', 'Aquarelle', 'Acrylique', 'Gouache']),
    'Acrylique',
    'L\'acrylique sèche vite et se nettoie à l\'eau. Parfaite pour les figurines !',
    '6ème', 1, 10, JSON.stringify(['peinture']));

  // Techniques de peinture avancées (figurines)
  courseId = insertCourse.run('arts', 'Peindre des figurines : techniques pro',
    `<h3>Les étapes pour peindre une figurine</h3>

    <h3>1. Préparation</h3>
    <ul>
      <li><strong>Ébarbage</strong> : enlever les bavures du moule au cutter</li>
      <li><strong>Assemblage</strong> : coller les pièces (colle plastique ou super glue)</li>
      <li><strong>Sous-couche</strong> (primer) : spray noir ou blanc pour que la peinture accroche</li>
    </ul>

    <h3>2. Base coat (couche de base)</h3>
    <p>Appliquer la couleur principale sur chaque zone. Plusieurs couches fines valent mieux qu'une grosse couche !</p>

    <h3>3. Wash (lavis)</h3>
    <p>Peinture très diluée (Nuln Oil, Agrax Earthshade) qui coule dans les creux pour créer des <strong>ombres naturelles</strong>.</p>

    <h3>4. Dry brush (brossage à sec)</h3>
    <p>Peu de peinture sur le pinceau, on frotte légèrement pour faire ressortir les <strong>reliefs</strong>.</p>

    <h3>5. Highlights (éclaircissements)</h3>
    <p>Peindre les <strong>arêtes et bords</strong> avec une couleur plus claire pour un effet 3D.</p>

    <h3>6. Détails et finition</h3>
    <p>Yeux, symboles, gemmes, bases... Les petits détails font toute la différence !</p>

    <div class="shopping-list">
      <h4>🛒 Matériel de base</h4>
      <ul>
        <li>Set de pinceaux (fin, moyen, large)</li>
        <li>Peintures Citadel : base + shade + layer</li>
        <li>Spray sous-couche (Chaos Black ou Corax White)</li>
        <li>Palette humide (ou assiette + papier humide)</li>
        <li>Verre d'eau et essuie-tout</li>
      </ul>
    </div>

    <div class="tip">
      💡 <strong>Règle d'or :</strong> "Deux couches fines valent mieux qu'une couche épaisse !" Dilue légèrement ta peinture pour un résultat lisse.
    </div>`,
    '6ème', 1, 2, JSON.stringify(['peinture', 'figurines', 'warhammer'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'arts', 'Ordre des étapes', 'qcm',
    'Quelle est la bonne ordre des étapes pour peindre une figurine ?',
    JSON.stringify(['Wash → Base → Highlights', 'Base → Highlights → Wash', 'Sous-couche → Base → Wash → Highlights', 'Highlights → Wash → Base']),
    'Sous-couche → Base → Wash → Highlights',
    'L\'ordre : sous-couche (primer) → base coat → wash (ombres) → dry brush/highlights (lumières).',
    '6ème', 1, 10, JSON.stringify(['figurines']));

  insertExercise.run(courseId, 'arts', 'Le wash', 'qcm',
    'À quoi sert le wash (lavis) ?',
    JSON.stringify(['Éclaircir les couleurs', 'Créer des ombres dans les creux', 'Coller les pièces', 'Protéger la peinture']),
    'Créer des ombres dans les creux',
    'Le wash est une peinture très diluée qui coule dans les creux pour créer des ombres naturelles.',
    '6ème', 1, 10, JSON.stringify(['figurines']));

  insertExercise.run(courseId, 'arts', 'Dry brush', 'fill',
    'La technique qui consiste à frotter un pinceau presque sec pour faire ressortir les reliefs s\'appelle le ... brush.',
    JSON.stringify([]), 'dry',
    'Dry brush (brossage à sec) : peu de peinture, on frotte pour éclaircir les reliefs.',
    '6ème', 1, 10, JSON.stringify(['figurines']));

  // Le collage et techniques mixtes
  courseId = insertCourse.run('arts', 'Le collage et les techniques mixtes',
    `<h3>L'art du collage</h3>
    <p>Le collage consiste à assembler différents <strong>matériaux</strong> (papier, tissu, photos, objets) sur un support pour créer une œuvre.</p>

    <h3>Types de collage</h3>
    <ul>
      <li><strong>Collage papier</strong> : découpage et assemblage de papiers colorés, magazines, journaux</li>
      <li><strong>Photomontage</strong> : assemblage de photos découpées</li>
      <li><strong>Collage 3D</strong> : objets en volume collés sur un support</li>
      <li><strong>Mixed media</strong> : mélange peinture + collage + dessin + objets</li>
    </ul>

    <h3>Artistes célèbres du collage</h3>
    <ul>
      <li><strong>Pablo Picasso</strong> : inventeur du collage cubiste (1912)</li>
      <li><strong>Henri Matisse</strong> : ses fameux "papiers découpés" (La Danse, etc.)</li>
      <li><strong>Kurt Schwitters</strong> : collages avec des déchets et objets trouvés</li>
    </ul>

    <h3>Techniques pratiques</h3>
    <ul>
      <li><strong>Déchirer vs découper</strong> : déchirer donne un effet organique, découper un effet net</li>
      <li><strong>Superposition</strong> : jouer avec les couches et la transparence</li>
      <li><strong>Texture</strong> : utiliser des matériaux variés (tissu, sable, ficelle, feuilles)</li>
      <li><strong>Composition</strong> : penser à l'équilibre visuel de l'ensemble</li>
    </ul>

    <div class="tip">
      💡 <strong>Projet Warhammer :</strong> Crée un décor pour tes figurines en mixed media ! Carton, sable, colle PVA, peinture = un champ de bataille réaliste.
    </div>`,
    '6ème', 1, 3, JSON.stringify(['collage', 'techniques mixtes', 'art'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'arts', 'Inventeur du collage', 'qcm',
    'Quel artiste est considéré comme l\'inventeur du collage en art ?',
    JSON.stringify(['Matisse', 'Picasso', 'Monet', 'Van Gogh']),
    'Picasso',
    'Pablo Picasso a réalisé le premier collage cubiste en 1912 ("Nature morte à la chaise cannée").',
    '6ème', 1, 10, JSON.stringify(['collage']));

  insertExercise.run(courseId, 'arts', 'Mixed media', 'qcm',
    'Le "mixed media" c\'est :',
    JSON.stringify(['Un type de colle', 'Le mélange de plusieurs techniques artistiques', 'Une marque de peinture', 'Un style de dessin']),
    'Le mélange de plusieurs techniques artistiques',
    'Mixed media = techniques mixtes : on mélange peinture, collage, dessin et matériaux divers.',
    '6ème', 1, 10, JSON.stringify(['collage']));

  insertExercise.run(courseId, 'arts', 'Papiers découpés', 'fill',
    'L\'artiste célèbre pour ses "papiers découpés" colorés est Henri ...',
    JSON.stringify([]), 'Matisse',
    'Henri Matisse est célèbre pour ses papiers découpés réalisés à la fin de sa vie.',
    '6ème', 1, 10, JSON.stringify(['collage']));

  // La sculpture et le modelage
  courseId = insertCourse.run('arts', 'Sculpture et modelage : créer en 3D',
    `<h3>La sculpture : donner forme à la matière</h3>

    <h3>Les techniques de sculpture</h3>
    <ul>
      <li><strong>Le modelage</strong> : ajouter de la matière (argile, pâte à modeler, Green Stuff)</li>
      <li><strong>La taille</strong> : enlever de la matière (bois, pierre, plâtre)</li>
      <li><strong>Le moulage</strong> : couler un matériau dans un moule</li>
      <li><strong>L'assemblage</strong> : assembler des éléments (soudure, collage, vis)</li>
    </ul>

    <h3>Matériaux courants</h3>
    <ul>
      <li><strong>Argile / terre</strong> : le classique, se travaille humide</li>
      <li><strong>Green Stuff</strong> : résine époxy bi-composant, idéal pour les conversions de figurines</li>
      <li><strong>Milliput</strong> : comme le Green Stuff mais se ponce une fois sec</li>
      <li><strong>Pâte Fimo</strong> : durcit au four, couleurs variées</li>
      <li><strong>Plâtre</strong> : moulage et sculpture</li>
      <li><strong>Fil de fer / armature</strong> : squelette pour les sculptures</li>
    </ul>

    <h3>Sculpter une figurine custom</h3>
    <ol>
      <li>Créer une <strong>armature en fil de fer</strong> (le squelette)</li>
      <li>Appliquer le <strong>Green Stuff</strong> par couches successives</li>
      <li>Sculpter les <strong>formes de base</strong> (torse, membres)</li>
      <li>Ajouter les <strong>détails</strong> (visage, armure, vêtements)</li>
      <li>Laisser <strong>durcir</strong> puis peindre</li>
    </ol>

    <div class="tip">
      💡 <strong>Conversion Warhammer :</strong> Transforme une figurine basique en création unique avec du Green Stuff ! Change la pose, ajoute des détails, crée tes propres personnages.
    </div>`,
    '6ème', 1, 4, JSON.stringify(['sculpture', 'modelage', '3D'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'arts', 'Modelage vs taille', 'qcm',
    'Quelle est la différence entre modelage et taille ?',
    JSON.stringify(['Il n\'y en a pas', 'Modelage = ajouter de la matière / Taille = en enlever', 'Modelage = bois / Taille = argile', 'Modelage = grand / Taille = petit']),
    'Modelage = ajouter de la matière / Taille = en enlever',
    'Modelage : on ajoute (argile, pâte). Taille : on enlève (pierre, bois). Deux approches opposées !',
    '6ème', 1, 10, JSON.stringify(['sculpture']));

  insertExercise.run(courseId, 'arts', 'Green Stuff', 'qcm',
    'Le Green Stuff est :',
    JSON.stringify(['Une peinture verte', 'Une résine époxy pour sculpter', 'Un type de colle', 'Un outil de découpe']),
    'Une résine époxy pour sculpter',
    'Le Green Stuff est une résine époxy bi-composant utilisée pour sculpter des détails et conversions.',
    '6ème', 1, 10, JSON.stringify(['sculpture']));

  insertExercise.run(courseId, 'arts', 'Armature', 'fill',
    'Le squelette d\'une sculpture s\'appelle une ...',
    JSON.stringify([]), 'armature',
    'L\'armature (en fil de fer ou fil d\'aluminium) sert de squelette pour soutenir la sculpture.',
    '6ème', 1, 10, JSON.stringify(['sculpture']));

  // Soudure et assemblage
  courseId = insertCourse.run('arts', 'Initiation à la soudure et à l\'assemblage',
    `<h3>La soudure : assembler des métaux</h3>
    <p>La soudure consiste à <strong>joindre des pièces métalliques</strong> en les chauffant. C'est utilisé en art, en électronique, et en construction.</p>

    <h3>Types de soudure accessibles</h3>
    <ul>
      <li><strong>Soudure à l'étain</strong> (fer à souder) : pour l'électronique et les petits assemblages. Basse température (~350°C)</li>
      <li><strong>Brasure</strong> : assemblage de métaux avec un métal d'apport</li>
      <li><strong>Collage métal</strong> : colle époxy métal pour les débutants</li>
    </ul>

    <h3>Sécurité d'abord !</h3>
    <ul>
      <li>⚠️ <strong>Toujours avec un adulte</strong></li>
      <li>🥽 Lunettes de protection</li>
      <li>🧤 Gants anti-chaleur</li>
      <li>💨 Ventilation (les fumées sont nocives)</li>
      <li>🔥 Support anti-feu pour le fer à souder</li>
    </ul>

    <h3>Premier projet : souder un circuit LED</h3>
    <ol>
      <li>Rassembler : fer à souder, étain, LED, résistance, pile, fils</li>
      <li>Chauffer le fer à souder (attendre 2-3 minutes)</li>
      <li>Placer les composants sur la platine</li>
      <li>Toucher le joint avec le fer ET l'étain</li>
      <li>L'étain fond et crée le joint → retirer le fer</li>
      <li>Vérifier que la LED s'allume !</li>
    </ol>

    <div class="shopping-list">
      <h4>🛒 Kit soudure débutant</h4>
      <ul>
        <li>Fer à souder 30W réglable (~15€)</li>
        <li>Fil d'étain sans plomb</li>
        <li>Support fer à souder</li>
        <li>Éponge nettoyage</li>
        <li>Kit LEDs + résistances + platine d'essai</li>
      </ul>
    </div>

    <div class="tip">
      💡 <strong>Lien Warhammer :</strong> La soudure permet de créer des éclairages LED pour tes décors et véhicules ! Imagine un Land Raider avec des phares qui s'allument vraiment !
    </div>`,
    '6ème', 2, 5, JSON.stringify(['soudure', 'assemblage', 'technique'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'arts', 'Sécurité soudure', 'qcm',
    'Quel équipement n\'est PAS nécessaire pour souder ?',
    JSON.stringify(['Lunettes de protection', 'Ventilation', 'Un casque audio', 'Un support anti-feu']),
    'Un casque audio',
    'Lunettes, ventilation et support anti-feu sont obligatoires. Un casque audio n\'est pas utile !',
    '6ème', 1, 10, JSON.stringify(['soudure']));

  insertExercise.run(courseId, 'arts', 'Température soudure étain', 'qcm',
    'La soudure à l\'étain se fait à environ :',
    JSON.stringify(['50°C', '150°C', '350°C', '1000°C']),
    '350°C',
    'Le fer à souder pour l\'électronique fonctionne autour de 350°C.',
    '6ème', 1, 10, JSON.stringify(['soudure']));

  insertExercise.run(courseId, 'arts', 'Qui doit accompagner', 'truefalse',
    'Un enfant de 11 ans peut souder seul sans surveillance.',
    JSON.stringify(['Vrai', 'Faux']),
    'Faux',
    'La soudure doit TOUJOURS se faire avec un adulte. C\'est une question de sécurité !',
    '6ème', 1, 10, JSON.stringify(['soudure']));

  // Histoire de l'art
  courseId = insertCourse.run('arts', 'Les grands mouvements artistiques',
    `<h3>L'art à travers les siècles</h3>

    <h3>🏛️ L'art antique</h3>
    <p>Égypte (pyramides, hiéroglyphes) · Grèce (sculptures, temples) · Rome (mosaïques, Colisée)</p>

    <h3>⛪ L'art médiéval</h3>
    <p>Vitraux des cathédrales, enluminures, tapisseries (Bayeux). Art au service de la religion.</p>

    <h3>🎨 La Renaissance (1400-1600)</h3>
    <p>Retour à l'art antique, perspective, anatomie. <strong>De Vinci</strong> (La Joconde), <strong>Michel-Ange</strong> (Sixtine), <strong>Raphaël</strong>.</p>

    <h3>🌻 L'Impressionnisme (1860-1900)</h3>
    <p>Peindre la lumière et l'instant. <strong>Monet</strong> (Nymphéas), <strong>Renoir</strong>, <strong>Degas</strong>. Touches de couleur, plein air.</p>

    <h3>🔲 L'art moderne (1900-1970)</h3>
    <ul>
      <li><strong>Cubisme</strong> (Picasso) : formes géométriques, plusieurs angles à la fois</li>
      <li><strong>Surréalisme</strong> (Dalí) : le rêve, l'inconscient</li>
      <li><strong>Pop Art</strong> (Warhol) : culture populaire, publicité</li>
      <li><strong>Art abstrait</strong> (Kandinsky, Mondrian) : pas de représentation du réel</li>
    </ul>

    <h3>🎮 L'art contemporain</h3>
    <p>Street art (Banksy), art numérique, installations, performance, concept art pour les jeux vidéo et les univers fantastiques comme Warhammer !</p>

    <div class="tip">
      💡 <strong>Warhammer et l'art :</strong> Les illustrateurs de Games Workshop s'inspirent de la Renaissance (armures), du gothique (cathédrales) et du surréalisme (le Chaos) !
    </div>`,
    '6ème', 1, 6, JSON.stringify(['histoire de l\'art', 'mouvements artistiques'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'arts', 'La Joconde', 'qcm',
    'Qui a peint La Joconde ?',
    JSON.stringify(['Michel-Ange', 'Raphaël', 'Léonard de Vinci', 'Picasso']),
    'Léonard de Vinci',
    'La Joconde (Mona Lisa) a été peinte par Léonard de Vinci vers 1503-1506.',
    '6ème', 1, 10, JSON.stringify(['histoire de l\'art']));

  insertExercise.run(courseId, 'arts', 'Impressionnisme', 'qcm',
    'L\'impressionnisme se caractérise par :',
    JSON.stringify(['Des formes géométriques', 'La peinture de la lumière et l\'instant', 'Des images de rêve', 'L\'art de la publicité']),
    'La peinture de la lumière et l\'instant',
    'Les impressionnistes peignaient en plein air pour capturer la lumière et le moment.',
    '6ème', 1, 10, JSON.stringify(['histoire de l\'art']));

  insertExercise.run(courseId, 'arts', 'Pop Art', 'fill',
    'Le mouvement Pop Art, célèbre pour ses boîtes de soupe Campbell, est représenté par Andy ...',
    JSON.stringify([]), 'Warhol',
    'Andy Warhol est l\'artiste emblématique du Pop Art (boîtes Campbell, portraits de Marilyn Monroe).',
    '6ème', 1, 10, JSON.stringify(['histoire de l\'art']));

  // Le dessin et la perspective
  courseId = insertCourse.run('arts', 'Le dessin : perspective et proportions',
    `<h3>Les bases du dessin</h3>

    <h3>La perspective</h3>
    <p>La perspective permet de donner l'illusion de la <strong>profondeur</strong> sur un dessin plat.</p>
    <ul>
      <li><strong>Perspective à 1 point de fuite</strong> : toutes les lignes convergent vers un point sur l'horizon</li>
      <li><strong>Perspective à 2 points de fuite</strong> : plus réaliste, pour les bâtiments vus en angle</li>
    </ul>

    <h3>Les proportions du corps humain</h3>
    <ul>
      <li>Le corps = environ <strong>7-8 têtes</strong> de hauteur</li>
      <li>Les mains arrivent à <strong>mi-cuisse</strong></li>
      <li>Les coudes sont au niveau de la <strong>taille</strong></li>
      <li>Les yeux sont au <strong>milieu</strong> du visage (pas en haut !)</li>
    </ul>

    <h3>Les ombres et la lumière</h3>
    <ul>
      <li>Identifier la <strong>source de lumière</strong></li>
      <li><strong>Ombre propre</strong> : sur l'objet, côté opposé à la lumière</li>
      <li><strong>Ombre portée</strong> : projetée sur le sol/mur</li>
      <li>Utiliser les <strong>hachures</strong> ou l'estompe pour les dégradés</li>
    </ul>

    <h3>Le concept art</h3>
    <p>Le concept art, c'est dessiner les personnages, décors et objets AVANT qu'ils soient modélisés en 3D pour les jeux vidéo et les films.</p>

    <div class="tip">
      💡 <strong>Exercice pratique :</strong> Dessine un Space Marine de face en respectant les proportions : tête (casque inclus), torse large, jambes en armure. Commence par le squelette (stick figure) !
    </div>`,
    '6ème', 1, 7, JSON.stringify(['dessin', 'perspective', 'proportions'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'arts', 'Perspective point de fuite', 'qcm',
    'Dans une perspective à 1 point de fuite, les lignes convergent vers :',
    JSON.stringify(['Le bas du dessin', 'Le haut du dessin', 'Un point sur la ligne d\'horizon', 'Les coins de la feuille']),
    'Un point sur la ligne d\'horizon',
    'Le point de fuite est sur la ligne d\'horizon. Toutes les lignes de profondeur y convergent.',
    '6ème', 1, 10, JSON.stringify(['dessin']));

  insertExercise.run(courseId, 'arts', 'Proportions corps', 'qcm',
    'Le corps humain mesure environ combien de "têtes" de hauteur ?',
    JSON.stringify(['3-4 têtes', '5-6 têtes', '7-8 têtes', '10-12 têtes']),
    '7-8 têtes',
    'Le corps humain adulte mesure environ 7 à 8 fois la hauteur de la tête.',
    '6ème', 1, 10, JSON.stringify(['dessin']));

  insertExercise.run(courseId, 'arts', 'Ombre portée', 'fill',
    'L\'ombre qui est projetée sur le sol par un objet s\'appelle l\'ombre ...',
    JSON.stringify([]), 'portée',
    'Ombre portée = projetée sur une surface. Ombre propre = sur l\'objet lui-même.',
    '6ème', 1, 10, JSON.stringify(['dessin']));

  // Créer des décors (terrain building)
  courseId = insertCourse.run('arts', 'Terrain building : créer des décors et dioramas',
    `<h3>L'art du décor miniature</h3>
    <p>Le terrain building, c'est créer des <strong>décors réalistes</strong> pour les figurines. Ça combine sculpture, peinture, collage et imagination !</p>

    <h3>Matériaux de base</h3>
    <ul>
      <li><strong>Polystyrène extrudé</strong> (XPS) : facile à découper, parfait pour les murs, ruines, collines</li>
      <li><strong>Carton plume / carton</strong> : sols, murs, structures</li>
      <li><strong>Sable et gravier</strong> : pour texturer les sols</li>
      <li><strong>Colle PVA</strong> : colle blanche, fixe le sable, sèche transparente</li>
      <li><strong>Végétation</strong> : herbe statique, mousse, branchages</li>
    </ul>

    <h3>Projet : une ruine gothique</h3>
    <ol>
      <li>Découper les murs dans le polystyrène</li>
      <li>Graver les briques avec un stylo bille</li>
      <li>Assembler avec des cure-dents et de la colle</li>
      <li>Texturer le sol : colle PVA + sable</li>
      <li>Sous-couche spray noir</li>
      <li>Peinture : gris, dry brush blanc/beige</li>
      <li>Ajouter la végétation et les détails</li>
    </ol>

    <h3>Techniques avancées</h3>
    <ul>
      <li><strong>Effets d'eau</strong> : résine UV ou vernis brillant</li>
      <li><strong>LEDs</strong> : éclairage intérieur (braseros, lampes)</li>
      <li><strong>Pigments</strong> : rouille, poussière, mousse</li>
    </ul>

    <div class="tip">
      💡 <strong>Récupération :</strong> Beaucoup de matériaux sont gratuits ! Bouchons, bâtonnets de glace, moustiquaire (pour grillage), fils électriques...
    </div>`,
    '6ème', 1, 8, JSON.stringify(['décors', 'diorama', 'terrain building'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'arts', 'Matériau décors', 'qcm',
    'Quel matériau est le plus utilisé pour découper des murs de décor ?',
    JSON.stringify(['Le bois', 'Le polystyrène extrudé', 'Le métal', 'Le verre']),
    'Le polystyrène extrudé',
    'Le polystyrène extrudé (XPS) est facile à découper, léger et bon marché. Idéal pour les décors !',
    '6ème', 1, 10, JSON.stringify(['décors']));

  insertExercise.run(courseId, 'arts', 'Colle PVA', 'qcm',
    'La colle PVA sert principalement à :',
    JSON.stringify(['Coller le métal', 'Fixer le sable et texturer les surfaces', 'Souder des fils', 'Peindre les figurines']),
    'Fixer le sable et texturer les surfaces',
    'La colle PVA (colle blanche) est parfaite pour fixer sable et gravier sur les socles et décors.',
    '6ème', 1, 10, JSON.stringify(['décors']));

  insertExercise.run(courseId, 'arts', 'Graver les briques', 'fill',
    'Pour graver des briques dans le polystyrène, on utilise un ... bille.',
    JSON.stringify([]), 'stylo',
    'Un stylo bille permet de graver facilement des lignes de briques dans le polystyrène.',
    '6ème', 1, 10, JSON.stringify(['décors']));

  // Design et composition
  courseId = insertCourse.run('arts', 'Design et composition visuelle',
    `<h3>Les règles de composition</h3>

    <h3>La règle des tiers</h3>
    <p>Divise ton image en 9 cases (3×3). Place les éléments importants sur les <strong>lignes</strong> ou aux <strong>intersections</strong> pour un résultat plus dynamique qu'un centrage simple.</p>

    <h3>L'équilibre visuel</h3>
    <ul>
      <li><strong>Symétrie</strong> : calme, ordre, stabilité</li>
      <li><strong>Asymétrie</strong> : dynamisme, tension, mouvement</li>
      <li><strong>Poids visuel</strong> : les éléments sombres/grands "pèsent" plus</li>
    </ul>

    <h3>Le contraste</h3>
    <ul>
      <li><strong>Clair / sombre</strong> : attire l'œil</li>
      <li><strong>Grand / petit</strong> : donne de l'échelle</li>
      <li><strong>Couleurs complémentaires</strong> : rouge/vert, bleu/orange → vibrant !</li>
    </ul>

    <h3>L'espace négatif</h3>
    <p>L'espace vide autour du sujet est aussi important que le sujet lui-même. Il laisse "respirer" l'image.</p>

    <h3>Application aux figurines</h3>
    <ul>
      <li>Le <strong>contraste de couleurs</strong> rend ta figurine lisible même de loin</li>
      <li>Un <strong>socle thématique</strong> raconte une histoire</li>
      <li>Les <strong>couleurs spot</strong> (petites touches de couleur vive) attirent l'œil</li>
    </ul>

    <div class="tip">
      💡 <strong>Astuce peinture :</strong> Sur une figurine sombre, un détail rouge vif (yeux, gemme, sceau) attire immédiatement le regard. C'est la couleur spot !
    </div>`,
    '6ème', 1, 9, JSON.stringify(['design', 'composition', 'visuel'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'arts', 'Règle des tiers', 'qcm',
    'La règle des tiers divise l\'image en :',
    JSON.stringify(['2 parties', '4 parties', '9 cases (3×3)', '16 cases (4×4)']),
    '9 cases (3×3)',
    'La règle des tiers : 2 lignes horizontales + 2 lignes verticales = 9 cases.',
    '6ème', 1, 10, JSON.stringify(['design']));

  insertExercise.run(courseId, 'arts', 'Couleurs complémentaires', 'qcm',
    'Quelle paire de couleurs est complémentaire ?',
    JSON.stringify(['Rouge et orange', 'Bleu et orange', 'Vert et jaune', 'Violet et bleu']),
    'Bleu et orange',
    'Les couleurs complémentaires sont opposées sur la roue : bleu/orange, rouge/vert, jaune/violet.',
    '6ème', 1, 10, JSON.stringify(['design']));

  insertExercise.run(courseId, 'arts', 'Couleur spot', 'fill',
    'Une petite touche de couleur vive sur une figurine sombre qui attire l\'œil s\'appelle une couleur ...',
    JSON.stringify([]), 'spot',
    'La couleur spot est un petit accent de couleur vive qui crée un point focal sur la figurine.',
    '6ème', 1, 10, JSON.stringify(['design']));

  // Ajouter les stats arts pour tous les enfants
  const children = db.prepare("SELECT id FROM users WHERE role = 'child'").all();
  for (const child of children) {
    const statExists = db.prepare("SELECT COUNT(*) as count FROM user_stats WHERE user_id = ? AND subject = 'arts'").get(child.id);
    if (statExists.count === 0) {
      db.prepare("INSERT INTO user_stats (user_id, subject) VALUES (?, 'arts')").run(child.id);
    }
  }

  console.log('🎨 Contenu Arts Créatifs chargé ! (peinture, collage, sculpture, soudure, décors, design)');
}

module.exports = { seedArts };
