const express = require( 'express' ),
      app     = express(),
      port    = 3000,
      session = require( 'express-session' ),
      { MongoClient } = require( 'mongodb' )

require( 'dotenv' ).config()

app.use( express.json() )
app.use( session({
  secret: 'change-this-to-anything-random',
  resave: false,
  saveUninitialized: false
}))

let db, expensesCollection, usersCollection

const client = new MongoClient( process.env.MONGO_URI )

const connectToDatabase = async function() {
  await client.connect()
  db = client.db( 'expenseTracker' )
  expensesCollection = db.collection( 'expenses' )
  usersCollection = db.collection( 'users' )
  console.log( 'Connected to MongoDB' )
}

// Derived field: computed from amount, added to every expense
const addDerivedField = function( expense ) {
  if( expense.amount < 10 ) {
    expense.spendLevel = 'Low'
  } else if( expense.amount <= 50 ) {
    expense.spendLevel = 'Medium'
  } else {
    expense.spendLevel = 'High'
  }
  return expense
}

// Middleware: blocks access unless someone's logged in
const requireLogin = function( request, response, next ) {
  if( request.session.username ) {
    next()
  } else {
    response.status( 401 ).json({ error: 'Not logged in' })
  }
}

app.post( '/login', async function( request, response ) {
  const { username, password } = request.body

  const existingUser = await usersCollection.findOne({ username })

  if( existingUser ) {
    if( existingUser.password === password ) {
      request.session.username = username
      response.json({ success: true })
    } else {
      response.json({ success: false, message: 'Incorrect password' })
    }
  } else {
    await usersCollection.insertOne({ username, password })
    request.session.username = username
    response.json({ success: true, message: 'New account created' })
  }
})

app.post( '/logout', function( request, response ) {
  request.session.destroy( function() {
    response.json({ success: true })
  })
})

app.get( '/', function( request, response ) {
  if( request.session.username ) {
    response.sendFile( __dirname + '/public/index.html' )
  } else {
    response.sendFile( __dirname + '/public/login.html' )
  }
})

app.use( express.static( 'public' ) )

app.get( '/expenses', requireLogin, async function( request, response ) {
  const expenses = await expensesCollection.find({ username: request.session.username }).toArray()
  expenses.forEach( addDerivedField )
  response.json( expenses )
})

app.post( '/add', requireLogin, async function( request, response ) {
  const data = request.body

  const newExpense = {
    username: request.session.username,
    description: data.description,
    category: data.category,
    amount: parseFloat( data.amount )
  }
  addDerivedField( newExpense )

  await expensesCollection.insertOne( newExpense )

  const expenses = await expensesCollection.find({ username: request.session.username }).toArray()
  expenses.forEach( addDerivedField )
  response.json( expenses )
})

app.post( '/delete', requireLogin, async function( request, response ) {
  const { ObjectId } = require( 'mongodb' )
  const data = request.body

  await expensesCollection.deleteOne({
    _id: new ObjectId( data.id ),
    username: request.session.username
  })

  const expenses = await expensesCollection.find({ username: request.session.username }).toArray()
  expenses.forEach( addDerivedField )
  response.json( expenses )
})

app.post( '/edit', requireLogin, async function( request, response ) {
  const { ObjectId } = require( 'mongodb' )
  const data = request.body

  const updatedExpense = {
    description: data.description,
    category: data.category,
    amount: parseFloat( data.amount )
  }
  addDerivedField( updatedExpense )

  await expensesCollection.updateOne(
    { _id: new ObjectId( data.id ), username: request.session.username },
    { $set: updatedExpense }
  )

  const expenses = await expensesCollection.find({ username: request.session.username }).toArray()
  expenses.forEach( addDerivedField )
  response.json( expenses )
})

connectToDatabase().then( function() {
  app.listen( process.env.PORT || port )
})