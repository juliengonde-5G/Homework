require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const { initDatabase } = require('./database/init');
const { seedContent } = require('./database/seed-content');
const { seedLearningPaths } = require('./database/seed-learning');
const { seedRobotics } = require('./database/seed-robotics');
const { seedSciences } = require('./database/seed-sciences');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialiser la base de données et charger le contenu
const db = initDatabase();
seedContent(db);
seedLearningPaths(db);
seedRobotics(db);
seedSciences(db);
app.locals.db = db;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db', dir: path.join(__dirname) }),
  secret: process.env.SESSION_SECRET || 'homework-buddy-secret-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/exercises', require('./routes/exercises'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/parent', require('./routes/parent'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/daily-mood', require('./routes/daily-mood'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/program', require('./routes/program'));
app.use('/api/daily-tips', require('./routes/daily-tips'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎓 Homework Buddy démarre sur http://localhost:${PORT}`);
  console.log(`📚 Prêt à aider toute la famille !`);
});
