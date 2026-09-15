let express = require( 'express' ),
    cookieSession = require( 'cookie-session' ),
    passport = require( 'passport' ),
    GitHubStrategy = require( 'passport-github2' ).Strategy,
    helmet = require( 'helmet' ),
    compression = require( 'compression' ),
    morgan = require( 'morgan' ),
    { MongoClient, ObjectId } = require( 'mongodb' ),
    port = 3000

require( 'dotenv' ).config()

let app = express()

app.use( helmet() )
app.use( compression() )
app.use( morgan( 'tiny' ) )

app.use( cookieSession({
  name: 'session',
  keys: [ process.env.SESSION_SECRET ]
}))

app.use( express.json() )
app.use( passport.initialize() )

passport.use( new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/auth/github/callback',
    proxy: true
  },
  function( accessToken, refreshToken, profile, done ) {
    done( null, { username: profile.username } )
  }
))

let startingPoems = [
  { author: 'Al-Busiri', title: 'The Mantle Ode', form: 'Qasida', maqams: [ 'Bayati', 'Hijaz', 'Nahawand' ], notes: '', birthYear: 1212 },
  { author: 'Nizar Qabbani', title: 'Bread, Hashish and Moon', form: 'Free verse', maqams: [ 'Rast' ], notes: '', birthYear: 1923 },
  { author: 'Mahmoud Darwish', title: 'Identity Card', form: 'Free verse', maqams: [ 'Saba' ], notes: '', birthYear: 1941 }
]

let moodByMaqam = {
  rast: 'Proud and powerful',
  bayati: 'Powerful and serious',
  hijaz: 'Mysterious and yearning',
  saba: 'Sad and aching',
  kurd: 'Romantic and gentle',
  nahawand: 'Dramatic and romantic',
  ajam: 'Happy and majestic',
  sikah: 'Solemn',
  jiharkah: 'Happy and upbeat'
}

function getMood(maqam) {
  let m = maqam.toLowerCase()
  let mood = moodByMaqam[ m ]

  if (mood) {
    return mood
  }

  else {
    return 'Unclassified'
  }
}

function addDerivedFields( poem ) {
  poem.era = poem.birthYear >= 1800 ? 'Modern' : 'Classical'
  poem.mood = poem.maqams.map(function (maqam) {
    return getMood(maqam)}).join('/');
  poem.multiMaqam = poem.maqams.length > 1

  return poem
}

let client = new MongoClient( process.env.MONGODB_URI )
let poems
let users

app.use( express.static( 'public' ) )

app.get( '/auth/github', passport.authenticate( 'github', { session: false } ) )

app.get( '/auth/github/callback', passport.authenticate( 'github', { session: false, failureRedirect: '/' } ), async function( request, response ) {
  let username = request.user.username
  request.session.username = username

  let user = await users.findOne( { username: username } )

  if( user === null ) {
    await users.insertOne( { username: username } )

    for( let i = 0; i < startingPoems.length; i++ ) {
      let newPoem = {
        username: username,
        author: startingPoems[ i ].author,
        title: startingPoems[ i ].title,
        form: startingPoems[ i ].form,
        maqams: startingPoems[ i ].maqams,
        notes: startingPoems[ i ].notes,
        birthYear: startingPoems[ i ].birthYear
      }

      newPoem = addDerivedFields( newPoem )
      await poems.insertOne( newPoem )
    }

    response.redirect( '/?new' )
  }else{
    response.redirect( '/' )
  }
})

let checkLogin = function( request, response, next ) {
  if( request.session.username ) {
    next()
  }else{
    response.status( 401 ).json( { error: 'Not logged in' } )
  }
}

// send back the list of poems as json
let sendPoems = async function( request, response ) {
  let data = await poems.find( { username: request.session.username } ).toArray()
  response.json( data )
}

app.get( '/data', async function( request, response ) {
  if( request.session.username ) {
    await sendPoems( request, response )
  }else{
    response.json( null )
  }
})

app.post( '/submit', checkLogin, async function( request, response ) {
  let body = request.body

  let newPoem = {
    username: request.session.username,
    author: body.author,
    title: body.title,
    form: body.form,
    maqams: body.maqams,
    notes: body.notes,
    birthYear: Number( body.birthYear )
  }

  newPoem = addDerivedFields( newPoem )
  await poems.insertOne( newPoem )

  await sendPoems( request, response )
})

app.post( '/delete', checkLogin, async function( request, response ) {
  let body = request.body

  await poems.deleteOne( { _id: new ObjectId( body.id ), username: request.session.username } )

  await sendPoems( request, response )
})

app.post( '/edit', checkLogin, async function( request, response ) {
  let body = request.body

  let updatedPoem = {
    username: request.session.username,
    author: body.author,
    title: body.title,
    form: body.form,
    maqams: body.maqams,
    notes: body.notes,
    birthYear: Number( body.birthYear )
  }

  updatedPoem = addDerivedFields( updatedPoem )

  await poems.updateOne(
    { _id: new ObjectId( body.id ), username: request.session.username },
    { $set: updatedPoem }
  )

  await sendPoems( request, response )
})

async function start() {
  await client.connect()

  let db = client.db( 'poetryApp' )
  poems = db.collection( 'poems' )
  users = db.collection( 'users' )

  app.listen( process.env.PORT || port )
}

start()
