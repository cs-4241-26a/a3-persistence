require('dotenv').config()


const express = require('express')
const helmet = require('helmet')
const compression = require('compression')
const responseTime = require('response-time')
const morgan = require('morgan')

const {MongoClient, ObjectId} = require('mongodb')

const app = express()
const port = process.env.PORT || 3000

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)
let applications
let users

app.use(helmet()) 
app.use(morgan('dev'))
app.use(responseTime())
app.use(compression())
app.use(express.json())
app.use(express.static('public'))


const session = require('express-session')
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}))

const calcApplicationAge = function(dateApplied) {
  //JS stores date as ms interally

  const oneDay = 1000*60*60*24; //ms/day
  const appliedDate = new Date(dateApplied + 'T00:00:00');
  const today = new Date();

  today.setHours(0,0,0,0);

  const diffTime = today - appliedDate;
  const diffDays = Math.floor(diffTime / oneDay);
  
  if (diffTime < 0) {
    return 'Invalid date';
  } else if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weekCount = Math.floor(diffDays / 7);

    if (weekCount === 1) {
      return '1 week ago';
    }
    return `${weekCount} weeks ago`;

  } else if (diffDays < 365) {
    const monthCount = Math.floor(diffDays / 30);

    if (monthCount === 1) {
      return '1 month ago';
    }
    return `${monthCount} months ago`;
  } else {
    const yearCount = Math.floor(diffDays / 365);

    if (yearCount === 1) {
      return '1 year ago';
    }
    return `${yearCount} years ago`;
  }
}

app.post('/api/login', async function(req, res) {

  const username= req.body.username
  
  const existingUser = await users.findOne({username})

  let accountCreated = false

  if (!existingUser) {
    await users.insertOne({username})
    accountCreated = true
  }

  req.session.username = username
  res.json({
    username: username,
    accountCreated: accountCreated
  })

})

app.get('/api/session', function(req, res) {
  res.json({
    loggedIn: Boolean(req.session.username),
    username: req.session.username || null
  })
})

app.post('/api/logout', function(req, res) {
  req.session.destroy(function() {
    res.json({
      message: 'Logged out successfully'
    })
  })
})


function requireLogin(req, res, next) {
  if (!req.session.username) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

//GET 
app.get('/api/applications',requireLogin, async function(req, res){

  const results = await applications.find({
    username: req.session.username
  }).toArray()
  results.forEach(function(application) {
    application.applicationAge = calcApplicationAge(application.dateApplied);

  })
  res.json(results);
})


//POST

app.post('/api/applications', requireLogin, async function(req, res){
  const newApp = {
    company: req.body.company,
    role: req.body.role,
    dateApplied: req.body.dateApplied,
    resume: req.body.resume,
    status: req.body.status, 
    username: req.session.username  
  }

  await applications.insertOne(newApp)
  const results = await applications.find({
    username: req.session.username
  }).toArray()
  results.forEach(function(application) {
    application.applicationAge = calcApplicationAge(application.dateApplied);

  })
  res.json(results);
})

//DELETE
app.delete('/api/applications/', requireLogin, async function(req, res){

  const deleteInfo = req.body;

  await applications.deleteOne({_id: new ObjectId(deleteInfo.id), username: req.session.username})

  const results = await applications.find({
    username: req.session.username
  }).toArray()
  results.forEach(function(application) {
    application.applicationAge = calcApplicationAge(application.dateApplied);

  })

  res.json(results);

})

//PUT
app.put('/api/applications/', requireLogin, async function(req, res){

  const updateInfo = req.body;

  await applications.updateOne(
    {_id: new ObjectId(updateInfo.id),
      username: req.session.username
    },
    {$set: {status: updateInfo.status}}
  )

  const results = await applications.find({
    username: req.session.username
  }).toArray()
  results.forEach(function(application) {
    application.applicationAge = calcApplicationAge(application.dateApplied);


  })
  res.json(results);
  
  })

//express server
async function startServer() {

  
  await client.connect()
  const database = client.db('jobApplicationsDB')
  applications = database.collection('applications')
  users = database.collection('users')

  app.listen(port, function(){
    console.log(`Server is running on port ${port}`)
  })
}

startServer()