require( 'dotenv' ).config()

const express = require("express"),
      cookie = require('cookie-session'),
      { MongoClient, ObjectId } = require("mongodb"),
      app = express()

app.use( express.static( "public" ) )
app.use( express.json() )
app.use(express.urlencoded({ extended:true }))

app.use(cookie ({
  name: 'session', //can set properties of this session, can store username here
  keys: ['cookiekey1', 'uniquekey2']
})
)

// app.use( function (req, res, next) { //middleware auth check
//   if (req.session.login === true ) {
//     console.log("Logged in")
//     next()
//   }
//   else 
//     console.log("Not logged in, redirect to index")
//     return res.status(302).end()
// })


app.post('/login', (req, res)=> {
  //console.log("Login route reached")
  let dataString = ''
    req.on( 'data', function( data ) {
        dataString += data 
    })
    
  req.on( 'end', async function() {
    //prevent empty username and pword
    //if username in DB: 
      //check pword matches, if not fail and redirect to index
    //if username not in DB: sign user up with the name and pword they entered
    collection = await client.db("ShoppingList").collection("Users")
    username = JSON.parse(dataString).username
    password = JSON.parse(dataString).password
    collection.findOne({username: username}).then(user => {
    //console.log(user)
    if(!user){ //user is null if not found
      //console.log("user not found, inserting user " + username)
      //user is not found in the db //signup
      collection.insertOne(JSON.parse(dataString))
      req.session.username = username
      req.session.login = true
      res.redirect('/main.html')
      //insert username and pword into db
      //then login and redirect
    }
    else {
      if(user.password === password){
        //console.log("username found, password is correct, username is " + username + " and password is " + password)
        //log in
        req.session.username = username
        req.session.login = true
        res.redirect('/main.html')
      } else {
        //console.log("username found, password is INCORRECT, username is " + username + " and password is " + password)
        //login fail
        res.redirect('/index.html')
      }
    } 
    })
  })
})

app.get('/logout', (req, res) => {
  //console.log("logout on server side")
  req.session.login = false
  req.session.username = ""
  res.redirect('/index.html')
})

app.get('/getuser', (req, res) => {
  //pass json that contains the user

    if(typeof req.session.username === "undefined" || req.session.username === ""){
      res.send(JSON.parse('{"username" : ""}'))
  } else {
      //res.send(json({ username: req.session.username}))
      //res.send(JSON.parse('"username": ""'))
      res.send(JSON.parse('{"username" : "' + req.session.username + '"}'))
  }
}
)

const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URI}`
// check for sanity
console.log( 'uri:', uri )
const client = new MongoClient( uri )

let collection = null //collection is global

async function run() {
  await client.connect()
  collection = await client.db("ShoppingList").collection("Items")
  // route to get all docs
  app.get("/docs", async (req, res) => {
    if (collection !== null) {
      const docs = await collection.find({}).toArray()
      res.json( docs )
    }
  })
}
//need 3 routes, getlist, submit, delete

app.post( '/delete', async (req,res) => {
  let dataString = ''

    req.on( 'data', function( data ) {
        dataString += data 
    })
    req.on( 'end', async function() {
    myId = JSON.parse(dataString)._id
    //console.log(myId)
  collection = await client.db("ShoppingList").collection("Items")  
  const result = await collection.deleteOne({ 
    "_id": myId //new ObjectId( myId ) 
  })
  
  res.json( result )
  })
})

app.get("/getlist", async (req, res) => { 
  await client.connect()
  let collection = await client.db("ShoppingList").collection("Items")
  let results = await collection.find({})
    .toArray()
  res.send(results)
})

app.post( '/submit', async (req,res) => {
  let dataString = ''
    req.on( 'data', function( data ) {
        dataString += data 
    })
    req.on( 'end', async function() {
        collection = await client.db("ShoppingList").collection("Items")
        result = await collection.insertOne( JSON.parse(dataString) )
        res.json( result )
    })
})

app.post( '/modify', async (req,res) => { 
  let dataString = ''

    req.on( 'data', function( data ) {
        dataString += data 
    })
    
  req.on( 'end', async function() {
    json = JSON.parse(dataString)
    id = json._id
    item = json.item
    cost = json.cost
    count = json.count 
    collection = await client.db("ShoppingList").collection("Items")
    const result = await collection.updateOne(
    { _id: id },
    { $set:{ item: item, count: count, cost: cost } }
    )
    res.json( result )
  })
  
})

run()

app.listen(3000)