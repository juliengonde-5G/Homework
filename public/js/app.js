/* ============================================
   HOMEWORK BUDDY - Application JavaScript
   ============================================ */

let currentUser = null;
let currentSubject = null;
let currentExercises = [];
let currentExerciseIndex = 0;
let exerciseScore = 0;
let timerInterval = null;
let remainingMinutes = 45;
let chatSubject = '';
let heartbeatInterval = null;
let warmthInterval = null;
let totalDailyMinutes = 45;
let dailyMoodData = {}; // Réponses du questionnaire du jour
let currentMoodStep = 1;
let todayPassion = null; // Passion choisie aujourd'hui

// ==================
// INITIALISATION
// ==================
document.addEventListener('DOMContentLoaded', () => {
  loadProfiles();
});

async function loadProfiles() {
  try {
    const res = await fetch('/api/auth/users');
    const users = await res.json();
    const grid = document.getElementById('profiles-grid');
    grid.innerHTML = users.map(u => `
      <div class="profile-card animate-in" onclick="login(${u.id})" style="animation-delay: ${u.id * 0.1}s">
        <span class="profile-avatar">${u.avatar}</span>
        <span class="profile-name">${u.name}</span>
        <span class="profile-classe">${u.classe}</span>
      </div>
    `).join('');
  } catch (e) {
    console.error('Erreur chargement profils:', e);
  }
}

// ==================
// AUTHENTIFICATION
// ==================
async function login(userId) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (data.error) { alert(data.error); return; }

    currentUser = data.user;
    remainingMinutes = data.remainingMinutes;
    totalDailyMinutes = currentUser.daily_limit_minutes || 45;

    if (remainingMinutes <= 0) {
      alert('Tu as déjà utilisé ton temps aujourd\'hui ! Reviens demain 😊');
      return;
    }

    // Appliquer le thème
    document.body.className = '';
    if (currentUser.theme) document.body.classList.add('theme-' + currentUser.theme);
    if (currentUser.is_dyslexic) document.body.classList.add('dyslexic');

    // Afficher l'écran principal
    showScreen('main-screen');
    setupMainScreen();
    startTimer();
    startHeartbeat();
    loadStats();
    loadChatHistory();
    showFloatingBot();
    showFloatingTimer();
    startWarmthQuestions();

    // Vérifier si le questionnaire du jour a déjà été rempli
    const moodRes = await fetch('/api/daily-mood');
    const moodData = await moodRes.json();

    if (moodData.filled) {
      // Déjà rempli : utiliser les données
      todayPassion = moodData.mood.passion_today;
      dailyMoodData = moodData.mood;
      loadHomeVideos();
      showDailyPassionBadge();

      // Première visite ? Afficher le welcome modal
      const welcomeKey = 'hw_welcomed_' + userId;
      if (!localStorage.getItem(welcomeKey)) {
        setTimeout(() => {
          document.getElementById('welcome-modal').classList.remove('hidden');
        }, 500);
        localStorage.setItem(welcomeKey, '1');
      } else {
        setTimeout(() => {
          showFloatingBotMessage(getFloatingBotGreeting(), [
            { text: 'Commencer', action: () => closeFloatingBubble() }
          ]);
        }, 1500);
      }
    } else {
      // Pas encore rempli : afficher le questionnaire
      const welcomeKey = 'hw_welcomed_' + userId;
      if (!localStorage.getItem(welcomeKey)) {
        localStorage.setItem(welcomeKey, '1');
      }
      setTimeout(() => showDailyMoodModal(), 500);
    }
  } catch (e) {
    console.error('Erreur login:', e);
  }
}

function closeWelcomeModal() {
  document.getElementById('welcome-modal').classList.add('hidden');
  // Petit message du bot après
  setTimeout(() => {
    showFloatingBotMessage(getFloatingBotGreeting(), [
      { text: 'Merci !', action: () => closeFloatingBubble() }
    ]);
  }, 500);
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {}
  currentUser = null;
  clearInterval(timerInterval);
  clearInterval(heartbeatInterval);
  clearInterval(warmthInterval);
  document.body.className = '';
  document.getElementById('floating-bot').classList.add('hidden');
  document.getElementById('floating-timer').classList.add('hidden');
  showScreen('login-screen');
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

// ==================
// ÉCRAN PRINCIPAL
// ==================
function setupMainScreen() {
  document.getElementById('user-avatar').textContent = currentUser.avatar;
  document.getElementById('user-greeting').textContent = getGreeting() + ' ' + currentUser.name + ' !';

  const motivations = getMotivation();
  document.getElementById('welcome-message').textContent = motivations.title;
  document.getElementById('motivation-text').textContent = motivations.text;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function getMotivation() {
  const motivations = {
    promoteur: [
      { title: '🏆 Prêt pour le défi ?', text: 'Chaque exercice est un match à gagner ! Montre de quoi tu es capable.' },
      { title: '⚽ En avant !', text: 'Comme sur le terrain, la victoire se prépare. Lance-toi !' },
      { title: '🎯 Objectif du jour', text: 'Bats ton record et deviens le champion des exercices !' }
    ],
    rebelle: [
      { title: '✌️ C\'est toi qui décides', text: 'Choisis ta matière, choisis ton rythme. C\'est ton moment.' },
      { title: '🎸 À toi de jouer', text: 'Pas de pression, juste toi et tes devoirs. Tu gères !' },
      { title: '😎 Cool, on y va ?', text: 'Prends le temps qu\'il te faut. L\'important c\'est d\'essayer.' }
    ],
    imagineur: [
      { title: '🎨 Bienvenue, créateur !', text: 'Chaque exercice est une aventure qui t\'attend. Imagine et conquiers !' },
      { title: '🐉 L\'aventure commence', text: 'Tel un héros de Warhammer, affronte les défis avec courage !' },
      { title: '✨ Ton monde t\'attend', text: 'Dessine ton chemin vers la réussite, exercice après exercice.' }
    ]
  };

  const pool = motivations[currentUser.profile_type] || motivations.promoteur;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ==================
// TIMER (header + floating)
// ==================
function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    remainingMinutes -= 1 / 60;
    updateTimerDisplay();

    if (remainingMinutes <= 5) {
      document.querySelector('.timer-display').classList.add('warning');
      document.getElementById('floating-timer').classList.add('warning');
    }

    if (remainingMinutes <= 0) {
      clearInterval(timerInterval);
      document.getElementById('time-up-modal').classList.remove('hidden');
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(Math.max(0, remainingMinutes));
  const secs = Math.floor((Math.max(0, remainingMinutes) % 1) * 60);
  const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  document.getElementById('timer-value').textContent = timeStr;

  // Floating timer
  document.getElementById('floating-timer-value').textContent = mins;

  // Ring progress
  const circumference = 2 * Math.PI * 26; // r=26
  const progress = Math.max(0, remainingMinutes) / totalDailyMinutes;
  const offset = circumference * (1 - progress);
  const ring = document.getElementById('timer-ring-progress');
  if (ring) ring.style.strokeDashoffset = offset;
}

function showFloatingTimer() {
  document.getElementById('floating-timer').classList.remove('hidden');
}

function startHeartbeat() {
  heartbeatInterval = setInterval(async () => {
    try {
      const res = await fetch('/api/auth/heartbeat', { method: 'POST' });
      const data = await res.json();
      if (data.remainingMinutes !== undefined) {
        remainingMinutes = data.remainingMinutes;
      }
    } catch (e) {}
  }, 60000);
}

// ==================
// FLOATING BOT
// ==================
function showFloatingBot() {
  document.getElementById('floating-bot').classList.remove('hidden');
}

function getFloatingBotGreeting() {
  const greetings = {
    promoteur: [
      'Hey ' + currentUser.name + ' ! Pret a marquer des points ? 💪',
      'Salut champion ! Besoin d\'un coup de main ?',
      'Yo ! Tu veux battre ton record aujourd\'hui ? ⚽'
    ],
    rebelle: [
      'Hey ' + currentUser.name + ' ! Je suis la si tu veux. Pas de pression 😎',
      'Salut ! T\'as des questions ? Je suis dispo ✌️',
      'Coucou ! Je traine ici si tu as besoin 🎸'
    ],
    imagineur: [
      'Salut ' + currentUser.name + ' ! Pret pour une nouvelle aventure ? ✨',
      'Hey createur ! Je suis ton compagnon de quete 🐉',
      'Bienvenue aventurier ! Besoin d\'aide dans ta quete ? 🗡️'
    ]
  };
  const pool = greetings[currentUser.profile_type] || greetings.promoteur;
  return pool[Math.floor(Math.random() * pool.length)];
}

function showFloatingBotMessage(text, actions) {
  const bubble = document.getElementById('floating-bot-bubble');
  document.getElementById('floating-bot-text').textContent = text;

  const actionsDiv = document.getElementById('floating-bot-actions');
  actionsDiv.innerHTML = '';
  if (actions) {
    actions.forEach(a => {
      const btn = document.createElement('button');
      btn.textContent = a.text;
      btn.onclick = a.action;
      actionsDiv.appendChild(btn);
    });
  }

  bubble.classList.remove('hidden');
}

function closeFloatingBubble() {
  document.getElementById('floating-bot-bubble').classList.add('hidden');
}

function toggleFloatingChat() {
  const bubble = document.getElementById('floating-bot-bubble');
  if (!bubble.classList.contains('hidden')) {
    bubble.classList.add('hidden');
  } else {
    // Aller au chat
    showSection('chat');
    bubble.classList.add('hidden');
  }
}

// ==================
// NAVIGATION
// ==================
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('section-' + sectionId).classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-btn[data-section="${sectionId}"]`)?.classList.add('active');

  // Masquer/afficher le bot flottant (caché quand on est dans le chat)
  const floatingBot = document.getElementById('floating-bot');
  if (floatingBot) {
    if (sectionId === 'chat') {
      floatingBot.classList.add('hidden');
    } else {
      floatingBot.classList.remove('hidden');
    }
  }

  if (sectionId === 'home') loadStats();
}

// ==================
// STATISTIQUES
// ==================
async function loadStats() {
  try {
    const res = await fetch('/api/progress/stats');
    const data = await res.json();

    document.getElementById('stat-points').textContent = data.totals.points;
    document.getElementById('stat-exercises').textContent = data.totals.exercises;
    document.getElementById('stat-success').textContent = data.totals.successRate + '%';
    document.getElementById('points-display').textContent = data.totals.points + ' pts';

    // Meilleur streak
    const bestStreak = Math.max(...data.bySubject.map(s => s.current_streak), 0);
    document.getElementById('stat-streak').textContent = bestStreak;

    // Progress par matière
    data.bySubject.forEach(s => {
      const el = document.getElementById('progress-' + s.subject);
      if (el) {
        const rate = s.total_exercises > 0 ? (s.correct_answers / s.total_exercises * 100) : 0;
        el.innerHTML = `<div class="progress-mini-fill" style="width: ${rate}%"></div>`;
      }
    });

    // Badges récents
    if (data.badges.length > 0) {
      document.getElementById('recent-badges').innerHTML = `
        <h3 class="section-title">Badges récents</h3>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${data.badges.slice(0, 5).map(b => `
            <span class="badge-item animate-in" style="display: inline-flex; align-items: center; gap: 0.3rem; padding: 0.3rem 0.8rem;">
              <span class="badge-icon" style="font-size: 1.2rem;">${b.icon}</span>
              <span class="badge-name">${b.name}</span>
            </span>
          `).join('')}
        </div>
      `;
    }
  } catch (e) {
    console.error('Erreur stats:', e);
  }
}

// ==================
// MATIÈRES & COURS
// ==================
function selectSubject(subject) {
  currentSubject = subject;
  const names = { francais: 'Français', anglais: 'Anglais', maths: 'Mathématiques' };
  document.getElementById('courses-title').textContent = 'Cours de ' + names[subject];
  document.getElementById('exercises-title').textContent = 'Exercices de ' + names[subject];
  loadCourses(subject);
  showSection('courses');
}

async function loadCourses(subject) {
  try {
    const res = await fetch(`/api/courses?subject=${subject}&level=${currentUser.classe}`);
    const courses = await res.json();
    const list = document.getElementById('courses-list');

    if (courses.length === 0) {
      list.innerHTML = `
        <div class="exercise-card">
          <p>Pas encore de cours disponibles pour cette matière.</p>
          <p>Utilise l'assistant pour poser tes questions ! 💬</p>
          <button class="btn-primary" onclick="showSection('chat')">Aller au chat</button>
        </div>
      `;
      return;
    }

    list.innerHTML = courses.map((c, i) => {
      const statusIcon = c.progress?.status === 'completed' ? '✅' :
                         c.progress?.status === 'in_progress' ? '📖' : '📘';
      return `
        <div class="course-item animate-in" onclick="showCourse(${c.id})" style="animation-delay: ${i * 0.05}s">
          <span class="course-number">${i + 1}</span>
          <div class="course-info">
            <h3>${c.title}</h3>
            <p>Difficulté: ${'⭐'.repeat(c.difficulty)}</p>
          </div>
          <span class="course-status">${statusIcon}</span>
        </div>
      `;
    }).join('');

    document.getElementById('course-detail').classList.add('hidden');
    document.getElementById('courses-list').classList.remove('hidden');
  } catch (e) {
    console.error('Erreur cours:', e);
  }
}

async function showCourse(courseId) {
  try {
    const res = await fetch(`/api/courses/${courseId}`);
    const course = await res.json();

    document.getElementById('courses-list').classList.add('hidden');
    document.getElementById('course-detail').classList.remove('hidden');
    document.getElementById('course-content').innerHTML = `
      <h2>${course.title}</h2>
      <div class="course-body">${course.content}</div>
    `;
  } catch (e) {
    console.error('Erreur cours détail:', e);
  }
}

function hideCourseDetail() {
  document.getElementById('course-detail').classList.add('hidden');
  document.getElementById('courses-list').classList.remove('hidden');
}

function startExercisesForCourse() {
  showSection('exercises');
  loadExercises();
}

// ==================
// EXERCICES
// ==================
async function loadExercises() {
  try {
    const res = await fetch(`/api/exercises/adaptive?subject=${currentSubject}`);
    const data = await res.json();
    currentExercises = data.exercises;
    currentExerciseIndex = 0;
    exerciseScore = 0;

    if (currentExercises.length === 0) {
      document.getElementById('exercise-card').innerHTML = `
        <p>Bravo, tu as fait tous les exercices disponibles ! 🎉</p>
        <p>Utilise l'assistant pour approfondir tes connaissances.</p>
        <button class="btn-primary" onclick="showSection('chat')">Parler à l'assistant</button>
      `;
      return;
    }

    showExercise();
  } catch (e) {
    console.error('Erreur exercices:', e);
  }
}

function showExercise() {
  const exercise = currentExercises[currentExerciseIndex];
  const total = currentExercises.length;
  const progress = ((currentExerciseIndex) / total) * 100;

  document.getElementById('exercise-progress-fill').style.width = progress + '%';
  document.getElementById('exercise-container').classList.remove('hidden');
  document.getElementById('exercise-result').classList.add('hidden');
  document.getElementById('exercise-complete').classList.add('hidden');

  const typeLabels = {
    qcm: 'QCM', fill: 'Complète', truefalse: 'Vrai ou Faux', open: 'Réponse libre'
  };

  let answersHtml = '';
  if (exercise.type === 'qcm' || exercise.type === 'truefalse') {
    answersHtml = `
      <div class="exercise-options">
        ${exercise.options.map((opt, i) => `
          <button class="exercise-option" onclick="selectOption(this, '${opt.replace(/'/g, "\\'")}')">
            ${opt}
          </button>
        `).join('')}
      </div>
      <button class="btn-primary" id="btn-validate" onclick="validateAnswer()" style="display:none;">
        Valider ✓
      </button>
    `;
  } else {
    answersHtml = `
      <input type="text" class="exercise-input" id="answer-input" placeholder="Ta réponse..."
             onkeypress="if(event.key==='Enter')validateAnswer()">
      <button class="btn-primary" onclick="validateAnswer()">Valider ✓</button>
    `;
  }

  document.getElementById('exercise-card').innerHTML = `
    <span class="exercise-type">${typeLabels[exercise.type] || exercise.type}</span>
    <p class="exercise-question">${exercise.question}</p>
    ${answersHtml}
    <p style="margin-top: 1rem; font-size: 0.8rem; color: var(--text-muted);">
      Question ${currentExerciseIndex + 1} / ${total} · ${exercise.points} points
    </p>
  `;
}

let selectedAnswer = null;

function selectOption(btn, answer) {
  document.querySelectorAll('.exercise-option').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedAnswer = answer;
  document.getElementById('btn-validate').style.display = 'inline-block';
}

async function validateAnswer() {
  const exercise = currentExercises[currentExerciseIndex];
  let answer;

  if (exercise.type === 'qcm' || exercise.type === 'truefalse') {
    answer = selectedAnswer;
    if (!answer) return;
  } else {
    answer = document.getElementById('answer-input')?.value;
    if (!answer || answer.trim() === '') return;
  }

  try {
    const res = await fetch(`/api/exercises/${exercise.id}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer })
    });
    const result = await res.json();

    // Afficher les options correctes/incorrectes
    if (exercise.type === 'qcm' || exercise.type === 'truefalse') {
      document.querySelectorAll('.exercise-option').forEach(btn => {
        const btnAnswer = btn.textContent.trim();
        if (btnAnswer === result.correctAnswer) {
          btn.classList.add('correct');
        } else if (btn.classList.contains('selected') && !result.correct) {
          btn.classList.add('incorrect');
        }
        btn.onclick = null;
        btn.style.cursor = 'default';
      });
    }

    if (result.correct) exerciseScore++;

    // Afficher le résultat
    const resultDiv = document.getElementById('exercise-result');
    resultDiv.classList.remove('hidden', 'correct', 'incorrect');
    resultDiv.classList.add(result.correct ? 'correct' : 'incorrect');

    const encouragements = result.correct
      ? getCorrectMessage()
      : getIncorrectMessage();

    resultDiv.innerHTML = `
      <h3>${encouragements}</h3>
      ${result.explanation ? `<p>${result.explanation}</p>` : ''}
      ${!result.correct ? `<p>La bonne réponse était : <strong>${result.correctAnswer}</strong></p>` : ''}
      <p style="color: var(--primary); font-weight: 700;">+${result.points} points</p>
      <button class="btn-primary" onclick="nextExercise()">
        ${currentExerciseIndex < currentExercises.length - 1 ? 'Suivant →' : 'Voir les résultats'}
      </button>
    `;

    // Mettre à jour les points en direct
    loadStats();
  } catch (e) {
    console.error('Erreur validation:', e);
  }
}

function getCorrectMessage() {
  const messages = {
    promoteur: ['🏆 Goal ! Bien joué !', '⚽ Quel tir ! Parfait !', '💪 Champion !', '🎯 En plein dans le mille !'],
    rebelle: ['😎 Trop bien !', '✌️ Stylé, bonne réponse !', '🎸 Tu gères grave !', '👏 Nice !'],
    imagineur: ['✨ Magnifique !', '🎨 Brillant, comme une oeuvre d\'art !', '🐉 Victoire héroïque !', '🌟 Légendaire !']
  };
  const pool = messages[currentUser.profile_type] || messages.promoteur;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getIncorrectMessage() {
  const messages = {
    promoteur: ['Pas grave, on se relève ! 💪', 'Prochaine fois, tu marques ! ⚽', 'C\'est qu\'un essai, tu vas y arriver ! 🎯'],
    rebelle: ['Pas de stress, ça arrive 😌', 'T\'inquiète, essaie encore ✌️', 'C\'est pas grave du tout 🤷'],
    imagineur: ['Chaque erreur est un apprentissage ✨', 'Le héros apprend de ses échecs 🛡️', 'Prochaine quête, tu réussiras ! 🗡️']
  };
  const pool = messages[currentUser.profile_type] || messages.promoteur;
  return pool[Math.floor(Math.random() * pool.length)];
}

function nextExercise() {
  selectedAnswer = null;
  currentExerciseIndex++;

  if (currentExerciseIndex >= currentExercises.length) {
    // Série terminée
    document.getElementById('exercise-container').classList.add('hidden');
    document.getElementById('exercise-result').classList.add('hidden');
    document.getElementById('exercise-complete').classList.remove('hidden');

    const total = currentExercises.length;
    const rate = Math.round((exerciseScore / total) * 100);

    let message = '';
    if (rate === 100) message = 'Score parfait ! Tu es incroyable ! 🌟🌟🌟';
    else if (rate >= 80) message = 'Excellent travail ! Continue comme ça ! 🌟🌟';
    else if (rate >= 60) message = 'Bien joué ! Tu progresses ! 🌟';
    else message = 'Continue à t\'entraîner, tu vas y arriver ! 💪';

    document.getElementById('exercise-summary').innerHTML = `
      <p style="font-size: 1.3rem; margin-bottom: 0.5rem;">${exerciseScore} / ${total} correct</p>
      <p style="font-size: 1.1rem;">${message}</p>
    `;

    document.getElementById('exercise-progress-fill').style.width = '100%';
    return;
  }

  showExercise();
}

// ==================
// CHAT
// ==================
function setChatSubject(btn, subject) {
  chatSubject = subject;
  document.querySelectorAll('.chat-subject-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

async function sendMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  if (!message) return;

  input.value = '';

  // Ajouter le message utilisateur
  addChatBubble(message, 'user');

  // Ajouter le bubble "en train d'écrire"
  const typingBubble = addChatBubble('', 'assistant typing');

  try {
    const res = await fetch('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, subject: chatSubject })
    });
    const data = await res.json();

    // Remplacer le bubble typing
    typingBubble.classList.remove('typing');
    typingBubble.innerHTML = `<p>${formatMessage(data.message)}</p>`;
    scrollChat();
  } catch (e) {
    typingBubble.classList.remove('typing');
    typingBubble.innerHTML = '<p>Oups, un problème est survenu. Réessaie ! 🔧</p>';
  }
}

function addChatBubble(text, className) {
  const container = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble ' + className;
  if (text) bubble.innerHTML = `<p>${formatMessage(text)}</p>`;
  container.appendChild(bubble);
  scrollChat();
  return bubble;
}

function formatMessage(text) {
  // Simple markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function scrollChat() {
  const container = document.getElementById('chat-messages');
  container.scrollTop = container.scrollHeight;
}

async function loadChatHistory() {
  try {
    const res = await fetch('/api/chat/history');
    const history = await res.json();
    const container = document.getElementById('chat-messages');

    if (history.length > 0) {
      container.innerHTML = history.map(h => `
        <div class="chat-bubble ${h.role}">
          <p>${formatMessage(h.content)}</p>
        </div>
      `).join('');
      scrollChat();
    }
  } catch (e) {
    console.error('Erreur chargement historique chat:', e);
  }
}

// ==================
// BADGES
// ==================
async function showBadges() {
  try {
    const res = await fetch('/api/progress/badges');
    const badges = await res.json();

    document.getElementById('badges-grid').innerHTML = badges.map(b => `
      <div class="badge-item ${b.earned ? '' : 'locked'}">
        <span class="badge-icon">${b.icon}</span>
        <span class="badge-name">${b.name}</span>
        <span class="badge-desc">${b.description}</span>
      </div>
    `).join('');

    document.getElementById('badges-modal').classList.remove('hidden');
  } catch (e) {
    console.error('Erreur badges:', e);
  }
}

function closeBadges() {
  document.getElementById('badges-modal').classList.add('hidden');
}

// ==================
// WARMTH QUESTIONS (rendre l'outil chaleureux)
// ==================
let warmthQuestionShown = false;

function startWarmthQuestions() {
  // Poser une question chaleureuse toutes les 8-12 minutes
  const interval = (8 + Math.random() * 4) * 60 * 1000;
  warmthInterval = setInterval(() => {
    if (!warmthQuestionShown && currentUser) {
      showWarmthQuestion();
    }
  }, interval);

  // Aussi après les 3 premiers minutes
  setTimeout(() => {
    if (currentUser && !warmthQuestionShown) {
      showWarmthQuestion();
    }
  }, 3 * 60 * 1000);
}

function showWarmthQuestion() {
  warmthQuestionShown = true;

  const questions = {
    promoteur: [
      { q: 'Comment tu te sens aujourd\'hui, champion ? ⚽', r1: 'Au top !', r2: 'Bof...' },
      { q: 'T\'es fier de toi aujourd\'hui ? Moi je trouve que tu geres ! 💪', r1: 'Carrément !', r2: 'Mouais' },
      { q: 'Tu veux un petit defi special ? 🎯', r1: 'Oui !', r2: 'Plus tard' },
      { q: 'C\'est quoi ta matiere preferee en ce moment ?', r1: 'Je te dis !', r2: 'Secret !' }
    ],
    rebelle: [
      { q: 'Ça va toi ? Pas trop la flemme ? 😎', r1: 'Ça va !', r2: 'Un peu...' },
      { q: 'T\'as envie de continuer ou tu veux faire une pause ? ✌️', r1: 'Je continue', r2: 'Pause !' },
      { q: 'C\'est cool que tu sois la ! Tu veux changer de matiere ?', r1: 'Oui pourquoi pas', r2: 'Non c\'est bien' },
      { q: 'Hey, raconte un truc marrant qui t\'est arrive cette semaine ?', r1: 'Haha oui !', r2: 'Rien de ouf' }
    ],
    imagineur: [
      { q: 'Si les maths étaient un personnage de Warhammer, ce serait qui ? 🐉', r1: 'Un mage !', r2: 'Un guerrier !' },
      { q: 'Tu te sens plutot createur ou explorateur aujourd\'hui ? ✨', r1: 'Créateur', r2: 'Explorateur' },
      { q: 'Imagine que chaque exercice est un sort a lancer... Tu es pret, sorcier ? 🗡️', r1: 'Oui !', r2: 'Presque...' },
      { q: 'Si tu pouvais inventer une matiere a l\'ecole, ce serait quoi ?', r1: 'Dis-moi !', r2: 'Hmm...' }
    ]
  };

  const pool = questions[currentUser.profile_type] || questions.promoteur;
  const question = pool[Math.floor(Math.random() * pool.length)];

  const toast = document.createElement('div');
  toast.className = 'warmth-toast';
  toast.innerHTML = `
    <p>${question.q}</p>
    <div class="warmth-toast-actions">
      <button class="btn-warmth-dismiss" onclick="dismissWarmth(this)">${question.r2}</button>
      <button class="btn-warmth-primary" onclick="respondWarmth(this, '${question.r1}')">${question.r1}</button>
    </div>
  `;

  document.body.appendChild(toast);

  // Auto-dismiss après 15 secondes
  setTimeout(() => {
    if (toast.parentNode) {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
      warmthQuestionShown = false;
    }
  }, 15000);
}

function dismissWarmth(btn) {
  const toast = btn.closest('.warmth-toast');
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s';
  setTimeout(() => {
    toast.remove();
    warmthQuestionShown = false;
  }, 300);
}

function respondWarmth(btn, response) {
  const toast = btn.closest('.warmth-toast');
  toast.innerHTML = `<p>Super ! Merci d'avoir repondu 😊 Allez, on continue !</p>`;
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      toast.remove();
      warmthQuestionShown = false;
    }, 300);
  }, 2000);
}

// ==================
// QUESTIONNAIRE QUOTIDIEN
// ==================
function showDailyMoodModal() {
  currentMoodStep = 1;
  dailyMoodData = {};
  document.getElementById('daily-mood-modal').classList.remove('hidden');

  // Personnaliser le titre selon le profil
  const titles = {
    promoteur: 'Avant de commencer, coach... 💪',
    rebelle: 'Hey, dis-moi un truc... 😎',
    imagineur: 'Aventurier, raconte-moi... ✨'
  };
  document.getElementById('daily-mood-title').textContent =
    titles[currentUser.profile_type] || 'Comment tu vas aujourd\'hui ?';

  // Préparer les passions personnalisées
  setupPassionOptions();
  showMoodStep(1);
}

function setupPassionOptions() {
  const passionsByProfile = {
    football: [
      { label: '⚽ Football', value: 'football' },
      { label: '🌍 Géopolitique', value: 'géopolitique' },
      { label: '🎮 Jeux vidéo', value: 'jeux vidéo' },
      { label: '🏃 Sport', value: 'sport' },
      { label: '📺 Séries/Films', value: 'séries' },
      { label: '🎵 Musique', value: 'musique' }
    ],
    creative: [
      { label: '🎭 Théâtre', value: 'théâtre' },
      { label: '🎵 Musique', value: 'musique' },
      { label: '🎨 Dessin', value: 'dessin' },
      { label: '📺 Vidéos/YouTube', value: 'vidéos' },
      { label: '🎮 Jeux', value: 'jeux' },
      { label: '📖 Histoires', value: 'histoires' }
    ],
    warhammer: [
      { label: '⚔️ Warhammer', value: 'warhammer' },
      { label: '🎨 Peinture figurines', value: 'peinture figurines' },
      { label: '🐉 Fantasy', value: 'fantasy' },
      { label: '🎮 Jeux vidéo', value: 'jeux vidéo' },
      { label: '📖 BD/Manga', value: 'bd manga' },
      { label: '🏰 Histoire médiévale', value: 'histoire médiévale' }
    ]
  };

  const passions = passionsByProfile[currentUser.theme] || passionsByProfile.creative;
  const container = document.getElementById('mood-passions');
  container.innerHTML = passions.map(p =>
    `<button class="mood-passion-btn" onclick="selectMood('passion_today', this, '${p.value}')">${p.label}</button>`
  ).join('');
}

function showMoodStep(step) {
  // Masquer tous les steps
  for (let i = 1; i <= 5; i++) {
    document.getElementById('mood-step-' + i).classList.add('hidden');
  }
  // Afficher le step courant
  document.getElementById('mood-step-' + step).classList.remove('hidden');
  currentMoodStep = step;

  // Mettre à jour la progress bar
  document.getElementById('mood-progress-fill').style.width = ((step - 1) / 4 * 100) + '%';
}

function selectMood(field, btn, value) {
  dailyMoodData[field] = value;

  // Highlight le bouton sélectionné
  const parent = btn.parentElement;
  parent.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  // Passer à l'étape suivante après un court délai
  setTimeout(() => {
    if (currentMoodStep < 4) {
      showMoodStep(currentMoodStep + 1);
    } else {
      // Dernière étape : sauvegarder et afficher le résumé
      saveDailyMood();
    }
  }, 300);
}

function selectCustomPassion() {
  const input = document.getElementById('mood-passion-custom');
  const value = input.value.trim();
  if (!value) return;

  dailyMoodData.passion_today = value;
  todayPassion = value;

  setTimeout(() => {
    showMoodStep(currentMoodStep + 1);
  }, 200);
}

async function saveDailyMood() {
  // Préparer le message de fin personnalisé
  const messages = {
    promoteur: 'Top ! Je prépare un programme sur mesure pour toi, champion !',
    rebelle: 'Cool ! Je m\'adapte a toi aujourd\'hui, pas de stress !',
    imagineur: 'Genial ! L\'aventure est personnalisee rien que pour toi !'
  };
  document.getElementById('mood-complete-text').textContent =
    messages[currentUser.profile_type] || 'Top ! Je vais personnaliser ta session !';

  showMoodStep(5);
  document.getElementById('mood-progress-fill').style.width = '100%';

  // Sauvegarder en base
  try {
    await fetch('/api/daily-mood', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dailyMoodData)
    });
  } catch (e) {
    console.error('Erreur sauvegarde mood:', e);
  }

  todayPassion = dailyMoodData.passion_today;
}

function closeDailyMood() {
  document.getElementById('daily-mood-modal').classList.add('hidden');

  // Charger les vidéos avec la passion du jour
  loadHomeVideos();
  showDailyPassionBadge();

  // Message du bot
  setTimeout(() => {
    const passionMsg = todayPassion
      ? `Je vois que tu es a fond sur "${todayPassion}" aujourd'hui ! J'ai prepare des trucs pour toi 🎯`
      : getFloatingBotGreeting();
    showFloatingBotMessage(passionMsg, [
      { text: 'Super !', action: () => closeFloatingBubble() }
    ]);
  }, 500);
}

function showDailyPassionBadge() {
  if (!todayPassion) return;
  const welcomeCard = document.getElementById('welcome-card');
  if (!welcomeCard) return;

  // Supprimer un ancien badge s'il existe
  const existing = welcomeCard.querySelector('.daily-passion-badge');
  if (existing) existing.remove();

  const badge = document.createElement('div');
  badge.className = 'daily-passion-badge';
  badge.innerHTML = `🎯 Passion du jour : <strong>${todayPassion}</strong>`;
  welcomeCard.appendChild(badge);
}

// ==================
// VIDEOS PERSONNALISÉES
// ==================
function getEducationalVideos() {
  // Vidéos éducatives de base par thème
  const baseVideos = {
    football: [
      { title: 'Les maths du football - Angles et trajectoires', icon: '⚽📐', subject: 'maths', url: 'https://www.youtube.com/results?search_query=math+football+angles+trajectoire+education' },
      { title: 'La géopolitique du football mondial', icon: '🌍⚽', subject: 'general', url: 'https://www.youtube.com/results?search_query=g%C3%A9opolitique+football+education' },
      { title: 'Vocabulaire anglais du sport', icon: '🇬🇧⚽', subject: 'anglais', url: 'https://www.youtube.com/results?search_query=english+football+vocabulary+learn' },
      { title: 'Les figures de style - comme un commentateur sportif', icon: '📝⚽', subject: 'francais', url: 'https://www.youtube.com/results?search_query=figures+de+style+fran%C3%A7ais+4eme' }
    ],
    creative: [
      { title: 'Le français par le théâtre - Expression créative', icon: '🎭📝', subject: 'francais', url: 'https://www.youtube.com/results?search_query=fran%C3%A7ais+th%C3%A9%C3%A2tre+expression+6eme' },
      { title: 'Les fractions en musique', icon: '🎵🔢', subject: 'maths', url: 'https://www.youtube.com/results?search_query=fractions+musique+maths+education' },
      { title: 'Apprendre l\'anglais en chansons', icon: '🇬🇧🎸', subject: 'anglais', url: 'https://www.youtube.com/results?search_query=learn+english+songs+kids+fun' },
      { title: 'Art et géométrie - Les formes dans la peinture', icon: '🎨📐', subject: 'maths', url: 'https://www.youtube.com/results?search_query=g%C3%A9om%C3%A9trie+art+peinture+education' }
    ],
    warhammer: [
      { title: 'Les maths de la stratégie de combat', icon: '🐉🔢', subject: 'maths', url: 'https://www.youtube.com/results?search_query=math+strategy+game+probability+education' },
      { title: 'Écriture créative fantasy - Raconte ton histoire', icon: '🗡️📝', subject: 'francais', url: 'https://www.youtube.com/results?search_query=%C3%A9criture+cr%C3%A9ative+fantasy+coll%C3%A8ge' },
      { title: 'English for Gamers - Game vocabulary', icon: '🇬🇧🎮', subject: 'anglais', url: 'https://www.youtube.com/results?search_query=english+for+gamers+vocabulary+learn' },
      { title: 'L\'histoire médiévale (comme Warhammer !)', icon: '🏰⚔️', subject: 'general', url: 'https://www.youtube.com/results?search_query=histoire+m%C3%A9di%C3%A9vale+coll%C3%A8ge+education' }
    ]
  };

  let videos = baseVideos[currentUser.theme] || baseVideos.creative;

  // Ajouter des vidéos dynamiques basées sur la passion du jour
  if (todayPassion) {
    const passionVideos = generatePassionVideos(todayPassion);
    // Mettre les vidéos passion en premier
    videos = [...passionVideos, ...videos];
  }

  return videos;
}

function generatePassionVideos(passion) {
  const encoded = encodeURIComponent(passion);
  const level = currentUser.classe === '4ème' ? '4eme' : '6eme';
  const passionIcon = getPassionIcon(passion);

  return [
    {
      title: `Apprendre les maths avec "${passion}"`,
      icon: passionIcon + '🔢',
      subject: 'maths',
      url: `https://www.youtube.com/results?search_query=maths+${encoded}+${level}+education+fun`
    },
    {
      title: `"${passion}" en anglais - Vocabulaire fun`,
      icon: passionIcon + '🇬🇧',
      subject: 'anglais',
      url: `https://www.youtube.com/results?search_query=${encoded}+english+vocabulary+kids+learn`
    }
  ];
}

function getPassionIcon(passion) {
  const icons = {
    'football': '⚽', 'géopolitique': '🌍', 'jeux vidéo': '🎮', 'sport': '🏃',
    'séries': '📺', 'musique': '🎵', 'théâtre': '🎭', 'dessin': '🎨',
    'vidéos': '📺', 'jeux': '🎮', 'histoires': '📖', 'warhammer': '⚔️',
    'peinture figurines': '🎨', 'fantasy': '🐉', 'bd manga': '📖',
    'histoire médiévale': '🏰'
  };
  return icons[passion.toLowerCase()] || '🎯';
}

function loadHomeVideos() {
  const videos = getEducationalVideos();
  const container = document.getElementById('home-videos');
  if (!container) return;

  container.innerHTML = `
    <h3 class="section-title">🎥 Videos pour toi</h3>
    <div class="videos-grid">
      ${videos.slice(0, 4).map(v => `
        <div class="video-card" onclick="window.open('${v.url}', '_blank')">
          <div class="video-card-thumb">
            <span>${v.icon}</span>
            <div class="play-icon">▶</div>
          </div>
          <div class="video-card-info">
            <h4>${v.title}</h4>
            <span>${v.subject === 'general' ? 'Culture' : v.subject.charAt(0).toUpperCase() + v.subject.slice(1)}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function closeVideosModal() {
  document.getElementById('videos-modal').classList.add('hidden');
}

// ==================
// ESPACE PARENT
// ==================
function showParentLogin() {
  showScreen('parent-screen');
  document.getElementById('parent-login-form').classList.remove('hidden');
  document.getElementById('parent-dashboard').classList.add('hidden');
}

function showLoginScreen() {
  showScreen('login-screen');
}

async function parentLogin(e) {
  e.preventDefault();
  const password = document.getElementById('parent-password').value;

  try {
    const res = await fetch('/api/auth/parent-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    if (res.ok) {
      document.getElementById('parent-login-form').classList.add('hidden');
      document.getElementById('parent-dashboard').classList.remove('hidden');
      loadParentDashboard();
    } else {
      alert('Mot de passe incorrect');
    }
  } catch (e) {
    alert('Erreur de connexion');
  }
}

async function loadParentDashboard() {
  try {
    const res = await fetch('/api/parent/dashboard');
    const dashboard = await res.json();

    const content = document.getElementById('parent-content');
    content.innerHTML = dashboard.map((d, idx) => {
      const subjectNames = { francais: 'Français', anglais: 'Anglais', maths: 'Maths' };

      return `
        <div class="child-report">
          <h3>${d.child.avatar} ${d.child.name} - ${d.child.classe}
            ${d.child.is_dyslexic ? '<span style="font-size:0.7rem; background:#FFF3E0; padding:0.2rem 0.5rem; border-radius:8px;">Dyslexique</span>' : ''}
          </h3>

          <div class="report-stats">
            <div class="report-stat">
              <span class="value">${d.totalPoints}</span>
              <span class="label">Points totaux</span>
            </div>
            <div class="report-stat">
              <span class="value">${d.lastSession ? new Date(d.lastSession.started_at).toLocaleDateString('fr-FR') : 'Jamais'}</span>
              <span class="label">Dernière connexion</span>
            </div>
            <div class="report-stat">
              <span class="value">${d.recentSessions.reduce((s, r) => s + r.total_minutes, 0)} min</span>
              <span class="label">Temps cette semaine</span>
            </div>
            <div class="report-stat">
              <span class="value">${d.recentSessions.length} / 7</span>
              <span class="label">Jours actifs</span>
            </div>
          </div>

          <!-- Courbe de performance -->
          <div class="report-section">
            <h4>📈 Courbe de performance</h4>
            <div class="performance-chart-container">
              <canvas id="chart-${d.child.id}"></canvas>
            </div>
          </div>

          <div class="report-section">
            <h4>📊 Par matière</h4>
            <div class="report-stats">
              ${d.stats.map(s => `
                <div class="report-stat">
                  <span class="value" style="color: ${getScoreColor(s.total_exercises > 0 ? s.correct_answers / s.total_exercises * 100 : 0)}">${s.total_exercises > 0 ? Math.round(s.correct_answers / s.total_exercises * 100) : 0}%</span>
                  <span class="label">${subjectNames[s.subject] || s.subject} (${s.total_exercises} ex.)</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Plan pédagogique -->
          <div class="report-section">
            <h4>📋 Plan d'action pédagogique</h4>
            ${generatePedagogicalPlan(d)}
          </div>

          ${d.strengths.length > 0 ? `
            <div class="report-section">
              <h4>💪 Points forts: ${d.strengths.map(s => subjectNames[s]).join(', ')}</h4>
            </div>
          ` : ''}

          ${d.weaknesses.length > 0 ? `
            <div class="report-section">
              <h4>📌 À renforcer: ${d.weaknesses.map(s => subjectNames[s]).join(', ')}</h4>
            </div>
          ` : ''}

          ${d.recentExercises.length > 0 ? `
            <div class="report-section">
              <h4>📝 Exercices récents</h4>
              <div class="report-exercises">
                ${d.recentExercises.map(e => `
                  <div class="exercise-row">
                    <span>${subjectNames[e.subject]} - ${e.title}</span>
                    <span class="${e.score === 100 ? 'tag-success' : 'tag-fail'}">
                      ${e.score === 100 ? '✅' : '❌'}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : '<p style="color: var(--text-muted); font-size: 0.9rem;">Pas encore d\'exercices réalisés</p>'}

          ${d.badges.length > 0 ? `
            <div class="report-section">
              <h4>🏅 Badges gagnés</h4>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${d.badges.map(b => `<span style="background: var(--bg); padding: 0.3rem 0.6rem; border-radius: 8px; font-size: 0.85rem;">${b.icon} ${b.name}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${d.recentMoods && d.recentMoods.length > 0 ? `
            <div class="report-section">
              <h4>🧠 Humeurs & passions récentes</h4>
              <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                ${d.recentMoods.map(m => `
                  <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.6rem; background: var(--bg); border-radius: 8px; font-size: 0.8rem;">
                    <span style="font-weight: 700; min-width: 65px;">${new Date(m.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}</span>
                    <span>${getMoodEmoji(m.mood)}</span>
                    <span>${getEnergyEmoji(m.energy)}</span>
                    ${m.passion_today ? `<span style="background: var(--accent); color: white; padding: 0.1rem 0.5rem; border-radius: 10px; font-size: 0.75rem;">🎯 ${m.passion_today}</span>` : ''}
                    ${m.want_to_learn ? `<span style="color: var(--text-muted);">→ ${m.want_to_learn}</span>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <button class="btn-secondary" style="margin-top: 1rem; font-size: 0.85rem;" onclick="viewChatHistory(${d.child.id}, '${d.child.name}')">
            💬 Voir l'historique du chat
          </button>
        </div>
      `;
    }).join('');

    // Générer les graphiques
    setTimeout(() => {
      dashboard.forEach(d => renderPerformanceChart(d));
    }, 100);
  } catch (e) {
    console.error('Erreur dashboard parent:', e);
  }
}

function getScoreColor(score) {
  if (score >= 70) return '#00B894';
  if (score >= 50) return '#FDCB6E';
  return '#E17055';
}

function generatePedagogicalPlan(d) {
  const subjectNames = { francais: 'Français', anglais: 'Anglais', maths: 'Maths' };
  const plans = [];

  // Analyser chaque matière
  d.stats.forEach(s => {
    const rate = s.total_exercises > 0 ? (s.correct_answers / s.total_exercises * 100) : -1;
    const name = subjectNames[s.subject] || s.subject;

    if (rate < 0 || s.total_exercises < 1) {
      plans.push({
        priority: 'medium',
        icon: '🎯',
        text: `<strong>${name}</strong> : Pas encore d'exercices. Commencer par les cours de base puis faire des exercices de difficulté 1.`
      });
    } else if (rate < 40) {
      plans.push({
        priority: 'high',
        icon: '🚨',
        text: `<strong>${name}</strong> (${Math.round(rate)}%) : Revoir les cours en priorité. Refaire les exercices de difficulté 1. Utiliser l'assistant pour poser des questions. Séances courtes et régulières recommandées.`
      });
    } else if (rate < 60) {
      plans.push({
        priority: 'medium',
        icon: '📚',
        text: `<strong>${name}</strong> (${Math.round(rate)}%) : Bonne base mais à consolider. Alterner cours et exercices. Augmenter progressivement la difficulté. ${s.current_streak > 0 ? 'Bonne série en cours, continuer !' : 'Viser des séries de 3+ bonnes réponses.'}`
      });
    } else if (rate < 80) {
      plans.push({
        priority: 'low',
        icon: '📈',
        text: `<strong>${name}</strong> (${Math.round(rate)}%) : Bon niveau ! Passer aux exercices de difficulté 2-3. Travailler les points faibles spécifiques. ${s.best_streak >= 5 ? 'Excellent streak !' : 'Objectif : série de 5 bonnes réponses.'}`
      });
    } else {
      plans.push({
        priority: 'low',
        icon: '🌟',
        text: `<strong>${name}</strong> (${Math.round(rate)}%) : Excellent ! Maintenir le rythme avec des exercices de difficulté 3. Explorer des notions avancées via l'assistant.`
      });
    }
  });

  // Recommandations générales
  const totalExercises = d.stats.reduce((s, st) => s + st.total_exercises, 0);
  const activeDays = d.recentSessions.length;

  if (activeDays < 3) {
    plans.push({
      priority: 'medium',
      icon: '📅',
      text: `<strong>Régularité</strong> : Seulement ${activeDays} jour(s) actif(s) cette semaine. Objectif : 4-5 jours de pratique pour une progression optimale.`
    });
  }

  if (totalExercises > 0 && totalExercises < 10) {
    plans.push({
      priority: 'low',
      icon: '💪',
      text: `<strong>Volume</strong> : ${totalExercises} exercices au total. Viser 5-10 exercices par session pour progresser efficacement.`
    });
  }

  // Trier par priorité
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  plans.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return `
    <div class="pedagogical-plan">
      ${plans.map(p => `
        <div class="plan-item plan-priority-${p.priority}">
          <span class="plan-item-icon">${p.icon}</span>
          <div class="plan-item-content">${p.text}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPerformanceChart(d) {
  const canvas = document.getElementById('chart-' + d.child.id);
  if (!canvas || typeof Chart === 'undefined') return;

  const subjectNames = { francais: 'Français', anglais: 'Anglais', maths: 'Maths' };
  const colors = { francais: '#4A90D9', anglais: '#E74C3C', maths: '#2ECC71' };

  const datasets = d.stats.map(s => ({
    label: subjectNames[s.subject] || s.subject,
    data: [
      Math.max(0, s.total_exercises > 3 ? Math.round((s.correct_answers - 2) / Math.max(1, s.total_exercises - 2) * 100) : 0),
      Math.max(0, s.total_exercises > 1 ? Math.round((s.correct_answers - 1) / Math.max(1, s.total_exercises - 1) * 100) : 0),
      s.total_exercises > 0 ? Math.round(s.correct_answers / s.total_exercises * 100) : 0
    ],
    borderColor: colors[s.subject] || '#6C5CE7',
    backgroundColor: (colors[s.subject] || '#6C5CE7') + '20',
    fill: true,
    tension: 0.4,
    pointRadius: 5,
    pointHoverRadius: 7
  }));

  new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['Début', 'Progression', 'Actuel'],
      datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'Nunito' } } }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: { callback: v => v + '%', font: { family: 'Nunito' } },
          grid: { color: '#F0F0F0' }
        },
        x: {
          ticks: { font: { family: 'Nunito' } },
          grid: { display: false }
        }
      }
    }
  });
}

function getMoodEmoji(mood) {
  const map = { 'super bien': '😄', 'bien': '🙂', 'bof': '😐', 'fatigue': '😴' };
  return map[mood] || '🙂';
}

function getEnergyEmoji(energy) {
  const map = { 'a fond': '🔥', 'moyen': '⚡', 'tranquille': '🌊' };
  return map[energy] || '⚡';
}

async function viewChatHistory(userId, name) {
  try {
    const res = await fetch(`/api/parent/chat-history/${userId}?days=7`);
    const history = await res.json();

    const modal = document.getElementById('badges-modal');
    document.getElementById('badges-grid').innerHTML = '';
    modal.querySelector('h2').textContent = `💬 Chat de ${name} (7 derniers jours)`;

    const content = modal.querySelector('.modal-content');
    const existingChat = content.querySelector('.chat-history-view');
    if (existingChat) existingChat.remove();

    if (history.length === 0) {
      const div = document.createElement('div');
      div.className = 'chat-history-view';
      div.innerHTML = '<p style="text-align: center; color: var(--text-muted);">Aucune conversation récente</p>';
      content.appendChild(div);
    } else {
      const div = document.createElement('div');
      div.className = 'chat-history-view';
      div.style.maxHeight = '60vh';
      div.style.overflowY = 'auto';
      div.innerHTML = history.map(h => `
        <div style="margin-bottom: 0.8rem; padding: 0.8rem; background: ${h.role === 'user' ? '#EBF5FB' : '#F8F9FE'}; border-radius: 8px;">
          <strong>${h.role === 'user' ? name : '🤖 Assistant'}</strong>
          <span style="float: right; font-size: 0.75rem; color: var(--text-muted);">${new Date(h.created_at).toLocaleString('fr-FR')}</span>
          <p style="margin-top: 0.3rem; font-size: 0.9rem;">${h.content}</p>
        </div>
      `).join('');
      content.appendChild(div);
    }

    modal.classList.remove('hidden');
  } catch (e) {
    console.error('Erreur historique chat:', e);
  }
}
