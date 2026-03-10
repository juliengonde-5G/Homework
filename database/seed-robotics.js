/**
 * Parcours Robotique & Programmation pour Sacha
 * Configuration : SunFounder PiCar-X + Raspberry Pi 4
 * Programme complet : de zéro à robot IA autonome
 * Lié au programme Éducation Nationale (Technologie 6ème/5ème)
 * Adapté au profil PCM Rebelle + dyslexie
 */

function seedRobotics(db) {
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
    "C'est quoi un algorithme ?",
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
    </div>`,
    '6ème', 1, 1,
    JSON.stringify(['algorithme', 'bases', 'logique', 'phase1']),
    null, 'https://www.youtube.com/watch?v=6hfOvs8pY1k', 10
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', "C'est quoi un algorithme ?", 'qcm',
    "Un algorithme, c'est quoi ?",
    JSON.stringify(["Un robot", "Une suite d'instructions dans un ordre précis", "Un ordinateur", "Un jeu vidéo"]),
    "Une suite d'instructions dans un ordre précis",
    "Un algorithme = une recette, une série d'étapes à suivre dans l'ordre !",
    '6ème', 1, 10, JSON.stringify(['algorithme']), null);

  insertExercise.run(courseId, 'techno', 'Les 3 briques', 'qcm',
    "Quelles sont les 3 briques de base d'un algorithme ?",
    JSON.stringify(['Séquence, condition, boucle', 'Début, milieu, fin', 'Lire, écrire, compter', 'Input, output, process']),
    'Séquence, condition, boucle',
    "Séquence (l'ordre), Condition (si/alors), Boucle (répéter). C'est tout ce qu'il faut !",
    '6ème', 1, 10, JSON.stringify(['algorithme']), null);

  insertExercise.run(courseId, 'techno', "Trouver l'erreur", 'qcm',
    "Algorithme pour faire du thé : 1. Mettre l'eau à chauffer 2. Boire le thé 3. Mettre le sachet 4. Verser l'eau. Problème ?",
    JSON.stringify(["Il manque du sucre", "Les étapes sont dans le désordre", "Il faut du café", "C'est parfait"]),
    "Les étapes sont dans le désordre",
    "On ne peut pas boire le thé avant de l'avoir préparé ! L'ordre compte dans un algorithme.",
    '6ème', 1, 10, JSON.stringify(['algorithme']), null);

  // --- Module 2 : Scratch - Programmer sans écrire de code ---
  courseId = insertCourse.run('techno',
    'Scratch - Programmer sans écrire',
    `<h3>Scratch, c'est quoi ?</h3>
    <p><strong>Scratch</strong> est un logiciel gratuit créé par le MIT. Tu programmes en assemblant des blocs colorés, comme des LEGO !</p>

    <h3>Les blocs par couleur</h3>
    <ul>
      <li><strong>Blocs bleus</strong> : mouvement (avancer, tourner)</li>
      <li><strong>Blocs violets</strong> : apparence (dire, changer de costume)</li>
      <li><strong>Blocs jaunes</strong> : événements (quand on clique...)</li>
      <li><strong>Blocs oranges</strong> : contrôle (si, répéter)</li>
    </ul>

    <h3>Ton premier programme</h3>
    <div class="example">
      1. Va sur <strong>scratch.mit.edu</strong><br>
      2. Clique "Créer"<br>
      3. Glisse "avancer de 10 pas"<br>
      4. Ajoute "tourner de 15 degrés"<br>
      5. Mets une boucle "répéter 24 fois"<br>
      6. Drapeau vert → Le chat fait un cercle !
    </div>

    <h3>Pourquoi Scratch avant Python ?</h3>
    <p>Scratch permet de comprendre la logique sans se battre avec l'écriture du code. Une fois que tu maîtrises les blocs, Python sera facile !</p>

    <div class="tip">
      💡 <strong>Défi :</strong> Crée un mini-jeu : un personnage qui bouge avec les flèches et attrape des objets.
    </div>`,
    '6ème', 1, 2,
    JSON.stringify(['scratch', 'programmation visuelle', 'bases', 'phase1']),
    null, 'https://www.youtube.com/watch?v=VIpmkeqJhmQ', 15
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', "Scratch c'est quoi ?", 'qcm',
    'Scratch utilise...',
    JSON.stringify(['Du texte à taper', 'Des blocs colorés à assembler', 'Des formules mathématiques', 'Des dessins']),
    'Des blocs colorés à assembler',
    "Des blocs colorés qu'on assemble comme des LEGO !",
    '6ème', 1, 10, JSON.stringify(['scratch']), null);

  insertExercise.run(courseId, 'techno', 'Faire un cercle', 'qcm',
    'Pour un cercle dans Scratch, il faut "avancer" + ...',
    JSON.stringify(['"dire bonjour"', '"tourner de quelques degrés"', '"changer de costume"', '"jouer un son"']),
    '"tourner de quelques degrés"',
    'Avancer + tourner un peu, dans une boucle = un cercle !',
    '6ème', 1, 10, JSON.stringify(['scratch']), null);

  // --- Module 3 : Variables et conditions ---
  courseId = insertCourse.run('techno',
    'Variables et conditions - Si... alors...',
    `<h3>C'est quoi une variable ?</h3>
    <p>Une variable = une <strong>boîte avec une étiquette</strong> qui contient une information.</p>

    <div class="example">
      📦 age = 11<br>
      📦 prenom = "Sacha"<br>
      📦 score = 0
    </div>

    <h3>Les conditions : Si... Alors... Sinon</h3>
    <div class="example">
      <strong>En Python :</strong><br>
      <code>if score >= 10:<br>&nbsp;&nbsp;print("Bravo !")<br>else:<br>&nbsp;&nbsp;print("Continue !")</code>
    </div>

    <h3>Les comparaisons</h3>
    <ul>
      <li><strong>==</strong> : égal à</li>
      <li><strong>!=</strong> : différent de</li>
      <li><strong>&gt;</strong> : plus grand que</li>
      <li><strong>&lt;</strong> : plus petit que</li>
    </ul>

    <h3>Lien avec la robotique</h3>
    <div class="example">
      <code>if obstacle_devant == True:<br>&nbsp;&nbsp;tourner_a_droite()<br>else:<br>&nbsp;&nbsp;avancer()</code>
    </div>

    <div class="tip">💡 Le PiCar-X utilise exactement ce genre de conditions pour naviguer !</div>`,
    '6ème', 1, 3,
    JSON.stringify(['variables', 'conditions', 'logique', 'phase1']),
    null, 'https://www.youtube.com/watch?v=Eaz5e6M8tL4', 12
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', "C'est quoi une variable ?", 'qcm',
    'Une variable en programmation, c\'est...',
    JSON.stringify(["Un nombre fixe", "Une boîte étiquetée contenant une info", "Un type de robot", "Une erreur"]),
    "Une boîte étiquetée contenant une info",
    "Variable = boîte étiquetée. On peut y mettre un nombre, du texte, etc.",
    '6ème', 1, 10, JSON.stringify(['variables']), null);

  insertExercise.run(courseId, 'techno', 'Que vaut la variable ?', 'qcm',
    'score = 5, puis score = score + 3. Que vaut score ?',
    JSON.stringify(['5', '3', '8', '53']),
    '8', '5 + 3 = 8 !',
    '6ème', 1, 10, JSON.stringify(['variables']), null);

  insertExercise.run(courseId, 'techno', 'Quel symbole ?', 'qcm',
    'Pour vérifier si deux valeurs sont égales en Python ?',
    JSON.stringify(['=', '==', '!=', '>=']),
    '==', '= donne une valeur (score = 5). == compare (score == 5 ?).',
    '6ème', 1, 10, JSON.stringify(['conditions']), null);

  // --- Module 4 : Les boucles ---
  courseId = insertCourse.run('techno',
    'Les boucles - Répéter des actions',
    `<h3>La boucle "for"</h3>
    <div class="example">
      <code>for i in range(10):<br>&nbsp;&nbsp;print(i)</code><br>
      → Affiche 0, 1, 2, ... 9
    </div>

    <h3>La boucle "while"</h3>
    <div class="example">
      <code>while not obstacle_detecte:<br>&nbsp;&nbsp;avancer()</code>
    </div>

    <h3>En robotique : la boucle principale</h3>
    <div class="example">
      <code>while True:<br>
      &nbsp;&nbsp;lire_capteurs()<br>
      &nbsp;&nbsp;decider()<br>
      &nbsp;&nbsp;bouger()</code>
    </div>
    <p>C'est exactement comme ça que fonctionne le PiCar-X !</p>

    <div class="tip">💡 Boucle infinie sans condition d'arrêt = DANGER. Le robot ne s'arrête jamais !</div>`,
    '6ème', 1, 4,
    JSON.stringify(['boucles', 'programmation', 'phase1']),
    null, 'https://www.youtube.com/watch?v=wxds6MAtUQ0', 12
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Combien de fois ?', 'qcm',
    'for i in range(5): print("hey") → Combien de fois ?',
    JSON.stringify(['4', '5', '6', '1']),
    '5', 'range(5) = 0,1,2,3,4 = 5 valeurs.',
    '6ème', 1, 10, JSON.stringify(['boucles']), null);

  insertExercise.run(courseId, 'techno', 'Boucle du robot', 'qcm',
    "Le programme principal d'un robot est...",
    JSON.stringify(["Une seule instruction", "Une grande boucle en permanence", "Un fichier texte", "Un dessin"]),
    "Une grande boucle en permanence",
    "Lire capteurs → décider → bouger → recommencer. C'est une boucle infinie !",
    '6ème', 1, 10, JSON.stringify(['boucles']), null);

  // --- Module 5 : Python - Ton premier programme ---
  courseId = insertCourse.run('techno',
    'Python - Ton premier programme',
    `<h3>Pourquoi Python ?</h3>
    <ul>
      <li>Le langage #1 mondial</li>
      <li>Simple à lire (comme de l'anglais)</li>
      <li>Utilisé pour les robots, l'IA, les jeux, le web</li>
      <li><strong>C'est le langage du Raspberry Pi !</strong></li>
    </ul>

    <h3>Ton premier programme</h3>
    <div class="example">
      <code>print("Salut Sacha !")</code>
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
      <li><strong>str</strong> (texte) : "Bonjour"</li>
      <li><strong>int</strong> (entier) : 11, 42</li>
      <li><strong>float</strong> (décimal) : 3.14</li>
      <li><strong>bool</strong> (vrai/faux) : True, False</li>
      <li><strong>list</strong> (liste) : [1, 2, 3]</li>
    </ul>

    <div class="tip">💡 <strong>Défi :</strong> Programme qui demande ton âge et dit combien d'années avant 18 ans !</div>

    <div class="shopping-list">
      🛒 <strong>Pour coder maintenant (gratuit) :</strong><br>
      → <a href="https://replit.com" target="_blank">replit.com</a> (en ligne, rien à installer)<br>
      → Ou <a href="https://thonny.org" target="_blank">Thonny</a> (éditeur Python simple, sur ordi)
    </div>`,
    '6ème', 1, 5,
    JSON.stringify(['python', 'premier programme', 'phase1']),
    null, 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 15
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Afficher du texte', 'qcm',
    'Comment afficher "Bonjour" en Python ?',
    JSON.stringify(['echo "Bonjour"', 'print("Bonjour")', 'display("Bonjour")', 'write("Bonjour")']),
    'print("Bonjour")', 'En Python, print() affiche du texte.',
    '6ème', 1, 10, JSON.stringify(['python']), null);

  insertExercise.run(courseId, 'techno', 'Type de donnée', 'qcm',
    'Quel type pour "Sacha" en Python ?',
    JSON.stringify(['int', 'float', 'str', 'bool']),
    'str', 'Les guillemets = texte = string (str).',
    '6ème', 1, 10, JSON.stringify(['python']), null);

  // ============================================================
  // PHASE 2 : RASPBERRY PI & LINUX (Semaines 5-8)
  // ============================================================

  // --- Module 6 : Le Raspberry Pi - Ton mini-ordinateur ---
  courseId = insertCourse.run('techno',
    'Raspberry Pi - Ton mini-ordinateur',
    `<h3>C'est quoi un Raspberry Pi ?</h3>
    <p>Un <strong>Raspberry Pi</strong> est un vrai ordinateur de la taille d'une carte bancaire ! Il peut :</p>
    <ul>
      <li>Faire tourner <strong>Linux</strong> (un vrai système d'exploitation)</li>
      <li>Exécuter du <strong>Python</strong> directement</li>
      <li>Se connecter en <strong>WiFi</strong></li>
      <li>Brancher une <strong>caméra</strong> pour voir</li>
      <li>Contrôler des <strong>moteurs et capteurs</strong> via ses pins GPIO</li>
    </ul>

    <h3>Raspberry Pi vs Arduino</h3>
    <table style="width:100%; text-align:left; border-collapse:collapse;">
      <tr style="border-bottom:1px solid #ddd;"><th></th><th>Raspberry Pi 4</th><th>Arduino UNO</th></tr>
      <tr style="border-bottom:1px solid #ddd;"><td>Processeur</td><td>4 coeurs 1.5 GHz</td><td>1 coeur 16 MHz</td></tr>
      <tr style="border-bottom:1px solid #ddd;"><td>RAM</td><td>4 Go</td><td>2 Ko</td></tr>
      <tr style="border-bottom:1px solid #ddd;"><td>Système</td><td>Linux complet</td><td>Pas de système</td></tr>
      <tr style="border-bottom:1px solid #ddd;"><td>Langage</td><td>Python, C, Java...</td><td>C++ uniquement</td></tr>
      <tr style="border-bottom:1px solid #ddd;"><td>WiFi</td><td>Oui intégré</td><td>Non</td></tr>
      <tr><td>Caméra</td><td>Oui</td><td>Non</td></tr>
    </table>

    <h3>Installation du Raspberry Pi</h3>
    <ol>
      <li>Télécharge <strong>Raspberry Pi Imager</strong> sur un PC</li>
      <li>Insère la carte SD dans le PC</li>
      <li>Grave "Raspberry Pi OS" sur la carte SD</li>
      <li>Insère la carte SD dans le Raspberry Pi</li>
      <li>Branche alimentation, écran, clavier, souris</li>
      <li>Allume → Linux démarre !</li>
    </ol>

    <h3>Le terminal Linux</h3>
    <div class="example">
      <code>pwd</code> → Affiche où tu es<br>
      <code>ls</code> → Liste les fichiers<br>
      <code>cd dossier</code> → Entre dans un dossier<br>
      <code>python3 mon_script.py</code> → Lance ton programme<br>
      <code>sudo</code> → Mode administrateur (super-pouvoir !)
    </div>

    <div class="tip">
      💡 <strong>Lien école :</strong> Linux est utilisé sur 96% des serveurs dans le monde. En l'apprenant maintenant, tu as une avance énorme !
    </div>

    <div class="shopping-list">
      🛒 <strong>Matériel nécessaire :</strong><br>
      - <strong>Raspberry Pi 4 Model B (4 Go RAM)</strong> ~55€<br>
      - <strong>Alimentation USB-C officielle</strong> ~10€<br>
      - <strong>Carte micro-SD 32 Go</strong> ~8€<br>
      - <strong>Câble micro-HDMI</strong> (pour l'écran, setup initial) ~8€<br>
      - Clavier + souris USB (tu en as sûrement déjà)<br>
      → Après le setup initial, tu pourras te connecter en WiFi depuis ton PC !
    </div>`,
    '6ème', 1, 6,
    JSON.stringify(['raspberry pi', 'linux', 'setup', 'phase2']),
    null, 'https://www.youtube.com/watch?v=BpJCAafw2qE', 15
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', "Raspberry Pi c'est quoi ?", 'qcm',
    "Un Raspberry Pi est...",
    JSON.stringify(["Un fruit", "Un mini-ordinateur complet avec Linux", "Une calculatrice", "Un jeu vidéo"]),
    "Un mini-ordinateur complet avec Linux",
    "Le Raspberry Pi fait tourner Linux, Python, WiFi, caméra... un vrai ordi de poche !",
    '6ème', 1, 10, JSON.stringify(['raspberry pi']), null);

  insertExercise.run(courseId, 'techno', 'RPi vs Arduino', 'qcm',
    "Quel avantage du Raspberry Pi sur l'Arduino ?",
    JSON.stringify(["Moins cher", "WiFi intégré + Python + caméra", "Plus petit", "Plus simple"]),
    "WiFi intégré + Python + caméra",
    "Le RPi a WiFi, Python natif, caméra, Linux... beaucoup plus puissant !",
    '6ème', 1, 10, JSON.stringify(['raspberry pi']), null);

  insertExercise.run(courseId, 'techno', 'Commande sudo', 'qcm',
    "À quoi sert 'sudo' dans le terminal Linux ?",
    JSON.stringify(["Fermer l'ordinateur", "Exécuter en mode administrateur", "Ouvrir un fichier", "Se connecter au WiFi"]),
    "Exécuter en mode administrateur",
    "sudo = 'Super User DO'. C'est le super-pouvoir administrateur de Linux !",
    '6ème', 1, 10, JSON.stringify(['linux']), null);

  // --- Module 7 : Le PiCar-X - Ton robot ---
  courseId = insertCourse.run('techno',
    'PiCar-X - Découverte de ton robot',
    `<h3>C'est quoi le PiCar-X ?</h3>
    <p>Le <strong>SunFounder PiCar-X</strong> est un kit robot complet qui se branche sur un Raspberry Pi. Il a :</p>
    <ul>
      <li><strong>Un module caméra</strong> : le robot "voit" son environnement</li>
      <li><strong>Un capteur ultrasonique</strong> : mesure la distance (comme un sonar)</li>
      <li><strong>Des capteurs de suivi de ligne</strong> : suit des tracés au sol</li>
      <li><strong>2 moteurs DC</strong> : pour avancer/reculer</li>
      <li><strong>Un servo de direction</strong> : pour tourner (comme un vrai volant)</li>
      <li><strong>Un servo d'inclinaison caméra</strong> : la caméra "lève la tête"</li>
      <li><strong>Un module son</strong> : le robot peut "parler" !</li>
      <li><strong>Programmation 100% Python</strong></li>
    </ul>

    <h3>Montage du robot</h3>
    <ol>
      <li>Assembler le châssis (vis + pièces fournies) ~30 min</li>
      <li>Fixer les moteurs et les roues</li>
      <li>Installer les servos (direction + caméra)</li>
      <li>Brancher le Raspberry Pi sur le HAT (carte d'extension)</li>
      <li>Connecter les capteurs</li>
      <li>Installer la caméra Pi</li>
      <li>Installer les piles</li>
    </ol>

    <h3>Installation logicielle</h3>
    <div class="example">
      <code># Sur le Raspberry Pi, ouvrir le terminal :<br>
      cd ~<br>
      git clone https://github.com/sunfounder/picar-x.git<br>
      cd picar-x<br>
      sudo python3 setup.py install</code>
    </div>

    <h3>Premier test !</h3>
    <div class="example">
      <code>from picarx import Picarx<br>
      import time<br><br>
      px = Picarx()<br>
      px.forward(30)  # avancer à 30% de puissance<br>
      time.sleep(2)   # pendant 2 secondes<br>
      px.stop()        # stop !<br>
      print("Mon robot bouge !")</code>
    </div>

    <div class="tip">
      💡 <strong>C'est du Python !</strong> Le même langage que tu as appris dans les modules précédents. Pas de nouveau langage à apprendre.
    </div>

    <div class="shopping-list">
      🛒 <strong>Kit PiCar-X :</strong><br>
      - <strong>SunFounder PiCar-X Kit</strong> ~80€<br>
      (châssis, moteurs, servos, capteurs, HAT, câbles, vis)<br>
      - <strong>Caméra Pi v2</strong> ~25€ (si pas incluse)<br>
      - <strong>2 piles 18650</strong> + chargeur ~15€<br><br>
      <strong>Total avec le Raspberry Pi : ~170€</strong>
    </div>`,
    '6ème', 2, 7,
    JSON.stringify(['picar-x', 'robot', 'montage', 'phase2']),
    null, 'https://www.youtube.com/watch?v=WK9TRHnLpnI', 20
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Le PiCar-X', 'qcm',
    "Quel langage utilise le PiCar-X ?",
    JSON.stringify(["C++", "Java", "Python", "Scratch"]),
    "Python", "Le PiCar-X se programme 100% en Python. Le même langage que tu connais déjà !",
    '6ème', 2, 15, JSON.stringify(['picar-x']), null);

  insertExercise.run(courseId, 'techno', "Premier mouvement", 'qcm',
    "px.forward(30) fait quoi ?",
    JSON.stringify(["Le robot recule", "Le robot avance à 30% de puissance", "Le robot tourne", "Rien"]),
    "Le robot avance à 30% de puissance",
    "forward(30) = avancer à 30% de la vitesse max. Tu peux aller jusqu'à 100 !",
    '6ème', 2, 15, JSON.stringify(['picar-x']), null);

  // --- Module 8 : L'électricité et les capteurs ---
  courseId = insertCourse.run('techno',
    "L'électricité et les capteurs du robot",
    `<h3>Les bases de l'électricité</h3>
    <ul>
      <li><strong>Tension (Volts)</strong> : la "pression" qui pousse les électrons</li>
      <li><strong>Courant (Ampères)</strong> : le "débit" d'électrons</li>
      <li><strong>Résistance (Ohms)</strong> : ce qui freine le courant</li>
    </ul>
    <div class="example">
      <strong>Loi d'Ohm :</strong> U = R × I<br>
      Le Raspberry Pi fonctionne en 5V. Les capteurs en 3.3V ou 5V.
    </div>

    <h3>Les capteurs du PiCar-X</h3>
    <ul>
      <li><strong>Ultrasonique</strong> : mesure la distance (2cm à 4m). Envoie un son et chronomètre l'écho.</li>
      <li><strong>Capteurs IR (×3)</strong> : détectent noir/blanc sous le robot pour suivre une ligne</li>
      <li><strong>Caméra Pi</strong> : vision par ordinateur ! Détecte des objets, des couleurs, des visages</li>
    </ul>

    <h3>Lire un capteur en Python</h3>
    <div class="example">
      <code>from picarx import Picarx<br><br>
      px = Picarx()<br><br>
      # Distance devant le robot<br>
      distance = px.ultrasonic.read()<br>
      print(f"Obstacle à {distance} cm")<br><br>
      # Capteurs de ligne (3 valeurs)<br>
      line = px.grayscale.read()<br>
      print(f"Ligne : {line}")</code>
    </div>

    <h3>Analogique vs Digital</h3>
    <ul>
      <li><strong>Digital</strong> : ON ou OFF (bouton, IR simple)</li>
      <li><strong>Analogique</strong> : une valeur variable (lumière, distance, température)</li>
    </ul>

    <div class="tip">💡 <strong>Lien maths :</strong> U = R × I, c'est une équation ! Si tu connais 2 valeurs, tu calcules la 3ème.</div>`,
    '6ème', 2, 8,
    JSON.stringify(['capteurs', 'électricité', 'picar-x', 'phase2']),
    null, 'https://www.youtube.com/watch?v=mc979OhitAg', 15
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Capteur ultrasonique', 'qcm',
    "Le capteur ultrasonique mesure...",
    JSON.stringify(["La température", "La distance", "La couleur", "Le poids"]),
    "La distance", "Il envoie un ultrason et mesure le temps de retour de l'écho.",
    '6ème', 2, 15, JSON.stringify(['capteurs']), null);

  insertExercise.run(courseId, 'techno', 'Loi d\'Ohm', 'qcm',
    "La loi d'Ohm : U = R × I. U se mesure en...",
    JSON.stringify(["Ampères", "Ohms", "Volts", "Watts"]),
    "Volts", "U = tension, mesurée en Volts. R en Ohms, I en Ampères.",
    '6ème', 2, 15, JSON.stringify(['électricité']), null);

  // ============================================================
  // PHASE 3 : ROBOT EN ACTION (Semaines 9-12)
  // ============================================================

  // --- Module 9 : Programmer les mouvements ---
  courseId = insertCourse.run('techno',
    'Programmer les mouvements du PiCar-X',
    `<h3>Les fonctions de mouvement</h3>
    <div class="example">
      <code>from picarx import Picarx<br>
      import time<br><br>
      px = Picarx()<br><br>
      # Avancer<br>
      px.forward(50)<br>
      time.sleep(2)<br><br>
      # Tourner à droite (angle de braquage)<br>
      px.set_dir_servo_angle(30)  # 30° à droite<br>
      px.forward(40)<br>
      time.sleep(1)<br><br>
      # Remettre droit<br>
      px.set_dir_servo_angle(0)<br><br>
      # Reculer<br>
      px.backward(30)<br>
      time.sleep(1)<br><br>
      # Stop<br>
      px.stop()</code>
    </div>

    <h3>Créer tes propres fonctions</h3>
    <div class="example">
      <code>def tourner_droite(vitesse=40, duree=1):<br>
      &nbsp;&nbsp;px.set_dir_servo_angle(30)<br>
      &nbsp;&nbsp;px.forward(vitesse)<br>
      &nbsp;&nbsp;time.sleep(duree)<br>
      &nbsp;&nbsp;px.set_dir_servo_angle(0)<br><br>
      def faire_carre(vitesse=40):<br>
      &nbsp;&nbsp;for i in range(4):<br>
      &nbsp;&nbsp;&nbsp;&nbsp;px.forward(vitesse)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;time.sleep(2)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;tourner_droite(vitesse, 0.8)<br>
      &nbsp;&nbsp;px.stop()</code>
    </div>

    <div class="tip">💡 <strong>Défi :</strong> Programme le robot pour écrire la lettre S au sol !</div>`,
    '6ème', 2, 9,
    JSON.stringify(['mouvements', 'programmation', 'picar-x', 'phase3']),
    null, null, 15
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Direction du servo', 'qcm',
    "set_dir_servo_angle(30) fait...",
    JSON.stringify(["Avancer", "Braquer les roues à 30° vers la droite", "Reculer", "Tourner la caméra"]),
    "Braquer les roues à 30° vers la droite",
    "Le servo de direction oriente les roues. 0 = droit, >0 = droite, <0 = gauche.",
    '6ème', 2, 15, JSON.stringify(['mouvements']), null);

  insertExercise.run(courseId, 'techno', 'Faire un carré', 'qcm',
    'Pour un carré : avancer + tourner 90°, combien de fois ?',
    JSON.stringify(['2', '3', '4', '6']),
    '4', '4 côtés = 4 fois (avancer + tourner 90°).',
    '6ème', 2, 15, JSON.stringify(['mouvements']), null);

  // --- Module 10 : Éviter les obstacles ---
  courseId = insertCourse.run('techno',
    'Éviter les obstacles - Robot intelligent',
    `<h3>Le robot qui "voit" les murs</h3>
    <div class="example">
      <code>from picarx import Picarx<br>
      import time<br><br>
      px = Picarx()<br>
      DISTANCE_MIN = 25  # cm<br><br>
      try:<br>
      &nbsp;&nbsp;while True:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;distance = px.ultrasonic.read()<br>
      &nbsp;&nbsp;&nbsp;&nbsp;print(f"Distance: {distance} cm")<br><br>
      &nbsp;&nbsp;&nbsp;&nbsp;if distance > 0 and distance < DISTANCE_MIN:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Obstacle ! Reculer et tourner<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;px.stop()<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;px.backward(30)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;time.sleep(0.5)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;px.set_dir_servo_angle(-30)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;px.forward(30)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;time.sleep(0.8)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;px.set_dir_servo_angle(0)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;else:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;px.forward(40)<br><br>
      &nbsp;&nbsp;&nbsp;&nbsp;time.sleep(0.1)<br>
      except KeyboardInterrupt:<br>
      &nbsp;&nbsp;px.stop()</code>
    </div>

    <h3>Amélioration : scanner gauche-droite</h3>
    <p>Avec le servo de la caméra, le robot peut "regarder" à gauche et à droite avant de choisir.</p>

    <div class="tip">💡 <strong>C'est de l'IA basique !</strong> Percevoir → Décider → Agir. C'est le fondement de l'intelligence artificielle.</div>`,
    '6ème', 3, 10,
    JSON.stringify(['obstacle', 'autonome', 'capteurs', 'phase3']),
    null, null, 20
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Seuil de détection', 'qcm',
    "DISTANCE_MIN = 25 signifie que le robot réagit quand l'obstacle est à...",
    JSON.stringify(["Plus de 25 cm", "Moins de 25 cm", "Exactement 25 cm", "25 mètres"]),
    "Moins de 25 cm",
    "Si la distance mesurée < 25 cm → obstacle trop proche → tourner !",
    '6ème', 3, 15, JSON.stringify(['obstacle']), null);

  // --- Module 11 : Suivre une ligne ---
  courseId = insertCourse.run('techno',
    'Suivre une ligne - Robot qui trace',
    `<h3>Principe du suivi de ligne</h3>
    <p>3 capteurs IR (grayscale) sous le robot. Chacun renvoie une valeur :</p>
    <ul>
      <li>Valeur basse = sur la ligne noire</li>
      <li>Valeur haute = sur le fond blanc</li>
    </ul>

    <div class="example">
      <code>from picarx import Picarx<br>
      import time<br><br>
      px = Picarx()<br>
      SEUIL = 500<br><br>
      try:<br>
      &nbsp;&nbsp;while True:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;g, c, d = px.grayscale.read()<br>
      &nbsp;&nbsp;&nbsp;&nbsp;<br>
      &nbsp;&nbsp;&nbsp;&nbsp;if c < SEUIL:  # Centre sur la ligne<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;px.set_dir_servo_angle(0)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;px.forward(30)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;elif g < SEUIL:  # Ligne à gauche<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;px.set_dir_servo_angle(-20)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;px.forward(25)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;elif d < SEUIL:  # Ligne à droite<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;px.set_dir_servo_angle(20)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;px.forward(25)<br>
      &nbsp;&nbsp;&nbsp;&nbsp;else:  # Ligne perdue<br>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;px.stop()<br><br>
      &nbsp;&nbsp;&nbsp;&nbsp;time.sleep(0.05)<br>
      except KeyboardInterrupt:<br>
      &nbsp;&nbsp;px.stop()</code>
    </div>

    <h3>Créer ta piste</h3>
    <p>Scotch noir (électricien) sur carton blanc. Fais des virages, des croisements !</p>

    <div class="tip">💡 C'est comme ça que fonctionnent les robots Amazon dans leurs entrepôts !</div>`,
    '6ème', 3, 11,
    JSON.stringify(['suivi ligne', 'capteur IR', 'autonome', 'phase3']),
    null, null, 20
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', "3 capteurs de ligne", 'qcm',
    "Le PiCar-X a combien de capteurs de ligne ?",
    JSON.stringify(["1", "2", "3", "4"]),
    "3", "3 capteurs : gauche, centre, droite. Le centre détecte si on est bien aligné.",
    '6ème', 3, 15, JSON.stringify(['suivi ligne']), null);

  // ============================================================
  // PHASE 4 : VISION & IA EMBARQUÉE (Semaines 13-16)
  // ============================================================

  // --- Module 12 : La caméra - Le robot qui voit ---
  courseId = insertCourse.run('techno',
    'La caméra - Le robot qui voit',
    `<h3>La vision par ordinateur</h3>
    <p>Grâce à la caméra Pi et la bibliothèque <strong>OpenCV</strong>, le robot peut :</p>
    <ul>
      <li>Détecter des <strong>couleurs</strong> (suivre un objet rouge)</li>
      <li>Reconnaître des <strong>visages</strong></li>
      <li>Suivre un <strong>objet en mouvement</strong></li>
      <li>Lire du <strong>texte</strong> (OCR)</li>
    </ul>

    <h3>Installer OpenCV</h3>
    <div class="example">
      <code>sudo pip3 install opencv-python</code>
    </div>

    <h3>Prendre une photo</h3>
    <div class="example">
      <code>import cv2<br><br>
      cam = cv2.VideoCapture(0)<br>
      ret, image = cam.read()<br>
      cv2.imwrite("photo.jpg", image)<br>
      cam.release()<br>
      print("Photo prise !")</code>
    </div>

    <h3>Détecter une couleur (suivre un objet)</h3>
    <div class="example">
      <code>import cv2<br>
      import numpy as np<br><br>
      # Détecter du rouge dans l'image<br>
      hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)<br>
      masque = cv2.inRange(hsv, (0, 120, 70), (10, 255, 255))<br>
      contours, _ = cv2.findContours(masque, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)<br><br>
      if len(contours) > 0:<br>
      &nbsp;&nbsp;plus_gros = max(contours, key=cv2.contourArea)<br>
      &nbsp;&nbsp;x, y, w, h = cv2.boundingRect(plus_gros)<br>
      &nbsp;&nbsp;print(f"Objet rouge à x={x}, y={y}")</code>
    </div>

    <div class="tip">
      💡 <strong>C'est comme ça que marchent les voitures autonomes Tesla !</strong> Elles "voient" la route avec des caméras et de l'IA.
    </div>`,
    '6ème', 3, 12,
    JSON.stringify(['caméra', 'vision', 'opencv', 'phase4']),
    null, 'https://www.youtube.com/watch?v=oXlwWbU8l2o', 20
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', "OpenCV c'est quoi ?", 'qcm',
    "OpenCV sert à...",
    JSON.stringify(["Faire de la musique", "Traiter des images et vidéos par ordinateur", "Écrire du texte", "Jouer à des jeux"]),
    "Traiter des images et vidéos par ordinateur",
    "OpenCV = Open Computer Vision. La bibliothèque #1 pour la vision par ordinateur.",
    '6ème', 3, 20, JSON.stringify(['caméra']), null);

  insertExercise.run(courseId, 'techno', "Détecter une couleur", 'qcm',
    "Pour détecter du rouge dans une image, on utilise...",
    JSON.stringify(["print()", "cv2.inRange() avec les bornes de couleur", "px.forward()", "random()"]),
    "cv2.inRange() avec les bornes de couleur",
    "inRange filtre les pixels dont la couleur est dans la plage définie (ici : rouge).",
    '6ème', 3, 20, JSON.stringify(['caméra']), null);

  // --- Module 13 : IA embarquée - Le robot intelligent ---
  courseId = insertCourse.run('techno',
    "IA embarquée - Le robot qui apprend",
    `<h3>C'est quoi l'IA ?</h3>
    <p>L'<strong>Intelligence Artificielle</strong>, c'est quand un programme prend des décisions "intelligentes" :</p>
    <ul>
      <li><strong>Niveau 1</strong> : Règles simples (if/else) → ce que tu fais déjà !</li>
      <li><strong>Niveau 2</strong> : Reconnaissance de formes (OpenCV) → tu viens de l'apprendre</li>
      <li><strong>Niveau 3</strong> : Apprentissage automatique (Machine Learning) → le robot apprend tout seul</li>
    </ul>

    <h3>TensorFlow Lite sur le Raspberry Pi</h3>
    <p>On peut faire tourner des <strong>modèles d'IA</strong> directement sur le Pi ! Exemples :</p>
    <ul>
      <li>Reconnaissance d'objets : "C'est une tasse, une chaussure, un chat..."</li>
      <li>Détection de visages : "Il y a 2 personnes devant moi"</li>
      <li>Classification d'images : "C'est un panneau stop"</li>
    </ul>

    <div class="example">
      <code>sudo pip3 install tflite-runtime<br><br>
      # Exemple : détecter des objets<br>
      import tflite_runtime.interpreter as tflite<br><br>
      interpreter = tflite.Interpreter("detect.tflite")<br>
      interpreter.allocate_tensors()<br>
      # ... prendre photo, la passer au modèle<br>
      # Le modèle dit : "Je vois une personne à 73% de confiance"</code>
    </div>

    <h3>L'IA de ton robot au quotidien</h3>
    <p>Combine tout ce que tu as appris :</p>
    <div class="example">
      <code>while True:<br>
      &nbsp;&nbsp;image = prendre_photo()<br>
      &nbsp;&nbsp;objets = detecter_objets(image)<br>
      &nbsp;&nbsp;distance = px.ultrasonic.read()<br><br>
      &nbsp;&nbsp;if "personne" in objets:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;suivre_personne(objets["personne"])<br>
      &nbsp;&nbsp;elif distance < 25:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;eviter_obstacle()<br>
      &nbsp;&nbsp;else:<br>
      &nbsp;&nbsp;&nbsp;&nbsp;explorer()</code>
    </div>

    <div class="tip">
      💡 <strong>C'est EXACTEMENT ce que fait Homework Buddy !</strong> L'IA qui t'aide avec tes devoirs (Claude) fonctionne sur le même principe : elle perçoit ta question, analyse, et génère une réponse. Ton robot fait pareil, mais avec des capteurs et des moteurs.
    </div>`,
    '6ème', 3, 13,
    JSON.stringify(['IA', 'machine learning', 'tensorflow', 'phase4']),
    null, 'https://www.youtube.com/watch?v=2kO8ScrqikM', 20
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', "Les 3 niveaux d'IA", 'qcm',
    "Quel est le niveau 3 de l'IA ?",
    JSON.stringify(["Règles if/else", "Reconnaissance de formes", "Apprentissage automatique (Machine Learning)", "Magie"]),
    "Apprentissage automatique (Machine Learning)",
    "Niveau 3 = le programme apprend tout seul à partir d'exemples. C'est le Machine Learning !",
    '6ème', 3, 20, JSON.stringify(['IA']), null);

  insertExercise.run(courseId, 'techno', "TensorFlow Lite", 'qcm',
    "TensorFlow Lite permet au Raspberry Pi de...",
    JSON.stringify(["Jouer à des jeux", "Faire tourner des modèles d'IA", "Se connecter au WiFi", "Imprimer"]),
    "Faire tourner des modèles d'IA",
    "TF Lite = version légère de TensorFlow qui tourne sur le Pi. Reconnaissance d'objets, visages, etc.",
    '6ème', 3, 20, JSON.stringify(['IA']), null);

  // --- Module 14 : Projet final - Robot contrôlé par smartphone ---
  courseId = insertCourse.run('techno',
    'Projet final - Robot contrôlé par smartphone',
    `<h3>Le serveur web embarqué</h3>
    <p>Grâce au WiFi du Raspberry Pi, tu peux créer un <strong>serveur web</strong> sur le robot et le contrôler depuis n'importe quel navigateur sur ton téléphone !</p>

    <div class="example">
      <code>from flask import Flask, render_template, jsonify<br>
      from picarx import Picarx<br><br>
      app = Flask(__name__)<br>
      px = Picarx()<br><br>
      @app.route('/')<br>
      def index():<br>
      &nbsp;&nbsp;return render_template('telecommande.html')<br><br>
      @app.route('/avancer')<br>
      def avancer():<br>
      &nbsp;&nbsp;px.forward(40)<br>
      &nbsp;&nbsp;return jsonify({"status": "ok"})<br><br>
      @app.route('/stop')<br>
      def stop():<br>
      &nbsp;&nbsp;px.stop()<br>
      &nbsp;&nbsp;return jsonify({"status": "ok"})<br><br>
      @app.route('/gauche')<br>
      def gauche():<br>
      &nbsp;&nbsp;px.set_dir_servo_angle(-30)<br>
      &nbsp;&nbsp;return jsonify({"status": "ok"})<br><br>
      app.run(host='0.0.0.0', port=8080)</code>
    </div>

    <p>Ouvre <strong>http://[ip-du-robot]:8080</strong> sur ton téléphone et tu as une télécommande web !</p>

    <h3>Ton robot sait maintenant :</h3>
    <ul>
      <li>✅ Avancer, reculer, tourner</li>
      <li>✅ Éviter les obstacles</li>
      <li>✅ Suivre une ligne</li>
      <li>✅ Voir avec une caméra</li>
      <li>✅ Reconnaître des objets avec l'IA</li>
      <li>✅ Être contrôlé depuis un smartphone</li>
    </ul>

    <h3>Et après ?</h3>
    <ul>
      <li><strong>Commande vocale</strong> : ajouter un micro et de la reconnaissance vocale</li>
      <li><strong>Cartographie SLAM</strong> : le robot dessine la carte de ta maison</li>
      <li><strong>ROS2</strong> : le framework professionnel de robotique (utilisé par les vrais robots industriels)</li>
      <li><strong>Bras robotique</strong> : ajouter une pince pour attraper des objets</li>
    </ul>

    <div class="shopping-list">
      🛒 <strong>Liste de courses complète du parcours :</strong><br><br>
      <strong>Le cerveau :</strong><br>
      - Raspberry Pi 4 Model B (4 Go) ~55€<br>
      - Alimentation USB-C 5V/3A ~10€<br>
      - Carte micro-SD 32 Go ~8€<br>
      - Câble micro-HDMI (setup) ~8€<br><br>
      <strong>Le corps :</strong><br>
      - SunFounder PiCar-X Kit ~80€<br>
      - Caméra Pi v2 ~25€<br>
      - 2 piles 18650 + chargeur ~15€<br><br>
      <strong>TOTAL : environ 170-200€</strong><br><br>
      <strong>Bonus optionnel :</strong><br>
      - Micro USB pour commande vocale ~8€<br>
      - Bras robotique servo ~20€
    </div>

    <div class="tip">
      💡 <strong>BRAVO !</strong> Tu maîtrises maintenant : Python, Linux, l'électronique, la mécanique, la vision par ordinateur, l'IA embarquée et le développement web. C'est le profil d'un VRAI ingénieur en robotique !
    </div>`,
    '6ème', 3, 14,
    JSON.stringify(['projet final', 'serveur web', 'smartphone', 'flask', 'phase4']),
    null, null, 30
  ).lastInsertRowid;

  insertExercise.run(courseId, 'techno', 'Serveur web', 'qcm',
    "Flask permet de...",
    JSON.stringify(["Faire de la musique", "Créer un serveur web en Python", "Dessiner", "Jouer"]),
    "Créer un serveur web en Python",
    "Flask = mini-framework web Python. Le robot devient un serveur web accessible depuis le téléphone !",
    '6ème', 3, 20, JSON.stringify(['flask']), null);

  insertExercise.run(courseId, 'techno', 'Compétences acquises', 'truefalse',
    "Après ce parcours, tu sais programmer en Python, utiliser Linux, câbler des capteurs, et faire de l'IA. Vrai ou faux ?",
    JSON.stringify(['Vrai', 'Faux']),
    'Vrai',
    "VRAI ! Python + Linux + électronique + mécanique + vision + IA + web = ingénieur robotique !",
    '6ème', 3, 20, JSON.stringify(['projet final']), null);

  // Ajouter les stats techno pour tous les enfants
  for (let userId = 1; userId <= 3; userId++) {
    const st = db.prepare("SELECT COUNT(*) as count FROM user_stats WHERE user_id = ? AND subject = 'techno'").get(userId);
    if (st.count === 0) {
      db.prepare("INSERT INTO user_stats (user_id, subject) VALUES (?, 'techno')").run(userId);
    }
  }

  console.log('🤖 Parcours Robotique PiCar-X + Raspberry Pi 4 chargé !');
}

module.exports = { seedRobotics };
