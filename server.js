require('dotenv').config()

const { default: mongoose } = require('mongoose')

const http = require( 'http' ),
      fs   = require( 'fs' ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you're testing this on your local machine.
      // On Render, make sure `npm install` is your build command.
      path = require( 'path' ),
      express = require( 'express' ),
      app = express(),
      connectDB = require('./database.js'),
      session = require( 'express-session' ),
      passport = require( 'passport' ),
      GitHubStrategy = require( 'passport-github2' ).Strategy,
      User = require( './user.js' ),
      Review = require( './review.js' ),
      dir  = 'public',
      port = 3000

connectDB()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')))
app.use(express.static(dir))

app.use(session({
  secret: process.env.SESSION_SECRET || 'super-duper-secret-key-123',
  resave: false,
  saveUninitialized: false,
}))

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => {
  done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
  try {
      const user = await User.findById(id);
      done(null, user);
  } catch (error) {
      done(error);
  }
})

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
  },

  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({
        $or: [
          { githubId: profile.id }
        ]
      })
      if (!user) {
        user = await User.create({
          username: profile.displayName,
          displayName: profile.displayName,
          githubId: profile.id
        })
      }
      else { await user.save() }
      return done(null, user)
    }
    catch (err) {
      console.log("Authentication error: ", err)
      return done(err)
    }
  }
))

app.get('/auth/github',
  passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 })
    res.json(reviews)
  }
  catch (err) {
    res.status(404).json({error: ("Could not fetch reviews: ${err.message}")})
  }
})

app.post('/api/reviews', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({error:('Unauthorized: Log in with GitHub to post.')})
  }

  try {
    const newReview = new Review({
      username: req.user.username,
      displayName: req.user.username,
      comment: req.body.comment
    })
    await newReview.save()
    res.json(newReview)
  }
  catch (err) {
    res.status(500).json({error:('Could not add review')})
  }
})

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true })
  }
  else {
    res.json({ authenticated: false })
  }
})

app.listen( process.env.PORT || port )
