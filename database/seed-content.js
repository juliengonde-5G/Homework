/**
 * Contenu pédagogique : cours et exercices
 * Français, Anglais, Maths pour 4ème et 6ème
 */

function seedContent(db) {
  const exerciseCount = db.prepare('SELECT COUNT(*) as count FROM exercises').get();
  if (exerciseCount.count > 0) return; // Déjà peuplé

  // Nettoyer les cours existants s'il n'y a pas d'exercices
  db.prepare('DELETE FROM courses').run();

  const insertCourse = db.prepare(`
    INSERT INTO courses (subject, title, content, level, difficulty, order_index, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertExercise = db.prepare(`
    INSERT INTO exercises (course_id, subject, title, type, question, options, correct_answer, explanation, level, difficulty, points, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // ========================================
  // FRANÇAIS - 6ème
  // ========================================
  let courseId;

  courseId = insertCourse.run('francais', 'Les classes grammaticales',
    `<h3>Qu'est-ce qu'une classe grammaticale ?</h3>
    <p>Chaque mot de la langue française appartient à une <strong>classe grammaticale</strong> (on dit aussi "nature du mot"). C'est comme son identité !</p>

    <h3>Les principales classes</h3>
    <ul>
      <li><strong>Le nom</strong> : désigne une personne, un animal, un objet ou une idée (chat, liberté, Paris)</li>
      <li><strong>Le déterminant</strong> : accompagne le nom (le, un, mon, cette)</li>
      <li><strong>L'adjectif</strong> : donne une qualité au nom (grand, bleu, gentil)</li>
      <li><strong>Le verbe</strong> : exprime une action ou un état (manger, être, courir)</li>
      <li><strong>Le pronom</strong> : remplace un nom (je, il, celui-ci)</li>
      <li><strong>L'adverbe</strong> : modifie un verbe ou un adjectif (rapidement, très, bien)</li>
    </ul>

    <div class="example">
      <strong>Exemple :</strong> "Le <em>petit</em> chat <em>mange</em> sa croquette."<br>
      Le = déterminant · petit = adjectif · chat = nom · mange = verbe · sa = déterminant · croquette = nom
    </div>

    <div class="tip">
      💡 <strong>Astuce :</strong> Pour trouver la classe d'un mot, demande-toi : est-ce qu'il nomme quelque chose ? Est-ce qu'il décrit ? Est-ce qu'il exprime une action ?
    </div>`,
    '6ème', 1, 1, JSON.stringify(['grammaire', 'bases'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'francais', 'Nature du mot "rapide"', 'qcm',
    'Quelle est la classe grammaticale du mot "rapide" ?',
    JSON.stringify(['Un nom', 'Un adjectif', 'Un verbe', 'Un adverbe']),
    'Un adjectif',
    '"Rapide" donne une qualité, il décrit quelque chose. C\'est donc un adjectif !',
    '6ème', 1, 10, JSON.stringify(['grammaire']));

  insertExercise.run(courseId, 'francais', 'Nature du mot "courir"', 'qcm',
    'Quelle est la classe grammaticale du mot "courir" ?',
    JSON.stringify(['Un nom', 'Un adjectif', 'Un verbe', 'Un adverbe']),
    'Un verbe',
    '"Courir" exprime une action. C\'est un verbe !',
    '6ème', 1, 10, JSON.stringify(['grammaire']));

  insertExercise.run(courseId, 'francais', 'Nature du mot "très"', 'qcm',
    'Quelle est la classe grammaticale du mot "très" ?',
    JSON.stringify(['Un déterminant', 'Un adjectif', 'Un pronom', 'Un adverbe']),
    'Un adverbe',
    '"Très" modifie un adjectif ou un adverbe (très grand, très vite). C\'est un adverbe !',
    '6ème', 1, 10, JSON.stringify(['grammaire']));

  insertExercise.run(courseId, 'francais', 'Trouve le nom', 'qcm',
    'Dans la phrase "Le chien dort dans le jardin", quels sont les noms ?',
    JSON.stringify(['chien et jardin', 'Le et le', 'dort et dans', 'chien et dort']),
    'chien et jardin',
    'Les noms désignent des choses ou des êtres : le chien (animal) et le jardin (lieu).',
    '6ème', 1, 10, JSON.stringify(['grammaire']));

  // Conjugaison 6ème
  courseId = insertCourse.run('francais', 'Le présent de l\'indicatif',
    `<h3>À quoi sert le présent ?</h3>
    <p>Le présent de l'indicatif sert à exprimer :</p>
    <ul>
      <li>Une action qui se passe <strong>maintenant</strong> : "Je mange une pomme."</li>
      <li>Une <strong>habitude</strong> : "Je me lève à 7h."</li>
      <li>Une <strong>vérité générale</strong> : "La Terre tourne autour du Soleil."</li>
    </ul>

    <h3>Les terminaisons du 1er groupe (-er)</h3>
    <p>Exemple avec <strong>chanter</strong> :</p>
    <ul>
      <li>Je chant<strong>e</strong></li>
      <li>Tu chant<strong>es</strong></li>
      <li>Il/Elle chant<strong>e</strong></li>
      <li>Nous chant<strong>ons</strong></li>
      <li>Vous chant<strong>ez</strong></li>
      <li>Ils/Elles chant<strong>ent</strong></li>
    </ul>

    <h3>Les terminaisons du 2e groupe (-ir comme finir)</h3>
    <p>Je fin<strong>is</strong>, tu fin<strong>is</strong>, il fin<strong>it</strong>, nous fin<strong>issons</strong>, vous fin<strong>issez</strong>, ils fin<strong>issent</strong></p>

    <div class="tip">
      💡 <strong>Astuce :</strong> Pour les verbes du 1er groupe, retiens : e, es, e, ons, ez, ent. C'est toujours pareil !
    </div>`,
    '6ème', 1, 2, JSON.stringify(['conjugaison', 'présent'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'francais', 'Conjuguer au présent', 'fill',
    'Conjugue le verbe "jouer" avec "nous" au présent : nous ...',
    JSON.stringify([]), 'jouons',
    'Nous jouons : avec "nous", les verbes du 1er groupe se terminent par -ons.',
    '6ème', 1, 10, JSON.stringify(['conjugaison']));

  insertExercise.run(courseId, 'francais', 'Conjuguer au présent (2)', 'qcm',
    'Quelle est la bonne conjugaison ? "Tu ... (manger) une glace."',
    JSON.stringify(['Tu mange', 'Tu manges', 'Tu mangent', 'Tu mangez']),
    'Tu manges',
    'Avec "tu", les verbes du 1er groupe prennent -es : tu manges.',
    '6ème', 1, 10, JSON.stringify(['conjugaison']));

  insertExercise.run(courseId, 'francais', 'Conjuguer finir', 'fill',
    'Conjugue "finir" avec "ils" au présent : ils ...',
    JSON.stringify([]), 'finissent',
    'Ils finissent : les verbes du 2e groupe prennent -issent avec ils/elles.',
    '6ème', 1, 10, JSON.stringify(['conjugaison']));

  insertExercise.run(courseId, 'francais', 'Conjuguer chanter', 'qcm',
    '"Elles ... (chanter) une chanson." Quelle forme est correcte ?',
    JSON.stringify(['chante', 'chantes', 'chantent', 'chantez']),
    'chantent',
    'Avec elles (3e personne du pluriel), le verbe prend -ent : elles chantent.',
    '6ème', 1, 10, JSON.stringify(['conjugaison']));

  // Orthographe 6ème
  courseId = insertCourse.run('francais', 'Les homophones : a/à, et/est, son/sont',
    `<h3>Qu'est-ce qu'un homophone ?</h3>
    <p>Des homophones sont des mots qui se prononcent pareil mais qui s'écrivent différemment et n'ont pas le même sens.</p>

    <h3>a / à</h3>
    <ul>
      <li><strong>a</strong> = verbe avoir → on peut le remplacer par "avait"</li>
      <li><strong>à</strong> = préposition → on ne peut PAS le remplacer par "avait"</li>
    </ul>
    <div class="example">"Il <strong>a</strong> mal à la tête." → "Il avait mal" ✅ (c'est le verbe avoir)</div>

    <h3>et / est</h3>
    <ul>
      <li><strong>et</strong> = conjonction (comme "and" en anglais) → on peut le remplacer par "et aussi"</li>
      <li><strong>est</strong> = verbe être → on peut le remplacer par "était"</li>
    </ul>

    <h3>son / sont</h3>
    <ul>
      <li><strong>son</strong> = déterminant possessif → on peut le remplacer par "mon" ou "ton"</li>
      <li><strong>sont</strong> = verbe être → on peut le remplacer par "étaient"</li>
    </ul>

    <div class="tip">
      💡 <strong>Le truc ultime :</strong> Quand tu hésites, essaie de remplacer le mot. Si ça marche avec "avait/était/étaient", c'est le verbe !
    </div>`,
    '6ème', 1, 3, JSON.stringify(['orthographe', 'homophones'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'francais', 'a ou à ?', 'qcm',
    '"Mon frère ... un nouveau vélo." Choisis la bonne réponse.',
    JSON.stringify(['a', 'à']),
    'a',
    'On peut dire "Mon frère avait un nouveau vélo", donc c\'est le verbe avoir : a.',
    '6ème', 1, 10, JSON.stringify(['orthographe']));

  insertExercise.run(courseId, 'francais', 'et ou est ?', 'qcm',
    '"Paul ... gentil ... drôle." Complète avec et/est.',
    JSON.stringify(['est / et', 'et / est', 'est / est', 'et / et']),
    'est / et',
    'Paul "était" gentil (verbe être = est) "et aussi" drôle (conjonction = et).',
    '6ème', 1, 10, JSON.stringify(['orthographe']));

  insertExercise.run(courseId, 'francais', 'son ou sont ?', 'qcm',
    '"Ils ... partis avec ... sac."',
    JSON.stringify(['sont / son', 'son / sont', 'sont / sont', 'son / son']),
    'sont / son',
    'Ils "étaient" partis (verbe être = sont) avec "mon" sac (possessif = son).',
    '6ème', 1, 10, JSON.stringify(['orthographe']));

  // ========================================
  // FRANÇAIS - 4ème
  // ========================================
  courseId = insertCourse.run('francais', 'Les figures de style',
    `<h3>Qu'est-ce qu'une figure de style ?</h3>
    <p>Une figure de style est une façon originale d'utiliser les mots pour créer un effet. On les retrouve en littérature, en poésie, mais aussi dans les chansons et même dans le foot !</p>

    <h3>Les figures les plus courantes</h3>
    <ul>
      <li><strong>La comparaison</strong> : rapproche deux éléments avec un mot outil (comme, tel, pareil à...)
        <div class="example">"Il court <strong>comme</strong> le vent." · "Ce joueur est <strong>tel</strong> un lion."</div>
      </li>
      <li><strong>La métaphore</strong> : comme la comparaison mais SANS mot outil
        <div class="example">"Ce joueur est un lion sur le terrain."</div>
      </li>
      <li><strong>L'hyperbole</strong> : exagération
        <div class="example">"J'ai mille choses à faire." · "Il est mort de fatigue."</div>
      </li>
      <li><strong>La personnification</strong> : donner des qualités humaines à un objet ou animal
        <div class="example">"Le vent hurle." · "La mer en colère."</div>
      </li>
      <li><strong>L'antithèse</strong> : opposition de deux idées
        <div class="example">"Certains rient, d'autres pleurent."</div>
      </li>
    </ul>

    <div class="tip">
      💡 <strong>Astuce :</strong> Comparaison = avec "comme" / Métaphore = sans "comme". C'est la différence clé !
    </div>`,
    '4ème', 1, 1, JSON.stringify(['littérature', 'figures de style'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'francais', 'Reconnaître une comparaison', 'qcm',
    'Quelle phrase contient une comparaison ?',
    JSON.stringify(['"Il est un lion."', '"Il est fort comme un lion."', '"Le lion rugit."', '"Sa force est légendaire."']),
    '"Il est fort comme un lion."',
    'La comparaison utilise un mot outil : "comme". Sans ce mot, ce serait une métaphore.',
    '4ème', 1, 10, JSON.stringify(['figures de style']));

  insertExercise.run(courseId, 'francais', 'Identifier la figure', 'qcm',
    '"J\'ai attendu une éternité !" Quelle figure de style est-ce ?',
    JSON.stringify(['Une comparaison', 'Une métaphore', 'Une hyperbole', 'Une personnification']),
    'Une hyperbole',
    'C\'est une exagération : on n\'a pas vraiment attendu une éternité. C\'est une hyperbole !',
    '4ème', 1, 10, JSON.stringify(['figures de style']));

  insertExercise.run(courseId, 'francais', 'La personnification', 'qcm',
    '"La nuit enveloppait la ville de son manteau noir." Quelle figure de style ?',
    JSON.stringify(['Comparaison', 'Hyperbole', 'Personnification', 'Antithèse']),
    'Personnification',
    'La nuit agit comme une personne qui enveloppe. C\'est une personnification !',
    '4ème', 1, 10, JSON.stringify(['figures de style']));

  // Conjugaison 4ème
  courseId = insertCourse.run('francais', 'Le subjonctif présent',
    `<h3>Quand utilise-t-on le subjonctif ?</h3>
    <p>Le subjonctif s'utilise pour exprimer :</p>
    <ul>
      <li>Un <strong>souhait</strong> : "Je veux qu'il <strong>vienne</strong>."</li>
      <li>Un <strong>doute</strong> : "Je doute qu'il <strong>soit</strong> là."</li>
      <li>Une <strong>obligation</strong> : "Il faut que tu <strong>fasses</strong> tes devoirs."</li>
      <li>Un <strong>sentiment</strong> : "Je suis content que tu <strong>sois</strong> là."</li>
    </ul>

    <h3>Formation</h3>
    <p>On part de la 3e personne du pluriel au présent de l'indicatif et on ajoute les terminaisons :</p>
    <p><strong>-e, -es, -e, -ions, -iez, -ent</strong></p>

    <div class="example">
      Finir → ils finiss<strong>ent</strong> → que je finiss<strong>e</strong>, que tu finiss<strong>es</strong>...
    </div>

    <h3>Verbes irréguliers importants</h3>
    <ul>
      <li>Être : que je <strong>sois</strong>, que tu sois, qu'il soit, que nous soyons, que vous soyez, qu'ils soient</li>
      <li>Avoir : que j'<strong>aie</strong>, que tu aies, qu'il ait, que nous ayons, que vous ayez, qu'ils aient</li>
      <li>Faire : que je <strong>fasse</strong></li>
      <li>Aller : que j'<strong>aille</strong></li>
    </ul>

    <div class="tip">
      💡 <strong>Le truc :</strong> Si tu peux mettre "il faut que..." avant, c'est du subjonctif !
    </div>`,
    '4ème', 2, 2, JSON.stringify(['conjugaison', 'subjonctif'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'francais', 'Subjonctif de être', 'qcm',
    '"Il faut que tu ... présent." Choisis la bonne forme.',
    JSON.stringify(['es', 'sois', 'soit', 'seras']),
    'sois',
    'Après "il faut que", on utilise le subjonctif. "Être" au subjonctif avec "tu" = sois.',
    '4ème', 2, 15, JSON.stringify(['conjugaison']));

  insertExercise.run(courseId, 'francais', 'Subjonctif ou indicatif ?', 'qcm',
    'Quelle phrase utilise le subjonctif ?',
    JSON.stringify(['Je pense qu\'il vient.', 'Je veux qu\'il vienne.', 'Je sais qu\'il vient.', 'Il dit qu\'il vient.']),
    'Je veux qu\'il vienne.',
    '"Vouloir que" exprime un souhait, ce qui déclenche le subjonctif.',
    '4ème', 2, 15, JSON.stringify(['conjugaison']));

  insertExercise.run(courseId, 'francais', 'Conjuguer au subjonctif', 'fill',
    'Complète : "Il faut que nous ... (faire) nos devoirs."',
    JSON.stringify([]), 'fassions',
    '"Faire" au subjonctif avec "nous" = fassions.',
    '4ème', 2, 15, JSON.stringify(['conjugaison']));

  // ========================================
  // ANGLAIS - 6ème
  // ========================================
  courseId = insertCourse.run('anglais', 'Present Simple - Les bases',
    `<h3>What is the Present Simple?</h3>
    <p>Le Present Simple sert à parler de :</p>
    <ul>
      <li><strong>Habitudes</strong> : "I <strong>play</strong> football every day." (Je joue au foot tous les jours.)</li>
      <li><strong>Vérités générales</strong> : "The sun <strong>rises</strong> in the east." (Le soleil se lève à l'est.)</li>
      <li><strong>Goûts</strong> : "I <strong>like</strong> chocolate." (J'aime le chocolat.)</li>
    </ul>

    <h3>La règle du S</h3>
    <p>Avec <strong>he, she, it</strong> (3e personne du singulier), on ajoute un <strong>-s</strong> au verbe !</p>
    <div class="example">
      I play → He play<strong>s</strong><br>
      I like → She like<strong>s</strong><br>
      I watch → He watch<strong>es</strong> (après ch, sh, s, x, o → -es)
    </div>

    <h3>La forme négative</h3>
    <p>On utilise <strong>don't</strong> (I/you/we/they) ou <strong>doesn't</strong> (he/she/it) + verbe sans -s</p>
    <div class="example">
      I <strong>don't</strong> like spiders. (Je n'aime pas les araignées.)<br>
      He <strong>doesn't</strong> play tennis. (Il ne joue pas au tennis.)
    </div>

    <div class="tip">
      💡 <strong>Remember:</strong> He/She/It → ajoute un S ! Sauf avec don't/doesn't où le S disparaît.
    </div>`,
    '6ème', 1, 1, JSON.stringify(['grammaire', 'present simple'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'anglais', 'He/She + S', 'qcm',
    'Choose the correct form: "She ... (play) tennis every Saturday."',
    JSON.stringify(['play', 'plays', 'playes', 'playing']),
    'plays',
    'With "she" (3rd person), we add -s to the verb: she plays.',
    '6ème', 1, 10, JSON.stringify(['present simple']));

  insertExercise.run(courseId, 'anglais', 'Forme négative', 'qcm',
    'Complete: "He ... like pizza."',
    JSON.stringify(["don't", "doesn't", "not", "isn't"]),
    "doesn't",
    'With "he" (3rd person), we use "doesn\'t" for the negative form.',
    '6ème', 1, 10, JSON.stringify(['present simple']));

  insertExercise.run(courseId, 'anglais', 'Present Simple', 'fill',
    'Complete with the right form: "My cat ... (sleep) a lot."',
    JSON.stringify([]), 'sleeps',
    'My cat = it (3rd person singular), so we add -s: sleeps.',
    '6ème', 1, 10, JSON.stringify(['present simple']));

  insertExercise.run(courseId, 'anglais', 'Negative form', 'qcm',
    '"They ... (not/like) vegetables." Choose the correct form.',
    JSON.stringify(["doesn't like", "don't like", "not like", "don't likes"]),
    "don't like",
    'They → we use "don\'t" (not "doesn\'t"). And the verb stays without -s after don\'t.',
    '6ème', 1, 10, JSON.stringify(['present simple']));

  // Vocabulaire anglais 6ème
  courseId = insertCourse.run('anglais', 'Vocabulary: My Daily Routine',
    `<h3>Les mots de la journée</h3>
    <ul>
      <li><strong>wake up</strong> = se réveiller</li>
      <li><strong>get up</strong> = se lever</li>
      <li><strong>have breakfast</strong> = prendre le petit-déjeuner</li>
      <li><strong>go to school</strong> = aller à l'école</li>
      <li><strong>have lunch</strong> = déjeuner</li>
      <li><strong>do homework</strong> = faire les devoirs</li>
      <li><strong>have dinner</strong> = dîner</li>
      <li><strong>go to bed</strong> = aller au lit</li>
      <li><strong>brush my teeth</strong> = se brosser les dents</li>
    </ul>

    <h3>Les marqueurs de temps</h3>
    <ul>
      <li><strong>in the morning</strong> = le matin</li>
      <li><strong>in the afternoon</strong> = l'après-midi</li>
      <li><strong>in the evening</strong> = le soir</li>
      <li><strong>at night</strong> = la nuit</li>
      <li><strong>every day</strong> = tous les jours</li>
    </ul>

    <div class="example">
      "I <strong>wake up</strong> at 7 o'clock <strong>in the morning</strong>. I <strong>have breakfast</strong> and then I <strong>go to school</strong>."
    </div>`,
    '6ème', 1, 2, JSON.stringify(['vocabulaire', 'daily routine'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'anglais', 'Traduire: petit-déjeuner', 'qcm',
    'Comment dit-on "prendre le petit-déjeuner" en anglais ?',
    JSON.stringify(['have dinner', 'have breakfast', 'have lunch', 'eat morning']),
    'have breakfast',
    'Breakfast = petit-déjeuner. Have breakfast = prendre le petit-déjeuner.',
    '6ème', 1, 10, JSON.stringify(['vocabulaire']));

  insertExercise.run(courseId, 'anglais', 'Daily routine', 'qcm',
    '"I ... at 7 o\'clock every morning." Choose the best answer.',
    JSON.stringify(['go to bed', 'have dinner', 'wake up', 'have lunch']),
    'wake up',
    'At 7 o\'clock in the morning, you "wake up" (se réveiller).',
    '6ème', 1, 10, JSON.stringify(['vocabulaire']));

  insertExercise.run(courseId, 'anglais', 'Traduire: devoirs', 'fill',
    'Comment dit-on "faire les devoirs" ? → do ...',
    JSON.stringify([]), 'homework',
    'Do homework = faire les devoirs.',
    '6ème', 1, 10, JSON.stringify(['vocabulaire']));

  // ========================================
  // ANGLAIS - 4ème
  // ========================================
  courseId = insertCourse.run('anglais', 'Present Perfect - Introduction',
    `<h3>What is the Present Perfect?</h3>
    <p>Le Present Perfect fait le lien entre le <strong>passé et le présent</strong>. Il exprime :</p>
    <ul>
      <li>Une <strong>expérience de vie</strong> : "I <strong>have visited</strong> London." (J'ai visité Londres.)</li>
      <li>Une action passée avec un <strong>résultat présent</strong> : "I <strong>have lost</strong> my keys." (J'ai perdu mes clés = je ne les ai toujours pas.)</li>
      <li>Une action qui <strong>vient de se passer</strong> : "He <strong>has just scored</strong> a goal!" (Il vient juste de marquer un but !)</li>
    </ul>

    <h3>Formation</h3>
    <p><strong>have/has + participe passé (past participle)</strong></p>
    <ul>
      <li>I/You/We/They <strong>have</strong> + past participle</li>
      <li>He/She/It <strong>has</strong> + past participle</li>
    </ul>

    <h3>Mots clés</h3>
    <ul>
      <li><strong>ever</strong> (déjà, dans une question) : "Have you <strong>ever</strong> been to Paris?"</li>
      <li><strong>never</strong> (jamais) : "I have <strong>never</strong> eaten sushi."</li>
      <li><strong>just</strong> (vient de) : "She has <strong>just</strong> arrived."</li>
      <li><strong>already</strong> (déjà) : "I have <strong>already</strong> finished."</li>
      <li><strong>yet</strong> (pas encore) : "I haven't finished <strong>yet</strong>."</li>
    </ul>

    <div class="tip">
      💡 <strong>Comparaison foot :</strong> "Mbappé <strong>has scored</strong> 3 goals this season." → Le lien passé-présent : les buts sont marqués et la saison continue !
    </div>`,
    '4ème', 2, 1, JSON.stringify(['grammaire', 'present perfect'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'anglais', 'Present Perfect: have/has', 'qcm',
    'Choose: "She ... (visit) three countries."',
    JSON.stringify(['have visited', 'has visited', 'has visit', 'have visit']),
    'has visited',
    'She → has + past participle. "Has visited" is correct.',
    '4ème', 2, 15, JSON.stringify(['present perfect']));

  insertExercise.run(courseId, 'anglais', 'Ever/Never', 'qcm',
    '"Have you ... been to England?" Choose the right word.',
    JSON.stringify(['never', 'ever', 'already', 'just']),
    'ever',
    'In questions, we use "ever" (= déjà). "Never" is for negative statements.',
    '4ème', 2, 15, JSON.stringify(['present perfect']));

  insertExercise.run(courseId, 'anglais', 'Just', 'fill',
    'Complete: "He has ... scored a goal!" (= Il vient juste de marquer)',
    JSON.stringify([]), 'just',
    '"Just" means "vient de". It goes between "has" and the past participle.',
    '4ème', 2, 15, JSON.stringify(['present perfect']));

  insertExercise.run(courseId, 'anglais', 'Present Perfect negative', 'qcm',
    '"I ... finished my homework yet."',
    JSON.stringify(["haven't", "hasn't", "don't have", "didn't"]),
    "haven't",
    'I → have. Negative = haven\'t. "Yet" is used in negative sentences.',
    '4ème', 2, 15, JSON.stringify(['present perfect']));

  // ========================================
  // MATHS - 6ème
  // ========================================
  courseId = insertCourse.run('maths', 'Les fractions - Les bases',
    `<h3>Qu'est-ce qu'une fraction ?</h3>
    <p>Une fraction représente une <strong>partie d'un tout</strong>.</p>
    <p>Elle s'écrit avec un <strong>numérateur</strong> (en haut) et un <strong>dénominateur</strong> (en bas).</p>

    <div class="example">
      <strong>3/4</strong> signifie : on a divisé quelque chose en <strong>4 parts égales</strong> et on en prend <strong>3</strong>.<br>
      🍕 Imagine une pizza coupée en 4 : tu en manges 3 parts = 3/4 de la pizza !
    </div>

    <h3>Fractions égales</h3>
    <p>On peut <strong>simplifier</strong> une fraction en divisant le numérateur et le dénominateur par le même nombre :</p>
    <div class="example">
      4/8 = 2/4 = <strong>1/2</strong> (on divise par 2 à chaque fois)
    </div>

    <h3>Comparer des fractions</h3>
    <p>Si les fractions ont le <strong>même dénominateur</strong>, on compare les numérateurs :</p>
    <div class="example">
      3/5 > 2/5 car 3 > 2
    </div>

    <div class="tip">
      💡 <strong>Astuce :</strong> 1/2 = la moitié, 1/4 = un quart, 3/4 = trois quarts. Ce sont les fractions les plus courantes !
    </div>`,
    '6ème', 1, 1, JSON.stringify(['fractions', 'nombres'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'maths', 'Comprendre une fraction', 'qcm',
    'Que représente la fraction 2/5 ?',
    JSON.stringify(['2 parts sur 5 parts égales', '5 parts sur 2', '2 fois 5', '2 plus 5']),
    '2 parts sur 5 parts égales',
    '2/5 signifie qu\'on prend 2 parts sur un total de 5 parts égales.',
    '6ème', 1, 10, JSON.stringify(['fractions']));

  insertExercise.run(courseId, 'maths', 'Simplifier une fraction', 'qcm',
    'Quelle est la forme simplifiée de 6/8 ?',
    JSON.stringify(['2/4', '3/4', '6/8', '1/2']),
    '3/4',
    '6/8 : on divise 6 et 8 par 2 → 3/4. On ne peut plus simplifier.',
    '6ème', 1, 10, JSON.stringify(['fractions']));

  insertExercise.run(courseId, 'maths', 'Comparer des fractions', 'qcm',
    'Quelle fraction est la plus grande : 3/7 ou 5/7 ?',
    JSON.stringify(['3/7', '5/7', 'Elles sont égales']),
    '5/7',
    'Même dénominateur (7), donc on compare les numérateurs : 5 > 3, donc 5/7 > 3/7.',
    '6ème', 1, 10, JSON.stringify(['fractions']));

  insertExercise.run(courseId, 'maths', 'Fraction = ?', 'fill',
    'Simplifie la fraction 4/8 (écris le résultat comme a/b) :',
    JSON.stringify([]), '1/2',
    '4/8 : on divise par 4 → 1/2. La moitié !',
    '6ème', 1, 10, JSON.stringify(['fractions']));

  // Géométrie 6ème
  courseId = insertCourse.run('maths', 'Les angles',
    `<h3>Qu'est-ce qu'un angle ?</h3>
    <p>Un angle est formé par <strong>deux demi-droites</strong> qui partent du même point (le sommet).</p>
    <p>On mesure un angle en <strong>degrés (°)</strong> avec un rapporteur.</p>

    <h3>Les types d'angles</h3>
    <ul>
      <li><strong>Angle aigu</strong> : entre 0° et 90° (petit angle)</li>
      <li><strong>Angle droit</strong> : exactement 90° (comme le coin d'une feuille)</li>
      <li><strong>Angle obtus</strong> : entre 90° et 180° (grand angle)</li>
      <li><strong>Angle plat</strong> : exactement 180° (une ligne droite)</li>
    </ul>

    <div class="example">
      L'angle d'un coin de ta table = <strong>90°</strong> (angle droit)<br>
      L'angle d'une part de pizza = environ <strong>45°</strong> (angle aigu)
    </div>

    <div class="tip">
      💡 <strong>Astuce :</strong> Un angle droit = un L. Si l'angle est plus fermé que le L, il est aigu. S'il est plus ouvert, il est obtus.
    </div>`,
    '6ème', 1, 2, JSON.stringify(['géométrie', 'angles'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'maths', 'Type d\'angle 45°', 'qcm',
    'Un angle de 45° est un angle :',
    JSON.stringify(['aigu', 'droit', 'obtus', 'plat']),
    'aigu',
    '45° est inférieur à 90°, c\'est donc un angle aigu.',
    '6ème', 1, 10, JSON.stringify(['géométrie']));

  insertExercise.run(courseId, 'maths', 'Angle droit', 'qcm',
    'Combien de degrés mesure un angle droit ?',
    JSON.stringify(['45°', '90°', '180°', '360°']),
    '90°',
    'Un angle droit mesure exactement 90°.',
    '6ème', 1, 10, JSON.stringify(['géométrie']));

  insertExercise.run(courseId, 'maths', 'Type d\'angle 120°', 'qcm',
    'Un angle de 120° est un angle :',
    JSON.stringify(['aigu', 'droit', 'obtus', 'plat']),
    'obtus',
    '120° est entre 90° et 180°, c\'est un angle obtus.',
    '6ème', 1, 10, JSON.stringify(['géométrie']));

  // ========================================
  // MATHS - 4ème
  // ========================================
  courseId = insertCourse.run('maths', 'Le théorème de Pythagore',
    `<h3>Le théorème</h3>
    <p>Dans un <strong>triangle rectangle</strong>, le carré de l'hypoténuse est égal à la somme des carrés des deux autres côtés.</p>

    <div class="example">
      Si les côtés de l'angle droit mesurent <strong>a</strong> et <strong>b</strong>, et l'hypoténuse mesure <strong>c</strong> :<br><br>
      <strong>a² + b² = c²</strong>
    </div>

    <h3>Qu'est-ce que l'hypoténuse ?</h3>
    <p>C'est le <strong>plus grand côté</strong> du triangle rectangle, celui qui est <strong>en face de l'angle droit</strong>.</p>

    <h3>Exemple concret</h3>
    <p>Un triangle rectangle avec des côtés de 3 cm et 4 cm :</p>
    <div class="example">
      3² + 4² = 9 + 16 = <strong>25</strong><br>
      c² = 25, donc c = √25 = <strong>5 cm</strong>
    </div>

    <h3>À quoi ça sert ?</h3>
    <ul>
      <li>Calculer une <strong>distance</strong> qu'on ne peut pas mesurer directement</li>
      <li>Vérifier si un triangle est <strong>rectangle</strong></li>
    </ul>

    <div class="tip">
      💡 <strong>Le trio magique :</strong> 3-4-5 est le triplet de Pythagore le plus connu. 5-12-13 et 8-15-17 aussi !
    </div>`,
    '4ème', 2, 1, JSON.stringify(['géométrie', 'pythagore'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'maths', 'Pythagore: calcul hypoténuse', 'qcm',
    'Un triangle rectangle a des côtés de 3 cm et 4 cm. Combien mesure l\'hypoténuse ?',
    JSON.stringify(['5 cm', '7 cm', '12 cm', '25 cm']),
    '5 cm',
    '3² + 4² = 9 + 16 = 25. √25 = 5 cm.',
    '4ème', 2, 15, JSON.stringify(['pythagore']));

  insertExercise.run(courseId, 'maths', 'Identifier l\'hypoténuse', 'qcm',
    'L\'hypoténuse d\'un triangle rectangle est :',
    JSON.stringify(['Le plus petit côté', 'Le côté de l\'angle droit', 'Le plus grand côté, face à l\'angle droit', 'N\'importe quel côté']),
    'Le plus grand côté, face à l\'angle droit',
    'L\'hypoténuse est toujours le plus grand côté et se situe face à l\'angle droit.',
    '4ème', 2, 15, JSON.stringify(['pythagore']));

  insertExercise.run(courseId, 'maths', 'Pythagore: vrai ou faux ?', 'truefalse',
    'Un triangle de côtés 5, 12 et 13 est rectangle. Vrai ou faux ?',
    JSON.stringify(['Vrai', 'Faux']),
    'Vrai',
    '5² + 12² = 25 + 144 = 169 = 13². L\'égalité est vérifiée, donc le triangle est rectangle !',
    '4ème', 2, 15, JSON.stringify(['pythagore']));

  insertExercise.run(courseId, 'maths', 'Calcul avec Pythagore', 'fill',
    'Un triangle rectangle a une hypoténuse de 10 cm et un côté de 6 cm. Quel est l\'autre côté ? (en cm)',
    JSON.stringify([]), '8',
    '10² - 6² = 100 - 36 = 64. √64 = 8 cm.',
    '4ème', 2, 15, JSON.stringify(['pythagore']));

  // Calcul littéral 4ème
  courseId = insertCourse.run('maths', 'Le calcul littéral - Développer et factoriser',
    `<h3>C'est quoi le calcul littéral ?</h3>
    <p>C'est du calcul avec des <strong>lettres</strong> qui représentent des nombres. On utilise souvent x, y, a, b...</p>

    <h3>Développer</h3>
    <p>Développer, c'est <strong>supprimer les parenthèses</strong> en distribuant la multiplication.</p>
    <div class="example">
      <strong>3(x + 2)</strong> = 3 × x + 3 × 2 = <strong>3x + 6</strong><br><br>
      <strong>(x + 3)(x + 2)</strong> = x×x + x×2 + 3×x + 3×2 = <strong>x² + 5x + 6</strong>
    </div>

    <h3>Factoriser</h3>
    <p>Factoriser, c'est l'inverse : on <strong>met en facteur</strong> ce qui est commun.</p>
    <div class="example">
      <strong>3x + 6</strong> = <strong>3(x + 2)</strong> (3 est le facteur commun)<br><br>
      <strong>x² + 5x</strong> = <strong>x(x + 5)</strong> (x est le facteur commun)
    </div>

    <div class="tip">
      💡 <strong>Astuce :</strong> Développer = on "ouvre" les parenthèses. Factoriser = on les "referme". Ce sont des opérations inverses !
    </div>`,
    '4ème', 2, 2, JSON.stringify(['algèbre', 'calcul littéral'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'maths', 'Développer 2(x+3)', 'qcm',
    'Développe : 2(x + 3) = ?',
    JSON.stringify(['2x + 3', '2x + 6', 'x + 6', '2x + 5']),
    '2x + 6',
    '2 × x = 2x et 2 × 3 = 6. Donc 2(x + 3) = 2x + 6.',
    '4ème', 2, 15, JSON.stringify(['algèbre']));

  insertExercise.run(courseId, 'maths', 'Factoriser 4x + 8', 'qcm',
    'Factorise : 4x + 8 = ?',
    JSON.stringify(['4(x + 8)', '4(x + 2)', '2(2x + 4)', '8(x + 1)']),
    '4(x + 2)',
    'Le facteur commun est 4 : 4x ÷ 4 = x, 8 ÷ 4 = 2. Donc 4(x + 2).',
    '4ème', 2, 15, JSON.stringify(['algèbre']));

  insertExercise.run(courseId, 'maths', 'Développer 5(2x - 1)', 'fill',
    'Développe : 5(2x - 1) = ? (écris la réponse sans espace)',
    JSON.stringify([]), '10x-5',
    '5 × 2x = 10x et 5 × (-1) = -5. Donc 10x - 5.',
    '4ème', 2, 15, JSON.stringify(['algèbre']));

  console.log('📚 Contenu pédagogique chargé avec succès !');
}

module.exports = { seedContent };
