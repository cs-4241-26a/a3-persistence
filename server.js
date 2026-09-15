require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const GitHubStrategy = require('passport-github2').Strategy;
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

const client = new MongoClient(process.env.MONGODB_URI)

let peopleCollection;

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

app.use(helmet())
app.use(compression())
app.use(morgan('dev'))

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
},
function(accessToken, refreshToken, profile, done) {
  return done(null, {id: profile.id, username: profile.username, displayName: profile.displayName});
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

app.get('/auth/github', passport.authenticate('github'));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), function(req, res) { res.redirect('/'); });

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

app.get('/user', function(req, res) {
  if (req.isAuthenticated()) {
    res.json({ loggedIn: true, user: req.user });
  } else {
    res.json({ loggedIn: false });
  }
});

function requireLogin(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ error: 'You must be logged in to access this resource.' });
}

app.get('/data', requireLogin, async function(req, res) {
  try {
    const data = await peopleCollection.find({userId: req.user.id}).toArray();

    res.json(data);

  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).send('Error fetching data from MongoDB');
  }
})

app.post('/submit', requireLogin, async function(req, res)  {
  try{
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const age = parseInt(req.body.age);

    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;

    const newPerson = { userId: req.user.id, firstName: firstName, lastName: lastName, age: age, birthYear: birthYear };

    await peopleCollection.insertOne(newPerson);
    const data = await peopleCollection.find({userId: req.user.id}).toArray();

    res.json(data);
  } catch (error) {
    console.error('Error inserting data into MongoDB:', error);
    res.status(500).send('Error inserting data into MongoDB');
  }
});

app.delete('/delete/:id', requireLogin, async function(req, res) {
  try {
    const id = req.params.id;

    await peopleCollection.deleteOne({ _id: new ObjectId(id), userId: req.user.id });

    const data = await peopleCollection.find({userId: req.user.id}).toArray();

    res.json(data);
  } catch (error) {
    console.error('Error deleting data from MongoDB:', error);
    res.status(500).send('Error deleting data from MongoDB');
  }
});

app.put('/update/:id', requireLogin, async function(req, res) {
  try {
    const id = req.params.id;
    
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const age = parseInt(req.body.age);

    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;

    await peopleCollection.updateOne(
      { _id: new ObjectId(id), userId: req.user.id },
      { $set: { firstName: firstName, lastName: lastName, age: age, birthYear: birthYear } }
    );

    const data = await peopleCollection.find({userId: req.user.id}).toArray();

    res.json(data);
  } catch (error) {
    console.error('Error updating data in MongoDB:', error);
    res.status(500).send('Error updating data in MongoDB');
  }
});

async function startServer() {
  try {
    await client.connect();
    const database = client.db('peopleDatabase');
    peopleCollection = database.collection('people');

    console.log('Connected to MongoDB');

    app.listen(port, function() {
      console.log(`Server is running on http://localhost:${port}`);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

startServer();