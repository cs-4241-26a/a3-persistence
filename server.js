// const express    = require('express'),
//       app        = express(),
//       dreams     = []

// app.use( express.static( 'public' ) )
// app.use( express.static( 'views'  ) )
// app.use( express.json() )

// app.post( '/submit', express.json(), ( req, res ) => {
//   dreams.push( req.body.newdream )
//   res.writeHead( 200, { 'Content-Type': 'application/json'})
//   res.end( JSON.stringify( dreams ) )
// })

// app.listen( process.env.PORT || 3000 )

require( 'dotenv' ).config()

const express = require("express"),
      { MongoClient, ObjectId } = require("mongodb"),
  { randomInt } = require("crypto"),
      app = express()

app.use( express.static( "public" ) )
app.use( express.json() )

const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASSWORD}@${process.env.MONGOHOST}`
const client = new MongoClient( uri )

let collection = null
let users = null

app.use( (req,res,next) => {
  if( collection !== null ) {
    next()
  }else{
    res.status( 503 ).json({ error: 'Database is not connected. Please try again shortly.' })
  }
})

async function run() {
  await client.connect()
  const database = client.db("datatest")
  collection = database.collection("test")
  users = database.collection("users")

  app.post( '/register', async (req,res) => {
    const username = req.body.username?.trim()
    const password = req.body.password

    if( !username || typeof password !== 'string' || password.length < 8 ) {
      return res.status( 400 ).json({ error: 'Username and a password of at least 8 characters are required.' })
    }

    if( await users.findOne({ username }) ) {
      return res.status( 409 ).json({ error: 'That username is already in use.' })
    }

    let accountId
    do {
      accountId = randomInt( 100000, 1000000 )
    } while( await users.findOne({ accountId }) )

    await users.insertOne({ username, password, accountId })
    res.json({ username, accountId })
  })

  app.post( '/login', async (req,res) => {
    const username = req.body.username?.trim()
    const password = req.body.password
    const user = await users.findOne({ username })

    if( !user || password !== user.password ) {
      return res.status( 401 ).json({ error: 'Invalid username or password.' })
    }

    res.json({ username: user.username, accountId: user.accountId })
  })

  const requireLogin = async (req,res,next) => {
    const authorization = req.headers.authorization || ''
    if( !authorization.startsWith( 'Basic ' ) ) {
      return res.status( 401 ).json({ error: 'Please log in first.' })
    }

    let username
    let password
    try {
      const credentials = Buffer.from( authorization.slice( 6 ), 'base64' ).toString( 'utf8' )
      const separator = credentials.indexOf( ':' )
      if( separator < 1 ) throw new Error( 'Invalid credentials' )
      username = credentials.slice( 0, separator )
      password = credentials.slice( separator + 1 )
    } catch {
      return res.status( 401 ).json({ error: 'Please log in first.' })
    }

    const user = await users.findOne({ username, password })
    if( !user ) return res.status( 401 ).json({ error: 'Invalid username or password.' })
    req.accountId = user.accountId
    next()
  }

  const publicEntry = doc => ({
    id: doc._id.toString(),
    website: doc.website,
    username: doc.username,
    passwordMatchesPrevious: doc.passwordMatchesPrevious ?? false
  })

  app.get("/data", requireLogin, async (req, res) => {
    const docs = await collection.find({ accountId: req.accountId }).toArray()
    res.json( docs.map( publicEntry ) )
  })

  app.post( '/submit', requireLogin, async (req,res) => {
    await collection.insertOne({
      accountId: req.accountId,
      website: req.body.website,
      username: req.body.username,
      password: req.body.password
    })
    const docs = await collection.find({ accountId: req.accountId }).toArray()
    res.json( docs.map( publicEntry ) )
  })

  app.put( '/edit', requireLogin, async (req,res) => {
    const changes = {
      website: req.body.website,
      username: req.body.username
    }
    if( req.body.password ) changes.password = req.body.password
    await collection.updateOne(
      { _id: new ObjectId( req.body.id ), accountId: req.accountId },
      { $set: changes }
    )
    const docs = await collection.find({ accountId: req.accountId }).toArray()
    res.json( docs.map( publicEntry ) )
  })

  app.delete( '/delete', requireLogin, async (req,res) => {
    await collection.deleteOne({
      _id: new ObjectId( req.query.id ),
      accountId: req.accountId
    })
    const docs = await collection.find({ accountId: req.accountId }).toArray()
    res.json( docs.map( publicEntry ) )
  })
}

app.listen( process.env.PORT || 3000, () => {
  console.log( `Password Manager running at http://localhost:${process.env.PORT || 3000}` )
})

run().catch( error => {
  console.error( 'Unable to connect to MongoDB:', error )
  process.exitCode = 1
})