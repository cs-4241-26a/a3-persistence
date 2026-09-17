const express = require( 'express' ),
      { MongoClient, ObjectId } = require("mongodb"),
      cookie  = require( 'cookie-session' ),
      app = express()

require('dotenv').config()


// serve up static files in the directory public
app.use( express.static('public') )
app.use( express.static( 'views'  ) )
app.use( express.json())


const port = 3000


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@${process.env.HOST}`
const client = new MongoClient( uri )

let collection = null
let usersCollection = null
async function run() {
  await client.connect()
  collection = await client.db("workoutapp").collection("workout")
  usersCollection = await client.db("workoutapp").collection("user")
  // route to get all docs
  app.get("/docs", async (req, res) => {
    if (collection !== null) {
      const docs = await collection.find({username: req.session.username}).toArray()
      res.json( docs )
    }
  })
}

run()

// use express.urlencoded to get data sent by defaut form actions
// or GET requests
app.use( express.urlencoded({ extended:true }) )

// cookie middleware! The keys are used for encryption and should be
// changed
app.use( cookie({
  name: 'session',
  keys: ['a7f3k9x2mQ8pL4vN6wZ1bT5yR0dE3sH7', 'j9K2mP5vX8qL1nR4wT7yB0dF3sH6cA9z']
}))

// add some middleware that always sends unauthenicaetd users to the login page

app.use( (req,res,next) => {
  if( collection !== null && usersCollection !== null ) {
    next()
  }else{
    res.status( 503 ).send()
  }
})

app.post( '/login', async (req,res)=> {
  // express.urlencoded will put your key value pairs 
  // into an object, where the key is the name of each
  // form field and the value is whatever the user entered
  console.log( req.body )
  
  // below is *just a simple authentication example* 
  // for A3, you should check username / password combos in your database
  const existingUser = await usersCollection.findOne({username: req.body.username})
  if (existingUser == null){
    await usersCollection.insertOne( {username: req.body.username, password: req.body.password} )
    req.session.login = true
    req.session.username = req.body.username
    res.redirect('workout.html')
  }else if (existingUser.password == req.body.password){
    req.session.login = true
    req.session.username = req.body.username
    res.redirect('workout.html')
  }else{
    // password incorrect, redirect back to login page
    res.sendFile( __dirname + '/public/index.html' )
  }
   
})

app.use( function( req,res,next) {
  if( req.session.login === true )
    next()
  else
    res.sendFile( __dirname + '/public/index.html' )
})



app.post('/delete', async (req, res) => {
  const deleting = await collection.deleteOne({ 
    _id:new ObjectId( req.body._id ),
    username: req.session.username
  })
  const result = await collection.find({username: req.session.username}).toArray()
  res.json( result )
})

app.post('/update', async (req, res) => {
  const calories_burned_per_rep = 1

  req.body.total_reps = req.body.sets * req.body.reps
  req.body.calories_burned = calories_burned_per_rep * req.body.total_reps

  const editing = await collection.updateOne(
    {_id:new ObjectId( req.body._id ),
      username: req.session.username
    },
    { $set:{ exercise: req.body.exercise, 
      sets: req.body.sets, 
      reps: req.body.reps, 
      total_reps: req.body.total_reps,
      calories_burned: req.body.calories_burned} }
)

  const result = await collection.find({username: req.session.username}).toArray()
  res.json( result )
})

app.post('/submit', async (req, res) => {
    const calories_burned_per_rep = 1
     
    // ... do something with the data here!!!
    req.body.total_reps = req.body.sets * req.body.reps
    req.body.calories_burned = calories_burned_per_rep * req.body.total_reps
    req.body.username = req.session.username
    // change this to incorporate data
    const adding = await collection.insertOne( req.body )
    const result = await collection.find({username: req.session.username}).toArray()
    res.json( result )
})

app.listen( process.env.PORT || 3000 )
