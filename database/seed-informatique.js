/**
 * Informatique, Logique, Architecture
 * Orienté Sacha (6ème, passionné robotique/programmation, dyslexique)
 * Complément au parcours robotique (seed-robotics.js)
 */

function seedInformatique(db) {
  const existing = db.prepare("SELECT COUNT(*) as count FROM courses WHERE subject = 'informatique'").get();
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
  // LOGIQUE ET ALGORITHMES
  // ========================================

  courseId = insertCourse.run('informatique', 'La pensée logique : vrai, faux et conditions',
    `<h3>La logique booléenne</h3>
    <p>En informatique, tout repose sur deux valeurs : <strong>VRAI</strong> (true / 1) et <strong>FAUX</strong> (false / 0).</p>

    <h3>Les opérateurs logiques</h3>
    <ul>
      <li><strong>ET (AND)</strong> : les deux conditions doivent être vraies
        <div class="example">Il pleut ET j'ai un parapluie → je sors sec</div>
      </li>
      <li><strong>OU (OR)</strong> : au moins une condition doit être vraie
        <div class="example">J'ai un vélo OU j'ai un skate → je peux rouler</div>
      </li>
      <li><strong>NON (NOT)</strong> : inverse la valeur
        <div class="example">NON(il pleut) = il ne pleut pas</div>
      </li>
    </ul>

    <h3>Tables de vérité</h3>
    <table style="width:100%; text-align:center;">
      <tr><th>A</th><th>B</th><th>A ET B</th><th>A OU B</th></tr>
      <tr><td>Vrai</td><td>Vrai</td><td><strong>Vrai</strong></td><td><strong>Vrai</strong></td></tr>
      <tr><td>Vrai</td><td>Faux</td><td>Faux</td><td><strong>Vrai</strong></td></tr>
      <tr><td>Faux</td><td>Vrai</td><td>Faux</td><td><strong>Vrai</strong></td></tr>
      <tr><td>Faux</td><td>Faux</td><td>Faux</td><td>Faux</td></tr>
    </table>

    <h3>Application en programmation</h3>
    <div class="example">
      <code>if age >= 12 AND a_son_billet == True:</code><br>
      <code>&nbsp;&nbsp;entrer_au_cinema()</code>
    </div>

    <div class="tip">
      💡 <strong>Pour ton robot :</strong> Le robot utilise la logique en permanence ! "SI capteur_distance < 20 ET vitesse > 0 ALORS freiner"
    </div>`,
    '6ème', 1, 1, JSON.stringify(['logique', 'booléen', 'conditions'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'informatique', 'ET logique', 'qcm',
    'Vrai ET Faux = ?',
    JSON.stringify(['Vrai', 'Faux', 'Peut-être', 'Erreur']),
    'Faux',
    'Avec ET, les DEUX doivent être Vrai. Si l\'un est Faux, le résultat est Faux.',
    '6ème', 1, 10, JSON.stringify(['logique']));

  insertExercise.run(courseId, 'informatique', 'OU logique', 'qcm',
    'Faux OU Vrai = ?',
    JSON.stringify(['Vrai', 'Faux', 'Peut-être', 'Erreur']),
    'Vrai',
    'Avec OU, il suffit qu\'UN des deux soit Vrai. Faux OU Vrai = Vrai !',
    '6ème', 1, 10, JSON.stringify(['logique']));

  insertExercise.run(courseId, 'informatique', 'NON logique', 'fill',
    'NON(Vrai) = ?',
    JSON.stringify([]), 'Faux',
    'NON inverse la valeur : NON(Vrai) = Faux, NON(Faux) = Vrai.',
    '6ème', 1, 10, JSON.stringify(['logique']));

  insertExercise.run(courseId, 'informatique', 'Condition robot', 'qcm',
    'Le robot avance SI capteur > 30 ET batterie > 10%. Si capteur = 40 et batterie = 5%, que fait le robot ?',
    JSON.stringify(['Il avance', 'Il s\'arrête', 'Il tourne', 'Il accélère']),
    'Il s\'arrête',
    'Capteur > 30 = Vrai, mais batterie > 10% = Faux. Vrai ET Faux = Faux → le robot s\'arrête.',
    '6ème', 1, 10, JSON.stringify(['logique']));

  // Les algorithmes
  courseId = insertCourse.run('informatique', 'Les algorithmes : résoudre des problèmes pas à pas',
    `<h3>Qu'est-ce qu'un algorithme ?</h3>
    <p>Un algorithme, c'est une <strong>suite d'instructions</strong> pour résoudre un problème, étape par étape. Comme une recette de cuisine !</p>

    <h3>Exemple : algorithme du sandwich</h3>
    <ol>
      <li>Prendre 2 tranches de pain</li>
      <li>Tartiner de beurre</li>
      <li>Ajouter du jambon</li>
      <li>Refermer le sandwich</li>
      <li>Couper en deux</li>
    </ol>

    <h3>Les structures de base</h3>
    <ul>
      <li><strong>Séquence</strong> : les instructions s'exécutent dans l'ordre</li>
      <li><strong>Condition (SI/SINON)</strong> : faire un choix
        <div class="example">SI il pleut ALORS prendre parapluie SINON mettre lunettes de soleil</div>
      </li>
      <li><strong>Boucle (RÉPÉTER)</strong> : répéter des instructions
        <div class="example">TANT QUE pas arrivé FAIRE avancer d'un pas</div>
      </li>
    </ul>

    <h3>Algorithme de tri</h3>
    <p>Comment ranger des cartes par ordre croissant ?</p>
    <ol>
      <li>Comparer les 2 premières cartes</li>
      <li>Si la 1ère est plus grande, les échanger</li>
      <li>Passer à la paire suivante</li>
      <li>Recommencer jusqu'à ce que tout soit trié</li>
    </ol>
    <p>C'est le <strong>tri à bulles</strong> ! Les grands nombres "remontent" comme des bulles.</p>

    <div class="tip">
      💡 <strong>GPS et algorithmes :</strong> Google Maps utilise l'algorithme de Dijkstra pour trouver le chemin le plus court. Ton robot aussi a besoin d'algorithmes pour naviguer !
    </div>`,
    '6ème', 1, 2, JSON.stringify(['algorithmes', 'logique', 'résolution'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'informatique', 'Définition algorithme', 'qcm',
    'Un algorithme, c\'est :',
    JSON.stringify(['Un langage de programmation', 'Une suite d\'instructions pour résoudre un problème', 'Un type d\'ordinateur', 'Un virus informatique']),
    'Une suite d\'instructions pour résoudre un problème',
    'Un algorithme = une suite d\'étapes ordonnées pour résoudre un problème. Comme une recette !',
    '6ème', 1, 10, JSON.stringify(['algorithmes']));

  insertExercise.run(courseId, 'informatique', 'Structure de boucle', 'qcm',
    '"Répéter 5 fois : avancer" est un exemple de :',
    JSON.stringify(['Séquence', 'Condition', 'Boucle', 'Variable']),
    'Boucle',
    'Répéter = boucle. On exécute les mêmes instructions plusieurs fois.',
    '6ème', 1, 10, JSON.stringify(['algorithmes']));

  insertExercise.run(courseId, 'informatique', 'Tri à bulles', 'qcm',
    'Dans le tri à bulles, que fait-on ?',
    JSON.stringify(['On tire les cartes au hasard', 'On compare des paires et échange si nécessaire', 'On coupe le paquet en deux', 'On enlève la plus grande carte']),
    'On compare des paires et échange si nécessaire',
    'Le tri à bulles compare des éléments adjacents et les échange s\'ils sont dans le mauvais ordre.',
    '6ème', 1, 10, JSON.stringify(['algorithmes']));

  // Le binaire
  courseId = insertCourse.run('informatique', 'Le binaire : le langage des machines',
    `<h3>Pourquoi le binaire ?</h3>
    <p>Les ordinateurs ne comprennent que <strong>deux chiffres : 0 et 1</strong>. C'est comme un interrupteur : éteint (0) ou allumé (1).</p>

    <h3>Compter en binaire</h3>
    <table style="width:100%; text-align:center;">
      <tr><th>Décimal</th><th>Binaire</th><th>Explication</th></tr>
      <tr><td>0</td><td>0</td><td></td></tr>
      <tr><td>1</td><td>1</td><td></td></tr>
      <tr><td>2</td><td>10</td><td>2¹</td></tr>
      <tr><td>3</td><td>11</td><td>2¹ + 2⁰</td></tr>
      <tr><td>4</td><td>100</td><td>2²</td></tr>
      <tr><td>5</td><td>101</td><td>2² + 2⁰</td></tr>
      <tr><td>8</td><td>1000</td><td>2³</td></tr>
      <tr><td>10</td><td>1010</td><td>2³ + 2¹</td></tr>
    </table>

    <h3>Comment convertir ?</h3>
    <p>Les positions représentent des puissances de 2 :</p>
    <div class="example">
      Position : ... 16 | 8 | 4 | 2 | 1<br>
      Binaire :  ... &nbsp;1 | 0 | 1 | 1 | 0 = 16 + 4 + 2 = <strong>22</strong>
    </div>

    <h3>Les octets</h3>
    <ul>
      <li><strong>1 bit</strong> = 0 ou 1 (la plus petite unité)</li>
      <li><strong>1 octet</strong> = 8 bits (peut stocker un nombre de 0 à 255)</li>
      <li><strong>1 kilooctet (Ko)</strong> = 1024 octets</li>
      <li><strong>1 mégaoctet (Mo)</strong> = 1024 Ko</li>
      <li><strong>1 gigaoctet (Go)</strong> = 1024 Mo</li>
    </ul>

    <div class="tip">
      💡 <strong>Astuce main :</strong> Avec une main (5 doigts = 5 bits), tu peux compter de 0 à 31 en binaire ! Essaie : pouce = 1, index = 2, majeur = 4, annulaire = 8, auriculaire = 16.
    </div>`,
    '6ème', 1, 3, JSON.stringify(['binaire', 'numérique', 'bits'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'informatique', 'Binaire de 5', 'qcm',
    'Quel est le nombre 5 en binaire ?',
    JSON.stringify(['100', '101', '110', '111']),
    '101',
    '5 = 4 + 1 = 2² + 2⁰ = 101 en binaire.',
    '6ème', 1, 10, JSON.stringify(['binaire']));

  insertExercise.run(courseId, 'informatique', 'Binaire vers décimal', 'qcm',
    'Que vaut 1100 en décimal ?',
    JSON.stringify(['6', '10', '12', '14']),
    '12',
    '1100 = 8 + 4 = 12. Position : 8|4|2|1 → 1|1|0|0.',
    '6ème', 1, 10, JSON.stringify(['binaire']));

  insertExercise.run(courseId, 'informatique', 'Bits et octets', 'qcm',
    'Un octet contient combien de bits ?',
    JSON.stringify(['4', '8', '16', '32']),
    '8',
    'Un octet = 8 bits. Il peut représenter 256 valeurs différentes (0 à 255).',
    '6ème', 1, 10, JSON.stringify(['binaire']));

  insertExercise.run(courseId, 'informatique', 'Conversion binaire', 'fill',
    'Le nombre binaire 1010 vaut ... en décimal.',
    JSON.stringify([]), '10',
    '1010 = 8 + 0 + 2 + 0 = 10.',
    '6ème', 1, 10, JSON.stringify(['binaire']));

  // Architecture d'un ordinateur
  courseId = insertCourse.run('informatique', 'Architecture d\'un ordinateur : comment ça marche',
    `<h3>Les composants d'un ordinateur</h3>

    <h3>🧠 Le processeur (CPU)</h3>
    <p>Le <strong>cerveau</strong> de l'ordinateur. Il exécute les instructions (calculs, décisions). Sa vitesse se mesure en <strong>GHz</strong>.</p>

    <h3>💾 La mémoire vive (RAM)</h3>
    <p>La <strong>mémoire à court terme</strong>. Elle stocke les données en cours d'utilisation. Rapide mais s'efface quand on éteint l'ordi.</p>

    <h3>💿 Le stockage (SSD/HDD)</h3>
    <p>La <strong>mémoire à long terme</strong>. Garde les fichiers même éteint. SSD = rapide, HDD = plus de place mais plus lent.</p>

    <h3>🎮 La carte graphique (GPU)</h3>
    <p>Spécialisée dans l'<strong>affichage</strong> et les calculs parallèles. Essentielle pour les jeux et... l'intelligence artificielle !</p>

    <h3>🔌 La carte mère</h3>
    <p>Le <strong>circuit principal</strong> qui relie tous les composants entre eux.</p>

    <h3>Analogie avec un humain</h3>
    <ul>
      <li>CPU = cerveau (réfléchit)</li>
      <li>RAM = mémoire courte (ce que tu fais maintenant)</li>
      <li>SSD = mémoire longue (tes souvenirs)</li>
      <li>GPU = capacité visuelle (voir et imaginer)</li>
      <li>Carte mère = système nerveux (relie tout)</li>
    </ul>

    <div class="tip">
      💡 <strong>Ton Raspberry Pi :</strong> Il a un CPU ARM, de la RAM (4Go), un stockage sur carte SD, et un petit GPU intégré. C'est un vrai ordinateur miniature !
    </div>`,
    '6ème', 1, 4, JSON.stringify(['architecture', 'hardware', 'composants'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'informatique', 'Rôle du CPU', 'qcm',
    'Le processeur (CPU) est comparable à :',
    JSON.stringify(['Un disque dur', 'Le cerveau', 'Un écran', 'Une imprimante']),
    'Le cerveau',
    'Le CPU est le cerveau de l\'ordinateur : il exécute toutes les instructions et calculs.',
    '6ème', 1, 10, JSON.stringify(['architecture']));

  insertExercise.run(courseId, 'informatique', 'RAM vs SSD', 'qcm',
    'Quelle mémoire s\'efface quand on éteint l\'ordinateur ?',
    JSON.stringify(['Le SSD', 'Le HDD', 'La RAM', 'La carte SD']),
    'La RAM',
    'La RAM est volatile : elle s\'efface à l\'extinction. Le SSD/HDD conserve les données.',
    '6ème', 1, 10, JSON.stringify(['architecture']));

  insertExercise.run(courseId, 'informatique', 'GPU', 'fill',
    'La carte ... est spécialisée dans l\'affichage et est aussi utilisée pour l\'IA.',
    JSON.stringify([]), 'graphique',
    'La carte graphique (GPU) gère l\'affichage et les calculs parallèles pour l\'IA et les jeux.',
    '6ème', 1, 10, JSON.stringify(['architecture']));

  // Internet et les réseaux
  courseId = insertCourse.run('informatique', 'Internet et les réseaux : comment tout est connecté',
    `<h3>Comment fonctionne Internet ?</h3>
    <p>Internet est un <strong>réseau mondial</strong> d'ordinateurs connectés entre eux.</p>

    <h3>Les concepts clés</h3>
    <ul>
      <li><strong>Adresse IP</strong> : l'adresse unique de chaque appareil sur le réseau (comme une adresse postale)</li>
      <li><strong>DNS</strong> : traduit les noms de site (google.com) en adresses IP</li>
      <li><strong>HTTP/HTTPS</strong> : le protocole pour naviguer sur le web (le S = sécurisé)</li>
      <li><strong>Serveur</strong> : un ordinateur qui stocke et envoie les sites web</li>
      <li><strong>Client</strong> : ton navigateur qui demande les pages</li>
    </ul>

    <h3>Que se passe-t-il quand tu tapes google.com ?</h3>
    <ol>
      <li>Ton navigateur demande l'adresse IP de google.com au <strong>DNS</strong></li>
      <li>DNS répond : "C'est 142.250.xxx.xxx"</li>
      <li>Ton navigateur envoie une requête <strong>HTTPS</strong> à cette adresse</li>
      <li>Le <strong>serveur</strong> Google renvoie la page HTML</li>
      <li>Ton navigateur <strong>affiche</strong> la page</li>
    </ol>

    <h3>Les types de réseau</h3>
    <ul>
      <li><strong>LAN</strong> : réseau local (ta maison, ton école)</li>
      <li><strong>Wi-Fi</strong> : réseau sans fil</li>
      <li><strong>Internet</strong> : le réseau des réseaux</li>
    </ul>

    <div class="tip">
      💡 <strong>Pour ton robot :</strong> Le PiCar-X crée son propre réseau Wi-Fi ! Ton smartphone s'y connecte en LAN pour le contrôler. C'est un mini-Internet privé.
    </div>`,
    '6ème', 1, 5, JSON.stringify(['internet', 'réseaux', 'web'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'informatique', 'Rôle du DNS', 'qcm',
    'Le DNS sert à :',
    JSON.stringify(['Protéger contre les virus', 'Traduire les noms de domaine en adresses IP', 'Accélérer Internet', 'Stocker les fichiers']),
    'Traduire les noms de domaine en adresses IP',
    'Le DNS (Domain Name System) traduit google.com en adresse IP numérique.',
    '6ème', 1, 10, JSON.stringify(['internet']));

  insertExercise.run(courseId, 'informatique', 'HTTPS', 'qcm',
    'Que signifie le "S" dans HTTPS ?',
    JSON.stringify(['Speed (vitesse)', 'Secure (sécurisé)', 'Server', 'Simple']),
    'Secure (sécurisé)',
    'HTTPS = HTTP Secure. Les données sont chiffrées entre ton navigateur et le serveur.',
    '6ème', 1, 10, JSON.stringify(['internet']));

  insertExercise.run(courseId, 'informatique', 'Client-serveur', 'fill',
    'Un ordinateur qui stocke et envoie les pages web s\'appelle un ...',
    JSON.stringify([]), 'serveur',
    'Le serveur stocke les sites web et répond aux requêtes des clients (navigateurs).',
    '6ème', 1, 10, JSON.stringify(['internet']));

  // L'intelligence artificielle
  courseId = insertCourse.run('informatique', 'L\'intelligence artificielle pour les débutants',
    `<h3>C'est quoi l'IA ?</h3>
    <p>L'Intelligence Artificielle, c'est quand un ordinateur peut <strong>apprendre</strong> et <strong>prendre des décisions</strong> comme un humain (ou presque !).</p>

    <h3>Types d'IA</h3>
    <ul>
      <li><strong>IA faible</strong> (actuelle) : spécialisée dans UNE tâche
        <div class="example">Siri, ChatGPT, reconnaissance d'images, pilotage automatique</div>
      </li>
      <li><strong>IA forte</strong> (théorique) : capable de penser comme un humain → n'existe pas encore !</li>
    </ul>

    <h3>Comment une IA apprend ?</h3>
    <p>Le <strong>Machine Learning</strong> (apprentissage automatique) :</p>
    <ol>
      <li>On donne à l'IA des milliers d'<strong>exemples</strong> (photos de chats, par ex.)</li>
      <li>L'IA trouve des <strong>patterns</strong> (motifs récurrents)</li>
      <li>Elle peut ensuite <strong>reconnaître</strong> de nouveaux chats qu'elle n'a jamais vus</li>
    </ol>

    <h3>L'IA dans ta vie quotidienne</h3>
    <ul>
      <li><strong>Recommandations</strong> YouTube/Netflix : l'IA prédit ce que tu vas aimer</li>
      <li><strong>Filtres</strong> Snapchat/Instagram : reconnaissance faciale en temps réel</li>
      <li><strong>Traduction</strong> automatique : Google Translate utilise l'IA</li>
      <li><strong>Jeux vidéo</strong> : les adversaires IA s'adaptent à ton style de jeu</li>
    </ul>

    <h3>L'IA dans ton robot PiCar-X</h3>
    <ul>
      <li><strong>Reconnaissance d'objets</strong> : la caméra détecte les obstacles</li>
      <li><strong>Suivi de ligne</strong> : l'IA guide le robot sur un parcours</li>
      <li><strong>Reconnaissance faciale</strong> : le robot te reconnaît !</li>
    </ul>

    <div class="tip">
      💡 <strong>Important :</strong> L'IA n'est pas magique ! Elle fait ce qu'on lui a appris. Si on lui donne de mauvais exemples, elle apprend mal. C'est pour ça que les données sont si importantes.
    </div>`,
    '6ème', 2, 6, JSON.stringify(['IA', 'intelligence artificielle', 'machine learning'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'informatique', 'Définition IA', 'qcm',
    'L\'intelligence artificielle, c\'est :',
    JSON.stringify(['Un robot qui ressemble à un humain', 'Un programme qui peut apprendre et prendre des décisions', 'Un virus très intelligent', 'Un réseau social']),
    'Un programme qui peut apprendre et prendre des décisions',
    'L\'IA = un programme capable d\'apprendre à partir de données et de prendre des décisions.',
    '6ème', 1, 10, JSON.stringify(['IA']));

  insertExercise.run(courseId, 'informatique', 'Machine Learning', 'qcm',
    'Comment une IA apprend-elle à reconnaître des chats ?',
    JSON.stringify(['On lui programme les règles manuellement', 'On lui montre des milliers de photos de chats', 'On lui demande poliment', 'On la connecte à un chat réel']),
    'On lui montre des milliers de photos de chats',
    'Le Machine Learning : on donne plein d\'exemples, l\'IA trouve les patterns toute seule.',
    '6ème', 1, 10, JSON.stringify(['IA']));

  insertExercise.run(courseId, 'informatique', 'IA au quotidien', 'truefalse',
    'Les recommandations de YouTube utilisent l\'intelligence artificielle.',
    JSON.stringify(['Vrai', 'Faux']),
    'Vrai',
    'YouTube utilise l\'IA pour analyser tes goûts et te recommander des vidéos similaires.',
    '6ème', 1, 10, JSON.stringify(['IA']));

  // La cybersécurité
  courseId = insertCourse.run('informatique', 'Cybersécurité : protège tes données',
    `<h3>Pourquoi la cybersécurité ?</h3>
    <p>Tes données personnelles (nom, photos, mots de passe) ont de la <strong>valeur</strong>. Les pirates veulent les voler !</p>

    <h3>Les menaces courantes</h3>
    <ul>
      <li><strong>Phishing</strong> : faux email/site qui imite un vrai pour voler tes identifiants</li>
      <li><strong>Malware</strong> : logiciel malveillant (virus, ransomware)</li>
      <li><strong>Mot de passe faible</strong> : "123456" se craque en 1 seconde !</li>
      <li><strong>Ingénierie sociale</strong> : manipulation pour obtenir des infos</li>
    </ul>

    <h3>Comment se protéger ?</h3>
    <ul>
      <li><strong>Mot de passe fort</strong> : au moins 12 caractères, majuscules, chiffres, symboles. Ex : "MonChat!Mange3Souris"</li>
      <li><strong>Ne jamais partager</strong> ses mots de passe</li>
      <li><strong>Vérifier les liens</strong> avant de cliquer</li>
      <li><strong>Mise à jour</strong> des logiciels (corrige les failles)</li>
      <li><strong>Authentification 2 facteurs</strong> (2FA) quand c'est possible</li>
    </ul>

    <h3>Créer un bon mot de passe</h3>
    <p>Technique de la <strong>phrase secrète</strong> :</p>
    <div class="example">
      "Mon robot PiCar roule à 3 km/h !" → <strong>MrPr@3km/h!</strong><br>
      Facile à retenir, difficile à deviner !
    </div>

    <div class="tip">
      💡 <strong>Ton robot et la sécurité :</strong> Quand ton PiCar-X crée un réseau Wi-Fi, il faut le protéger par un mot de passe ! Sinon, n'importe qui pourrait le contrôler.
    </div>`,
    '6ème', 1, 7, JSON.stringify(['cybersécurité', 'sécurité', 'mots de passe'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'informatique', 'Phishing', 'qcm',
    'Le phishing, c\'est :',
    JSON.stringify(['Un jeu vidéo', 'Un faux email pour voler des identifiants', 'Un réseau social', 'Un type de virus']),
    'Un faux email pour voler des identifiants',
    'Le phishing = hameçonnage. Un faux message qui imite un site légitime pour voler tes données.',
    '6ème', 1, 10, JSON.stringify(['cybersécurité']));

  insertExercise.run(courseId, 'informatique', 'Mot de passe fort', 'qcm',
    'Quel mot de passe est le plus sécurisé ?',
    JSON.stringify(['123456', 'motdepasse', 'MonChat!Mange3Souris', 'azerty']),
    'MonChat!Mange3Souris',
    'Un bon mot de passe est long (12+ caractères) avec majuscules, chiffres et symboles.',
    '6ème', 1, 10, JSON.stringify(['cybersécurité']));

  insertExercise.run(courseId, 'informatique', '2FA', 'fill',
    'L\'authentification à 2 facteurs est souvent abrégée en ...',
    JSON.stringify([]), '2FA',
    '2FA = Two-Factor Authentication. Un code supplémentaire en plus du mot de passe.',
    '6ème', 1, 10, JSON.stringify(['cybersécurité']));

  // Linux et la ligne de commande
  courseId = insertCourse.run('informatique', 'Linux et la ligne de commande',
    `<h3>C'est quoi Linux ?</h3>
    <p>Linux est un <strong>système d'exploitation</strong> libre et gratuit (comme Windows ou macOS, mais open source). C'est le système de ton Raspberry Pi !</p>

    <h3>Pourquoi la ligne de commande ?</h3>
    <p>Le terminal est <strong>plus puissant</strong> qu'une interface graphique. Les développeurs et hackers l'utilisent tous les jours !</p>

    <h3>Commandes essentielles</h3>
    <table style="width:100%; text-align:left;">
      <tr><th>Commande</th><th>Action</th><th>Exemple</th></tr>
      <tr><td><code>ls</code></td><td>Lister les fichiers</td><td><code>ls -la</code></td></tr>
      <tr><td><code>cd</code></td><td>Changer de dossier</td><td><code>cd Documents</code></td></tr>
      <tr><td><code>mkdir</code></td><td>Créer un dossier</td><td><code>mkdir mon_projet</code></td></tr>
      <tr><td><code>cp</code></td><td>Copier un fichier</td><td><code>cp fichier.txt copie.txt</code></td></tr>
      <tr><td><code>mv</code></td><td>Déplacer/renommer</td><td><code>mv ancien.txt nouveau.txt</code></td></tr>
      <tr><td><code>rm</code></td><td>Supprimer</td><td><code>rm fichier.txt</code></td></tr>
      <tr><td><code>cat</code></td><td>Voir le contenu</td><td><code>cat fichier.txt</code></td></tr>
      <tr><td><code>sudo</code></td><td>Super-utilisateur</td><td><code>sudo apt install python3</code></td></tr>
    </table>

    <h3>Le système de fichiers</h3>
    <ul>
      <li><code>/</code> : la racine (tout commence ici)</li>
      <li><code>/home</code> : les dossiers des utilisateurs</li>
      <li><code>~</code> : raccourci pour ton dossier personnel</li>
      <li><code>..</code> : dossier parent (remonter d'un niveau)</li>
    </ul>

    <div class="tip">
      💡 <strong>Sur ton Raspberry Pi :</strong> Tu utiliseras le terminal pour installer des programmes, lancer tes scripts Python, et configurer le PiCar-X. C'est ton outil principal !
    </div>`,
    '6ème', 2, 8, JSON.stringify(['linux', 'terminal', 'commandes'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'informatique', 'Commande ls', 'qcm',
    'Quelle commande Linux permet de lister les fichiers ?',
    JSON.stringify(['cd', 'ls', 'rm', 'cp']),
    'ls',
    'ls = list. Elle affiche les fichiers et dossiers du répertoire courant.',
    '6ème', 1, 10, JSON.stringify(['linux']));

  insertExercise.run(courseId, 'informatique', 'Commande mkdir', 'fill',
    'Pour créer un dossier "mon_robot" en ligne de commande, on tape : ... mon_robot',
    JSON.stringify([]), 'mkdir',
    'mkdir = make directory. mkdir mon_robot crée un nouveau dossier.',
    '6ème', 1, 10, JSON.stringify(['linux']));

  insertExercise.run(courseId, 'informatique', 'Commande sudo', 'qcm',
    'La commande "sudo" signifie :',
    JSON.stringify(['Supprimer un dossier', 'Exécuter en tant que super-utilisateur', 'Fermer le terminal', 'Copier un fichier']),
    'Exécuter en tant que super-utilisateur',
    'sudo = Super User DO. Ça donne les droits administrateur pour une commande.',
    '6ème', 1, 10, JSON.stringify(['linux']));

  // Les langages de programmation
  courseId = insertCourse.run('informatique', 'Tour d\'horizon des langages de programmation',
    `<h3>Pourquoi plusieurs langages ?</h3>
    <p>Chaque langage a ses <strong>forces</strong>. On choisit le bon outil pour le bon travail !</p>

    <h3>Les langages populaires</h3>
    <ul>
      <li><strong>🐍 Python</strong> : simple, polyvalent. Idéal pour débuter, IA, science, robotique.
        <div class="example"><code>print("Hello World!")</code></div>
      </li>
      <li><strong>🌐 JavaScript</strong> : le langage du web. Sites internet, applications.
        <div class="example"><code>console.log("Hello World!")</code></div>
      </li>
      <li><strong>📱 Swift / Kotlin</strong> : applications mobiles (iOS / Android)</li>
      <li><strong>🎮 C# / C++</strong> : jeux vidéo (Unity, Unreal Engine)</li>
      <li><strong>🤖 C</strong> : systèmes embarqués, Arduino, très rapide</li>
      <li><strong>📊 SQL</strong> : bases de données (stocker et chercher des informations)</li>
    </ul>

    <h3>Classement par domaine</h3>
    <table style="width:100%; text-align:left;">
      <tr><th>Domaine</th><th>Langages</th></tr>
      <tr><td>🤖 Robotique</td><td>Python, C/C++</td></tr>
      <tr><td>🌐 Web</td><td>JavaScript, Python, PHP</td></tr>
      <tr><td>🎮 Jeux vidéo</td><td>C#, C++, Lua</td></tr>
      <tr><td>📱 Mobile</td><td>Swift, Kotlin, Dart</td></tr>
      <tr><td>🧠 IA</td><td>Python, R</td></tr>
    </table>

    <div class="tip">
      💡 <strong>Pour ton projet :</strong> Tu utilises Python pour le PiCar-X car il est simple et puissant. Mais cette app (Homework Buddy) est écrite en JavaScript ! Chaque langage a son domaine.
    </div>`,
    '6ème', 1, 9, JSON.stringify(['programmation', 'langages', 'code'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'informatique', 'Python pour quoi', 'qcm',
    'Python est particulièrement utilisé pour :',
    JSON.stringify(['Les jeux vidéo AAA', 'L\'IA, la robotique et les sciences', 'Les applications iOS', 'La création de musique']),
    'L\'IA, la robotique et les sciences',
    'Python est le langage star de l\'IA, de la science des données et de la robotique.',
    '6ème', 1, 10, JSON.stringify(['programmation']));

  insertExercise.run(courseId, 'informatique', 'Langage du web', 'fill',
    'Le langage principal pour créer des sites web interactifs est ...',
    JSON.stringify([]), 'JavaScript',
    'JavaScript est LE langage du web. Tous les navigateurs l\'exécutent nativement.',
    '6ème', 1, 10, JSON.stringify(['programmation']));

  insertExercise.run(courseId, 'informatique', 'Langage jeux vidéo', 'qcm',
    'Quel langage est couramment utilisé avec Unity pour créer des jeux vidéo ?',
    JSON.stringify(['Python', 'JavaScript', 'C#', 'SQL']),
    'C#',
    'C# (C Sharp) est le langage principal de Unity, l\'un des moteurs de jeux les plus populaires.',
    '6ème', 1, 10, JSON.stringify(['programmation']));

  // Ajouter les stats informatique pour tous les enfants
  const children = db.prepare("SELECT id FROM users WHERE role = 'child'").all();
  for (const child of children) {
    const statExists = db.prepare("SELECT COUNT(*) as count FROM user_stats WHERE user_id = ? AND subject = 'informatique'").get(child.id);
    if (statExists.count === 0) {
      db.prepare("INSERT INTO user_stats (user_id, subject) VALUES (?, 'informatique')").run(child.id);
    }
  }

  console.log('💻 Contenu Informatique chargé ! (logique, binaire, architecture, réseaux, IA, cybersécurité, Linux, langages)');
}

module.exports = { seedInformatique };
