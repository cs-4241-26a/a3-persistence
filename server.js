require( 'dotenv' ).config()

const express       = require( 'express' ),
      mongoose      = require( 'mongoose' ),
      session       = require( 'express-session' ),
      MongoStore    = require( 'connect-mongo' ),
      bcrypt        = require( 'bcryptjs' ),
      morgan        = require( 'morgan' ),
      helmet        = require( 'helmet' ),
      compression   = require( 'compression' ),
      rateLimit     = require( 'express-rate-limit' ),
      path          = require( 'path' )

const User = require( './models/User' )
const Task = require( './models/Task' )
const { requireLoginPage, requireLoginApi } = require( './middleware/requireLogin' )

const app  = express()
const port = process.env.PORT || 3000
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task-tracker'

mongoose.connect( mongoUri )
  .then( function() { console.log( 'Connected to MongoDB' ) } )
  .catch( function( err ) { console.error( 'MongoDB connection error:', err ) } )

// security and performance middleware
app.use( helmet( {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [ "'self'" ],
      styleSrc: [ "'self'", 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com', "'unsafe-inline'" ],
      fontSrc: [ "'self'", 'https://fonts.gstatic.com' ],
      scriptSrc: [ "'self'", 'https://cdn.jsdelivr.net' ],
      imgSrc: [ "'self'", 'data:' ]
    }
  }
} ) )
app.use( morgan( 'dev' ) )
app.use( compression() )
app.use( express.json() )
app.use( express.static( path.join( __dirname, 'public' ) ) )

// Limit login attempts to slow down brute forcing
const loginLimiter = rateLimit( {
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20,
  message: { error: 'Too many login attempts. Please try again later' }
} )

// sessions 
app.use( session( {
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create( { mongoUrl: mongoUri } ),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week before session expires
  }
} ) )

// field logic for calculating the deadline based on priority and created date
const calculateDeadline = function( priority, createdDateString ) {
  let daysToAdd

  if( priority === 'high' ) {
    daysToAdd = 1
  }else if( priority === 'medium' ) {
    daysToAdd = 3
  }else{
    daysToAdd = 7
  }

  const created = new Date( createdDateString )
  created.setDate( created.getDate() + daysToAdd )
  return created.toISOString().split( 'T' )[ 0 ]
}

// page routes
app.get( '/', function( request, response ) {
  if( request.session && request.session.userId ) {
    response.redirect( '/app.html' )
  }else{
    response.sendFile( path.join( __dirname, 'views', 'index.html' ) )
  }
} )

app.get( '/app.html', requireLoginPage, function( request, response ) {
  response.sendFile( path.join( __dirname, 'views', 'app.html' ) )
} )

// authentication routes
app.post( '/api/login', loginLimiter, async function( request, response ) {
  try {
    const username = ( request.body.username || '' ).trim().toLowerCase()
    const password = request.body.password || ''

    if( !username || !password ) {
      return response.status( 400 ).json( { error: 'Username and password are required' } )
    }
    if( password.length < 4 ) {
      return response.status( 400 ).json( { error: 'Password must at least be 4 characters' } )
    }

    let user = await User.findOne( { username: username } )
    let isNewUser = false

    if( !user ) {
      // no account yet, create one
      const passwordHash = await bcrypt.hash( password, 10 )
      user = await User.create( { username: username, passwordHash: passwordHash } )
      isNewUser = true
    }else{
      const passwordMatches = await bcrypt.compare( password, user.passwordHash )
      if( !passwordMatches ) {
        return response.status( 401 ).json( { error: 'Incorrect password.' } )
      }
    }

    request.session.userId = user._id.toString()
    request.session.username = user.username

    response.json( { success: true, username: user.username, isNewUser: isNewUser } )
  }catch( err ) {
    console.error( err )
    response.status( 500 ).json( { error: 'Server error while logging in.' } )
  }
} )

app.post( '/api/logout', function( request, response ) {
  request.session.destroy( function() {
    response.json( { success: true } )
  } )
} )

app.get( '/api/session', function( request, response ) {
  if( request.session && request.session.userId ) {
    response.json( { loggedIn: true, username: request.session.username } )
  }else{
    response.json( { loggedIn: false } )
  }
} )

// task routes
app.get( '/api/tasks', requireLoginApi, async function( request, response ) {
  const tasks = await Task.find( { owner: request.session.userId } ).sort( { _id: 1 } )
  response.json( tasks )
} )

app.post( '/api/tasks', requireLoginApi, async function( request, response ) {
  try {
    const { task, priority, created } = request.body

    if( !task || !created ) {
      return response.status( 400 ).json( { error: 'Task name and created date are required' } )
    }

    const newTask = await Task.create( {
      owner: request.session.userId,
      task: task,
      priority: priority,
      created: created,
      deadline: calculateDeadline( priority, created )
    } )

    const tasks = await Task.find( { owner: request.session.userId } ).sort( { _id: 1 } )
    response.json( tasks )
  }catch( err ) {
    console.error( err )
    response.status( 500 ).json( { error: 'Server error while adding task' } )
  }
} )

app.put( '/api/tasks/:id', requireLoginApi, async function( request, response ) {
  try {
    const { task, priority, created } = request.body

    const existing = await Task.findOne( { _id: request.params.id, owner: request.session.userId } )
    if( !existing ) {
      return response.status( 404 ).json( { error: 'Task not found' } )
    }

    existing.task = task
    existing.priority = priority
    existing.created = created
    existing.deadline = calculateDeadline( priority, created )
    await existing.save()

    const tasks = await Task.find( { owner: request.session.userId } ).sort( { _id: 1 } )
    response.json( tasks )
  }catch( err ) {
    console.error( err )
    response.status( 500 ).json( { error: 'Server error while updating task' } )
  }
} )

app.delete( '/api/tasks/:id', requireLoginApi, async function( request, response ) {
  await Task.deleteOne( { _id: request.params.id, owner: request.session.userId } )
  const tasks = await Task.find( { owner: request.session.userId } ).sort( { _id: 1 } )
  response.json( tasks )
} )

app.listen( port, function() {
  console.log( 'Server listening on port ' + port )
} )
