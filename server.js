require('dotenv').config()

const express  = require( 'express' ),
      mongoose = require( 'mongoose' ),
      session  = require( 'express-session' )

const app = express()

// --- middleware ---
app.use( express.json() )              // parses JSON request bodies 
app.use( express.static( 'public' ) )  // serves html/css/js 
app.use( session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.get( '/', function( request, response ) { //redirect
  if( request.session.username ) {
    response.redirect( '/app.html' )
  }else{
    response.redirect( '/login.html' )
  }
})

const authRoutes = require( './routes/auth' )
app.use( '/', authRoutes )

const todoRoutes = require( './routes/todos' )
app.use( '/', todoRoutes )

// --- database ---
mongoose.connect( process.env.MONGODB_URI )
  .then( () => console.log( 'Connected to MongoDB!' ) )
  .catch( err => console.error( 'MongoDB connection error:', err ) )

// --- temporary test route ---
app.get( '/api/ping', function( request, response ) {
  response.json({ message: 'server is alive' })
})

const port = process.env.PORT || 3000
app.listen( port, () => console.log( `listening on port ${ port }` ) )