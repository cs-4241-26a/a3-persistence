require( 'dotenv' ).config()

var favicon = require('serve-favicon');
var path = require('path');
const serveStatic = require('serve-static');
var errorhandler = require('errorhandler');

const express = require('express'),
    { MongoClient, ObjectId } = require("mongodb"),
    cookie = require( 'cookie-session' ),
    app = express()


app.use( express.json() );
app.use(serveStatic('public'));
app.use(express.urlencoded({ extended:true }) );
app.use( cookie({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

var morgan = require('morgan');
app.use(morgan('dev'));
app.use(errorhandler());


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@${process.env.HOST}/?appName=Cluster0`
console.log( 'uri:', uri )
const client = new MongoClient( uri )

let collection = null
let signin_collection = null

async function run() {
    await client.connect()

    collection = await client.db("A3Database").collection("A3Collection")
    signin_collection = await client.db("A3Database").collection("A3UserInfo")


    app.get("/docs", async (req, res) => {
        if (collection !== null) {
            const docs = await collection.find({
              username: req.session.user
            }).toArray()
            res.json( docs )
        }
    })

    app.get("/alldocs", async (req, res) => {
        if (collection !== null) {
            const docs = await collection.find({}).toArray()
            res.json( docs )
        }
    })

    app.get("/user_docs", async (req, res) => {
        if (signin_collection !== null) {
            const docs = await signin_collection.find({}).toArray()
            res.json( docs )
        }
    })
}

run()
app.listen(process.env.PORT || 3000)

app.use( (req,res,next) => {
  if( collection !== null ) {
    next()
  }else{
    res.status( 503 ).send()
  }
})

app.post( '/submit', async (req,res) => {
  const result = await collection.insertOne({
    username: req.session.user,
    name: req.body.name,
    birth_year: Number(req.body.birth_year),
    user_class: req.body.user_class,
    age: 2026 - Number(req.body.birth_year)
  })
  res.json( result )
})
app.post( '/remove', async (req,res) => {
  const result = await collection.deleteOne({ 
    _id:new ObjectId( req.body._id ) 
  })
  
  res.json( result )
})
app.post( '/update', async (req,res) => {
  const result = await collection.updateOne(
  { _id: new ObjectId(req.body._id) },
    {
      $set: {
        name: req.body.name,
        birth_year: Number(req.body.birth_year),
        user_class: req.body.user_class,
        age: 2026 - Number(req.body.birth_year)
      }
    }
  )
  res.json( result )
})

app.post( '/signin_redirect', async (req,res)=> {
  res.redirect('/index.html')
})

app.post( '/alldata_redirect', async (req,res)=> {
  res.redirect('/alldata.html')
})

app.post( '/userdata_redirect', async (req,res)=> {
  res.redirect('/page2.html')
})

app.post( '/signout', async (req,res)=> {
  res.redirect('/index.html')
})

app.post( '/createAcct', async (req,res)=> {
  // express.urlencoded will put your key value pairs 
  // into an object, where the key is the name of each
  // form field and the value is whatever the user entered
  console.log( req.body )
  

  const user = await signin_collection.findOne({
    username: req.body.username,
    password: req.body.password
  })

  // below is *just a simple authentication example* 
  // for A3, you should check username / password combos in your database
  if(user){
    console.log( "User Already Exists" )
    res.redirect('noacct.html');
  }


  const new_user = await signin_collection.insertOne({
    username: req.body.username,
    password: req.body.password
  })
  console.log( "Account Created" )
  req.session.login = true;
  req.session.user = req.body.username
  res.redirect('/page2.html')
})

//sign in stuff
app.post( '/login', async (req,res)=> {
  // express.urlencoded will put your key value pairs 
  // into an object, where the key is the name of each
  // form field and the value is whatever the user entered
  console.log( req.body )
  

  const user = await signin_collection.findOne({
    username: req.body.username,
    password: req.body.password
  })

  // below is *just a simple authentication example* 
  // for A3, you should check username / password combos in your database
  if(user){
    console.log( "Sign-In Sucsessful" )
    req.session.login = true;
    req.session.user = user.username;
    res.redirect('page2.html');
  
    
    // since login was successful, send the user to the main content
    // use redirect to avoid authentication problems when refreshing
    // the page or using the back button, for details see:
    // https://stackoverflow.com/questions/10827242/understanding-the-post-redirect-get-pattern 
  }else{
    // password incorrect, redirect back to login page
    console.log( "Sign-In Failed" )
    res.redirect('noacct.html');
  }
})

// add some middleware that always sends unauthenicaetd users to the login page
app.use( function( req,res,next) {
  if( req.session.login === true )
    next()
  else
    res.sendFile( __dirname + '/public/index.html' )
})



// serve up static files in the directory public
app.use( express.static('public') )