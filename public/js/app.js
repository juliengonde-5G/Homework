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
    const res = await fetch('/api/auth/family');
    if (!res.ok) throw new Error('family endpoint failed');
    const data = await res.json();
    const children = data.children || [];
    const parents = data.parents || [];

    // Ligne 1 : les enfants
    const grid = document.getElementById('profiles-grid');
    if (children.length > 0) {
      grid.innerHTML = children.map(u => `
        <div class="profile-card animate-in" onclick="login(${u.id})" style="animation-delay: ${u.id * 0.1}s">
          <span class="profile-avatar">${u.avatar}</span>
          <span class="profile-name">${u.name}</span>
          <span class="profile-classe">${u.classe}</span>
        </div>
      `).join('');
    }

    // Ligne 2 : les parents
    const parentsGrid = document.getElementById('parents-grid');
    const separator = document.querySelector('.family-separator');
    if (parentsGrid && parents.length > 0) {
      parentsGrid.innerHTML = parents.map(u => `
        <div class="profile-card parent-card animate-in" onclick="loginParentProfile(${u.id}, '${u.name}')" style="animation-delay: ${(u.id) * 0.1}s">
          <span class="profile-avatar">${u.avatar}</span>
          <span class="profile-name">${u.name}</span>
          <span class="profile-role">${u.name === 'Ophélie' ? 'Maman' : 'Papa'}</span>
        </div>
      `).join('');
    } else if (parents.length === 0) {
      if (separator) separator.style.display = 'none';
      if (parentsGrid) parentsGrid.style.display = 'none';
    }

    // Charger les alertes anniversaires
    loadBirthdayBanner();
  } catch (e) {
    console.error('Erreur chargement profils:', e);
    // Fallback sur l'ancienne API
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
    } catch (e2) {
      console.error('Erreur fallback:', e2);
    }
  }
}

async function loadBirthdayBanner() {
  try {
    const res = await fetch('/api/parent/birthdays');
    if (!res.ok) return;
    const birthdays = await res.json();
    const upcoming = birthdays.filter(b => b.daysUntil <= 7);

    const banner = document.getElementById('birthday-banner');
    if (!banner || upcoming.length === 0) {
      if (banner) banner.classList.add('hidden');
      return;
    }

    banner.classList.remove('hidden');
    banner.innerHTML = upcoming.map(b => {
      if (b.daysUntil === 0) {
        return `<div class="birthday-alert birthday-today-alert">🎂🎉 C'est l'anniversaire de <strong>${b.name}</strong> aujourd'hui ! Joyeux anniversaire ${b.avatar} ! 🎉🎂</div>`;
      } else {
        return `<div class="birthday-alert birthday-soon-alert">🎂 L'anniversaire de <strong>${b.name}</strong> ${b.avatar} est dans <strong>${b.daysUntil} jour${b.daysUntil > 1 ? 's' : ''}</strong> !</div>`;
      }
    }).join('');
  } catch (e) {
    // Pas d'accès parent, pas de bannière
  }
}

// ==================
// PROFILS PARENTS (Ophélie & Julien)
// ==================
async function loginParentProfile(userId, name) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (data.error) { alert(data.error); return; }

    currentUser = data.user;
    remainingMinutes = 999;
    totalDailyMinutes = 999;

    document.body.className = '';
    if (currentUser.theme) document.body.classList.add('theme-' + currentUser.theme);

    if (name === 'Ophélie') {
      // Ophélie : accès direct au chat libre
      showScreen('main-screen');
      setupParentChatScreen();
    } else if (name === 'Julien') {
      // Julien : accès aux parcours de compétences
      showScreen('main-screen');
      setupJulienScreen();
    }
  } catch (e) {
    console.error('Erreur connexion parent:', e);
    alert('Erreur de connexion');
  }
}

function setupParentChatScreen() {
  // Header simplifié pour Ophélie
  document.getElementById('main-header').innerHTML = `
    <div class="header-left">
      <span class="user-avatar">👩</span>
      <span class="user-greeting">Ophélie</span>
    </div>
    <div class="header-right">
      <button class="btn-icon" onclick="logout()" title="Se déconnecter">🚪</button>
    </div>
  `;

  // Masquer la navigation et afficher directement le chat
  document.getElementById('main-nav').style.display = 'none';
  document.getElementById('floating-timer').classList.add('hidden');
  document.getElementById('floating-bot').classList.add('hidden');

  // Afficher la section chat
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const chatSection = document.getElementById('section-chat');
  chatSection.classList.add('active');

  // Personnaliser le chat pour Ophélie
  chatSection.querySelector('.section-header').innerHTML = `
    <button class="btn-back" onclick="logout()">← Retour</button>
    <h2>💬 Mon espace</h2>
  `;
  chatSection.querySelector('.chat-subject-picker').innerHTML = `
    <button class="chat-subject-btn active" data-subject="" onclick="setChatSubject(this, '')">Libre</button>
    <button class="chat-subject-btn" data-subject="competences" onclick="setChatSubject(this, 'competences')">🎯 Compétences</button>
    <button class="chat-subject-btn" data-subject="organisation" onclick="setChatSubject(this, 'organisation')">📋 Organisation</button>
  `;

  // Message d'accueil personnalisé
  document.getElementById('chat-messages').innerHTML = `
    <div class="chat-bubble assistant">
      <p>Salut Ophélie ! Je suis ton assistant personnel. Tu peux me demander de t'aider à créer ton parcours de compétences, t'organiser, ou discuter de n'importe quel sujet. Qu'est-ce qui te ferait plaisir ? 😊</p>
    </div>
  `;

  loadChatHistory();
  setTimeout(() => loadAdultTips(), 500);
}

function setupJulienScreen() {
  // Header simplifié pour Julien
  document.getElementById('main-header').innerHTML = `
    <div class="header-left">
      <span class="user-avatar">👨</span>
      <span class="user-greeting">Julien</span>
    </div>
    <div class="header-right">
      <button class="btn-icon" onclick="logout()" title="Se déconnecter">🚪</button>
    </div>
  `;

  // Navigation avec parcours + chat
  const nav = document.getElementById('main-nav');
  nav.style.display = '';
  nav.innerHTML = `
    <button class="nav-btn active" data-section="julien-parcours" onclick="showSection('julien-parcours')">
      <span class="nav-icon">🎧</span>
      <span class="nav-label">Parcours</span>
    </button>
    <button class="nav-btn" data-section="chat" onclick="showSection('chat')">
      <span class="nav-icon">💬</span>
      <span class="nav-label">Assistant</span>
    </button>
  `;

  document.getElementById('floating-timer').classList.add('hidden');
  document.getElementById('floating-bot').classList.add('hidden');

  // Créer la section parcours Julien si elle n'existe pas
  if (!document.getElementById('section-julien-parcours')) {
    const section = document.createElement('section');
    section.id = 'section-julien-parcours';
    section.className = 'section active';
    section.innerHTML = `
      <div class="section-header">
        <button class="btn-back" onclick="logout()">← Retour</button>
        <h2>🎧 Mes Parcours de Compétences</h2>
      </div>
      <div id="julien-learning-content">
        <p style="text-align:center; padding:2rem;">Chargement...</p>
      </div>
    `;
    document.getElementById('content-area').appendChild(section);
  }

  // Afficher la section
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('section-julien-parcours').classList.add('active');

  // Charger les parcours
  loadJulienParcours();
  // Charger le mot du jour et l'actu du jour
  setTimeout(() => loadAdultTips(), 500);
}

async function loadJulienParcours() {
  const container = document.getElementById('julien-learning-content');
  try {
    const res = await fetch('/api/learning/paths');
    const paths = await res.json();

    if (paths.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--text-muted);">Aucun parcours disponible.</p>';
      return;
    }

    container.innerHTML = `
      <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.9rem;">
        Profil Analyseur - Parcours structurés pour progresser méthodiquement.
      </p>
      <div class="learning-paths-grid">
        ${paths.map(p => `
          <div class="learning-path-card" onclick="openJulienPath('${p.slug}')">
            <div class="learning-path-icon">${p.icon}</div>
            <div class="learning-path-info">
              <h4>${p.title}</h4>
              <p class="learning-path-desc">${p.description || ''}</p>
              <div class="learning-path-progress">
                <div class="learning-path-progress-bar">
                  <div class="learning-path-progress-fill" style="width: ${p.progress || 0}%"></div>
                </div>
                <span class="learning-path-progress-text">${p.completedLessons || 0} / ${p.totalLessons || p.total_modules} modules</span>
              </div>
            </div>
            <span class="learning-path-arrow">→</span>
          </div>
        `).join('')}
      </div>
    `;
  } catch (e) {
    console.error('Erreur chargement parcours:', e);
    container.innerHTML = '<p style="text-align:center; color:#E17055; padding:2rem;">Erreur de chargement</p>';
  }
}

async function openJulienPath(slug) {
  const container = document.getElementById('julien-learning-content');
  container.innerHTML = '<p style="text-align:center; padding:2rem;">Chargement...</p>';

  try {
    const res = await fetch(`/api/learning/path/${slug}`);
    const data = await res.json();

    container.innerHTML = `
      <button class="btn-back" onclick="loadJulienParcours()" style="margin-bottom: 1rem;">← Retour aux parcours</button>
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
        <span style="font-size: 2.5rem;">${data.path.icon}</span>
        <div>
          <h3 style="margin: 0;">${data.path.title}</h3>
          <p style="color: var(--text-muted); margin: 0.3rem 0 0; font-size: 0.9rem;">${data.path.description || ''}</p>
        </div>
      </div>
      <div class="lessons-list">
        ${data.lessons.map((lesson, i) => {
          _lessonCache[i] = lesson;
          const status = lesson.status || 'not_started';
          const statusIcon = status === 'completed' ? '✅' : status === 'in_progress' ? '🔄' : '⬜';
          const statusClass = status === 'completed' ? 'completed' : status === 'in_progress' ? 'in_progress' : '';
          return `
            <div class="lesson-item ${statusClass}" onclick="openAudioLesson(_lessonCache[${i}])">
              <span class="lesson-status">${statusIcon}</span>
              <div class="lesson-info">
                <span class="lesson-number">Module ${lesson.module_number}</span>
                <h4 class="lesson-title">${lesson.title}</h4>
                <p class="lesson-subtitle">${lesson.subtitle || ''}</p>
              </div>
              <div class="lesson-meta">
                <span class="lesson-duration">~${lesson.duration_estimate || 10} min</span>
                ${lesson.quiz_score != null ? `<span class="lesson-score">Quiz: ${lesson.quiz_score}%</span>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (e) {
    console.error('Erreur chargement parcours:', e);
    container.innerHTML = '<p style="text-align:center; color:#E17055; padding:2rem;">Erreur de chargement</p>';
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

    // Charger le programme du jour
    loadDailyProgram();

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

  // Restaurer le header et nav par défaut
  const nav = document.getElementById('main-nav');
  nav.style.display = '';
  nav.innerHTML = `
    <button class="nav-btn active" data-section="home" onclick="showSection('home')">
      <span class="nav-icon">🏠</span>
      <span class="nav-label">Accueil</span>
    </button>
    <button class="nav-btn" data-section="learn" onclick="showSection('learn')">
      <span class="nav-icon">📖</span>
      <span class="nav-label">Apprendre</span>
    </button>
    <button class="nav-btn" data-section="chat" onclick="showSection('chat')">
      <span class="nav-icon">💬</span>
      <span class="nav-label">Assistant</span>
    </button>
  `;

  // Supprimer la section Julien si elle existe
  const julienSection = document.getElementById('section-julien-parcours');
  if (julienSection) julienSection.remove();

  // Restaurer le chat par défaut
  const chatSection = document.getElementById('section-chat');
  chatSection.querySelector('.section-header').innerHTML = `
    <button class="btn-back" onclick="showSection('home')">← Retour</button>
    <h2>Mon Assistant</h2>
  `;
  chatSection.querySelector('.chat-subject-picker').innerHTML = `
    <button class="chat-subject-btn active" data-subject="" onclick="setChatSubject(this, '')">Général</button>
    <button class="chat-subject-btn" data-subject="francais" onclick="setChatSubject(this, 'francais')">📝 Français</button>
    <button class="chat-subject-btn" data-subject="anglais" onclick="setChatSubject(this, 'anglais')">🇬🇧 Anglais</button>
    <button class="chat-subject-btn" data-subject="maths" onclick="setChatSubject(this, 'maths')">🔢 Maths</button>
    <button class="chat-subject-btn" data-subject="techno" onclick="setChatSubject(this, 'techno')">🤖 Robot</button>
  `;
  document.getElementById('chat-messages').innerHTML = `
    <div class="chat-bubble assistant">
      <p>Salut ! Je suis ton assistant devoirs. Comment je peux t'aider ? 😊</p>
    </div>
  `;

  showScreen('login-screen');
  loadProfiles();
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
    ],
    entrepreneur: [
      { title: '💼 Prêt à progresser ?', text: 'Chaque apprentissage est un investissement. Développez vos compétences !' },
      { title: '🚀 En route vers l\'excellence', text: 'Le savoir, c\'est votre meilleur outil de dirigeant.' },
      { title: '🎯 Objectif compétences', text: 'Textile, anglais, IA... chaque module vous rend plus fort.' }
    ]
  };

  const pool = motivations[currentUser.profile_type] || motivations.promoteur;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ==================
// TIMER (header + floating)
// ==================
let timerRunning = false;

function startTimer() {
  updateTimerDisplay();
  // Le timer ne tourne que pendant les exercices - on le démarre/stoppe via showSection
}

function resumeTimer() {
  if (timerRunning) return;
  timerRunning = true;
  timerInterval = setInterval(() => {
    remainingMinutes -= 1 / 60;
    updateTimerDisplay();

    if (remainingMinutes <= 5) {
      document.querySelector('.timer-display')?.classList.add('warning');
      document.getElementById('floating-timer')?.classList.add('warning');
    }

    if (remainingMinutes <= 0) {
      pauseTimer();
      // Non bloquant : on affiche un message encourageant mais on laisse continuer
      showFloatingBotMessage(
        getTimerEndMessage(),
        [{ text: 'Je continue un peu', action: () => { closeFloatingBubble(); } },
         { text: 'OK, j\'arrête !', action: () => { closeFloatingBubble(); showSection('home'); } }]
      );
    }
  }, 1000);
}

function pauseTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerRunning = false;
}

function getTimerEndMessage() {
  const name = currentUser?.name;
  const msgs = {
    'Ilan': ['Temps écoulé champion ! Tu as super bien bossé ! 🏆', 'Fin du match ! Quelle performance ! ⚽💪'],
    'Sacha': ['Hey, les 45 min sont passées ! T\'as bien géré 😎', 'Temps fini ! T\'as assuré, prends une pause ✌️'],
    'Adan': ['La quête du jour est terminée, héros ! 🐉✨', 'Ton aventure a été épique aujourd\'hui ! 🌟']
  };
  const pool = msgs[name] || ['Session terminée ! Bien joué ! 🌟'];
  return pool[Math.floor(Math.random() * pool.length)];
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
  const name = currentUser.name;
  const greetings = {
    'Ilan': [`Hey ${name} ! Pret a marquer des points ? 💪`, `Salut champion ! Besoin d'un coup de main ?`, `Yo ! Tu veux battre ton record aujourd'hui ? ⚽`],
    'Sacha': [`Hey ${name} ! Je suis la si tu veux. Pas de pression 😎`, `Salut ! T'as des questions ? Je suis dispo ✌️`, `Coucou ! Je traine ici si tu as besoin 🎸`],
    'Adan': [`Salut ${name} ! Pret pour une nouvelle aventure ? ✨`, `Hey createur ! Je suis ton compagnon de quete 🐉`, `Bienvenue aventurier ! Besoin d'aide dans ta quete ? 🗡️`]
  };
  const pool = greetings[name] || [`Salut ${name} ! Comment je peux t'aider ? 😊`];
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

  // Masquer/afficher le bot flottant (caché quand on est dans le chat ou decouverte)
  const floatingBot = document.getElementById('floating-bot');
  if (floatingBot) {
    if (sectionId === 'chat' || sectionId === 'decouverte') {
      floatingBot.classList.add('hidden');
    } else {
      floatingBot.classList.remove('hidden');
    }
  }

  // Timer : tourne pendant les leçons et exercices (section learn)
  if (sectionId === 'learn') {
    resumeTimer();
  } else {
    pauseTimer();
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
// PARCOURS APPRENDRE (flux unifié : matière -> leçon -> exercices -> vidéos)
// ==================
let learnStep = 'list'; // 'list', 'lesson', 'exercises', 'complete'

function selectSubject(subject) {
  currentSubject = subject;
  const names = { francais: 'Français', anglais: 'Anglais', maths: 'Mathématiques', techno: 'Techno & Robotique', sciences: 'Sciences', culture: 'Culture & Géopolitique', arts: 'Arts Créatifs', informatique: 'Informatique & Logique' };
  document.getElementById('learn-title').textContent = names[subject] || subject;
  learnStep = 'list';
  loadLearnCourses(subject);
  showSection('learn');
  resumeTimer(); // Timer démarre dès qu'on entre dans une matière
}

function learnGoBack() {
  if (learnStep === 'lesson') {
    learnStep = 'list';
    document.getElementById('learn-course-detail').classList.add('hidden');
    document.getElementById('learn-courses-list').classList.remove('hidden');
    const names = { francais: 'Français', anglais: 'Anglais', maths: 'Mathématiques', techno: 'Techno & Robotique', sciences: 'Sciences', culture: 'Culture & Géopolitique', arts: 'Arts Créatifs', informatique: 'Informatique & Logique' };
    document.getElementById('learn-title').textContent = names[currentSubject] || currentSubject;
  } else if (learnStep === 'exercises') {
    // On ne revient pas en arrière pendant les exercices, on va à l'accueil
    showSection('home');
  } else {
    showSection('home');
  }
}

async function loadLearnCourses(subject) {
  try {
    const res = await fetch(`/api/courses?subject=${subject}&level=${currentUser.classe}`);
    const courses = await res.json();
    const list = document.getElementById('learn-courses-list');

    if (courses.length === 0) {
      list.innerHTML = `
        <div class="exercise-card">
          <p>Pas encore de leçons disponibles pour cette matière.</p>
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
        <div class="course-item animate-in" onclick="learnShowCourse(${c.id})" style="animation-delay: ${i * 0.05}s">
          <span class="course-number">${i + 1}</span>
          <div class="course-info">
            <h3>${c.title}</h3>
            <p>Difficulté: ${'⭐'.repeat(c.difficulty)}</p>
          </div>
          <span class="course-status">${statusIcon}</span>
        </div>
      `;
    }).join('');

    document.getElementById('learn-course-detail').classList.add('hidden');
    document.getElementById('learn-exercises').classList.add('hidden');
    document.getElementById('learn-complete').classList.add('hidden');
    list.classList.remove('hidden');
  } catch (e) {
    console.error('Erreur cours:', e);
  }
}

async function learnShowCourse(courseId) {
  try {
    const res = await fetch(`/api/courses/${courseId}`);
    const course = await res.json();

    learnStep = 'lesson';
    document.getElementById('learn-title').textContent = course.title;
    document.getElementById('learn-courses-list').classList.add('hidden');
    document.getElementById('learn-course-detail').classList.remove('hidden');
    document.getElementById('learn-course-content').innerHTML = `
      <h2>${course.title}</h2>
      ${course.video_url ? `<div class="course-video"><a href="${course.video_url}" target="_blank" class="btn-video">🎥 Voir la vidéo du cours</a></div>` : ''}
      <div class="course-body">${course.content}</div>
    `;
    // Ajouter le bouton TTS
    setTimeout(() => addTTSButton(currentSubject), 100);
  } catch (e) {
    console.error('Erreur cours détail:', e);
  }
}

function learnStartExercises() {
  learnStep = 'exercises';
  document.getElementById('learn-title').textContent = 'Exercices';
  document.getElementById('learn-course-detail').classList.add('hidden');
  document.getElementById('learn-exercises').classList.remove('hidden');
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

function getPersonalMessage(name, type) {
  const msgs = {
    'Ilan': {
      perfect: [`Score parfait Ilan ! Tu es un CHAMPION ! 🏆🔥`, `100% !! Ilan, GOAL GOAL GOAL ! 🥅⚽🌟`, `Sans faute ! Même Mbappé serait impressionné ! 💪`],
      great: [`Excellent Ilan ! Tu es sur la voie du champion ! 🌟`, `Bravo Ilan ! Continue comme ça, tu vas tout déchirer ! 🔥`, `Trop fort ! Tu progresses à vitesse grand V ! 🚀`],
      good: [`Bien joué Ilan ! Tu progresses et c'est ça qui compte ! 💪`, `Bravo ! Chaque exercice te rend plus fort ! 🎯`, `C'est bien Ilan ! Ne lâche rien ! ⚽`],
      encourage: [`Continue Ilan, les meilleurs joueurs s'entraînent ! 💪`, `C'est en s'entraînant qu'on devient champion ! 🔥`, `Hey Ilan, t'as essayé et c'est déjà super ! 💫`]
    },
    'Sacha': {
      perfect: [`Score parfait Sacha ! T'es un GÉNIE ! 🌟✨`, `100% !! Sacha, trop stylé ! 😎🔥`, `Sans faute ! Franchement respect ! 🤩`],
      great: [`Excellent Sacha ! T'assures grave ! 😎`, `Bravo Sacha ! C'est vraiment impressionnant ! ✌️`, `Trop fort ! Continue comme ça ! 🎸`],
      good: [`Bien joué Sacha ! Tu gères ! 😎`, `Bravo ! Tu progresses et c'est cool ! ✌️`, `C'est bien ! T'es sur la bonne voie ! 🎸`],
      encourage: [`Pas de stress Sacha, ça va venir ! 😌`, `Hey, tu t'améliores à chaque fois ! ✌️`, `T'as essayé et c'est déjà super courageux ! 💫`]
    },
    'Adan': {
      perfect: [`Score parfait Adan ! Tu es LÉGENDAIRE ! ⚔️🌟`, `100% !! Le grand mage a parlé ! 🧙‍♂️✨`, `Sans faute ! Victoire épique ! 🐉👑`],
      great: [`Excellent Adan ! Une quête héroïque ! 🗡️`, `Bravo Adan ! Tu as conquis le savoir ! 🏰`, `Ton sort de connaissance est puissant ! ✨`],
      good: [`Bien joué Adan ! Chaque combat te rend plus fort ! ⚔️`, `Bravo ! L'aventure continue ! 🐉`, `C'est bien ! Le héros progresse ! 🌟`],
      encourage: [`Continue Adan, même les héros échouent avant de triompher ! 🛡️`, `Le dragon était coriace ! Mais tu deviens plus fort ! 🐉`, `Nouvelle quête, nouvelle chance de briller ! ✨`]
    }
  };
  const pool = msgs[name]?.[type] || [`Bravo ${name} ! Continue comme ça ! 🌟`];
  return pool[Math.floor(Math.random() * pool.length)];
}

function getCorrectMessage() {
  const name = currentUser?.name;
  const messages = {
    'Ilan': ['🏆 Goal ! Bien joué !', '⚽ Quel tir ! Parfait !', '💪 Champion !', '🎯 En plein dans le mille !', '🥇 Inarrêtable !', '🔥 En feu !'],
    'Sacha': ['😎 Trop bien !', '✌️ Stylé !', '🎸 Tu gères grave !', '👏 Nice !', '🔥 Respect !', '🤩 T\'assures !'],
    'Adan': ['✨ Magnifique !', '🎨 Brillant !', '🐉 Victoire héroïque !', '⚔️ Sort réussi, mage !', '🏰 Territoire conquis !', '👑 Légendaire !']
  };
  const pool = messages[name] || ['🌟 Bravo !', '✅ Correct !', '👏 Bien joué !'];
  return pool[Math.floor(Math.random() * pool.length)];
}

function getIncorrectMessage() {
  const name = currentUser?.name;
  const messages = {
    'Ilan': ['Pas grave, on se relève ! 💪', 'Prochaine fois, tu marques ! ⚽', 'Même les pros ratent ! 🎯', 'Allez, on repart ! ⚡'],
    'Sacha': ['Pas de stress, ça arrive 😌', 'T\'inquiète, essaie encore ✌️', 'Relax, tu vas déchirer la prochaine ! 🤙', 'Personne n\'est parfait 😎'],
    'Adan': ['Le héros apprend de ses échecs 🛡️', 'Prochaine quête, tu réussiras ! 🗡️', 'Le dragon était coriace ! 🐉', 'Même les mages ratent des sorts ! 🧙‍♂️']
  };
  const pool = messages[name] || ['Pas grave, on continue ! 💪', 'Ça arrive, essaie encore ! 🎯'];
  return pool[Math.floor(Math.random() * pool.length)];
}

function nextExercise() {
  selectedAnswer = null;
  currentExerciseIndex++;

  if (currentExerciseIndex >= currentExercises.length) {
    // Série terminée - afficher résultats + vidéos récompense
    learnStep = 'complete';
    document.getElementById('learn-exercises').classList.add('hidden');
    document.getElementById('exercise-result').classList.add('hidden');
    document.getElementById('learn-complete').classList.remove('hidden');
    pauseTimer(); // Pause le timer après les exercices

    const total = currentExercises.length;
    const rate = Math.round((exerciseScore / total) * 100);
    const name = currentUser?.name || '';

    let message = '';
    if (rate === 100) {
      message = getPersonalMessage(name, 'perfect');
    } else if (rate >= 80) {
      message = getPersonalMessage(name, 'great');
    } else if (rate >= 60) {
      message = getPersonalMessage(name, 'good');
    } else {
      message = getPersonalMessage(name, 'encourage');
    }

    document.getElementById('exercise-summary').innerHTML = `
      <p style="font-size: 1.3rem; margin-bottom: 0.5rem;">${exerciseScore} / ${total} correct</p>
      <p style="font-size: 1.1rem;">${message}</p>
    `;

    document.getElementById('exercise-progress-fill').style.width = '100%';

    // Charger les vidéos récompense
    loadRewardVideos();
    return;
  }

  showExercise();
}

function loadRewardVideos() {
  const videoContainer = document.getElementById('learn-videos-reward');
  if (!videoContainer) return;

  const videos = getPersonalVideos();
  if (videos.length === 0) {
    videoContainer.innerHTML = '';
    return;
  }

  videoContainer.innerHTML = `
    <h3 style="margin-top: 1.5rem;">🎥 Tes vidéos récompense !</h3>
    <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Tu as bien travaillé, voici des vidéos rien que pour toi !</p>
    <div class="videos-grid">
      ${videos.slice(0, 2).map(v => `
        <a href="${v.url}" target="_blank" class="video-card">
          <span class="video-icon">🎬</span>
          <span class="video-title">${v.title}</span>
        </a>
      `).join('')}
    </div>
  `;
}

function getPersonalVideos() {
  const name = currentUser?.name;
  const videosMap = {
    'Ilan': [
      { title: 'Les maths du football', url: 'https://www.youtube.com/watch?v=math-football' },
      { title: 'Les langues dans le sport pro', url: 'https://www.youtube.com/watch?v=sport-langues' },
      { title: 'La géopolitique du foot', url: 'https://www.youtube.com/watch?v=geopolitique-foot' }
    ],
    'Sacha': [
      { title: 'Les maths dans la musique', url: 'https://www.youtube.com/watch?v=math-musique' },
      { title: 'Créer son premier film', url: 'https://www.youtube.com/watch?v=creer-film' },
      { title: 'L\'art du storytelling', url: 'https://www.youtube.com/watch?v=storytelling' }
    ],
    'Adan': [
      { title: 'Peindre des figurines Warhammer', url: 'https://www.youtube.com/watch?v=paint-warhammer' },
      { title: 'Les maths des jeux de stratégie', url: 'https://www.youtube.com/watch?v=math-strategie' },
      { title: 'Créer un monde imaginaire', url: 'https://www.youtube.com/watch?v=monde-imaginaire' }
    ]
  };
  // Ajouter vidéo basée sur la passion du jour
  const videos = videosMap[name] || [];
  if (todayPassion) {
    videos.unshift({ title: `En savoir plus sur : ${todayPassion}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(todayPassion + ' pour enfants')}` });
  }
  return videos;
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
    'Ilan': [
      { q: 'Comment tu te sens aujourd\'hui, champion ? ⚽', r1: 'Au top !', r2: 'Bof...' },
      { q: 'T\'es fier de toi ? Moi je trouve que tu gères ! 💪', r1: 'Carrément !', r2: 'Mouais' },
      { q: 'Tu veux un petit défi spécial ? 🎯', r1: 'Oui !', r2: 'Plus tard' },
      { q: 'C\'est quoi ta matière préférée en ce moment ?', r1: 'Je te dis !', r2: 'Secret !' }
    ],
    'Sacha': [
      { q: 'Ça va toi ? Pas trop la flemme ? 😎', r1: 'Ça va !', r2: 'Un peu...' },
      { q: 'T\'as envie de continuer ou tu veux faire une pause ? ✌️', r1: 'Je continue', r2: 'Pause !' },
      { q: 'C\'est cool que tu sois là ! Tu veux changer de matière ?', r1: 'Oui pourquoi pas', r2: 'Non c\'est bien' },
      { q: 'Hey, raconte un truc marrant qui t\'est arrivé cette semaine ?', r1: 'Haha oui !', r2: 'Rien de ouf' }
    ],
    'Adan': [
      { q: 'Si les maths étaient un personnage de Warhammer, ce serait qui ? 🐉', r1: 'Un mage !', r2: 'Un guerrier !' },
      { q: 'Tu te sens plutôt créateur ou explorateur aujourd\'hui ? ✨', r1: 'Créateur', r2: 'Explorateur' },
      { q: 'Imagine que chaque exercice est un sort à lancer... Tu es prêt, sorcier ? 🗡️', r1: 'Oui !', r2: 'Presque...' },
      { q: 'Si tu pouvais inventer une matière à l\'école, ce serait quoi ?', r1: 'Dis-moi !', r2: 'Hmm...' }
    ]
  };

  const pool = questions[currentUser.name] || [
    { q: 'Comment ça va ? 😊', r1: 'Bien !', r2: 'Bof...' }
  ];
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
    imagineur: 'Aventurier, raconte-moi... ✨',
    entrepreneur: 'Avant votre session... 💼'
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
      { label: '🤖 Robotique', value: 'robotique' },
      { label: '💻 Programmation', value: 'programmation' },
      { label: '🎮 Jeux vidéo', value: 'jeux vidéo' },
      { label: '🎵 Musique', value: 'musique' },
      { label: '🎨 Dessin', value: 'dessin' },
      { label: '📺 Vidéos/YouTube', value: 'vidéos' }
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
    imagineur: 'Genial ! L\'aventure est personnalisee rien que pour toi !',
    entrepreneur: 'Parfait ! Votre session est prête, on y va !'
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
      const subjectNames = { francais: 'Français', anglais: 'Anglais', maths: 'Maths', techno: 'Techno', sciences: 'Sciences', culture: 'Culture', arts: 'Arts', informatique: 'Info' };

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
  const subjectNames = { francais: 'Français', anglais: 'Anglais', maths: 'Maths', techno: 'Techno', sciences: 'Sciences', culture: 'Culture', arts: 'Arts', informatique: 'Info' };
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

  const subjectNames = { francais: 'Français', anglais: 'Anglais', maths: 'Maths', techno: 'Techno', sciences: 'Sciences', culture: 'Culture', arts: 'Arts', informatique: 'Info' };
  const colors = { francais: '#4A90D9', anglais: '#E74C3C', maths: '#2ECC71', techno: '#FF6B35', sciences: '#9B59B6', culture: '#E67E22', arts: '#E91E63', informatique: '#00BCD4' };

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

// ==================
// DÉCOUVERTE LIBRE
// ==================
function openDecouverte() {
  showSection('decouverte');
  loadDecouverteSuggestions();
}

function loadDecouverteSuggestions() {
  const suggestions = {
    promoteur: [
      { text: '⚽ Comment on devient footballeur pro ?', topic: 'Comment on devient footballeur professionnel ?' },
      { text: '🏆 Comment marchent les JO ?', topic: 'Comment fonctionnent les Jeux Olympiques ?' },
      { text: '🚀 C\'est quoi l\'espace ?', topic: 'Comment fonctionne l\'espace et les fusées ?' },
      { text: '🎮 Comment on crée un jeu vidéo ?', topic: 'Comment on crée un jeu vidéo ?' }
    ],
    rebelle: [
      { text: '🎸 Comment on fait de la musique ?', topic: 'Comment on compose et fait de la musique ?' },
      { text: '📱 Comment marche TikTok ?', topic: 'Comment fonctionne l\'algorithme de TikTok ?' },
      { text: '🎬 Comment on fait un film ?', topic: 'Comment on réalise un film ?' },
      { text: '🛹 L\'histoire du skateboard', topic: 'Quelle est l\'histoire du skateboard ?' }
    ],
    imagineur: [
      { text: '🎨 Comment peindre des figurines ?', topic: 'Comment bien peindre des figurines Warhammer ?' },
      { text: '🐉 Les dragons dans l\'histoire', topic: 'D\'où viennent les légendes de dragons ?' },
      { text: '✈️ Comment faire un avion en papier ?', topic: 'Comment fabriquer le meilleur avion en papier ?' },
      { text: '🏰 Comment vivait-on au Moyen Âge ?', topic: 'Comment vivaient les gens au Moyen Âge ?' }
    ],
    entrepreneur: [
      { text: '♻️ L\'avenir du recyclage textile', topic: 'Quelles sont les innovations dans le recyclage textile ?' },
      { text: '🤖 L\'IA en entreprise', topic: 'Comment l\'IA transforme les entreprises en 2026 ?' },
      { text: '🌍 L\'économie circulaire', topic: 'Comment fonctionne l\'économie circulaire dans le textile ?' },
      { text: '📊 Management et leadership', topic: 'Quelles sont les meilleures pratiques de management moderne ?' }
    ]
  };

  // Ajouter les suggestions basées sur la passion du jour
  const pool = suggestions[currentUser?.profile_type] || suggestions.promoteur;
  const container = document.getElementById('decouverte-suggestions');

  let allSuggestions = [...pool];
  if (todayPassion) {
    allSuggestions.unshift({ text: `🎯 En savoir plus sur : ${todayPassion}`, topic: `Explique-moi tout sur ${todayPassion}` });
  }

  container.innerHTML = allSuggestions.slice(0, 4).map(s =>
    `<button class="decouverte-suggestion-btn" onclick="sendDecouverteTopic('${s.topic.replace(/'/g, "\\'")}')">${s.text}</button>`
  ).join('');
}

function sendDecouverteTopic(topic) {
  document.getElementById('decouverte-input').value = topic;
  sendDecouverteMessage(new Event('submit'));
}

async function sendDecouverteMessage(e) {
  e.preventDefault();
  const input = document.getElementById('decouverte-input');
  const message = input.value.trim();
  if (!message) return;
  input.value = '';

  // Masquer les suggestions après la première question
  const suggestionsEl = document.getElementById('decouverte-suggestions');
  if (suggestionsEl) suggestionsEl.style.display = 'none';

  // Ajouter le message utilisateur
  const container = document.getElementById('decouverte-messages');
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.innerHTML = `<p>${formatMessage(message)}</p>`;
  container.appendChild(userBubble);

  // Bubble typing
  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-bubble assistant typing';
  container.appendChild(typingBubble);
  container.scrollTop = container.scrollHeight;

  try {
    const res = await fetch('/api/chat/decouverte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();

    typingBubble.classList.remove('typing');
    typingBubble.innerHTML = `<p>${formatMessage(data.message)}</p>`;
    container.scrollTop = container.scrollHeight;
  } catch (e) {
    typingBubble.classList.remove('typing');
    typingBubble.innerHTML = '<p>Oups, un problème est survenu. Réessaie ! 🔧</p>';
  }
}

// ==================
// PARCOURS D'APPRENTISSAGE (Parent - Audio)
// ==================
let currentAudioLesson = null;
let _lessonCache = [];
let speechUtterance = null;
let speechPlaying = false;
let audioSpeed = 1;
let audioCharIndex = 0;

function showParentTab(tab) {
  const contentEl = document.getElementById('parent-content');
  const competenciesEl = document.getElementById('parent-competencies');
  const birthdaysEl = document.getElementById('parent-birthdays');
  const tabDashboard = document.getElementById('tab-dashboard');
  const tabCompetencies = document.getElementById('tab-competencies');
  const tabBirthdays = document.getElementById('tab-birthdays');

  // Reset all tabs
  [tabDashboard, tabCompetencies, tabBirthdays].forEach(t => { if (t) t.className = 'btn-secondary'; });
  [contentEl, competenciesEl, birthdaysEl].forEach(el => { if (el) el.classList.add('hidden'); });

  if (tab === 'birthdays') {
    birthdaysEl.classList.remove('hidden');
    tabBirthdays.className = 'btn-primary';
    loadBirthdayAdmin();
  } else if (tab === 'competencies') {
    competenciesEl.classList.remove('hidden');
    tabCompetencies.className = 'btn-primary';
    loadCompetenciesTab();
  } else {
    contentEl.classList.remove('hidden');
    tabDashboard.className = 'btn-primary';
  }
}

async function loadCompetenciesTab() {
  const container = document.getElementById('parent-competencies');
  container.innerHTML = '<p style="text-align:center; padding:2rem;">Chargement...</p>';

  try {
    const res = await fetch('/api/parent/dashboard');
    const dashboard = await res.json();

    const subjectNames = { francais: 'Français', anglais: 'Anglais', maths: 'Maths', techno: 'Techno', sciences: 'Sciences', culture: 'Culture', arts: 'Arts', informatique: 'Info' };
    const subjectIcons = { francais: '📝', anglais: '🇬🇧', maths: '🔢', techno: '🤖', sciences: '🔬', culture: '🌍', arts: '🎨', informatique: '💻' };
    const subjectColors = { francais: '#4A90D9', anglais: '#E74C3C', maths: '#2ECC71', techno: '#FF6B35', sciences: '#9B59B6', culture: '#E67E22', arts: '#E91E63', informatique: '#00BCD4' };

    container.innerHTML = '<h3 style="margin-bottom: 1rem;">🎯 Suivi des compétences et parcours</h3>' +
      dashboard.map(d => {
        return `<div class="child-report" style="margin-bottom: 2rem;">
          <h3>${d.child.avatar} ${d.child.name} - ${d.child.classe}</h3>
          <div class="competency-selector">
            <button class="btn-primary" style="font-size:0.8rem;" onclick="loadChildCompetencies(${d.child.id})">📊 Voir les compétences détaillées</button>
            <button class="btn-secondary" style="font-size:0.8rem;" onclick="loadChildCourseHistory(${d.child.id}, '${d.child.name}')">📚 Historique des parcours</button>
          </div>
          <div id="competency-detail-${d.child.id}" class="competency-detail"></div>
        </div>`;
      }).join('');
  } catch (e) {
    container.innerHTML = '<p style="color: #E17055; text-align: center;">Erreur de chargement</p>';
  }
}

async function loadChildCompetencies(userId) {
  const container = document.getElementById('competency-detail-' + userId);
  container.innerHTML = '<p style="text-align:center; padding:1rem;">Chargement des compétences...</p>';

  try {
    const res = await fetch('/api/parent/competencies/' + userId);
    const data = await res.json();

    const subjectNames = { francais: 'Français', anglais: 'Anglais', maths: 'Maths', techno: 'Techno', sciences: 'Sciences', culture: 'Culture', arts: 'Arts', informatique: 'Info' };
    const subjectColors = { francais: '#4A90D9', anglais: '#E74C3C', maths: '#2ECC71', techno: '#FF6B35', sciences: '#9B59B6', culture: '#E67E22', arts: '#E91E63', informatique: '#00BCD4' };

    let html = '';

    // Pour chaque matière, afficher les compétences
    for (const [subject, courses] of Object.entries(data.coursesBySubject)) {
      const subjectColor = subjectColors[subject] || '#6C5CE7';
      const competencies = data.competencies[subject] || {};

      const totalCourses = courses.length;
      const completedCourses = courses.filter(c => c.status === 'completed').length;
      const progressPercent = totalCourses > 0 ? Math.round(completedCourses / totalCourses * 100) : 0;

      html += `<div class="competency-subject" style="margin: 1rem 0; padding: 1rem; background: var(--bg); border-radius: 12px; border-left: 4px solid ${subjectColor};">
        <h4 style="margin: 0 0 0.5rem 0; color: ${subjectColor};">${subjectNames[subject] || subject} — ${completedCourses}/${totalCourses} cours (${progressPercent}%)</h4>
        <div style="background: #eee; border-radius: 8px; height: 8px; margin-bottom: 0.8rem;">
          <div style="background: ${subjectColor}; width: ${progressPercent}%; height: 100%; border-radius: 8px; transition: width 0.3s;"></div>
        </div>`;

      // Liste des cours avec statut
      html += '<div style="display: flex; flex-direction: column; gap: 0.3rem;">';
      courses.forEach(c => {
        const icon = c.status === 'completed' ? '✅' : c.status === 'in_progress' ? '🔄' : '⬜';
        const scoreText = c.score !== null && c.score !== undefined ? ` (${c.score}%)` : '';
        const dateText = c.completedAt ? ` — ${new Date(c.completedAt).toLocaleDateString('fr-FR')}` : '';
        html += `<div style="font-size: 0.85rem; padding: 0.3rem 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>${icon}</span>
          <span style="flex:1;">${c.title}</span>
          <span style="color: var(--text-muted); font-size: 0.75rem;">${scoreText}${dateText}</span>
        </div>`;
      });
      html += '</div>';

      // Compétences (tags) avec barres de progression
      const tagEntries = Object.entries(competencies);
      if (tagEntries.length > 0) {
        html += '<div style="margin-top: 0.8rem;"><strong style="font-size: 0.8rem;">Compétences détaillées :</strong>';
        html += '<div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.4rem;">';
        tagEntries.forEach(([tag, vals]) => {
          const rate = vals.done > 0 ? Math.round(vals.correct / vals.done * 100) : 0;
          const bgColor = rate >= 80 ? '#00B894' : rate >= 50 ? '#FDCB6E' : vals.done === 0 ? '#DFE6E9' : '#E17055';
          html += `<span style="font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 10px; background: ${bgColor}20; border: 1px solid ${bgColor}; color: ${bgColor === '#DFE6E9' ? '#636E72' : bgColor};" title="${vals.correct}/${vals.done} correct sur ${vals.total} total">
            ${tag} ${vals.done > 0 ? rate + '%' : '—'}
          </span>`;
        });
        html += '</div></div>';
      }

      html += '</div>';
    }

    if (!html) html = '<p style="color: var(--text-muted);">Aucune donnée de compétences disponible.</p>';
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = '<p style="color: #E17055;">Erreur de chargement des compétences</p>';
  }
}

async function loadChildCourseHistory(userId, childName) {
  const container = document.getElementById('competency-detail-' + userId);
  container.innerHTML = '<p style="text-align:center; padding:1rem;">Chargement de l\'historique...</p>';

  try {
    const res = await fetch('/api/parent/course-history/' + userId);
    const data = await res.json();

    const subjectNames = { francais: 'Français', anglais: 'Anglais', maths: 'Maths', techno: 'Techno', sciences: 'Sciences', culture: 'Culture', arts: 'Arts', informatique: 'Info' };

    let html = `<h4 style="margin: 0.5rem 0;">📚 Historique des parcours de ${childName}</h4>`;

    // Progression hebdomadaire
    if (data.weeklyProgress.length > 0) {
      html += '<div style="margin: 1rem 0; padding: 1rem; background: var(--bg); border-radius: 12px;"><strong>Progression hebdomadaire</strong>';
      const weeks = {};
      data.weeklyProgress.forEach(w => {
        if (!weeks[w.week]) weeks[w.week] = [];
        weeks[w.week].push(w);
      });

      for (const [week, subjects] of Object.entries(weeks)) {
        html += `<div style="margin-top: 0.5rem; padding: 0.5rem; border-bottom: 1px solid var(--border);">
          <strong style="font-size: 0.85rem;">${week}</strong>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.3rem;">`;
        subjects.forEach(s => {
          const rate = s.exercises_done > 0 ? Math.round(s.correct / s.exercises_done * 100) : 0;
          html += `<span style="font-size: 0.75rem; padding: 0.2rem 0.5rem; background: var(--card-bg); border-radius: 8px; border: 1px solid var(--border);">
            ${subjectNames[s.subject] || s.subject}: ${s.exercises_done} ex. (${rate}%)
          </span>`;
        });
        html += '</div></div>';
      }
      html += '</div>';
    }

    // Liste des exercices récents
    if (data.history.length > 0) {
      html += '<div style="margin-top: 1rem;"><strong>Derniers exercices</strong>';
      html += '<div style="display: flex; flex-direction: column; gap: 0.3rem; margin-top: 0.5rem; max-height: 40vh; overflow-y: auto;">';
      data.history.forEach(h => {
        const icon = h.score === 100 ? '✅' : '❌';
        const date = h.completed_at ? new Date(h.completed_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
        html += `<div style="font-size: 0.85rem; padding: 0.4rem 0.6rem; background: var(--bg); border-radius: 8px; display: flex; align-items: center; gap: 0.5rem;">
          <span>${icon}</span>
          <span style="min-width: 50px; font-weight: 600; color: var(--text-muted); font-size: 0.75rem;">${subjectNames[h.subject] || h.subject}</span>
          <span style="flex: 1;">${h.title}</span>
          ${h.course_title ? `<span style="color: var(--text-muted); font-size: 0.7rem;">📖 ${h.course_title}</span>` : ''}
          <span style="color: var(--text-muted); font-size: 0.7rem;">${date}</span>
        </div>`;
      });
      html += '</div></div>';
    } else {
      html += '<p style="color: var(--text-muted); margin-top: 1rem;">Aucun exercice réalisé pour le moment.</p>';
    }

    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = '<p style="color: #E17055;">Erreur de chargement de l\'historique</p>';
  }
}

async function loadBirthdayAdmin() {
  const container = document.getElementById('parent-birthdays');
  container.innerHTML = '<p style="text-align:center; padding:2rem;">Chargement...</p>';

  try {
    const res = await fetch('/api/parent/family');
    const members = await res.json();

    container.innerHTML = `
      <h3 style="margin-bottom: 1rem;">🎂 Anniversaires de la famille</h3>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.9rem;">
        Configurez les dates d'anniversaire pour recevoir des rappels et surprises !
      </p>
      <div class="birthday-list">
        ${members.map(m => `
          <div class="birthday-card">
            <div class="birthday-info">
              <span style="font-size: 2rem;">${m.avatar}</span>
              <div>
                <strong>${m.name}</strong>
                <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">${m.role === 'parent' ? (m.name === 'Ophélie' ? 'Maman' : 'Papa') : m.classe}</span>
              </div>
            </div>
            <div class="birthday-input-group">
              <input type="date" id="birthday-${m.id}" value="${m.birthday || ''}" class="birthday-input"
                     onchange="saveBirthday(${m.id}, this.value)">
              <span id="birthday-status-${m.id}" class="birthday-status"></span>
            </div>
          </div>
        `).join('')}
      </div>

      <div id="birthday-countdown-section" style="margin-top: 2rem;">
        <h4>🎉 Prochains anniversaires</h4>
        <div id="birthday-countdowns"></div>
      </div>
    `;

    // Charger les comptes à rebours
    loadBirthdayCountdowns();
  } catch (e) {
    console.error('Erreur chargement anniversaires:', e);
    container.innerHTML = '<p style="text-align:center; color:#E17055;">Erreur de chargement</p>';
  }
}

async function saveBirthday(userId, birthday) {
  const statusEl = document.getElementById(`birthday-status-${userId}`);
  try {
    await fetch(`/api/parent/birthday/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ birthday })
    });
    statusEl.textContent = '✅';
    setTimeout(() => { statusEl.textContent = ''; }, 2000);
    loadBirthdayCountdowns();
  } catch (e) {
    statusEl.textContent = '❌';
  }
}

async function loadBirthdayCountdowns() {
  try {
    const res = await fetch('/api/parent/birthdays');
    const birthdays = await res.json();

    const container = document.getElementById('birthday-countdowns');
    if (!container) return;

    if (birthdays.length === 0) {
      container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Aucun anniversaire configuré.</p>';
      return;
    }

    container.innerHTML = birthdays.map(b => {
      const isClose = b.daysUntil <= 7;
      const isToday = b.daysUntil === 0;
      const urgencyClass = isToday ? 'birthday-today' : isClose ? 'birthday-soon' : '';

      return `
        <div class="birthday-countdown-item ${urgencyClass}">
          <span style="font-size: 1.5rem;">${b.avatar}</span>
          <div style="flex: 1;">
            <strong>${b.name}</strong>
            <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">
              ${new Date(b.nextBirthday + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
            </span>
          </div>
          <div class="birthday-countdown-badge ${urgencyClass}">
            ${isToday ? '🎉 Aujourd\'hui !' : isClose ? `⏰ ${b.daysUntil}j` : `${b.daysUntil} jours`}
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    console.error('Erreur comptes à rebours:', e);
  }
}

async function loadLearningPaths() {
  const container = document.getElementById('parent-learning');
  container.innerHTML = '<p style="text-align:center; padding:2rem;">Chargement...</p>';

  try {
    const res = await fetch('/api/learning/paths');
    const paths = await res.json();

    if (paths.length === 0) {
      container.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--text-muted);">Aucun parcours disponible.</p>';
      return;
    }

    container.innerHTML = `
      <h3 style="margin-bottom: 1rem;">🎧 Mes Parcours Audio</h3>
      <p style="color: var(--text-muted); margin-bottom: 1.5rem; font-size: 0.9rem;">
        Conçus pour vos trajets en voiture - écoutez, apprenez, progressez.
      </p>
      <div class="learning-paths-grid">
        ${paths.map(p => `
          <div class="learning-path-card" onclick="openLearningPath('${p.slug}')">
            <div class="learning-path-icon">${p.icon}</div>
            <div class="learning-path-info">
              <h4>${p.title}</h4>
              <p class="learning-path-desc">${p.description || ''}</p>
              <div class="learning-path-progress">
                <div class="learning-path-progress-bar">
                  <div class="learning-path-progress-fill" style="width: ${p.progress || 0}%"></div>
                </div>
                <span class="learning-path-progress-text">${p.completedLessons || 0} / ${p.totalLessons || p.total_modules} modules</span>
              </div>
            </div>
            <span class="learning-path-arrow">→</span>
          </div>
        `).join('')}
      </div>
    `;
  } catch (e) {
    console.error('Erreur chargement parcours:', e);
    container.innerHTML = '<p style="text-align:center; color:#E17055; padding:2rem;">Erreur de chargement</p>';
  }
}

async function openLearningPath(slug) {
  const container = document.getElementById('parent-learning');
  container.innerHTML = '<p style="text-align:center; padding:2rem;">Chargement...</p>';

  try {
    const res = await fetch(`/api/learning/path/${slug}`);
    const data = await res.json();

    container.innerHTML = `
      <button class="btn-back" onclick="loadLearningPaths()" style="margin-bottom: 1rem;">← Retour aux parcours</button>
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
        <span style="font-size: 2.5rem;">${data.path.icon}</span>
        <div>
          <h3 style="margin: 0;">${data.path.title}</h3>
          <p style="color: var(--text-muted); margin: 0.3rem 0 0; font-size: 0.9rem;">${data.path.description || ''}</p>
        </div>
      </div>
      <div class="lessons-list">
        ${data.lessons.map((lesson, i) => {
          _lessonCache[i] = lesson;
          const status = lesson.status || 'not_started';
          const statusIcon = status === 'completed' ? '✅' : status === 'in_progress' ? '🔄' : '⬜';
          const statusClass = status === 'completed' ? 'completed' : status === 'in_progress' ? 'in_progress' : '';
          return `
            <div class="lesson-item ${statusClass}" onclick="openAudioLesson(_lessonCache[${i}])">
              <span class="lesson-status">${statusIcon}</span>
              <div class="lesson-info">
                <span class="lesson-number">Module ${lesson.module_number}</span>
                <h4 class="lesson-title">${lesson.title}</h4>
                <p class="lesson-subtitle">${lesson.subtitle || ''}</p>
              </div>
              <div class="lesson-meta">
                <span class="lesson-duration">~${lesson.duration_estimate || 10} min</span>
                ${lesson.quiz_score != null ? `<span class="lesson-score">Quiz: ${lesson.quiz_score}%</span>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } catch (e) {
    console.error('Erreur chargement parcours:', e);
    container.innerHTML = '<p style="text-align:center; color:#E17055; padding:2rem;">Erreur de chargement</p>';
  }
}

function openAudioLesson(lesson) {
  try {
    if (!lesson) { console.error('openAudioLesson: lesson is null/undefined'); return; }
    currentAudioLesson = lesson;
    stopSpeech();

    document.getElementById('audio-lesson-number').textContent = `Module ${lesson.module_number}`;
    document.getElementById('audio-lesson-title').textContent = lesson.title;
    document.getElementById('audio-lesson-subtitle').textContent = lesson.subtitle || '';
    document.getElementById('audio-text-content').textContent = lesson.content_text || '';
    document.getElementById('audio-play-btn').textContent = '▶️ Écouter';

    // Vocabulaire
    const vocabEl = document.getElementById('audio-vocab');
    try {
      const vocab = typeof lesson.vocabulary === 'string' ? JSON.parse(lesson.vocabulary) : (lesson.vocabulary || []);
      if (vocab.length > 0) {
        vocabEl.innerHTML = `
          <h4>📖 Vocabulaire</h4>
          <div class="vocab-list">
            ${vocab.map(v => `
              <div class="vocab-item">
                <span class="vocab-term">${v.en || v.term || ''}</span>
                <span class="vocab-def">${v.fr || v.definition || ''}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        vocabEl.innerHTML = '';
      }
    } catch (e) { vocabEl.innerHTML = ''; }

    // Points clés
    const keypointsEl = document.getElementById('audio-keypoints');
    try {
      const kp = typeof lesson.key_points === 'string' ? JSON.parse(lesson.key_points) : (lesson.key_points || []);
      if (kp.length > 0) {
        keypointsEl.innerHTML = `
          <h4>🎯 Points clés</h4>
          <ul class="keypoints-list">
            ${kp.map(p => `<li>${p}</li>`).join('')}
          </ul>
        `;
      } else {
        keypointsEl.innerHTML = '';
      }
    } catch (e) { keypointsEl.innerHTML = ''; }

    // Reset visibility
    document.getElementById('audio-text-container').style.display = 'none';
    vocabEl.classList.add('hidden');
    keypointsEl.classList.add('hidden');

    // Reset speed buttons
    document.querySelectorAll('.audio-speed-btn').forEach(btn => btn.classList.remove('active'));
    const defaultSpeedBtn = document.querySelector('.audio-speed-btn[onclick*="setAudioSpeed(1)"]');
    if (defaultSpeedBtn) defaultSpeedBtn.classList.add('active');
    audioSpeed = 1;

    document.getElementById('audio-player-modal').classList.remove('hidden');

    // Mark as in_progress
    updateLessonProgress('in_progress');
  } catch (e) {
    console.error('Erreur openAudioLesson:', e);
    alert('Erreur lors de l\'ouverture du module: ' + e.message);
  }
}

function toggleAudioPlay() {
  if (speechPlaying) {
    pauseTTS();
    speechPlaying = false;
    document.getElementById('audio-play-btn').textContent = '▶️ Reprendre';
  } else if (ttsSegments.length > 0) {
    // Reprendre là où on en était
    resumeTTS();
    speechPlaying = true;
    document.getElementById('audio-play-btn').textContent = '⏸️ Pause';
  } else {
    // Démarrer depuis le début
    startSpeech();
    document.getElementById('audio-play-btn').textContent = '⏸️ Pause';
  }
}

function startSpeech() {
  if (!currentAudioLesson) return;

  const text = currentAudioLesson.content_text || '';
  const isEnglish = currentAudioLesson.title && currentAudioLesson.title.match(/english|anglais|business/i);
  const lang = isEnglish ? 'en' : 'fr';

  // Utiliser le moteur Google TTS serveur (voix natives)
  ttsRate = audioSpeed;
  setTTSRate(audioSpeed);
  speakText(text, lang);
  speechPlaying = true;
}

function stopSpeech() {
  stopTTS();
  speechPlaying = false;
}

function audioRewind() {
  ttsRewind();
  speechPlaying = true;
  document.getElementById('audio-play-btn').textContent = '⏸️ Pause';
}

function audioForward() {
  ttsForward();
  speechPlaying = true;
  document.getElementById('audio-play-btn').textContent = '⏸️ Pause';
}

function setAudioSpeed(rate, btn) {
  audioSpeed = rate;
  document.querySelectorAll('.audio-speed-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  setTTSRate(rate);
}

function toggleAudioText() {
  const el = document.getElementById('audio-text-container');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function toggleAudioVocab() {
  document.getElementById('audio-vocab').classList.toggle('hidden');
}

function toggleAudioKeypoints() {
  document.getElementById('audio-keypoints').classList.toggle('hidden');
}

async function markLessonComplete() {
  await updateLessonProgress('completed');
  stopSpeech();
  closeAudioPlayer();

  // Refresh the path view
  if (currentAudioLesson && currentAudioLesson.path_id) {
    // Reload the current path
    const container = document.getElementById('parent-learning');
    const backBtn = container.querySelector('.btn-back');
    if (backBtn) {
      // Re-fetch the path
      try {
        const res = await fetch('/api/learning/paths');
        const paths = await res.json();
        const currentPath = paths.find(p => p.id === currentAudioLesson.path_id);
        if (currentPath) openLearningPath(currentPath.slug);
      } catch (e) {
        loadLearningPaths();
      }
    }
  }
}

async function updateLessonProgress(status) {
  if (!currentAudioLesson) return;
  try {
    await fetch(`/api/learning/lesson/${currentAudioLesson.id}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  } catch (e) {
    console.error('Erreur mise à jour progression:', e);
  }
}

function closeAudioPlayer() {
  stopSpeech();
  document.getElementById('audio-player-modal').classList.add('hidden');
  currentAudioLesson = null;
}

// ==================
// PROGRAMME DU JOUR (adaptatif)
// ==================
async function loadDailyProgram() {
  try {
    const res = await fetch('/api/program/today');
    const data = await res.json();
    if (!data.program) return;

    const card = document.getElementById('daily-program-card');
    const blocksDiv = document.getElementById('daily-program-blocks');
    if (!card || !blocksDiv) return;

    const blocks = data.program.blocks;
    const currentBlock = data.program.current_block;

    blocksDiv.innerHTML = blocks.map((b, i) => {
      const status = i < currentBlock ? 'done' : i === currentBlock ? 'current' : 'upcoming';
      const statusIcon = status === 'done' ? '✅' : status === 'current' ? '▶️' : '⬜';
      return `
        <div class="program-block program-block-${status}" onclick="${status === 'current' ? `startProgramBlock(${i}, '${b.type}', '${b.subject}')` : ''}">
          <span class="program-block-icon">${b.icon || '📚'}</span>
          <div class="program-block-info">
            <strong>${b.title}</strong>
            <span>${b.description}</span>
          </div>
          <div class="program-block-meta">
            <span>${b.duration} min</span>
            <span>${statusIcon}</span>
          </div>
        </div>
      `;
    }).join('');

    card.classList.remove('hidden');
  } catch (e) {
    console.error('Erreur chargement programme:', e);
  }
}

function startProgramBlock(index, type, subject) {
  if (type === 'lesson' || type === 'exercises') {
    selectSubject(subject);
  } else if (type === 'discovery') {
    openDecouverte();
  }
  // Marquer l'avancement
  fetch('/api/program/advance', { method: 'POST' }).catch(() => {});
}

// ==================
// TEXT-TO-SPEECH (TTS) - Moteur Google TTS côté serveur
// Voix anglaise NATIVE Google, lecteur HTML5 <audio>
// Seek, pause/resume, fonctionne écran verrouillé
// ==================
let ttsAudio = null;
let ttsSegments = [];
let ttsCurrentSegment = 0;
let ttsPlaying = false;
let ttsRate = 1;
let ttsCurrentLang = 'fr';

function initTTS() {
  // Créer l'élément audio global (invisible)
  ttsAudio = new Audio();
  ttsAudio.preload = 'auto';

  ttsAudio.addEventListener('ended', () => {
    // Passer au segment suivant
    ttsCurrentSegment++;
    if (ttsCurrentSegment < ttsSegments.length) {
      playCurrentSegment();
    } else {
      ttsPlaying = false;
      updateTTSButton('done');
    }
  });

  ttsAudio.addEventListener('error', (e) => {
    console.error('TTS audio error:', e);
    // Essayer le segment suivant
    ttsCurrentSegment++;
    if (ttsCurrentSegment < ttsSegments.length) {
      playCurrentSegment();
    } else {
      ttsPlaying = false;
    }
  });

  // Media Session API : permet de contrôler depuis l'écran de verrouillage
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () => resumeTTS());
    navigator.mediaSession.setActionHandler('pause', () => pauseTTS());
    navigator.mediaSession.setActionHandler('previoustrack', () => ttsRewind());
    navigator.mediaSession.setActionHandler('nexttrack', () => ttsForward());
  }
}

async function speakText(text, lang) {
  stopTTS();

  ttsCurrentLang = lang || 'fr';
  ttsCurrentSegment = 0;

  try {
    const res = await fetch('/api/tts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang: ttsCurrentLang })
    });

    if (!res.ok) throw new Error('TTS API error');

    const data = await res.json();
    ttsSegments = data.segments || [];

    if (ttsSegments.length === 0) {
      console.warn('TTS: aucun segment audio généré');
      return;
    }

    ttsPlaying = true;
    updateTTSButton('playing');

    // Configurer Media Session pour l'écran de verrouillage
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: lang === 'en' ? 'English Lesson' : 'Cours',
        artist: 'Homework Buddy',
        album: lang === 'en' ? 'English' : 'Français'
      });
    }

    playCurrentSegment();
  } catch (err) {
    console.error('TTS error:', err);
    ttsPlaying = false;
  }
}

function playCurrentSegment() {
  if (ttsCurrentSegment >= ttsSegments.length) {
    ttsPlaying = false;
    updateTTSButton('done');
    return;
  }

  const segment = ttsSegments[ttsCurrentSegment];
  ttsAudio.src = segment.url;
  ttsAudio.playbackRate = ttsRate;
  ttsAudio.play().catch(e => {
    console.error('Audio play error:', e);
  });
}

function stopTTS() {
  if (ttsAudio) {
    ttsAudio.pause();
    ttsAudio.src = '';
  }
  ttsPlaying = false;
  ttsSegments = [];
  ttsCurrentSegment = 0;
}

function pauseTTS() {
  if (ttsAudio && !ttsAudio.paused) {
    ttsAudio.pause();
    ttsPlaying = false;
    updateTTSButton('paused');
  }
}

function resumeTTS() {
  if (ttsAudio && ttsAudio.src && ttsAudio.paused) {
    ttsAudio.play().catch(() => {});
    ttsPlaying = true;
    updateTTSButton('playing');
  } else if (ttsSegments.length > 0 && ttsCurrentSegment < ttsSegments.length) {
    ttsPlaying = true;
    playCurrentSegment();
    updateTTSButton('playing');
  }
}

// Avancer : passer au segment suivant
function ttsForward() {
  if (ttsSegments.length === 0) return;
  ttsAudio.pause();
  ttsCurrentSegment = Math.min(ttsCurrentSegment + 1, ttsSegments.length - 1);
  ttsPlaying = true;
  playCurrentSegment();
  updateTTSButton('playing');
}

// Reculer : revenir au segment précédent
function ttsRewind() {
  if (ttsSegments.length === 0) return;
  // Si on est au début du segment, reculer d'un segment
  if (ttsAudio.currentTime < 2 && ttsCurrentSegment > 0) {
    ttsCurrentSegment--;
  }
  ttsAudio.pause();
  ttsPlaying = true;
  playCurrentSegment();
  updateTTSButton('playing');
}

function setTTSRate(rate) {
  ttsRate = rate;
  if (ttsAudio) {
    ttsAudio.playbackRate = rate;
  }
}

function updateTTSButton(state) {
  const btn = document.getElementById('tts-course-btn');
  if (!btn) return;
  if (state === 'playing') btn.innerHTML = '⏸️ Pause';
  else if (state === 'paused') btn.innerHTML = '▶️ Reprendre';
  else if (state === 'done') btn.innerHTML = '🔊 Réécouter';
  else btn.innerHTML = '🔊 Écouter';
}

function speakCourseContent(subject) {
  const content = document.getElementById('learn-course-content');
  if (!content) return;

  const text = content.innerText || content.textContent;
  const lang = subject === 'anglais' ? 'en' : 'fr';
  speakText(text, lang);
}

function speakExerciseQuestion() {
  if (!currentExercises || currentExerciseIndex >= currentExercises.length) return;
  const exercise = currentExercises[currentExerciseIndex];
  const lang = exercise.subject === 'anglais' ? 'en' : 'fr';
  speakText(exercise.question, lang);
}

// Initialiser TTS au chargement
document.addEventListener('DOMContentLoaded', initTTS);

// ==================
// ASTUCES ADULTES (mot du jour, actu du jour)
// ==================
async function loadAdultTips() {
  if (!currentUser || currentUser.role !== 'parent') return;

  try {
    const [wordRes, newsRes] = await Promise.all([
      fetch('/api/daily-tips/word'),
      fetch('/api/daily-tips/news')
    ]);

    const word = await wordRes.json();
    const news = await newsRes.json();

    // Créer ou mettre à jour le conteneur de tips
    let tipsContainer = document.getElementById('adult-daily-tips');
    if (!tipsContainer) {
      tipsContainer = document.createElement('div');
      tipsContainer.id = 'adult-daily-tips';
      tipsContainer.className = 'adult-daily-tips';

      // Insérer après le header dans la section appropriée
      const contentArea = document.getElementById('julien-learning-content')
        || document.getElementById('chat-messages');
      if (contentArea && contentArea.parentNode) {
        contentArea.parentNode.insertBefore(tipsContainer, contentArea);
      }
    }

    let wordHtml = '';
    if (word.word) {
      const hasEnDef = word.definition_en;
      wordHtml = `
        <div class="tip-card tip-word">
          <div class="tip-header">
            <span class="tip-icon">📖</span>
            <strong>Mot du jour</strong>
            <button class="btn-speak" onclick="speakText('${word.word}. ${(word.example_en || '').replace(/'/g, "\\'")}', 'en')" title="Écouter">🔊</button>
          </div>
          <h4 class="tip-word-text">${word.word}</h4>
          ${word.pronunciation ? `<span class="tip-pronunciation">${word.pronunciation}</span>` : ''}
          <p>${hasEnDef ? word.definition_fr : word.definition || ''}</p>
          ${word.example_en ? `<p class="tip-example"><em>"${word.example_en}"</em></p>` : ''}
          ${word.example_fr ? `<p class="tip-example-fr">${word.example_fr}</p>` : ''}
          ${word.tip ? `<p class="tip-advice">💡 ${word.tip}</p>` : ''}
        </div>
      `;
    }

    let newsHtml = '';
    if (news.title) {
      const catColors = { 'réglementation': '#3498DB', 'innovation': '#2ECC71', 'marché': '#E67E22', 'RSE': '#9B59B6', 'subvention': '#E74C3C' };
      newsHtml = `
        <div class="tip-card tip-news">
          <div class="tip-header">
            <span class="tip-icon">📰</span>
            <strong>Actu du jour</strong>
            ${news.category ? `<span class="tip-category" style="background:${catColors[news.category] || '#95a5a6'}">${news.category}</span>` : ''}
          </div>
          <h4>${news.title}</h4>
          <p>${news.summary}</p>
          ${news.relevance ? `<p class="tip-relevance"><strong>Pour nous :</strong> ${news.relevance}</p>` : ''}
          ${news.action ? `<p class="tip-action">➡️ <strong>Action :</strong> ${news.action}</p>` : ''}
        </div>
      `;
    }

    tipsContainer.innerHTML = wordHtml + newsHtml;
  } catch (e) {
    console.error('Erreur chargement tips adultes:', e);
  }
}

// Ajouter un panneau de contrôle audio dans les cours
function addTTSButton(subject) {
  const header = document.querySelector('#learn-course-detail .course-body');
  if (!header) return;

  // Ne pas ajouter si déjà présent
  if (document.getElementById('tts-course-controls')) return;

  const controls = document.createElement('div');
  controls.id = 'tts-course-controls';
  controls.className = 'tts-controls';
  controls.innerHTML = `
    <div class="tts-controls-row">
      <button class="tts-btn tts-btn-seek" onclick="ttsRewind()" title="Reculer">⏪</button>
      <button class="tts-btn tts-btn-main" id="tts-course-btn" title="Lecture">🔊 Écouter</button>
      <button class="tts-btn tts-btn-seek" onclick="ttsForward()" title="Avancer">⏩</button>
      <button class="tts-btn tts-btn-stop" onclick="stopTTS(); document.getElementById('tts-course-btn').innerHTML='🔊 Écouter'" title="Stop">⏹️</button>
    </div>
    <div class="tts-speed-row">
      <span style="font-size: 0.75rem; color: var(--text-muted);">Vitesse :</span>
      <button class="tts-speed-btn" onclick="setTTSRate(0.75)">0.75x</button>
      <button class="tts-speed-btn active" onclick="setTTSRate(1)">1x</button>
      <button class="tts-speed-btn" onclick="setTTSRate(1.25)">1.25x</button>
    </div>
  `;

  // Bouton play/pause principal
  const playBtn = controls.querySelector('#tts-course-btn');
  playBtn.onclick = () => {
    if (ttsPlaying) {
      pauseTTS();
      playBtn.innerHTML = '▶️ Reprendre';
    } else if (ttsChunks.length > 0 && ttsCurrentChunk < ttsChunks.length) {
      resumeTTS();
      playBtn.innerHTML = '⏸️ Pause';
    } else {
      speakCourseContent(subject);
      playBtn.innerHTML = '⏸️ Pause';
    }
  };

  // Speed buttons
  controls.querySelectorAll('.tts-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      controls.querySelectorAll('.tts-speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  header.parentNode.insertBefore(controls, header);
}
