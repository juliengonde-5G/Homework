/**
 * Contenu enrichi Anglais - 6ème et 4ème
 * Complète le seed-content.js avec plus de cours et exercices
 */

function seedAnglais(db) {
  const existing = db.prepare("SELECT COUNT(*) as count FROM courses WHERE subject = 'anglais' AND title LIKE '%Irregular%'").get();
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
  // ANGLAIS 6ème - Cours supplémentaires
  // ========================================

  // Present Continuous 6ème
  courseId = insertCourse.run('anglais', 'Present Continuous - Be + V-ing',
    `<h3>What is the Present Continuous?</h3>
    <p>Le Present Continuous sert à parler de ce qui se passe <strong>en ce moment</strong>.</p>

    <h3>Formation</h3>
    <p><strong>be (am/is/are) + verbe-ing</strong></p>
    <ul>
      <li>I <strong>am playing</strong> football. (Je suis en train de jouer au foot.)</li>
      <li>She <strong>is reading</strong> a book. (Elle est en train de lire.)</li>
      <li>They <strong>are watching</strong> TV. (Ils regardent la télé.)</li>
    </ul>

    <h3>Règles d'orthographe pour le -ing</h3>
    <ul>
      <li>Règle normale : play → play<strong>ing</strong></li>
      <li>-e final : mak<strong>e</strong> → mak<strong>ing</strong> (on enlève le e)</li>
      <li>Consonne doublée : run → ru<strong>nn</strong>ing, swim → swi<strong>mm</strong>ing</li>
    </ul>

    <h3>Forme négative et question</h3>
    <div class="example">
      Négatif : I <strong>am not</strong> sleeping. / She <strong>isn't</strong> working.<br>
      Question : <strong>Are</strong> you listening? / <strong>Is</strong> he coming?
    </div>

    <div class="tip">
      💡 <strong>Present Simple vs Continuous :</strong><br>
      Simple = habitude (I play football every day)<br>
      Continuous = maintenant (I am playing football right now)
    </div>`,
    '6ème', 1, 3, JSON.stringify(['grammaire', 'present continuous'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'anglais', 'Form the present continuous', 'qcm',
    '"Look! The cat ... (sleep) on the sofa."',
    JSON.stringify(['sleeps', 'is sleeping', 'sleeping', 'sleep']),
    'is sleeping',
    'The cat = it → is + sleeping. Action happening right now = present continuous.',
    '6ème', 1, 10, JSON.stringify(['present continuous']));

  insertExercise.run(courseId, 'anglais', '-ing spelling', 'qcm',
    'What is the -ing form of "make"?',
    JSON.stringify(['makeing', 'making', 'makking', 'mading']),
    'making',
    'When a verb ends in -e, drop the -e and add -ing: make → making.',
    '6ème', 1, 10, JSON.stringify(['present continuous']));

  insertExercise.run(courseId, 'anglais', 'Negative continuous', 'fill',
    'Complete: "She ... not watching TV." (use the verb "be")',
    JSON.stringify([]), 'is',
    'She → is. "She is not watching TV."',
    '6ème', 1, 10, JSON.stringify(['present continuous']));

  insertExercise.run(courseId, 'anglais', 'Simple or Continuous?', 'qcm',
    'Which sentence describes a habit?',
    JSON.stringify(['I am eating breakfast.', 'I eat breakfast every morning.', 'I am running now.', 'She is reading a book.']),
    'I eat breakfast every morning.',
    'Habits use the Present Simple. "Every morning" = habitude → Present Simple.',
    '6ème', 1, 10, JSON.stringify(['present continuous']));

  // Can / Can't 6ème
  courseId = insertCourse.run('anglais', 'Can / Can\'t - Abilities',
    `<h3>Exprimer ce qu'on sait faire</h3>
    <p><strong>Can</strong> = savoir faire / pouvoir. <strong>Can't</strong> = ne pas savoir / ne pas pouvoir.</p>

    <h3>Règles importantes</h3>
    <ul>
      <li>Can ne change <strong>jamais</strong> : I can, he can, she can, they can (pas de -s !)</li>
      <li>Le verbe après can est <strong>sans "to"</strong> : I can swim (pas "I can to swim")</li>
    </ul>

    <h3>Exemples</h3>
    <div class="example">
      I <strong>can</strong> play the guitar. 🎸 (Je sais jouer de la guitare.)<br>
      She <strong>can't</strong> swim. 🏊 (Elle ne sait pas nager.)<br>
      <strong>Can</strong> you speak English? (Tu sais parler anglais ?)
    </div>

    <h3>Questions avec Can</h3>
    <div class="example">
      <strong>Can</strong> I go to the toilet? (Est-ce que je peux aller aux toilettes ?)<br>
      <strong>Can</strong> you help me? (Tu peux m'aider ?)
    </div>

    <div class="tip">
      💡 <strong>Remember:</strong> Can + verb (without "to"). He can play (NOT he cans play, NOT he can to play).
    </div>`,
    '6ème', 1, 4, JSON.stringify(['grammaire', 'modal verbs'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'anglais', 'Can with he/she', 'qcm',
    '"He ... speak three languages." Choose the correct form.',
    JSON.stringify(['cans', 'can', 'can to', 'is can']),
    'can',
    'Can never changes! No -s with he/she/it. He can speak.',
    '6ème', 1, 10, JSON.stringify(['modal verbs']));

  insertExercise.run(courseId, 'anglais', 'Can question', 'qcm',
    'How do you ask "Tu sais nager ?" in English?',
    JSON.stringify(['Do you can swim?', 'Can you swim?', 'You can swim?', 'Are you can swim?']),
    'Can you swim?',
    'Questions with "can": Can + subject + verb. Can you swim?',
    '6ème', 1, 10, JSON.stringify(['modal verbs']));

  insertExercise.run(courseId, 'anglais', 'Can or Can\'t', 'qcm',
    '"Fish ... fly, but they ... swim very well."',
    JSON.stringify(["can / can't", "can't / can", "can / can", "can't / can't"]),
    "can't / can",
    'Fish cannot fly (can\'t) but they can swim very well.',
    '6ème', 1, 10, JSON.stringify(['modal verbs']));

  // There is / There are 6ème
  courseId = insertCourse.run('anglais', 'There is / There are',
    `<h3>Exprimer l'existence</h3>
    <p><strong>There is</strong> = il y a (singulier) · <strong>There are</strong> = il y a (pluriel)</p>

    <h3>Exemples</h3>
    <div class="example">
      <strong>There is</strong> a cat in the garden. (Il y a un chat dans le jardin.)<br>
      <strong>There are</strong> three books on the table. (Il y a trois livres sur la table.)
    </div>

    <h3>Formes négative et interrogative</h3>
    <ul>
      <li>Négatif : There <strong>isn't</strong> a park. / There <strong>aren't</strong> any shops.</li>
      <li>Question : <strong>Is there</strong> a cinema? / <strong>Are there</strong> any restaurants?</li>
    </ul>

    <h3>Some et Any</h3>
    <ul>
      <li><strong>some</strong> = dans les phrases affirmatives : There are <strong>some</strong> apples.</li>
      <li><strong>any</strong> = dans les négations et questions : Are there <strong>any</strong> bananas?</li>
    </ul>

    <div class="tip">
      💡 <strong>Astuce :</strong> 1 chose = there IS · 2+ choses = there ARE. Facile !
    </div>`,
    '6ème', 1, 5, JSON.stringify(['grammaire', 'there is are'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'anglais', 'Is or Are?', 'qcm',
    '"There ... five students in the classroom."',
    JSON.stringify(['is', 'are', 'has', 'have']),
    'are',
    'Five students = plural → There ARE five students.',
    '6ème', 1, 10, JSON.stringify(['there is are']));

  insertExercise.run(courseId, 'anglais', 'Some or Any?', 'qcm',
    '"Are there ... eggs in the fridge?"',
    JSON.stringify(['some', 'any', 'a', 'the']),
    'any',
    'In questions, we use "any" (not "some").',
    '6ème', 1, 10, JSON.stringify(['there is are']));

  insertExercise.run(courseId, 'anglais', 'There is/are negative', 'fill',
    '"There ... a swimming pool in my town." (negative - use isn\'t or aren\'t)',
    JSON.stringify([]), "isn't",
    'A swimming pool = singular → There isn\'t.',
    '6ème', 1, 10, JSON.stringify(['there is are']));

  // Vocabulary: Feelings & Personality 6ème
  courseId = insertCourse.run('anglais', 'Vocabulary: Feelings & Personality',
    `<h3>How are you feeling?</h3>
    <ul>
      <li><strong>happy</strong> 😊 = content, heureux</li>
      <li><strong>sad</strong> 😢 = triste</li>
      <li><strong>angry</strong> 😠 = en colère</li>
      <li><strong>tired</strong> 😴 = fatigué</li>
      <li><strong>excited</strong> 🤩 = excité, enthousiaste</li>
      <li><strong>bored</strong> 😑 = qui s'ennuie</li>
      <li><strong>scared</strong> 😨 = qui a peur</li>
      <li><strong>hungry</strong> 🍔 = qui a faim</li>
      <li><strong>thirsty</strong> 🥤 = qui a soif</li>
    </ul>

    <h3>Describe someone's personality</h3>
    <ul>
      <li><strong>kind</strong> = gentil</li>
      <li><strong>funny</strong> = drôle</li>
      <li><strong>shy</strong> = timide</li>
      <li><strong>brave</strong> = courageux</li>
      <li><strong>clever</strong> = intelligent</li>
      <li><strong>lazy</strong> = paresseux</li>
      <li><strong>friendly</strong> = amical, sympathique</li>
    </ul>

    <div class="example">
      "My friend is very <strong>funny</strong> and <strong>kind</strong>."<br>
      "I'm feeling <strong>tired</strong> but <strong>happy</strong>."
    </div>

    <div class="tip">
      💡 <strong>I am</strong> + feeling / <strong>He/She is</strong> + personality trait. Use "be" !
    </div>`,
    '6ème', 1, 6, JSON.stringify(['vocabulaire', 'feelings'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'anglais', 'Translate: fatigué', 'qcm',
    'How do you say "fatigué" in English?',
    JSON.stringify(['hungry', 'angry', 'tired', 'scared']),
    'tired',
    'Tired = fatigué. Be careful: hungry = faim, angry = colère.',
    '6ème', 1, 10, JSON.stringify(['vocabulaire']));

  insertExercise.run(courseId, 'anglais', 'Opposite feelings', 'qcm',
    'What is the opposite of "happy"?',
    JSON.stringify(['angry', 'sad', 'bored', 'scared']),
    'sad',
    'Happy (heureux) ↔ Sad (triste). They are opposites.',
    '6ème', 1, 10, JSON.stringify(['vocabulaire']));

  insertExercise.run(courseId, 'anglais', 'Personality', 'fill',
    'Someone who makes you laugh is ...',
    JSON.stringify([]), 'funny',
    'Funny = drôle. A funny person makes you laugh.',
    '6ème', 1, 10, JSON.stringify(['vocabulaire']));

  // ========================================
  // ANGLAIS 4ème - Cours supplémentaires
  // ========================================

  // Past Simple 4ème
  courseId = insertCourse.run('anglais', 'Past Simple - Regular & Irregular Verbs',
    `<h3>Le Past Simple</h3>
    <p>On utilise le Past Simple pour parler d'<strong>actions terminées dans le passé</strong>.</p>

    <h3>Verbes réguliers : + ed</h3>
    <div class="example">
      play → play<strong>ed</strong> · watch → watch<strong>ed</strong> · stop → stopp<strong>ed</strong><br>
      "I <strong>played</strong> football yesterday."
    </div>

    <h3>Verbes irréguliers : à apprendre !</h3>
    <table style="width:100%; text-align:left;">
      <tr><th>Base</th><th>Past</th><th>Traduction</th></tr>
      <tr><td>go</td><td><strong>went</strong></td><td>aller</td></tr>
      <tr><td>see</td><td><strong>saw</strong></td><td>voir</td></tr>
      <tr><td>eat</td><td><strong>ate</strong></td><td>manger</td></tr>
      <tr><td>take</td><td><strong>took</strong></td><td>prendre</td></tr>
      <tr><td>make</td><td><strong>made</strong></td><td>faire</td></tr>
      <tr><td>have</td><td><strong>had</strong></td><td>avoir</td></tr>
      <tr><td>get</td><td><strong>got</strong></td><td>obtenir</td></tr>
      <tr><td>give</td><td><strong>gave</strong></td><td>donner</td></tr>
      <tr><td>buy</td><td><strong>bought</strong></td><td>acheter</td></tr>
      <tr><td>think</td><td><strong>thought</strong></td><td>penser</td></tr>
    </table>

    <h3>Forme négative et question</h3>
    <div class="example">
      Négatif : I <strong>didn't</strong> play. He <strong>didn't</strong> go. (didn't + base verbale)<br>
      Question : <strong>Did</strong> you play? <strong>Did</strong> she go?
    </div>

    <div class="tip">
      💡 <strong>Key words :</strong> yesterday, last week, two days ago, in 2020 → Past Simple !
    </div>`,
    '4ème', 2, 2, JSON.stringify(['grammaire', 'past simple'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'anglais', 'Past of "go"', 'qcm',
    '"I ... to the cinema last night."',
    JSON.stringify(['goed', 'went', 'go', 'gone']),
    'went',
    'Go is irregular: go → went → gone. Past simple = went.',
    '4ème', 2, 15, JSON.stringify(['past simple']));

  insertExercise.run(courseId, 'anglais', 'Regular past', 'fill',
    'Add -ed: "She ... (watch) a film yesterday."',
    JSON.stringify([]), 'watched',
    'Watch is regular: watch + ed = watched.',
    '4ème', 2, 15, JSON.stringify(['past simple']));

  insertExercise.run(courseId, 'anglais', 'Past negative', 'qcm',
    '"He ... go to school yesterday."',
    JSON.stringify(["didn't", "don't", "wasn't", "hasn't"]),
    "didn't",
    'Past Simple negative = didn\'t + base verb. He didn\'t go.',
    '4ème', 2, 15, JSON.stringify(['past simple']));

  insertExercise.run(courseId, 'anglais', 'Irregular: buy', 'qcm',
    '"We ... a new car last month."',
    JSON.stringify(['buyed', 'bought', 'buy', 'buied']),
    'bought',
    'Buy is irregular: buy → bought. No "buyed"!',
    '4ème', 2, 15, JSON.stringify(['past simple']));

  // Comparatives & Superlatives 4ème
  courseId = insertCourse.run('anglais', 'Comparatives & Superlatives',
    `<h3>Comparer en anglais</h3>

    <h3>Comparatif : comparer 2 choses</h3>
    <ul>
      <li>Adjectif court (1 syllabe) : + <strong>-er ... than</strong><br>
        <div class="example">tall → tall<strong>er</strong> than · fast → fast<strong>er</strong> than<br>
        "Usain Bolt is <strong>faster than</strong> me."</div>
      </li>
      <li>Adjectif long (2+ syllabes) : <strong>more ... than</strong><br>
        <div class="example">"English is <strong>more interesting than</strong> maths."</div>
      </li>
    </ul>

    <h3>Superlatif : le plus / le moins</h3>
    <ul>
      <li>Court : <strong>the + -est</strong><br>
        <div class="example">"He is <strong>the tallest</strong> player in the team."</div>
      </li>
      <li>Long : <strong>the most</strong><br>
        <div class="example">"It's <strong>the most beautiful</strong> city in the world."</div>
      </li>
    </ul>

    <h3>Irréguliers importants</h3>
    <table style="width:100%; text-align:left;">
      <tr><th>Adjectif</th><th>Comparatif</th><th>Superlatif</th></tr>
      <tr><td>good</td><td><strong>better</strong></td><td><strong>the best</strong></td></tr>
      <tr><td>bad</td><td><strong>worse</strong></td><td><strong>the worst</strong></td></tr>
      <tr><td>far</td><td><strong>farther</strong></td><td><strong>the farthest</strong></td></tr>
    </table>

    <div class="tip">
      💡 <strong>Football example:</strong> "Mbappé is <strong>faster than</strong> most players. He is <strong>the best</strong> striker in the world!"
    </div>`,
    '4ème', 2, 3, JSON.stringify(['grammaire', 'comparatives'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'anglais', 'Comparative: tall', 'qcm',
    '"My brother is ... me." (tall)',
    JSON.stringify(['more tall than', 'taller than', 'tallest than', 'the taller']),
    'taller than',
    'Tall = 1 syllable → taller than. Not "more tall".',
    '4ème', 2, 15, JSON.stringify(['comparatives']));

  insertExercise.run(courseId, 'anglais', 'Superlative: good', 'qcm',
    '"She is ... student in the class."',
    JSON.stringify(['the goodest', 'the better', 'the best', 'more good']),
    'the best',
    'Good → better → THE BEST. Irregular!',
    '4ème', 2, 15, JSON.stringify(['comparatives']));

  insertExercise.run(courseId, 'anglais', 'Comparative: interesting', 'fill',
    '"This book is ... interesting ... that one." (comparative)',
    JSON.stringify([]), 'more/than',
    'Interesting = long adjective → more interesting than.',
    '4ème', 2, 15, JSON.stringify(['comparatives']));

  insertExercise.run(courseId, 'anglais', 'Comparative: bad', 'qcm',
    '"This film is ... the first one."',
    JSON.stringify(['badder than', 'more bad than', 'worse than', 'the worst']),
    'worse than',
    'Bad → worse → the worst. Irregular comparative!',
    '4ème', 2, 15, JSON.stringify(['comparatives']));

  // Will / Going to 4ème
  courseId = insertCourse.run('anglais', 'Future: Will vs Going to',
    `<h3>Parler du futur en anglais</h3>
    <p>En anglais, il y a deux façons principales de parler du futur :</p>

    <h3>WILL + base verbale</h3>
    <p>Pour les <strong>décisions spontanées</strong>, les <strong>prédictions</strong> et les <strong>promesses</strong> :</p>
    <div class="example">
      "I think it <strong>will rain</strong> tomorrow." (prédiction)<br>
      "I <strong>will help</strong> you!" (promesse spontanée)<br>
      "He <strong>won't</strong> (will not) come." (négatif)
    </div>

    <h3>BE GOING TO + base verbale</h3>
    <p>Pour les <strong>plans et intentions</strong> déjà décidés :</p>
    <div class="example">
      "I <strong>am going to</strong> visit London this summer." (plan prévu)<br>
      "She <strong>is going to</strong> study medicine." (intention)<br>
      "They <strong>are not going to</strong> play tonight." (négatif)
    </div>

    <h3>Résumé</h3>
    <table style="width:100%; text-align:left;">
      <tr><th>Will</th><th>Going to</th></tr>
      <tr><td>Décision spontanée</td><td>Plan déjà décidé</td></tr>
      <tr><td>Prédiction (opinion)</td><td>Prédiction (évidence)</td></tr>
      <tr><td>Promesse</td><td>Intention</td></tr>
    </table>

    <div class="tip">
      💡 <strong>Truc :</strong> "I will" = je décide maintenant. "I'm going to" = j'ai déjà décidé avant.
    </div>`,
    '4ème', 2, 4, JSON.stringify(['grammaire', 'future'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'anglais', 'Will or Going to?', 'qcm',
    '"I\'ve already booked the tickets. We ... to Paris!" (plan decided)',
    JSON.stringify(['will go', 'are going to go', 'go', 'going']),
    'are going to go',
    'Already decided/planned → going to. "We are going to go to Paris."',
    '4ème', 2, 15, JSON.stringify(['future']));

  insertExercise.run(courseId, 'anglais', 'Spontaneous decision', 'qcm',
    '"Oh no, I forgot my book! — Don\'t worry, I ... lend you mine."',
    JSON.stringify(["am going to", "will", "going to", "do"]),
    'will',
    'Spontaneous decision (decided just now) → will. "I will lend you mine."',
    '4ème', 2, 15, JSON.stringify(['future']));

  insertExercise.run(courseId, 'anglais', 'Negative will', 'fill',
    '"He ... come to the party." (negative of will)',
    JSON.stringify([]), "won't",
    'Will not = won\'t. "He won\'t come to the party."',
    '4ème', 2, 15, JSON.stringify(['future']));

  // Vocabulary: Sports & Competitions 4ème (Ilan friendly)
  courseId = insertCourse.run('anglais', 'Vocabulary: Sports & Competition',
    `<h3>Sports vocabulary</h3>
    <ul>
      <li><strong>to score a goal</strong> = marquer un but</li>
      <li><strong>to win / to lose</strong> = gagner / perdre</li>
      <li><strong>a match / a game</strong> = un match</li>
      <li><strong>a team</strong> = une équipe</li>
      <li><strong>a player</strong> = un joueur</li>
      <li><strong>the referee</strong> = l'arbitre</li>
      <li><strong>a foul</strong> = une faute</li>
      <li><strong>half-time</strong> = mi-temps</li>
      <li><strong>the pitch</strong> = le terrain</li>
      <li><strong>a supporter / a fan</strong> = un supporter</li>
    </ul>

    <h3>Competition expressions</h3>
    <ul>
      <li><strong>to compete</strong> = participer à une compétition</li>
      <li><strong>to train / to practise</strong> = s'entraîner</li>
      <li><strong>a championship</strong> = un championnat</li>
      <li><strong>a trophy</strong> = un trophée</li>
      <li><strong>to qualify</strong> = se qualifier</li>
      <li><strong>the finals</strong> = la finale</li>
    </ul>

    <div class="example">
      "France <strong>won</strong> the World Cup. Mbappé <strong>scored</strong> two goals in the <strong>finals</strong>!"
    </div>

    <div class="tip">
      💡 <strong>Win vs Beat :</strong> You WIN a match/trophy. You BEAT an opponent. "France beat Argentina" = "France won the match."
    </div>`,
    '4ème', 1, 5, JSON.stringify(['vocabulaire', 'sports'])
  ).lastInsertRowid;

  insertExercise.run(courseId, 'anglais', 'Score a goal', 'qcm',
    'How do you say "marquer un but" in English?',
    JSON.stringify(['make a goal', 'do a goal', 'score a goal', 'put a goal']),
    'score a goal',
    'In English, we say "score a goal" (not "make" or "do").',
    '4ème', 1, 15, JSON.stringify(['vocabulaire']));

  insertExercise.run(courseId, 'anglais', 'Win vs Beat', 'qcm',
    'Choose the correct sentence:',
    JSON.stringify(['France won Argentina.', 'France beat the World Cup.', 'France beat Argentina.', 'France scored Argentina.']),
    'France beat Argentina.',
    'Beat + opponent. Win + trophy/match. France BEAT Argentina and WON the World Cup.',
    '4ème', 1, 15, JSON.stringify(['vocabulaire']));

  insertExercise.run(courseId, 'anglais', 'Translate: arbitre', 'fill',
    'The person who controls the match is the ...',
    JSON.stringify([]), 'referee',
    'Referee = arbitre. The referee makes decisions during the match.',
    '4ème', 1, 15, JSON.stringify(['vocabulaire']));

  console.log('🇬🇧 Contenu anglais enrichi chargé !');
}

module.exports = { seedAnglais };
