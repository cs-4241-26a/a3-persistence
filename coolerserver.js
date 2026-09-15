const express    = require('express'),
      { MongoClient, ObjectId } = require("mongodb"),
      app        = express()

app.use( express.static( 'public' ) )
app.use( express.static( 'views'  ) )
app.use( express.json() )

const uri = `mongodb+srv://hpwood_db_user:kQOHxE7im3ttKQCZ@webwareclass.k1gvsdm.mongodb.net`
// check for sanity
console.log( 'uri:', uri )
const client = new MongoClient( uri )

let collection = null
let users = null

let user = ""
let pass = ""

async function run() {
  await client.connect()
  collection = await client.db("datatest").collection("test")
  users = await client.db("datatest").collection("user")

  // route to get all docs
  app.get("/docs", async (req, res) => {
    if (collection !== null) {
      const docs = await collection.find({userpass: user + "##@" + pass}).toArray()
      res.json( docs )
    }
  })
}

run()

app.use( (req,res,next) => {
  if( collection !== null ) {
    next()
  }else{
    res.status( 503 ).send()
  }
})

app.post( '/add', async (req,res) => {
  req.body.userpass = user + "##@" + pass
  const result = await collection.insertOne( req.body )
  res.json( result )
})

// assumes req.body takes form { _id:5d91fb30f3f81b282d7be0dd } etc.
app.post( '/remove', async (req,res) => {
  console.log(req.body)
  const result = await collection.deleteOne({ 
    name: req.body.delete,
    userpass: user + "##@" + pass
  })
  
  res.json( result )
})

app.post( '/update', async (req,res) => {
  const result = await collection.updateOne(
    { name: req.body.modify,
    userpass: user + "##@" + pass },
    { $set:{ name:req.body.name } }
  )

  res.json( result )
})

app.post( '/sign', async (req,res) => {
  let ok = true
  if (!req.body.user || !req.body.pass) {
    ok = false
  } else {
    let current = await users.findOne({ user: req.body.user })
    if (!current) {
      const result = await users.insertOne( req.body )
    } else if (!(await users.findOne(req.body))) {
      ok = false
    }
  }
  
  if (ok) {
    user = req.body.user
    pass = req.body.pass
    res.json( { accepted: true} )
  } else {
    res.json( { accepted: false} )
  }
})

app.post( '/submit', (req, res) => {
  let i = 0
  let modified = false
  for (let item of dreams) {
    if (item.name == req.body.delete) {
      dreams.splice(i, 1);
    }
    if (item.name == req.body.modify) {
      dreams[i] = req.body;
      modified = true
    }
    i = i + 1
  }
  if (modified == false) {
    dreams.push(req.body)
  }
  res.writeHead( 200, { 'Content-Type': 'application/json' })
  res.end( JSON.stringify( dreams ) )
})

app.listen( process.env.PORT || 3000 )