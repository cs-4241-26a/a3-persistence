const express = require( 'express' ),
      app = express(),
      port = 3000,

      { MongoClient, ObjectId } = require('mongodb'),

      session = require('express-session'),
      passport = require('passport'),
      GitHubStrategy = require('passport-github2').Strategy,

      helmet = require('helmet'),
      morgan = require('morgan'),
      compression = require('compression'),
      cookieParser = require('cookie-parser'),
      rateLimit = require('express-rate-limit');

require('dotenv').config({path:'.env/credentials.env'});
console.log('URI: ' + process.env.MONGODB_URI);

// MIDDLEWARE
// serve static files
app.use(express.static('public'));
// parse JSON files from incoming requests
app.use(express.json());

//middleware achievements
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 600, // 100 requests max per 10 minutes
  max: 100
});
app.use(limiter);

//OAuth
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      // Uses a live URL in production, or localhost when testing on your computer
      callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/auth/github/callback"
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// auth routes
app.get('/auth/github', passport.authenticate('github', { scope: [ 'user:email' ] }));
app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => res.redirect('/app.html'));

const checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "Not logged in" });
};

// Mongo
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let collection = null;

// connect to database
async function connectDB(){
  await client.connect();
  // create database + collection for notes
  collection = client.db('sticky_notes_db').collection('notes');
  console.log('MongoDB Connection Successful');
}

connectDB();


// ROUTES

// logout
app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/'); // Sends them back to the main page (which will force a new login)
  });
});

// GET: send notes
app.get('/notes', checkAuth, async (req, res) => {
  const notesData = await collection.find({user: req.user.id}).toArray();
  res.json(notesData);
});

// POST: add new note
app.post('/submit', checkAuth, async (req, res) => {
  const newNote = req.body;

  let days = 7; // default is low
  if(newNote.urgency === 'high'){
    days = 1;
  } else if (newNote.urgency === 'medium'){
    days = 3;
  }

  let date = new Date();
  date.setDate(date.getDate() + days);
  newNote.deadline = date.toLocaleDateString();

  newNote.user = req.user.id;

  // insert to mongodb
  await collection.insertOne(newNote);

  // fetch and send updated list
  const notesData = await collection.find({ user: req.user.id}).toArray();
  res.json(notesData)
})

// POST: update existing note
app.post('/update', checkAuth, async (req, res) => {
  const updatedNote = req.body;

  let days = 7;
  if(updatedNote.urgency === 'high'){
    days = 1;
  } else if (updatedNote.urgency === 'medium'){
    days = 3;
  }

  let date = new Date();
  date.setDate(date.getDate() + days);
  updatedNote.deadline = date.toLocaleDateString();

  await collection.updateOne(
      { _id: new ObjectId(updatedNote._id), user: req.user.id },
      {
        $set: {
          title: updatedNote.title,
          content: updatedNote.content,
          urgency: updatedNote.urgency,
          deadline: updatedNote.deadline
        }
      }
  );

  const notesData = await collection.find({user: req.user.id}).toArray();
  res.json(notesData);
})

// DELETE: remove a note

app.delete('/delete', checkAuth, async (req, res) => {
  await collection.deleteOne({ _id: new ObjectId(req.body._id), user: req.user.id },);

  const notesData = await collection.find({user: req.user.id}).toArray();
  res.json(notesData);
})

// start server
app.listen(process.env.PORT || port, () => {
  console.log(`Server running on port: http://localhost:${port}`);
});