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
  } catch (e) {
    console.error('Erreur login:', e);
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {}
  currentUser = null;
  clearInterval(timerInterval);
  clearInterval(heartbeatInterval);
  document.body.className = '';
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
// TIMER
// ==================
function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    remainingMinutes -= 1 / 60;
    updateTimerDisplay();

    if (remainingMinutes <= 5) {
      document.querySelector('.timer-display').classList.add('warning');
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
  document.getElementById('timer-value').textContent =
    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
// NAVIGATION
// ==================
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('section-' + sectionId).classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-btn[data-section="${sectionId}"]`)?.classList.add('active');

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
    content.innerHTML = dashboard.map(d => {
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

          <div class="report-section">
            <h4>📊 Par matière</h4>
            <div class="report-stats">
              ${d.stats.map(s => `
                <div class="report-stat">
                  <span class="value">${s.total_exercises > 0 ? Math.round(s.correct_answers / s.total_exercises * 100) : 0}%</span>
                  <span class="label">${subjectNames[s.subject] || s.subject} (${s.total_exercises} ex.)</span>
                </div>
              `).join('')}
            </div>
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

          <button class="btn-secondary" style="margin-top: 1rem; font-size: 0.85rem;" onclick="viewChatHistory(${d.child.id}, '${d.child.name}')">
            💬 Voir l'historique du chat
          </button>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Erreur dashboard parent:', e);
  }
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
