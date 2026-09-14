require( 'dotenv' ).config()

const express = require( 'express' ),
      session = require( 'express-session' ),
      passport = require( 'passport' ),
      GitHubStrategy = require( 'passport-github2' ).Strategy,
      compression = require( 'compression' ),
      morgan = require( 'morgan' ),
      helmet = require( 'helmet' ),
      { MongoClient, ObjectId } = require( 'mongodb' ),
      app  = express(),
      port = 3000

const client = new MongoClient( process.env.MONGODB_URI ),
      todos = client.db( 'a3' ).collection( 'todos' ),
      users = client.db( 'a3' ).collection( 'users' )

// helper to add number of days to date string
const addDays = function( dateString, days ) {
  const date = new Date( dateString )
  date.setDate( date.getDate() + days )
  return date.toISOString().slice( 0, 10 )
}

// Dervied to set deadline based on priority
const makeDeadline = function( created, priority ) {
  let days = 7
  if( priority === 'high' ) {
    days = 1
  }

  else if( priority === 'medium' ) {
    days = 3
  }
  return addDays( created, days )
}

const getTodos = function( username ) {
  return todos.find({ username: username }).toArray()
}

app.use( helmet() )
app.use( compression() )
app.use( morgan( 'dev' ) )
app.use( express.json() )
app.use( session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use( passport.initialize() )
app.use( passport.session() )

passport.use( new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  async function( accessToken, refreshToken, profile, done ) {
    try {
      const existing = await users.findOne({ username: profile.username })
      let newUser = false

      if( existing === null ) {
        await users.insertOne({ username: profile.username })
        newUser = true
      }

      done( null, { username: profile.username, newUser: newUser } )
    }

    catch( err ) {
      done( err )
    }
  }
))

passport.serializeUser( function( user, done ) {
  done( null, user )
})

passport.deserializeUser( function( user, done ) {
  done( null, user )
})

const checkLogin = function( req, res, next ) {
  if( req.isAuthenticated() ) {
    next()
  }

  else {
    res.status( 401 ).json({ error: 'You need to log in first.' })
  }
}

const checkTodo = function( req, res, next ) {
  if( typeof req.body.task === 'string' && req.body.task.trim() !== '' && [ 'high', 'medium', 'low' ].includes( req.body.priority ) ) {
    next()
  }

  else {
    res.status( 400 ).json({ error: 'Please enter a task and pick a priority.' })
  }
}

app.get( [ '/', '/index.html' ], function( req, res ) {
  if( req.isAuthenticated() ) {
    res.sendFile( __dirname + '/public/index.html' )
  }

  else {
    res.redirect( '/login.html' )
  }
})

app.get( '/auth/github', passport.authenticate( 'github' ) )

app.get( '/auth/github/callback', passport.authenticate( 'github', { failureRedirect: '/login.html' } ), function( req, res ) {
  req.session.newUser = req.user.newUser
  res.redirect( '/' )
})

app.get( '/logout', function( req, res ) {
  req.logout( function() {
    res.redirect( '/login.html' )
  })
})

app.use( express.static( 'public' ) )

app.get( '/user', checkLogin, function( req, res ) {
  const newUser = req.session.newUser
  req.session.newUser = false
  res.json({ username: req.user.username, newUser: newUser })
})

app.get( '/data', checkLogin, async function( req, res ) {
  res.json( await getTodos( req.user.username ) )
})

app.post( '/add', checkLogin, checkTodo, async function( req, res ) {
  // build new todo
  const created = new Date().toISOString().slice( 0, 10 )
  await todos.insertOne({
    username: req.user.username,
    task: req.body.task,
    notes: req.body.notes,
    priority: req.body.priority,
    important: req.body.important,
    list: 'open',
    created: created,
    deadline: makeDeadline( created, req.body.priority )
  })

  res.json({ todos: await getTodos( req.user.username ), error: null })
})

app.post( '/edit', checkLogin, checkTodo, async function( req, res ) {
  const filter = { _id: new ObjectId( req.body.id ), username: req.user.username }
  const todo = await todos.findOne( filter )
  let error = null

  if( todo === null ) {
    error = 'That task could not be found.'
  }

  else {
    await todos.updateOne( filter, { $set: {
      task: req.body.task,
      notes: req.body.notes,
      priority: req.body.priority,
      important: req.body.important,
      deadline: makeDeadline( todo.created, req.body.priority )
    }})
  }

  res.json({ todos: await getTodos( req.user.username ), error: error })
})

app.post( '/delete', checkLogin, async function( req, res ) {
  // find item with same id and remove it
  await todos.deleteOne({ _id: new ObjectId( req.body.id ), username: req.user.username })
  res.json({ todos: await getTodos( req.user.username ), error: null })
})

app.post( '/move', checkLogin, async function( req, res ) {
  let error = null

  if( ![ 'open', 'closed', 'done' ].includes( req.body.list ) ) {
    error = 'That list does not exist.'
  }

  // only allowing 3 items in the closed list
  else if( req.body.list === 'closed' ) {
    const count = await todos.countDocuments({ username: req.user.username, list: 'closed' })
    if( count >= 3 ) {
      error = 'The In Progress list can only hold 3 items.'
    }
  }

  if( error === null ) {
    await todos.updateOne( { _id: new ObjectId( req.body.id ), username: req.user.username }, { $set: { list: req.body.list } } )
  }

  // send updated dataset and error message back to client
  res.json({ todos: await getTodos( req.user.username ), error: error })
})

app.use( function( err, req, res, next ) {
  res.status( 500 ).json({ error: 'Something went wrong with that request.' })
})

app.listen( process.env.PORT || port )
