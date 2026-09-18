const http = require('http'),
      fs   = require('fs'),
      port = 3000

// Express server
const express = require('express'),
      app = express(),
      purecss = require('purecss')

app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// CSS framework: normalize.css + purecss
app.use(express.static('node_modules/normalize.css'))
app.use(express.static('node_modules/purecss/build'))

// Database setup
const dotenv = require('dotenv').config(),
      uri = `${process.env.MONGODB_URI}`,
      { MongoClient, ObjectId } = require('mongodb'),
      client = new MongoClient(uri),
      dbname = 'recipe-website',
      recipecollection = 'recipes'
      usercollection = 'users'
      recipes = [],
      recipedb = client.db(dbname).collection(recipecollection)
      userdb = client.db(dbname).collection(usercollection)
let nextindex = 0;

// User accounts
const cookie = require('cookie-session')
app.use(cookie({
  name:'session',
  keys:['ses89htdgd7jhk', 'kj8o9hjgf63dsdfg']
}))

const isLoggedIn = async function (credentials) {
  if(credentials){
    const id = new ObjectId(credentials.user)
    const user = await userdb.findOne({_id:id})
    if(user){
      return true
    }
  }
  return false
}

app.post( '/createaccount', async (req,res) => {
  const newuser = req.body
  const preexisting = await userdb.findOne({username:newuser.username})
  if(preexisting){
    res.redirect('createaccount.html')
    console.log('Account "' + preexisting.username + '" already exists')
  }
  else{
    const acknowledgement = await userdb.insertOne(newuser)
    console.log('Account created with username "' + newuser.username + '"');
    req.session.user = newuser._id
    req.session.login = true
    res.redirect('index.html')
  }
})

app.post( '/login', async (req,res) => {
  isLoggedIn(req.session)
  const credentials = req.body
  const user = await userdb.findOne({username:credentials.username})
  if(!user){
    console.log('Login attempt for nonexistent user "' + credentials.username + '"')
    res.redirect('login.html')
  }
  else if(user.password !== credentials.password){
    console.log('Incorrect password for user "' + user.username + '"')
    res.redirect('login.html')
  }
  else{
    console.log('Logged in user "' + user.username + '"');
    req.session.login = true
    req.session.user = user._id
    res.redirect('index.html')
  }
})

app.post('/logout', async (req, res) => {
  console.log('Logged out user "' + req.session.user + '"');
  req.session.login = false
  req.session.user = null
  res.redirect('login.html')
})

app.post('/editaccount', async (req, res) => {
  const password = req.body.password
  const id = new ObjectId(req.session.user)
  const user = await userdb.findOneAndUpdate({_id:id},{$set:{password:password}})
  console.log('Updated password')
  req.session.user = null
  req.session.login = false
  res.redirect('/login.html')
})

app.get('/amiloggedin', async (req, res) => {
  const checkUser = await isLoggedIn(req.session)
  if(checkUser){
    const userid = new ObjectId(req.session.user)
    const user = await userdb.findOne({_id:userid})
    res.json({username:user.username})
    return;
  }
  res.json({username:null})
})

// Recipes
app.get('/allrecipes', async (req,res) => {
  const result = await recipedb.find({}).toArray()
  res.json(result)
})

// Recipes
app.get('/myrecipes', async (req,res) => {
  const id = new ObjectId(req.session.user)
  const user = await userdb.findOne({_id:id})
  const result = await recipedb.find({author:user.username}).toArray()
  res.json(result)
})

app.post( '/newrecipe', async (req,res) => {
  const loggedIn = await isLoggedIn(req.session)
  if(!loggedIn){
    console.log('Cannot post recipes while logged out!')
    return
  }
  const newrecipe = req.body
  newrecipe.totaltime = newrecipe.preptime + newrecipe.cooktime
  const userid = new ObjectId(req.session.user)
  const user = await userdb.findOne({_id:userid})
  newrecipe.author = user.username
  const acknowledgement = await recipedb.insertOne(newrecipe)
  id = acknowledgement.insertedId
  const result = await recipedb.findOne({_id:id})
  console.log('Recipe "' + newrecipe.name + '" added (id ' + id + ')');
  res.json(result)
})

app.post( '/deleterecipe', async (req,res) => {
  id = new ObjectId(req.body.id)
  const result = await recipedb.deleteOne({_id:id})
  console.log('Recipe ' + id + ' deleted: ' + (result.deletedCount === 1))
  res.json(result)
})

app.listen(process.env.PORT || port)
