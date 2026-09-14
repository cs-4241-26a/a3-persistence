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
      app = express()

app.use( express.static( "public" ) )
app.use( express.json() )

const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASSWORD}@${process.env.MONGOHOST}`
const client = new MongoClient( uri )

let collection = null

app.use( (req,res,next) => {
  if( collection !== null ) {
    next()
  }else{
    res.status( 503 ).send()
  }
})

async function run() {
  await client.connect()
  collection = await client.db("datatest").collection("test")

  app.get("/data", async (req, res) => {
    const docs = await collection.find({}).toArray()
    res.json( docs.map( doc => ({ ...doc, id: doc._id.toString() }) ) )
  })

  app.post( '/submit', async (req,res) => {
    const result = await collection.insertOne( req.body )
    const docs = await collection.find({}).toArray()
    res.json( docs.map( doc => ({ ...doc, id: doc._id.toString() }) ) )
  })

  app.put( '/edit', async (req,res) => {
    await collection.updateOne(
      { _id: new ObjectId( req.body.id ) },
      { $set: {
        website: req.body.website,
        username: req.body.username,
        password: req.body.password
      } }
    )
    const docs = await collection.find({}).toArray()
    res.json( docs.map( doc => ({ ...doc, id: doc._id.toString() }) ) )
  })

  app.delete( '/delete', async (req,res) => {
    await collection.deleteOne({ _id: new ObjectId( req.query.id ) })
    const docs = await collection.find({}).toArray()
    res.json( docs.map( doc => ({ ...doc, id: doc._id.toString() }) ) )
  })
}

app.listen( process.env.PORT || 3000, () => {
  console.log( `Password Manager running at http://localhost:${process.env.PORT || 3000}` )
})

run().catch( error => {
  console.error( 'Unable to connect to MongoDB:', error )
  process.exitCode = 1
})