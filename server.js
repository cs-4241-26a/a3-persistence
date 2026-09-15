require('dotenv').config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const morgan = require('morgan');

const User = require('./models/User');
const Item = require('./models/Item');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI in environment. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:'],
      },
    },
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

async function start() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ client: mongoose.connection.getClient() }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
      },
    })
  );

  registerRoutes();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

function registerRoutes() {

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }
    const cleanUsername = username.trim().toLowerCase();

    let user = await User.findOne({ username: cleanUsername });
    let created = false;

    if (!user) {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({ username: cleanUsername, passwordHash });
      created = true;
    } else {
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Incorrect password.' });
      }
    }

    req.session.userId = user._id.toString();
    req.session.username = user.username;

    res.json({ username: user.username, created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

app.get('/api/me', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ username: req.session.username });
  }
  res.status(401).json({ error: 'Not logged in.' });
});


app.get('/api/items', requireAuth, async (req, res) => {
  const items = await Item.find({ userId: req.session.userId }).sort({ createdAt: -1 });
  res.json(items);
});

app.post('/api/items', requireAuth, async (req, res) => {
  try {
    const { title, url, category, notes, favorite } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: 'Title and URL are required.' });
    }
    const item = await Item.create({
      userId: req.session.userId,
      title,
      url,
      category,
      notes,
      favorite: !!favorite,
    });
    res.status(201).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error creating item.' });
  }
});

app.put('/api/items/:id', requireAuth, async (req, res) => {
  try {
    const { title, url, category, notes, favorite } = req.body;
    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      { title, url, category, notes, favorite: !!favorite },
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error updating item.' });
  }
});

app.delete('/api/items/:id', requireAuth, async (req, res) => {
  const result = await Item.findOneAndDelete({
    _id: req.params.id,
    userId: req.session.userId,
  });
  if (!result) {
    return res.status(404).json({ error: 'Item not found.' });
  }
  res.json({ ok: true });
});

app.get('/', (req, res) => {
  if (req.session && req.session.userId) {
    return res.redirect('/app');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/app', (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
} 

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
