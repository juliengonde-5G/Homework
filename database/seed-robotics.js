/**
 * Parcours Robotique & Programmation pour Sacha
 * Programme complet : de zéro à robot autonome
 * Lié au programme Éducation Nationale (Technologie 6ème/5ème)
 * Adapté au profil PCM Rebelle + dyslexie
 */

function seedRobotics(db) {
  // Vérifier si le contenu robotique existe déjà
  const existing = db.prepare("SELECT COUNT(*) as count FROM courses WHERE subject = 'techno'").get();
  if (existing.count > 0) return;

  const insertCourse = db.prepare(`
    INSERT INTO courses (subject, title, content, level, difficulty, order_index, tags, media_url, video_url, duration_minutes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertExercise = db.prepare(`
    INSERT INTO exercises (course_id, subject, title, type, question, options, correct_answer, explanation, level, difficulty, points, tags, media_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let courseId;

  // ============================================================
  // PHASE 1 : LES BASES DE LA PROGRAMMATION (Semaines 1-4)
  // ============================================================

  // --- Module 1 : C'est quoi un algorithme ? ---
  courseId = insertCourse.run('techno',
    'C\'est quoi un algorithme ?',
    `<h3>Un algorithme, c'est une recette !</h3>
    <p>Imagine que tu veux faire un sandwich. Tu suis des étapes :</p>
    <ol>
      <li>Prendre le pain</li>
      <li>Mettre le beurre</li>
      <li>Ajouter le jambon</li>
      <li>Refermer le pain</li>
    </ol>
    <p><strong>Ça, c'est un algorithme !</strong> Une suite d'instructions dans un ordre précis.</p>

    <h3>Les robots suivent des algorithmes</h3>
    <p>Un robot ne peut rien faire tout seul. Il suit des instructions qu'on lui donne. Si tu oublies une étape... il fait n'importe quoi !</p>

    <div class="example">
      <strong>Exemple de la vie réelle :</strong><br>
      Algorithme pour traverser la route :<br>
      1. Regarder à gauche<br>
      2. Regarder à droite<br>
      3. Si pas de voiture → traverser<br>
      4. Sinon → attendre et recommencer à l'étape 1
    </div>

    <h3>Les 3 briques de base</h3>
    <ul>
      <li><strong>La séquence</strong> : faire les choses dans l'ordre</li>
      <li><strong>La condition</strong> : si... alors... sinon...</li>
      <li><strong>La boucle</strong> : répéter une action</li>
    </ul>

    <div class="tip">
      💡 <strong>Le savais-tu ?</strong> Le mot "algorithme" vient d'un mathématicien perse du 9ème siècle : Al-Khwarizmi !
    </div>

    <div class="shopping-list">
      🛒 <strong>Pas besoin de matériel pour ce module !</strong> Juste ton cerveau et un papier.
    </div>`,
    '6ème', 1, 1,
    JSON.stringify(['algorithme', 'bases', 'logique', 'phase1']),
    null,
    'https://www.youtube.com/watch?v=6hfOvs8pY1k',
    10
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'C\'est quoi un algorithme ?', 'qcm',
    'Un algorithme, c\'est quoi ?',
    JSON.stringify(['Un robot', 'Une suite d\'instructions dans un ordre précis', 'Un ordinateur', 'Un jeu vidéo']),
    'Une suite d\'instructions dans un ordre précis',
    'Un algorithme = une recette, une série d\'étapes à suivre dans l\'ordre !',
    '6ème', 1, 10, JSON.stringify(['algorithme']), null);

  insertExercise.run(courseId, 'techno', 'Les 3 briques', 'qcm',
    'Quelles sont les 3 briques de base d\'un algorithme ?',
    JSON.stringify(['Séquence, condition, boucle', 'Début, milieu, fin', 'Lire, écrire, compter', 'Input, output, process']),
    'Séquence, condition, boucle',
    'Séquence (l\'ordre), Condition (si/alors), Boucle (répéter). C\'est tout ce qu\'il faut !',
    '6ème', 1, 10, JSON.stringify(['algorithme']), null);

  insertExercise.run(courseId, 'techno', 'Trouver l\'erreur', 'qcm',
    'Algorithme pour faire du thé : 1. Mettre l\'eau à chauffer 2. Boire le thé 3. Mettre le sachet dans la tasse 4. Verser l\'eau. Quel est le problème ?',
    JSON.stringify(['Il manque du sucre', 'Les étapes sont dans le désordre', 'Il faut du café', 'C\'est parfait']),
    'Les étapes sont dans le désordre',
    'On ne peut pas boire le thé avant de l\'avoir préparé ! L\'ordre compte dans un algorithme.',
    '6ème', 1, 10, JSON.stringify(['algorithme']), null);

  insertExercise.run(courseId, 'techno', 'Condition dans l\'algo', 'qcm',
    'Dans l\'algorithme "Si il pleut → prendre un parapluie, sinon → mettre des lunettes de soleil", que fait-on quand il fait beau ?',
    JSON.stringify(['Prendre un parapluie', 'Mettre des lunettes de soleil', 'Rester à la maison', 'Rien du tout']),
    'Mettre des lunettes de soleil',
    'Quand la condition "il pleut" est fausse, on exécute le "sinon" : lunettes de soleil !',
    '6ème', 1, 10, JSON.stringify(['algorithme', 'condition']), null);

  // --- Module 2 : Scratch - Programmer sans écrire de code ---
  courseId = insertCourse.run('techno',
    'Scratch - Programmer sans écrire',
    `<h3>Scratch, c'est quoi ?</h3>
    <p><strong>Scratch</strong> est un logiciel gratuit créé par le MIT (une des meilleures universités du monde). Tu programmes en assemblant des blocs colorés, comme des LEGO !</p>

    <h3>Comment ça marche ?</h3>
    <ul>
      <li><strong>Les blocs bleus</strong> : mouvement (avancer, tourner)</li>
      <li><strong>Les blocs violets</strong> : apparence (dire, changer de costume)</li>
      <li><strong>Les blocs jaunes</strong> : événements (quand on clique...)</li>
      <li><strong>Les blocs oranges</strong> : contrôle (si, répéter)</li>
    </ul>

    <h3>Ton premier programme</h3>
    <div class="example">
      <strong>Fais bouger le chat :</strong><br>
      1. Va sur <strong>scratch.mit.edu</strong><br>
      2. Clique "Créer"<br>
      3. Glisse le bloc "avancer de 10 pas"<br>
      4. Ajoute "tourner de 15 degrés"<br>
      5. Mets une boucle "répéter 24 fois"<br>
      6. Clique sur le drapeau vert → Le chat fait un cercle !
    </div>

    <h3>Pourquoi Scratch avant Python ?</h3>
    <p>Scratch permet de comprendre la logique sans se battre avec l'écriture du code. Une fois que tu maîtrises les blocs, Python sera facile !</p>

    <div class="tip">
      💡 <strong>Défi :</strong> Crée un mini-jeu sur Scratch ! Un personnage qui se déplace avec les flèches et attrape des objets.
    </div>

    <div class="shopping-list">
      🛒 <strong>Matériel :</strong> Un ordinateur ou tablette avec accès internet → <a href="https://scratch.mit.edu" target="_blank">scratch.mit.edu</a> (gratuit !)
    </div>`,
    '6ème', 1, 2,
    JSON.stringify(['scratch', 'programmation visuelle', 'bases', 'phase1']),
    null,
    'https://www.youtube.com/watch?v=VIpmkeqJhmQ',
    15
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Scratch c\'est quoi ?', 'qcm',
    'Scratch est un logiciel de programmation qui utilise...',
    JSON.stringify(['Du texte à taper', 'Des blocs colorés à assembler', 'Des formules mathématiques', 'Des dessins à tracer']),
    'Des blocs colorés à assembler',
    'Scratch utilise des blocs colorés qu\'on assemble comme des LEGO pour créer des programmes !',
    '6ème', 1, 10, JSON.stringify(['scratch']), null);

  insertExercise.run(courseId, 'techno', 'Les blocs de mouvement', 'qcm',
    'De quelle couleur sont les blocs de mouvement dans Scratch ?',
    JSON.stringify(['Jaune', 'Orange', 'Bleu', 'Violet']),
    'Bleu',
    'Les blocs bleus servent au mouvement : avancer, tourner, aller à une position.',
    '6ème', 1, 10, JSON.stringify(['scratch']), null);

  insertExercise.run(courseId, 'techno', 'Faire un cercle', 'qcm',
    'Pour faire un cercle avec le chat Scratch, il faut combiner "avancer" et...',
    JSON.stringify(['"dire bonjour"', '"tourner de quelques degrés"', '"changer de costume"', '"jouer un son"']),
    '"tourner de quelques degrés"',
    'Avancer + tourner un peu, le tout dans une boucle = un cercle !',
    '6ème', 1, 10, JSON.stringify(['scratch']), null);

  // --- Module 3 : Variables et conditions ---
  courseId = insertCourse.run('techno',
    'Variables et conditions - Si... alors...',
    `<h3>C'est quoi une variable ?</h3>
    <p>Une variable, c'est une <strong>boîte avec une étiquette</strong> dans laquelle tu ranges une information.</p>

    <div class="example">
      <strong>Exemples :</strong><br>
      📦 age = 11 → la boîte "age" contient le nombre 11<br>
      📦 prenom = "Sacha" → la boîte "prenom" contient le texte "Sacha"<br>
      📦 score = 0 → la boîte "score" contient 0 (pour l'instant !)
    </div>

    <h3>Les conditions : Si... Alors... Sinon</h3>
    <p>Les conditions permettent au programme de <strong>prendre des décisions</strong>.</p>

    <div class="example">
      <strong>En français :</strong><br>
      Si score >= 10 alors afficher "Bravo !"<br>
      Sinon afficher "Continue, tu vas y arriver !"<br><br>
      <strong>En Python :</strong><br>
      <code>if score >= 10:<br>&nbsp;&nbsp;print("Bravo !")<br>else:<br>&nbsp;&nbsp;print("Continue !")</code>
    </div>

    <h3>Les comparaisons</h3>
    <ul>
      <li><strong>==</strong> : est égal à</li>
      <li><strong>!=</strong> : est différent de</li>
      <li><strong>></strong> : est plus grand que</li>
      <li><strong><</strong> : est plus petit que</li>
      <li><strong>>=</strong> : est plus grand ou égal</li>
    </ul>

    <h3>Lien avec la robotique</h3>
    <p>Un robot utilise des conditions tout le temps :</p>
    <div class="example">
      Si obstacle_devant == vrai alors tourner_a_droite()<br>
      Sinon avancer()
    </div>

    <div class="tip">
      💡 <strong>Dans Scratch :</strong> Le bloc orange "si... alors..." fait exactement la même chose !
    </div>`,
    '6ème', 1, 3,
    JSON.stringify(['variables', 'conditions', 'logique', 'phase1']),
    null,
    'https://www.youtube.com/watch?v=Eaz5e6M8tL4',
    12
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'C\'est quoi une variable ?', 'qcm',
    'Une variable en programmation, c\'est...',
    JSON.stringify(['Un nombre qui ne change jamais', 'Une boîte avec une étiquette qui contient une information', 'Un type de robot', 'Une erreur dans le code']),
    'Une boîte avec une étiquette qui contient une information',
    'Une variable = une boîte étiquetée. On peut y mettre un nombre, du texte, etc.',
    '6ème', 1, 10, JSON.stringify(['variables']), null);

  insertExercise.run(courseId, 'techno', 'Que vaut la variable ?', 'qcm',
    'Si on écrit : score = 5, puis score = score + 3. Que vaut score ?',
    JSON.stringify(['5', '3', '8', '53']),
    '8',
    'score commence à 5, puis on ajoute 3. 5 + 3 = 8 !',
    '6ème', 1, 10, JSON.stringify(['variables']), null);

  insertExercise.run(courseId, 'techno', 'Condition du robot', 'qcm',
    'Si temperature > 30 alors ventilateur = "ON". Il fait 25°C. Que fait le ventilateur ?',
    JSON.stringify(['Il s\'allume', 'Il reste éteint', 'Il explose', 'On ne sait pas']),
    'Il reste éteint',
    '25 n\'est PAS plus grand que 30, donc la condition est fausse. Le ventilateur reste éteint.',
    '6ème', 1, 10, JSON.stringify(['conditions']), null);

  insertExercise.run(courseId, 'techno', 'Quel symbole ?', 'qcm',
    'Pour vérifier si deux valeurs sont égales en Python, on utilise...',
    JSON.stringify(['=', '==', '!=', '>=']),
    '==',
    '= sert à donner une valeur (score = 5). == sert à comparer (score == 5 ?).',
    '6ème', 1, 10, JSON.stringify(['conditions']), null);

  // --- Module 4 : Les boucles ---
  courseId = insertCourse.run('techno',
    'Les boucles - Répéter des actions',
    `<h3>Pourquoi des boucles ?</h3>
    <p>Imagine que tu veux écrire "Bonjour" 100 fois. Tu ne vas pas écrire 100 lignes ! Une boucle le fait pour toi.</p>

    <h3>La boucle "for" (pour)</h3>
    <div class="example">
      <strong>En français :</strong><br>
      Pour i allant de 1 à 10 : afficher i<br><br>
      <strong>En Python :</strong><br>
      <code>for i in range(10):<br>&nbsp;&nbsp;print(i)</code><br><br>
      Résultat : 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
    </div>

    <h3>La boucle "while" (tant que)</h3>
    <div class="example">
      <strong>En français :</strong><br>
      Tant que le robot n'a pas trouvé le mur : avancer<br><br>
      <strong>En Python :</strong><br>
      <code>while not mur_detecte:<br>&nbsp;&nbsp;avancer()</code>
    </div>

    <h3>Boucle infinie = DANGER !</h3>
    <p>Si tu oublies la condition d'arrêt, le programme tourne à l'infini. C'est comme un robot qui avance sans jamais s'arrêter... CRASH ! 💥</p>

    <h3>En robotique</h3>
    <p>Le programme principal d'un robot est UNE GRANDE BOUCLE :</p>
    <div class="example">
      <code>while True:  # boucle infinie (volontaire !)<br>
      &nbsp;&nbsp;lire_capteurs()<br>
      &nbsp;&nbsp;prendre_decision()<br>
      &nbsp;&nbsp;bouger_moteurs()</code>
    </div>

    <div class="tip">
      💡 <strong>Astuce :</strong> Dans Scratch, c'est le bloc "répéter X fois" ou "répéter indéfiniment".
    </div>`,
    '6ème', 1, 4,
    JSON.stringify(['boucles', 'programmation', 'phase1']),
    null,
    'https://www.youtube.com/watch?v=wxds6MAtUQ0',
    12
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Pourquoi une boucle ?', 'qcm',
    'Pourquoi utilise-t-on des boucles en programmation ?',
    JSON.stringify(['Pour rendre le code plus joli', 'Pour répéter des actions sans tout réécrire', 'Pour aller plus vite', 'Pour faire des erreurs']),
    'Pour répéter des actions sans tout réécrire',
    'Une boucle évite de copier-coller le même code 100 fois !',
    '6ème', 1, 10, JSON.stringify(['boucles']), null);

  insertExercise.run(courseId, 'techno', 'Combien de fois ?', 'qcm',
    'for i in range(5): print("hey") → Combien de fois "hey" s\'affiche ?',
    JSON.stringify(['4 fois', '5 fois', '6 fois', '1 fois']),
    '5 fois',
    'range(5) va de 0 à 4, soit 5 valeurs. Donc "hey" s\'affiche 5 fois.',
    '6ème', 1, 10, JSON.stringify(['boucles']), null);

  insertExercise.run(courseId, 'techno', 'Boucle du robot', 'qcm',
    'Le programme principal d\'un robot est généralement...',
    JSON.stringify(['Une seule instruction', 'Une grande boucle qui tourne en permanence', 'Un fichier texte', 'Un dessin']),
    'Une grande boucle qui tourne en permanence',
    'Le robot lit ses capteurs, décide, bouge... et recommence. C\'est une boucle infinie !',
    '6ème', 1, 10, JSON.stringify(['boucles', 'robotique']), null);

  // --- Module 5 : Python - Premier programme ---
  courseId = insertCourse.run('techno',
    'Python - Ton premier programme',
    `<h3>Pourquoi Python ?</h3>
    <p>Python est le langage le plus utilisé au monde. Il est :</p>
    <ul>
      <li>Simple à lire (presque comme de l'anglais)</li>
      <li>Utilisé pour les robots, l'IA, les jeux, les sites web</li>
      <li>Gratuit et disponible partout</li>
    </ul>

    <h3>Installer Python</h3>
    <p>Tu peux coder en ligne sans rien installer : <strong>replit.com</strong> ou <strong>trinket.io</strong></p>
    <p>Ou installer Python sur ton PC : <strong>python.org</strong></p>

    <h3>Ton premier programme</h3>
    <div class="example">
      <code>print("Salut Sacha !")</code><br>
      → Affiche : Salut Sacha !
    </div>

    <h3>Programme interactif</h3>
    <div class="example">
      <code>prenom = input("Comment tu t'appelles ? ")<br>
      age = int(input("Tu as quel âge ? "))<br>
      print(f"Salut {prenom} ! Tu as {age} ans.")<br>
      if age >= 12:<br>
      &nbsp;&nbsp;print("Tu es au collège !")<br>
      else:<br>
      &nbsp;&nbsp;print("Bientôt le collège !")</code>
    </div>

    <h3>Les types de données</h3>
    <ul>
      <li><strong>str</strong> (texte) : "Bonjour", "Sacha"</li>
      <li><strong>int</strong> (nombre entier) : 11, 42, -5</li>
      <li><strong>float</strong> (nombre décimal) : 3.14, 9.99</li>
      <li><strong>bool</strong> (vrai/faux) : True, False</li>
    </ul>

    <div class="tip">
      💡 <strong>Défi :</strong> Crée un programme qui demande ton âge et dit combien d'années il te reste avant 18 ans !
    </div>

    <div class="shopping-list">
      🛒 <strong>Matériel :</strong> Un ordi avec accès internet → <a href="https://replit.com" target="_blank">replit.com</a> (gratuit, rien à installer)
    </div>`,
    '6ème', 1, 5,
    JSON.stringify(['python', 'premier programme', 'phase1']),
    null,
    'https://www.youtube.com/watch?v=kqtD5dpn9C8',
    15
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Afficher du texte', 'qcm',
    'Comment afficher "Bonjour" en Python ?',
    JSON.stringify(['echo "Bonjour"', 'print("Bonjour")', 'display("Bonjour")', 'write("Bonjour")']),
    'print("Bonjour")',
    'En Python, on utilise print() pour afficher du texte à l\'écran.',
    '6ème', 1, 10, JSON.stringify(['python']), null);

  insertExercise.run(courseId, 'techno', 'Type de donnée', 'qcm',
    'Quel est le type de la valeur "Sacha" en Python ?',
    JSON.stringify(['int', 'float', 'str', 'bool']),
    'str',
    '"Sacha" est du texte (string = str). Les guillemets indiquent que c\'est du texte.',
    '6ème', 1, 10, JSON.stringify(['python']), null);

  insertExercise.run(courseId, 'techno', 'input() sert à...', 'qcm',
    'À quoi sert input() en Python ?',
    JSON.stringify(['Afficher du texte', 'Demander une information à l\'utilisateur', 'Faire un calcul', 'Dessiner']),
    'Demander une information à l\'utilisateur',
    'input() attend que l\'utilisateur tape quelque chose au clavier.',
    '6ème', 1, 10, JSON.stringify(['python']), null);

  // ============================================================
  // PHASE 2 : L'ÉLECTRONIQUE (Semaines 5-8)
  // ============================================================

  // --- Module 6 : L'électricité - Les bases ---
  courseId = insertCourse.run('techno',
    'L\'électricité - Courant, tension, résistance',
    `<h3>C'est quoi l'électricité ?</h3>
    <p>L'électricité, c'est le <strong>mouvement des électrons</strong> dans un fil. Imagine de l'eau qui coule dans un tuyau :</p>
    <ul>
      <li><strong>La tension (Volts)</strong> = la pression de l'eau → pousse les électrons</li>
      <li><strong>Le courant (Ampères)</strong> = le débit d'eau → quantité d'électrons qui passent</li>
      <li><strong>La résistance (Ohms)</strong> = un rétrécissement du tuyau → freine les électrons</li>
    </ul>

    <h3>La loi d'Ohm</h3>
    <div class="example">
      <strong>U = R × I</strong><br>
      Tension = Résistance × Courant<br><br>
      Exemple : Une LED a besoin de 2V et 20mA.<br>
      Avec une pile de 5V, la résistance nécessaire :<br>
      R = (5 - 2) / 0.02 = <strong>150 Ohms</strong>
    </div>

    <h3>Le circuit électrique</h3>
    <p>L'électricité a besoin d'un <strong>circuit fermé</strong> pour circuler :</p>
    <ul>
      <li>Source d'énergie (pile, USB) → fil → composant → retour à la source</li>
      <li>Si le circuit est ouvert (fil coupé) → rien ne se passe</li>
    </ul>

    <h3>Sécurité</h3>
    <p>Avec Arduino et des piles, il n'y a <strong>aucun danger</strong>. On travaille en 5V maximum. Mais ne touche JAMAIS une prise murale (230V) !</p>

    <div class="tip">
      💡 <strong>Lien maths :</strong> La loi d'Ohm, c'est une équation ! U = R × I. Si tu connais 2 valeurs, tu trouves la 3ème.
    </div>

    <div class="shopping-list">
      🛒 <strong>Matériel suggéré :</strong><br>
      - Kit Arduino Starter (environ 35€) - contient tout le nécessaire !<br>
      Recommandé : <strong>ELEGOO Kit de Démarrage Arduino UNO R3</strong>
    </div>`,
    '6ème', 1, 6,
    JSON.stringify(['électricité', 'physique', 'circuit', 'phase2']),
    null,
    'https://www.youtube.com/watch?v=mc979OhitAg',
    12
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'La tension', 'qcm',
    'La tension électrique se mesure en...',
    JSON.stringify(['Ampères', 'Ohms', 'Volts', 'Watts']),
    'Volts',
    'La tension se mesure en Volts (V). C\'est la "pression" qui pousse les électrons.',
    '6ème', 1, 10, JSON.stringify(['électricité']), null);

  insertExercise.run(courseId, 'techno', 'Loi d\'Ohm', 'qcm',
    'Quelle est la loi d\'Ohm ?',
    JSON.stringify(['U = R + I', 'U = R × I', 'U = R / I', 'U = R - I']),
    'U = R × I',
    'U = R × I. Tension = Résistance × Courant. La formule magique de l\'électricité !',
    '6ème', 1, 10, JSON.stringify(['électricité']), null);

  insertExercise.run(courseId, 'techno', 'Circuit fermé', 'truefalse',
    'L\'électricité peut circuler dans un circuit ouvert (fil coupé). Vrai ou faux ?',
    JSON.stringify(['Vrai', 'Faux']),
    'Faux',
    'FAUX ! L\'électricité a besoin d\'un circuit FERMÉ pour circuler. Fil coupé = pas de courant.',
    '6ème', 1, 10, JSON.stringify(['électricité']), null);

  // --- Module 7 : Arduino - Ton premier microcontrôleur ---
  courseId = insertCourse.run('techno',
    'Arduino - Ton premier microcontrôleur',
    `<h3>C'est quoi Arduino ?</h3>
    <p>Un <strong>Arduino</strong> est un petit ordinateur de la taille d'une carte bancaire. Il peut :</p>
    <ul>
      <li>Lire des <strong>capteurs</strong> (température, distance, lumière)</li>
      <li>Contrôler des <strong>actionneurs</strong> (LED, moteurs, buzzers)</li>
      <li>Exécuter <strong>ton programme</strong> en boucle</li>
    </ul>

    <h3>Les composants de l'Arduino UNO</h3>
    <ul>
      <li><strong>Port USB</strong> : pour le brancher à l'ordinateur et le programmer</li>
      <li><strong>Pins digitaux (0-13)</strong> : envoyer/recevoir des signaux ON/OFF</li>
      <li><strong>Pins analogiques (A0-A5)</strong> : lire des valeurs (0 à 1023)</li>
      <li><strong>Pin 5V et GND</strong> : alimentation et masse (le "moins")</li>
      <li><strong>LED intégrée (pin 13)</strong> : une LED déjà sur la carte !</li>
    </ul>

    <h3>Le logiciel Arduino IDE</h3>
    <p>Télécharge <strong>Arduino IDE</strong> gratuitement sur arduino.cc. C'est là que tu écris tes programmes !</p>

    <h3>Structure d'un programme Arduino</h3>
    <div class="example">
      <code>void setup() {<br>
      &nbsp;&nbsp;// S'exécute 1 seule fois au démarrage<br>
      &nbsp;&nbsp;pinMode(13, OUTPUT); // Pin 13 en sortie<br>
      }<br><br>
      void loop() {<br>
      &nbsp;&nbsp;// Se répète en boucle infinie<br>
      &nbsp;&nbsp;digitalWrite(13, HIGH); // Allumer LED<br>
      &nbsp;&nbsp;delay(1000);            // Attendre 1 seconde<br>
      &nbsp;&nbsp;digitalWrite(13, LOW);  // Éteindre LED<br>
      &nbsp;&nbsp;delay(1000);            // Attendre 1 seconde<br>
      }</code>
    </div>

    <div class="tip">
      💡 <strong>C'est comme Python mais en C++ !</strong> setup() = ce qui se passe au début, loop() = la boucle infinie du robot.
    </div>

    <div class="shopping-list">
      🛒 <strong>Matériel nécessaire :</strong><br>
      - <strong>Arduino UNO R3</strong> (ou compatible ELEGOO) ~12€<br>
      - <strong>Câble USB</strong> (inclus dans le kit)<br>
      - <strong>Breadboard</strong> (plaque d'essai) ~3€<br>
      - <strong>Kit de fils</strong> (jumper wires) ~4€<br>
      → Tout est inclus dans le kit ELEGOO (~35€)
    </div>`,
    '6ème', 2, 7,
    JSON.stringify(['arduino', 'microcontrôleur', 'électronique', 'phase2']),
    null,
    'https://www.youtube.com/watch?v=fJWR7dBag0g',
    15
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Arduino c\'est quoi ?', 'qcm',
    'Un Arduino est...',
    JSON.stringify(['Un gros ordinateur', 'Un petit ordinateur programmable', 'Un jeu vidéo', 'Un robot tout fait']),
    'Un petit ordinateur programmable',
    'L\'Arduino est un petit ordinateur programmable qui lit des capteurs et contrôle des moteurs/LED.',
    '6ème', 2, 15, JSON.stringify(['arduino']), null);

  insertExercise.run(courseId, 'techno', 'setup() et loop()', 'qcm',
    'Dans un programme Arduino, setup() s\'exécute...',
    JSON.stringify(['En boucle', '1 seule fois au démarrage', 'Quand on appuie un bouton', 'Jamais']),
    '1 seule fois au démarrage',
    'setup() = 1 fois au démarrage pour configurer. loop() = en boucle pour le programme principal.',
    '6ème', 2, 15, JSON.stringify(['arduino']), null);

  insertExercise.run(courseId, 'techno', 'Allumer une LED', 'qcm',
    'Pour allumer une LED sur le pin 13, on utilise...',
    JSON.stringify(['digitalWrite(13, HIGH)', 'analogRead(13)', 'print(13)', 'turnOn(13)']),
    'digitalWrite(13, HIGH)',
    'digitalWrite(pin, HIGH) envoie du courant. HIGH = allumé, LOW = éteint.',
    '6ème', 2, 15, JSON.stringify(['arduino']), null);

  // --- Module 8 : Capteurs - Le robot voit et entend ---
  courseId = insertCourse.run('techno',
    'Les capteurs - Le robot voit et entend',
    `<h3>Les sens du robot</h3>
    <p>Un robot "voit" et "sent" grâce à ses <strong>capteurs</strong>. C'est comme ses yeux, ses oreilles et ses mains !</p>

    <h3>Les capteurs principaux</h3>
    <ul>
      <li><strong>Capteur ultrasonique (HC-SR04)</strong> : mesure la distance (comme un sonar de chauve-souris). Portée : 2 cm à 4 m.</li>
      <li><strong>Capteur infrarouge (IR)</strong> : détecte le noir/blanc (pour suivre une ligne)</li>
      <li><strong>Capteur de lumière (LDR)</strong> : mesure la luminosité</li>
      <li><strong>Capteur de température (DHT11)</strong> : mesure la température et l'humidité</li>
      <li><strong>Bouton poussoir</strong> : le capteur le plus simple ! ON ou OFF</li>
    </ul>

    <h3>Lire un capteur avec Arduino</h3>
    <div class="example">
      <strong>Capteur de distance :</strong><br>
      <code>#include "NewPing.h"<br>
      NewPing sonar(7, 8, 200); // trig=7, echo=8, max=200cm<br><br>
      void loop() {<br>
      &nbsp;&nbsp;int distance = sonar.ping_cm();<br>
      &nbsp;&nbsp;if (distance < 20) {<br>
      &nbsp;&nbsp;&nbsp;&nbsp;// Obstacle proche ! Tourner<br>
      &nbsp;&nbsp;&nbsp;&nbsp;tourner();<br>
      &nbsp;&nbsp;} else {<br>
      &nbsp;&nbsp;&nbsp;&nbsp;avancer();<br>
      &nbsp;&nbsp;}<br>
      }</code>
    </div>

    <h3>Analogique vs Digital</h3>
    <ul>
      <li><strong>Digital</strong> = ON ou OFF (0 ou 1). Ex: bouton, IR</li>
      <li><strong>Analogique</strong> = une valeur entre 0 et 1023. Ex: lumière, température</li>
    </ul>

    <div class="tip">
      💡 <strong>Lien sciences :</strong> Le capteur ultrasonique utilise les ondes sonores, comme les dauphins ! Il envoie un "bip" et mesure le temps avant le retour de l'écho.
    </div>

    <div class="shopping-list">
      🛒 <strong>Matériel :</strong> Tout est dans le kit ELEGOO !<br>
      - Capteur HC-SR04 (distance)<br>
      - Capteurs IR (suivi de ligne)<br>
      - LED + résistances<br>
      - Boutons poussoir
    </div>`,
    '6ème', 2, 8,
    JSON.stringify(['capteurs', 'électronique', 'arduino', 'phase2']),
    null,
    'https://www.youtube.com/watch?v=ZzKNcuaSEKQ',
    15
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Capteur de distance', 'qcm',
    'Le capteur HC-SR04 mesure...',
    JSON.stringify(['La température', 'La distance', 'La couleur', 'Le poids']),
    'La distance',
    'Le HC-SR04 utilise des ultrasons pour mesurer la distance. Comme un sonar !',
    '6ème', 2, 15, JSON.stringify(['capteurs']), null);

  insertExercise.run(courseId, 'techno', 'Analogique vs digital', 'qcm',
    'Un bouton poussoir est un capteur...',
    JSON.stringify(['Analogique (valeurs de 0 à 1023)', 'Digital (ON ou OFF)', 'Les deux', 'Ni l\'un ni l\'autre']),
    'Digital (ON ou OFF)',
    'Un bouton a 2 états : appuyé (ON/1) ou relâché (OFF/0). C\'est digital.',
    '6ème', 2, 15, JSON.stringify(['capteurs']), null);

  insertExercise.run(courseId, 'techno', 'Le sonar du robot', 'qcm',
    'Comment le capteur ultrasonique mesure la distance ?',
    JSON.stringify(['Il regarde avec une caméra', 'Il envoie un son et mesure le temps de retour', 'Il pèse l\'objet', 'Il utilise un laser']),
    'Il envoie un son et mesure le temps de retour',
    'Le capteur envoie un ultrason et chronomètre le temps avant que l\'écho revienne.',
    '6ème', 2, 15, JSON.stringify(['capteurs']), null);

  // ============================================================
  // PHASE 3 : LA MÉCANIQUE (Semaines 9-12)
  // ============================================================

  // --- Module 9 : Les moteurs ---
  courseId = insertCourse.run('techno',
    'Les moteurs - Faire bouger le robot',
    `<h3>Les types de moteurs</h3>
    <ul>
      <li><strong>Moteur DC (courant continu)</strong> : tourne en continu, contrôle la vitesse. Pour les roues !</li>
      <li><strong>Servo-moteur</strong> : se positionne à un angle précis (0° à 180°). Pour la direction, un bras...</li>
      <li><strong>Moteur pas à pas (stepper)</strong> : très précis, avance "pas par pas". Pour les imprimantes 3D !</li>
    </ul>

    <h3>Le driver moteur (L298N ou L293D)</h3>
    <p>L'Arduino ne peut pas alimenter un moteur directement (pas assez puissant). On utilise un <strong>driver</strong> = un amplificateur de puissance.</p>

    <div class="example">
      <strong>Contrôler un moteur DC :</strong><br>
      <code>// Pins du driver moteur<br>
      int ENA = 9;  // Vitesse (PWM)<br>
      int IN1 = 8;  // Direction 1<br>
      int IN2 = 7;  // Direction 2<br><br>
      void avancer() {<br>
      &nbsp;&nbsp;digitalWrite(IN1, HIGH);<br>
      &nbsp;&nbsp;digitalWrite(IN2, LOW);<br>
      &nbsp;&nbsp;analogWrite(ENA, 200); // Vitesse 0-255<br>
      }<br><br>
      void reculer() {<br>
      &nbsp;&nbsp;digitalWrite(IN1, LOW);<br>
      &nbsp;&nbsp;digitalWrite(IN2, HIGH);<br>
      &nbsp;&nbsp;analogWrite(ENA, 200);<br>
      }</code>
    </div>

    <h3>Servo-moteur</h3>
    <div class="example">
      <code>#include <Servo.h><br>
      Servo monServo;<br><br>
      void setup() {<br>
      &nbsp;&nbsp;monServo.attach(9); // Pin 9<br>
      }<br>
      void loop() {<br>
      &nbsp;&nbsp;monServo.write(0);   // Aller à 0°<br>
      &nbsp;&nbsp;delay(1000);<br>
      &nbsp;&nbsp;monServo.write(90);  // Aller à 90°<br>
      &nbsp;&nbsp;delay(1000);<br>
      &nbsp;&nbsp;monServo.write(180); // Aller à 180°<br>
      &nbsp;&nbsp;delay(1000);<br>
      }</code>
    </div>

    <div class="tip">
      💡 <strong>Lien maths :</strong> La vitesse du moteur se contrôle avec un signal PWM (0-255). C'est une proportion : 128 = 50% de puissance !
    </div>

    <div class="shopping-list">
      🛒 <strong>Matériel :</strong><br>
      - 2 moteurs DC + roues (~8€)<br>
      - 1 driver moteur L298N (~5€)<br>
      - 1 servo-moteur SG90 (~3€)<br>
      - Piles 9V ou pack 4xAA<br>
      → Ou kit robot complet ELEGOO Smart Robot Car V4 (~70€)
    </div>`,
    '6ème', 2, 9,
    JSON.stringify(['moteurs', 'mécanique', 'arduino', 'phase3']),
    null,
    'https://www.youtube.com/watch?v=LXURLvga8bQ',
    15
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Types de moteurs', 'qcm',
    'Quel type de moteur se positionne à un angle précis ?',
    JSON.stringify(['Moteur DC', 'Servo-moteur', 'Moteur pas à pas', 'Moteur diesel']),
    'Servo-moteur',
    'Le servo-moteur peut aller à un angle précis (0° à 180°). Parfait pour une tête de robot !',
    '6ème', 2, 15, JSON.stringify(['moteurs']), null);

  insertExercise.run(courseId, 'techno', 'Le driver moteur', 'qcm',
    'Pourquoi a-t-on besoin d\'un driver (L298N) pour les moteurs ?',
    JSON.stringify(['Pour les rendre plus jolis', 'L\'Arduino n\'est pas assez puissant seul', 'Pour les connecter au WiFi', 'Ce n\'est pas nécessaire']),
    'L\'Arduino n\'est pas assez puissant seul',
    'L\'Arduino envoie des signaux faibles. Le driver amplifie la puissance pour faire tourner les moteurs.',
    '6ème', 2, 15, JSON.stringify(['moteurs']), null);

  insertExercise.run(courseId, 'techno', 'Vitesse du moteur', 'qcm',
    'analogWrite(ENA, 128) donne au moteur quelle puissance ?',
    JSON.stringify(['100%', '75%', '50%', '25%']),
    '50%',
    '128 / 255 ≈ 50%. Le PWM va de 0 (arrêt) à 255 (pleine puissance). 128 = la moitié.',
    '6ème', 2, 15, JSON.stringify(['moteurs']), null);

  // --- Module 10 : Construire le châssis ---
  courseId = insertCourse.run('techno',
    'Construire le châssis du robot',
    `<h3>Le châssis, c'est le squelette du robot</h3>
    <p>C'est la structure qui porte tous les composants : moteurs, carte Arduino, capteurs, piles.</p>

    <h3>Les options de châssis</h3>
    <ul>
      <li><strong>Kit prêt à monter</strong> : le plus simple, tout est prévu (ELEGOO Robot Car)</li>
      <li><strong>Impression 3D</strong> : si tu as accès à une imprimante 3D</li>
      <li><strong>Recyclage créatif</strong> : carton épais, bois, boîtes plastique</li>
    </ul>

    <h3>Configuration 2 roues + roulette</h3>
    <p>Le robot le plus simple a :</p>
    <ul>
      <li>2 roues motorisées à l'arrière</li>
      <li>1 roulette libre à l'avant (comme une roue de chaise)</li>
      <li>Pour tourner : une roue va plus vite que l'autre</li>
    </ul>

    <h3>Plan de montage</h3>
    <ol>
      <li>Fixer les 2 moteurs DC au châssis (vis ou colle chaude)</li>
      <li>Mettre les roues sur les moteurs</li>
      <li>Fixer la roulette à l'avant</li>
      <li>Placer l'Arduino et le driver moteur au centre</li>
      <li>Fixer le pack de piles</li>
      <li>Monter le capteur ultrasonique à l'avant (les "yeux")</li>
    </ol>

    <div class="example">
      <strong>Schéma de câblage :</strong><br>
      Pile → Driver moteur (12V + GND)<br>
      Driver → Moteur gauche (OUT1, OUT2)<br>
      Driver → Moteur droit (OUT3, OUT4)<br>
      Arduino pin 9 → ENA (vitesse moteur G)<br>
      Arduino pin 10 → ENB (vitesse moteur D)<br>
      Arduino 5V → Capteur ultrasonique VCC<br>
      Arduino pin 7 → Capteur TRIG<br>
      Arduino pin 8 → Capteur ECHO
    </div>

    <div class="tip">
      💡 <strong>Astuce recyclage :</strong> Tu peux utiliser une boîte de chaussures comme châssis ! Solide et facile à percer.
    </div>

    <div class="shopping-list">
      🛒 <strong>Option 1 - Kit tout-en-un :</strong><br>
      ELEGOO Smart Robot Car Kit V4 (~70€) → tout inclus !<br><br>
      🛒 <strong>Option 2 - DIY :</strong><br>
      - Châssis 2WD en acrylique (~10€)<br>
      - 2 moteurs DC avec roues (~8€)<br>
      - 1 roulette pivotante (~2€)<br>
      - Vis, entretoises, colle chaude
    </div>`,
    '6ème', 2, 10,
    JSON.stringify(['châssis', 'construction', 'mécanique', 'phase3']),
    null,
    'https://www.youtube.com/watch?v=1n_KjpMfVR0',
    20
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Configuration basique', 'qcm',
    'Le robot le plus simple utilise...',
    JSON.stringify(['4 roues motorisées', '2 roues motorisées + 1 roulette libre', '6 pattes', '1 seule roue']),
    '2 roues motorisées + 1 roulette libre',
    '2 roues arrière motorisées pour avancer + 1 roulette avant pour l\'équilibre. Simple et efficace !',
    '6ème', 2, 15, JSON.stringify(['châssis']), null);

  insertExercise.run(courseId, 'techno', 'Pour tourner', 'qcm',
    'Comment le robot tourne-t-il à droite ?',
    JSON.stringify(['Les 2 roues tournent à droite', 'La roue gauche va plus vite que la droite', 'Il a un volant', 'Il penche à droite']),
    'La roue gauche va plus vite que la droite',
    'Pour tourner à droite, la roue gauche tourne plus vite (ou la droite s\'arrête). Différence de vitesse = virage !',
    '6ème', 2, 15, JSON.stringify(['châssis']), null);

  // ============================================================
  // PHASE 4 : LE ROBOT AUTONOME (Semaines 13-16)
  // ============================================================

  // --- Module 11 : Programmer les mouvements ---
  courseId = insertCourse.run('techno',
    'Programmer les mouvements du robot',
    `<h3>Les fonctions de mouvement</h3>
    <p>On crée des fonctions pour chaque mouvement. C'est plus propre et réutilisable !</p>

    <div class="example">
      <code>// === FONCTIONS DE MOUVEMENT ===<br>
      void avancer(int vitesse) {<br>
      &nbsp;&nbsp;motorG_avant(vitesse);<br>
      &nbsp;&nbsp;motorD_avant(vitesse);<br>
      }<br><br>
      void reculer(int vitesse) {<br>
      &nbsp;&nbsp;motorG_arriere(vitesse);<br>
      &nbsp;&nbsp;motorD_arriere(vitesse);<br>
      }<br><br>
      void tournerDroite(int vitesse) {<br>
      &nbsp;&nbsp;motorG_avant(vitesse);<br>
      &nbsp;&nbsp;motorD_arriere(vitesse / 2);<br>
      }<br><br>
      void tournerGauche(int vitesse) {<br>
      &nbsp;&nbsp;motorG_arriere(vitesse / 2);<br>
      &nbsp;&nbsp;motorD_avant(vitesse);<br>
      }<br><br>
      void stop() {<br>
      &nbsp;&nbsp;motorG_avant(0);<br>
      &nbsp;&nbsp;motorD_avant(0);<br>
      }</code>
    </div>

    <h3>Un premier parcours</h3>
    <div class="example">
      <code>void loop() {<br>
      &nbsp;&nbsp;avancer(200);<br>
      &nbsp;&nbsp;delay(2000);  // 2 secondes tout droit<br>
      &nbsp;&nbsp;tournerDroite(150);<br>
      &nbsp;&nbsp;delay(500);   // tourner 0.5 seconde<br>
      &nbsp;&nbsp;avancer(200);<br>
      &nbsp;&nbsp;delay(2000);  // 2 secondes tout droit<br>
      &nbsp;&nbsp;stop();<br>
      &nbsp;&nbsp;delay(5000);  // pause 5 secondes<br>
      }</code>
    </div>

    <div class="tip">
      💡 <strong>Défi :</strong> Programme ton robot pour faire un carré ! (avancer, tourner 90°, avancer, tourner 90°... 4 fois)
    </div>`,
    '6ème', 2, 11,
    JSON.stringify(['programmation', 'mouvements', 'arduino', 'phase4']),
    null, null, 15
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Fonction avancer', 'qcm',
    'Pour que le robot avance en ligne droite, il faut que...',
    JSON.stringify(['Un seul moteur tourne', 'Les 2 moteurs tournent à la même vitesse dans le même sens', 'Les moteurs tournent en sens inverse', 'Le robot ne bouge pas']),
    'Les 2 moteurs tournent à la même vitesse dans le même sens',
    'Les 2 moteurs tournent en avant à la même vitesse = le robot va tout droit.',
    '6ème', 2, 15, JSON.stringify(['mouvements']), null);

  insertExercise.run(courseId, 'techno', 'Faire un carré', 'qcm',
    'Pour faire un carré, combien de fois le robot doit-il tourner à 90° ?',
    JSON.stringify(['2 fois', '3 fois', '4 fois', '1 fois']),
    '4 fois',
    'Un carré a 4 côtés et 4 angles droits. Donc : avancer + tourner 90° × 4 !',
    '6ème', 2, 15, JSON.stringify(['mouvements']), null);

  // --- Module 12 : Éviter les obstacles ---
  courseId = insertCourse.run('techno',
    'Éviter les obstacles - Robot intelligent',
    `<h3>Le robot qui "voit" les murs</h3>
    <p>Avec le capteur ultrasonique, le robot mesure la distance devant lui. S'il détecte un obstacle → il tourne !</p>

    <h3>L'algorithme d'évitement</h3>
    <div class="example">
      <code>void loop() {<br>
      &nbsp;&nbsp;int distance = mesurer_distance();<br><br>
      &nbsp;&nbsp;if (distance < 20) {<br>
      &nbsp;&nbsp;&nbsp;&nbsp;// Obstacle à moins de 20 cm !<br>
      &nbsp;&nbsp;&nbsp;&nbsp;stop();<br>
      &nbsp;&nbsp;&nbsp;&nbsp;delay(200);<br>
      &nbsp;&nbsp;&nbsp;&nbsp;reculer(150);<br>
      &nbsp;&nbsp;&nbsp;&nbsp;delay(400);<br>
      &nbsp;&nbsp;&nbsp;&nbsp;tournerDroite(150);<br>
      &nbsp;&nbsp;&nbsp;&nbsp;delay(500);<br>
      &nbsp;&nbsp;} else {<br>
      &nbsp;&nbsp;&nbsp;&nbsp;// Voie libre !<br>
      &nbsp;&nbsp;&nbsp;&nbsp;avancer(200);<br>
      &nbsp;&nbsp;}<br>
      }</code>
    </div>

    <h3>Amélioration : regarder à gauche ET à droite</h3>
    <p>Avec un servo-moteur qui porte le capteur, le robot peut "tourner la tête" !</p>
    <div class="example">
      <code>if (distance < 20) {<br>
      &nbsp;&nbsp;stop();<br>
      &nbsp;&nbsp;int distDroite = regarder(0);   // tourner capteur à droite<br>
      &nbsp;&nbsp;int distGauche = regarder(180); // tourner capteur à gauche<br>
      &nbsp;&nbsp;regarder(90); // remettre droit<br><br>
      &nbsp;&nbsp;if (distDroite > distGauche) {<br>
      &nbsp;&nbsp;&nbsp;&nbsp;tournerDroite(150);<br>
      &nbsp;&nbsp;} else {<br>
      &nbsp;&nbsp;&nbsp;&nbsp;tournerGauche(150);<br>
      &nbsp;&nbsp;}<br>
      }</code>
    </div>

    <div class="tip">
      💡 <strong>C'est de l'IA basique !</strong> Le robot prend une décision en fonction de ce qu'il perçoit. C'est le début de l'intelligence artificielle embarquée !
    </div>`,
    '6ème', 3, 12,
    JSON.stringify(['obstacle', 'autonome', 'capteurs', 'phase4']),
    null,
    'https://www.youtube.com/watch?v=oPVlLrjNR_U',
    20
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Distance de détection', 'qcm',
    'Si distance < 20 signifie quoi pour le robot ?',
    JSON.stringify(['L\'obstacle est à plus de 20 cm', 'L\'obstacle est à moins de 20 cm', 'Il n\'y a pas d\'obstacle', 'Le robot est cassé']),
    'L\'obstacle est à moins de 20 cm',
    'distance < 20 = la distance mesurée est inférieure à 20 cm. Obstacle proche → il faut tourner !',
    '6ème', 3, 15, JSON.stringify(['obstacle']), null);

  insertExercise.run(courseId, 'techno', 'Regarder autour', 'qcm',
    'Pourquoi utiliser un servo-moteur avec le capteur de distance ?',
    JSON.stringify(['Pour faire joli', 'Pour que le robot regarde à gauche et à droite', 'Pour aller plus vite', 'Ce n\'est pas utile']),
    'Pour que le robot regarde à gauche et à droite',
    'Le servo tourne le capteur pour mesurer la distance à gauche ET à droite. Le robot choisit le meilleur chemin !',
    '6ème', 3, 15, JSON.stringify(['obstacle']), null);

  // --- Module 13 : Suivre une ligne ---
  courseId = insertCourse.run('techno',
    'Suivre une ligne - Le robot qui trace',
    `<h3>Comment ça marche ?</h3>
    <p>Des capteurs infrarouges (IR) sous le robot détectent une ligne noire sur fond blanc. Le robot ajuste sa direction en permanence.</p>

    <h3>Principe du suivi de ligne</h3>
    <ul>
      <li><strong>2 capteurs IR</strong> sous le robot, de chaque côté de la ligne</li>
      <li>Capteur sur BLANC → renvoie 1</li>
      <li>Capteur sur NOIR → renvoie 0</li>
    </ul>

    <div class="example">
      <strong>Les 4 situations :</strong><br>
      Gauche=BLANC, Droite=BLANC → Avancer tout droit<br>
      Gauche=NOIR, Droite=BLANC → Tourner à gauche<br>
      Gauche=BLANC, Droite=NOIR → Tourner à droite<br>
      Gauche=NOIR, Droite=NOIR → Stop (fin de ligne ou croisement)
    </div>

    <h3>Le code</h3>
    <div class="example">
      <code>int capteurG = digitalRead(A0);<br>
      int capteurD = digitalRead(A1);<br><br>
      if (capteurG == 1 && capteurD == 1) {<br>
      &nbsp;&nbsp;avancer(150); // tout droit<br>
      } else if (capteurG == 0 && capteurD == 1) {<br>
      &nbsp;&nbsp;tournerGauche(120);<br>
      } else if (capteurG == 1 && capteurD == 0) {<br>
      &nbsp;&nbsp;tournerDroite(120);<br>
      } else {<br>
      &nbsp;&nbsp;stop();<br>
      }</code>
    </div>

    <h3>Créer la piste</h3>
    <p>Colle du ruban adhésif noir (scotch électricien) sur une grande feuille blanche ou un carton blanc. Fais des virages, des intersections !</p>

    <div class="tip">
      💡 <strong>C'est comme ça que marchent les robots dans les entrepôts Amazon !</strong> Ils suivent des lignes au sol.
    </div>`,
    '6ème', 3, 13,
    JSON.stringify(['suivi ligne', 'capteur IR', 'autonome', 'phase4']),
    null, null, 20
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Capteur IR', 'qcm',
    'Quand le capteur IR est sur du NOIR, il renvoie...',
    JSON.stringify(['1 (blanc)', '0 (noir)', '100', 'Rien du tout']),
    '0 (noir)',
    'Le capteur IR renvoie 0 quand il détecte du noir (la lumière est absorbée) et 1 quand c\'est blanc.',
    '6ème', 3, 15, JSON.stringify(['suivi ligne']), null);

  insertExercise.run(courseId, 'techno', 'Tourner à gauche', 'qcm',
    'Si le capteur gauche voit NOIR et le droit voit BLANC, le robot doit...',
    JSON.stringify(['Avancer tout droit', 'Tourner à gauche', 'Tourner à droite', 'S\'arrêter']),
    'Tourner à gauche',
    'La ligne est partie à gauche ! Le capteur gauche la voit (noir) → le robot corrige à gauche.',
    '6ème', 3, 15, JSON.stringify(['suivi ligne']), null);

  // --- Module 14 : Le projet final - Robot intelligent ---
  courseId = insertCourse.run('techno',
    'Projet final - Mon robot intelligent',
    `<h3>L'assemblage complet</h3>
    <p>Tu as maintenant toutes les pièces du puzzle. Ton robot va combiner :</p>
    <ul>
      <li>Évitement d'obstacles (capteur ultrasonique)</li>
      <li>Suivi de ligne (capteurs IR)</li>
      <li>Choix intelligent du mode (bouton ou commande)</li>
    </ul>

    <h3>Les modes du robot</h3>
    <div class="example">
      <code>int mode = 1; // 1=évitement, 2=suivi ligne<br><br>
      void loop() {<br>
      &nbsp;&nbsp;if (boutonAppuye()) {<br>
      &nbsp;&nbsp;&nbsp;&nbsp;mode = (mode == 1) ? 2 : 1; // change de mode<br>
      &nbsp;&nbsp;}<br><br>
      &nbsp;&nbsp;if (mode == 1) {<br>
      &nbsp;&nbsp;&nbsp;&nbsp;modeEvitement();<br>
      &nbsp;&nbsp;} else {<br>
      &nbsp;&nbsp;&nbsp;&nbsp;modeSuiviLigne();<br>
      &nbsp;&nbsp;}<br>
      }</code>
    </div>

    <h3>L'IA embarquée : aller plus loin</h3>
    <p>Ton robot prend des décisions simples (if/else). Pour aller plus loin :</p>
    <ul>
      <li><strong>Apprentissage</strong> : le robot mémorise les virages qui fonctionnent</li>
      <li><strong>Cartographie</strong> : il dessine une carte de son environnement</li>
      <li><strong>Communication</strong> : ajouter du Bluetooth pour le contrôler depuis ton téléphone</li>
    </ul>

    <h3>Évolution possible : le Bluetooth</h3>
    <p>Avec un module <strong>HC-05</strong> (~5€), tu peux contrôler ton robot depuis une appli smartphone ! Tu envoies des commandes : "A" = avancer, "G" = gauche, etc.</p>

    <h3>Ta liste de courses complète</h3>
    <div class="shopping-list">
      🛒 <strong>Kit complet recommandé :</strong><br>
      <strong>ELEGOO Smart Robot Car Kit V4</strong> (~70€)<br>
      Contient : Arduino UNO, driver moteur, 4 moteurs DC,<br>
      capteur ultrasonique, capteurs IR, servo, télécommande IR,<br>
      module Bluetooth, châssis, roues, piles, câbles<br><br>
      🛒 <strong>OU en pièces détachées :</strong><br>
      - Arduino UNO R3 compatible (~12€)<br>
      - Châssis 2WD + moteurs + roues (~15€)<br>
      - Driver L298N (~5€)<br>
      - Capteur HC-SR04 (~3€)<br>
      - 2 capteurs IR (~3€)<br>
      - Servo SG90 (~3€)<br>
      - Module Bluetooth HC-05 (~5€)<br>
      - Breadboard + fils (~5€)<br>
      - Pack piles 4xAA (~4€)<br>
      <strong>Total : ~55€</strong>
    </div>

    <div class="tip">
      💡 <strong>Bravo ! Tu as construit un VRAI robot !</strong> Tu maîtrises maintenant la programmation, l'électronique ET la mécanique. C'est exactement ce que font les ingénieurs en robotique. La prochaine étape ? Ajouter une caméra et de l'IA avec un Raspberry Pi !
    </div>`,
    '6ème', 3, 14,
    JSON.stringify(['projet final', 'robot complet', 'IA', 'phase4']),
    null,
    'https://www.youtube.com/watch?v=1WrsMAiR8jY',
    30
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Les composants du robot', 'qcm',
    'Quels composants sont nécessaires pour un robot qui évite les obstacles ?',
    JSON.stringify([
      'Arduino + moteurs + capteur de distance',
      'Juste un Arduino',
      'Un ordinateur portable',
      'Un téléphone'
    ]),
    'Arduino + moteurs + capteur de distance',
    'Il faut un cerveau (Arduino), des jambes (moteurs) et des yeux (capteur de distance) !',
    '6ème', 3, 20, JSON.stringify(['projet final']), null);

  insertExercise.run(courseId, 'techno', 'IA embarquée', 'qcm',
    'Quand le robot décide seul de tourner en voyant un obstacle, c\'est...',
    JSON.stringify(['De la magie', 'De l\'intelligence artificielle basique', 'Du hasard', 'Impossible']),
    'De l\'intelligence artificielle basique',
    'Le robot perçoit (capteur), décide (algorithme), agit (moteur). C\'est la base de l\'IA !',
    '6ème', 3, 20, JSON.stringify(['projet final', 'IA']), null);

  insertExercise.run(courseId, 'techno', 'Résumé du parcours', 'truefalse',
    'Pour construire un robot, il faut maîtriser la programmation, l\'électronique ET la mécanique. Vrai ou faux ?',
    JSON.stringify(['Vrai', 'Faux']),
    'Vrai',
    'VRAI ! La robotique combine 3 disciplines : programmer le cerveau, câbler les capteurs/moteurs, construire le corps. Et toi, tu sais faire les 3 !',
    '6ème', 3, 20, JSON.stringify(['projet final']), null);

  // Ajouter les stats techno pour Sacha (user_id = 2)
  const sachaStats = db.prepare("SELECT COUNT(*) as count FROM user_stats WHERE user_id = 2 AND subject = 'techno'").get();
  if (sachaStats.count === 0) {
    db.prepare("INSERT INTO user_stats (user_id, subject) VALUES (2, 'techno')").run();
  }
  // Ajouter aussi pour les autres enfants au cas où
  for (let userId = 1; userId <= 3; userId++) {
    const st = db.prepare("SELECT COUNT(*) as count FROM user_stats WHERE user_id = ? AND subject = 'techno'").get(userId);
    if (st.count === 0) {
      db.prepare("INSERT INTO user_stats (user_id, subject) VALUES (?, 'techno')").run(userId);
    }
  }

  console.log('🤖 Parcours Robotique & Programmation chargé !');
}

module.exports = { seedRobotics };
