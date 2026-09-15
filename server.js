'use strict'

require( 'dotenv' ).config()

const express     = require( 'express' )
const mongodb     = require( 'mongodb' )
const session     = require( 'express-session' )
const MongoStore  = require( 'connect-mongo' )
const bcrypt      = require( 'bcryptjs' )
const helmet      = require( 'helmet' )
const morgan      = require( 'morgan' )
const compression = require( 'compression' )
const path        = require( 'path' )

const app  = express()
const port = process.env.PORT || 3000
const uri  = process.env.MONGODB_URI || 'mongodb://localhost:27017'

const client = new mongodb.MongoClient( uri )
let users, cars

const connectDB = async () => {
  await client.connect()
  const db = client.db( 'a3' )
  users = db.collection( 'users' )
  cars  = db.collection( 'cars' )
}

// ── Middleware ──────────────────────────────────────────────

app.use( compression() )
app.use( morgan( 'dev' ) )
app.use( helmet({ contentSecurityPolicy: false }) )
app.use( express.json() )
app.use( express.urlencoded({ extended: false }) )
app.use( session({
  secret: process.env.SESSION_SECRET || 'a3-dev-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: uri, dbName: 'a3' }),
  cookie: { maxAge: 86400000 }
}) )
app.use( express.static( 'public', { index: false }) )

// ── Auth guards ─────────────────────────────────────────────

const requireLoginPage = ( req, res, next ) => {
  if ( req.session.username ) return next()
  res.redirect( '/login.html' )
}

const requireLoginAPI = ( req, res, next ) => {
  if ( req.session.username ) return next()
  res.status( 401 ).json({ ok: false, message: 'Not authenticated' })
}

// ── Pages ───────────────────────────────────────────────────

app.get( '/', requireLoginPage, ( req, res ) => {
  res.sendFile( path.join( __dirname, 'public', 'index.html' ) )
})

app.get( '/login.html', ( req, res ) => {
  if ( req.session.username ) return res.redirect( '/' )
  res.sendFile( path.join( __dirname, 'public', 'login.html' ) )
})

// ── Auth endpoints ──────────────────────────────────────────

app.post( '/login', async ( req, res ) => {
  const { username, password } = req.body
  if ( !username || !password )
    return res.json({ ok: false, message: 'Username and password are required.' })

  const user    = await users.findOne({ username })
  const created = !user

  if ( user ) {
    const match = await bcrypt.compare( password, user.password )
    if ( !match ) return res.json({ ok: false, message: 'Incorrect password.' })
  } else {
    const hash = await bcrypt.hash( password, 10 )
    await users.insertOne({ username, password: hash })
  }

  req.session.username = username
  res.json({ ok: true, created })
})

app.post( '/logout', ( req, res ) => {
  req.session.destroy()
  res.json({ ok: true })
})

app.get( '/session', ( req, res ) => {
  if ( !req.session.username ) return res.status( 401 ).json({ ok: false })
  res.json({ ok: true, username: req.session.username })
})

// ── Data helpers ────────────────────────────────────────────

const getUserCars = ( username ) =>
  cars.find({ username }, { projection: { _id: 0, username: 0 } }).toArray()

const deriveValueRating = ( year, price ) => {
  if ( year >= 2015 && price < 15000 ) return 'Great Deal'
  if ( price < 25000 ) return 'Good Value'
  if ( price < 45000 ) return 'Fair Price'
  return 'Premium'
}

// ── Data endpoints ──────────────────────────────────────────

app.get( '/data', requireLoginAPI, async ( req, res ) => {
  res.json( await getUserCars( req.session.username ) )
})

app.post( '/submit', requireLoginAPI, async ( req, res ) => {
  const { make, model, year, price, mpg, transmission, certified, notes } = req.body
  const username = req.session.username
  await cars.insertOne({
    username,
    id:           Date.now(),
    make,
    model,
    year:         parseInt( year ),
    price:        parseFloat( price ),
    mpg:          parseFloat( mpg ),
    transmission: transmission || 'Automatic',
    certified:    certified === 'true',
    notes:        notes || '',
    valueRating:  deriveValueRating( parseInt( year ), parseFloat( price ) )
  })
  res.json( await getUserCars( username ) )
})

app.post( '/update', requireLoginAPI, async ( req, res ) => {
  const { id, make, model, year, price, mpg, transmission, certified, notes } = req.body
  const username = req.session.username
  await cars.updateOne(
    { id: parseInt( id ), username },
    { $set: {
        make, model,
        year:         parseInt( year ),
        price:        parseFloat( price ),
        mpg:          parseFloat( mpg ),
        transmission: transmission || 'Automatic',
        certified:    certified === 'true',
        notes:        notes || '',
        valueRating:  deriveValueRating( parseInt( year ), parseFloat( price ) )
    }}
  )
  res.json( await getUserCars( username ) )
})

app.post( '/delete', requireLoginAPI, async ( req, res ) => {
  const username = req.session.username
  await cars.deleteOne({ id: parseInt( req.body.id ), username })
  res.json( await getUserCars( username ) )
})

// ── Start ───────────────────────────────────────────────────

connectDB().then( () => {
  app.listen( port, () => console.log( `Server running on port ${port}` ) )
}).catch( err => {
  console.error( 'MongoDB connection failed:', err )
  process.exit( 1 )
})
