require('dotenv').config()

const express = require('express'),
      { MongoClient, ObjectId } = require('mongodb'),
      cookie = require('cookie-session'),
      bcrypt = require('bcryptjs')
      app = express()

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use( cookie({
  name: 'session',
  //made using randomkeygen.com
  keys: ['Ja6S?-5ta_ryIE=<', 'pX20sqIPa>N-#a1r']
}))

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.HOST}`
console.log('uri :', uri)
const client = new MongoClient(uri)

//middleware to calculate difficulty before data is added or updated in database
const deriveDifficulty = (req, res, next) => {
  console.log(req.body)
  const numIngredients = req.body.ingredients.length;
  const numStep = req.body.instructions.length;
  const cookTime = req.body.cookTime;

  let diffSum = 0.016*cookTime+ 0.05*numIngredients+0.1*numStep
  if (diffSum < 1){
    req.body.difficulty = 'easy'
  }
  else if (diffSum > 1.5){
    req.body.difficulty = 'hard'
  }
  else{
    req.body.difficulty = 'moderate'
  }  
  next()
  
}
let collection = null

async function run() {
  await client.connect()
  collection = await client.db("cookbook").collection("recipes")

  //middleware to check connection
  app.use( (req, res, next) => {
    if(collection !== null){
      next()
    }
    else{
      res.status(503).send
    }
  })
  
  app.post( '/login', async (req,res)=> {
    // express.urlencoded will put your key value pairs 
    // into an object, where the key is the name of each
    // form field and the value is whatever the user entered
    console.log( req.body )
    const username = req.body.username 
    const password = req.body.password

    //find the user
    const existing_user = await collection.findOne({ username: { $eq: username } })
    // if username is not in db, create that user
    if(!existing_user){
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      req.body.password = hashedPassword
      const result = await collection.insertOne( req.body )
      req.session.user = username
      res.redirect( 'main.html' )
    }
    //otherwise check if password matches stored password
    else if( await bcrypt.compare(password, existing_user.password) ){
      // define a variable that we can check in other middleware
      // the session object is added to our requests by the cookie-session middleware
      req.session.login = true
      
      // since login was successful, send the user to the main content
      req.session.user = username
      res.redirect( 'main.html' )
    }else{
      // password incorrect, redirect back to login page
      res.sendFile( __dirname + '/public/index.html' )
    }
  })

  // middleware that always sends unauthenicaetd users to the login page
  app.use( function( req,res,next) {
    console.log(req.session.login)
    if( req.session.login === true )
      next()
    else
      res.sendFile( __dirname + '/public/index.html' )
  })

  app.post( '/logout', async (req,res)=> {
    // express.urlencoded will put your key value pairs 
    // into an object, where the key is the name of each
    // form field and the value is whatever the user entered
    req.session.login = false
    delete req.session.user
    res.sendFile( __dirname + '/public/index.html' )
  })

  // route to get all docs
  app.get("/docs", async (req, res) => {
    const docs = await collection.find({author : {$eq: req.session.user }}).toArray()
    res.json( docs )
  })

  //add item to DB
  app.post( '/add', deriveDifficulty,  async (req,res) => {
    req.body.author = req.session.user
    const result = await collection.insertOne( req.body )
    const id = result['insertedId']
    const recipe = await collection.findOne(id)
    recipe._id = recipe._id.toString()
    console.log(recipe)
    res.json(recipe)
  })

  //remove item from DB 
  // where req.body is of form like {_id:5d91fb30f3f81b282d7be0dd } for 
  app.post( '/remove', async (req,res) => {
    console.log(req.body._id)
    const result = await collection.deleteOne({ 
      _id:new ObjectId( req.body._id ) })
    res.json( result )
  })

  app.post( '/update', deriveDifficulty, async (req,res) => {
    const id = new ObjectId( req.body._id )
    const result = await collection.updateOne(
      { _id:  id},
      { $set:{ recipeName : req.body.recipeName,
              ingredients : req.body.ingredients,
              instructions : req.body.instructions,
              cookTime : req.body.cookTime,
              difficulty : req.body.difficulty,
              author : req.body.author
       } })
    const recipe = await collection.findOne(id)
    recipe._id = recipe._id.toString()
    console.log(recipe)
    res.json(recipe)
  })
}

run()

app.listen( 3000 )