require( 'dotenv' ).config()

const express = require("express"),
      { MongoClient, ObjectId } = require("mongodb"),
      cookie  = require('cookie-session'),
      app = express()

app.use( express.json() )

app.use( express.urlencoded({ extended:true }) )

app.use(cookie({
  name: 'session',
  keys: ['bark', 'woof']
}))

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@${process.env.HOST}`
// check for sanity
console.log( 'uri:', uri )
const client = new MongoClient( uri )

let collection = null

async function run() {
  await client.connect()
  collection = await client.db("a3").collection("make_a_deal")
  accounts = await client.db("a3").collection("accounts")
  let user = "";

  //log in 
  app.post('/login', async (req,res) => {
  // express.urlencoded will put your key value pairs 
  // into an object, where the key is the name of each
  // form field and the value is whatever the user entered
  console.log( req.body )
  
  // below is *just a simple authentication example* 
  // for A3, you should check username / password combos in your database
  const account = await accounts.findOne({
    username: {$eq: req.body.username}, 
    password: {$eq: req.body.password}
  })
  // if there is an account with that username + password combo...
  if(account != null) {
    // we save username somewhere it will be held onto (for future referencing)
    user = req.body.username;
    // define a variable that we can check in other middleware
    // the session object is added to our requests by the cookie-session middleware
    req.session.login = true
    
    // and we send them to the table!
    res.redirect( 'table.html' )
  }else{
    // password incorrect, redirect back to login page
    res.sendFile( __dirname + '/public/index.html' )
  }
})

  // get message at given location
  app.get(`/one/:loc`, async (req, res) => {
    const loc = parseInt(req.params.loc);
    if (collection !== null) {
      const ans = await collection.findOne({location : {$eq: loc}})
      res.json( ans )
    }
  })

  // add message to given location 
  app.post(`/post/:loc`, async (req, res) => {
    const loc = parseInt(req.params.loc);
    if(collection !== null) {
      const json = {
        //_id: 1,
        location: loc,
        user: user,
        message: req.body.message
      }
      const result = await collection.insertOne(json)
      res.json(result);
      res.redirect('table.html')
    }
  })

  // remove message at given location (untested)
  app.post( '/remove/:loc', async (req,res) => {
    const loc = parseInt(req.params.loc);
    const result = await collection.deleteOne({ 
      location: {$eq: loc}
    })
    res.json( result )
  })

  // edit message at given location (untested)
  app.post( '/update/:loc', async (req,res) => {
    const result = await collection.updateOne(
      { location: {$eq: loc} },
      { $set:{ message:req.body.message }}
    )

  res.json( result )
})
}

run()

// add some middleware that always sends unauthenicaetd users to the login page
// app.use( function( req,res,next) {
//   if( req.session.login === true )
//     next()
//   else
//     res.sendFile( __dirname + '/public/index.html' )
// })

app.use( express.static( "public" ) )



app.listen(3000)