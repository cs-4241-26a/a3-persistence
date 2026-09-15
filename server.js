require( 'dotenv' ).config()

const express         = require( 'express' ),
      path            = require( 'path' ),
      bcrypt          = require( 'bcryptjs' ),
      mongoose        = require( 'mongoose' ),
      { ServerApiVersion } = require( 'mongodb' ),
      session         = require( 'express-session' ),
      MongoStore      = require( 'connect-mongo' ),
      helmet          = require( 'helmet' ),
      morgan          = require( 'morgan' ),
      User            = require( './models/User' ),
      Car             = require( './models/Car' ),
      app             = express(),
      port            = process.env.PORT || 3000,
      mongoUri        = process.env.MONGODB_URI,
      sessionSecret   = process.env.SESSION_SECRET || 'dev-secret-change-me'

// family: 4 forces IPv4, which avoids a TLS handshake failure
// (SSL alert number 80) seen on some hosts' IPv6 network paths to Atlas.
// serverApi pins requests to MongoDB's Stable API v1, as recommended by Atlas.
mongoose.connect( mongoUri, {
  family: 4,
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
})
  .then( function() { console.log( 'Connected to MongoDB' ) })
  .catch( function( err ) { console.error( 'MongoDB connection error:', err ) })

// derives an efficiency rating and an age category from fields already
// present on the car (mpg and year) so they never have to be stored
const addDerivedFields = function( car ) {
  let efficiency
  if( car.mpg >= 30 ) efficiency = 'Excellent'
  else if( car.mpg >= 20 ) efficiency = 'Good'
  else efficiency = 'Poor'

  const ageCategory = car.year < 2000 ? 'Classic' : 'Modern'

  return {
    id: car._id,
    model: car.model,
    year: car.year,
    mpg: car.mpg,
    fuelType: car.fuelType,
    notes: car.notes,
    favorite: car.favorite,
    efficiency,
    ageCategory
  }
}

app.use( helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'script-src': [ "'self'" ],
      'style-src': [ "'self'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net' ],
      'font-src': [ "'self'", 'https://fonts.gstatic.com' ],
      'style-src-elem': [ "'self'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net' ]
    }
  }
}))
app.use( morgan( 'dev' ) )
app.use( express.json() )
app.use( session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: mongoUri }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}))

// ----- auth middleware -----

const requireAuthPage = function( request, response, next ) {
  if( !request.session.userId ) return response.redirect( '/' )
  next()
}

const requireAuthApi = function( request, response, next ) {
  if( !request.session.userId ) return response.status( 401 ).json({ error: 'Not authenticated' })
  next()
}

// ----- auth routes -----

app.post( '/login', async function( request, response ) {
  const { username, password } = request.body

  if( !username || !password ) {
    return response.status( 400 ).json({ error: 'Username and password are required' })
  }

  try {
    const existingUser = await User.findOne({ username: username.trim() })

    if( !existingUser ) {
      const passwordHash = await bcrypt.hash( password, 10 )
      const newUser = await User.create({ username: username.trim(), passwordHash })

      request.session.userId = newUser._id.toString()
      request.session.username = newUser.username

      return response.json({ success: true, newAccount: true, username: newUser.username })
    }

    const passwordMatches = await bcrypt.compare( password, existingUser.passwordHash )

    if( !passwordMatches ) {
      return response.status( 401 ).json({ error: 'Incorrect password' })
    }

    request.session.userId = existingUser._id.toString()
    request.session.username = existingUser.username

    response.json({ success: true, newAccount: false, username: existingUser.username })
  }catch( err ) {
    console.error( err )
    response.status( 500 ).json({ error: 'Server error during login' })
  }
})

app.post( '/logout', function( request, response ) {
  request.session.destroy( function() {
    response.json({ success: true })
  })
})

app.get( '/api/session', function( request, response ) {
  if( !request.session.userId ) return response.status( 401 ).json({ error: 'Not authenticated' })
  response.json({ username: request.session.username })
})

// ----- page routes -----

app.get( '/app', requireAuthPage, function( request, response ) {
  response.sendFile( path.join( __dirname, 'views', 'app.html' ) )
})

// ----- car API routes (scoped to logged-in user) -----

app.get( '/cars', requireAuthApi, async function( request, response ) {
  const cars = await Car.find({ userId: request.session.userId })
  response.json( cars.map( addDerivedFields ) )
})

app.post( '/cars', requireAuthApi, async function( request, response ) {
  const { model, year, mpg, fuelType, notes, favorite } = request.body

  await Car.create({
    userId: request.session.userId,
    model,
    year: Number( year ),
    mpg: Number( mpg ),
    fuelType,
    notes,
    favorite: Boolean( favorite )
  })

  const cars = await Car.find({ userId: request.session.userId })
  response.json( cars.map( addDerivedFields ) )
})

app.put( '/cars/:id', requireAuthApi, async function( request, response ) {
  const { model, year, mpg, fuelType, notes, favorite } = request.body

  const car = await Car.findOne({ _id: request.params.id, userId: request.session.userId })
  if( !car ) return response.status( 404 ).json({ error: 'Car not found' })

  car.model = model
  car.year = Number( year )
  car.mpg = Number( mpg )
  car.fuelType = fuelType
  car.notes = notes
  car.favorite = Boolean( favorite )
  await car.save()

  const cars = await Car.find({ userId: request.session.userId })
  response.json( cars.map( addDerivedFields ) )
})

app.delete( '/cars/:id', requireAuthApi, async function( request, response ) {
  await Car.deleteOne({ _id: request.params.id, userId: request.session.userId })

  const cars = await Car.find({ userId: request.session.userId })
  response.json( cars.map( addDerivedFields ) )
})

// ----- static assets (css/js/images + the login page at "/") -----

app.use( express.static( 'public' ) )

app.listen( port, function() {
  console.log( `Server listening on port ${ port }` )
})
