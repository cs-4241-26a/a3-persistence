require('dotenv').config()

const express = require('express')
const app = express()
const dir  = 'public/'
const port = 3000
const { MongoClient, ObjectId } = require('mongodb') 
const bcrypt = require('bcrypt')

app.use(express.json())
app.use(express.static(dir))

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const client = new MongoClient(uri)

const session = require('express-session')

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}))

let usersCollect
let tasksCollect

const derivePriority = function(item){
  const created = new Date(item.creationDate)
  const dueDate = new Date(item.deadline)

  const millisecondsLeft = dueDate - created
  const daysRemaining = millisecondsLeft / (1000 * 60 * 60 * 24)

  let priority
  if (isNaN(daysRemaining) || daysRemaining <= 1) {
    priority = 'urgent'
  } else if (daysRemaining <= 3) {
    priority = 'high'
  } else if (daysRemaining <= 7) {
    priority = 'medium'
  } else {
    priority = 'low'
  }

  return {...item, priority}
}


//Login data
app.post('/login', async function(request, response) {
  const { username, password } = request.body

  if (!username || !password) {
    return response.status(400).json({ error: 'Username and password required' })
  }

  const existingUser = await usersCollect.findOne({ username })

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, 10)
    const result = await usersCollect.insertOne({ username, passwordHash })

    request.session.userId = result.insertedId.toString()
    request.session.username = username

    return response.json({ status: 'created', message: 'New account created for you.' })
  }

  const passwordMatches = await bcrypt.compare(password, existingUser.passwordHash)

  if (!passwordMatches) {
    return response.status(401).json({ error: 'Incorrect password' })
  }

  request.session.userId = existingUser._id.toString()
  request.session.username = existingUser.username

  response.json({ status: 'logged in' })
})

app.post('/logout', function(request, response) {
  request.session.destroy(function() {
    response.json({ status: 'logged out' })
  })
})

const requireLogin = function(request, response, next) {
  if (!request.session.userId) {
    return response.status(401).json({ error: 'Not logged in' })
  }
  next()
}

app.get('/user', function(request, response) {
  if (request.session.userId) {
    response.json({ loggedIn: true, username: request.session.username })
  } else {
    response.json({ loggedIn: false })
  }
})

//Processing data
app.get('/data', requireLogin, async function(request, response) {
  const appdata = await tasksCollect.find({owner: request.session.userId}).toArray()
  response.json(appdata)
})

app.post('/data', requireLogin, async function(request, response) {
  const newItem = derivePriority({...request.body, owner: request.session.userId})
  await tasksCollect.insertOne(newItem)
  const appdata = await tasksCollect.find({owner: request.session.userId}).toArray()
  response.json(appdata)
})

app.delete('/data', requireLogin, async function(request, response) {
  const idToDelete = request.body.id
  await tasksCollect.deleteOne({ _id: new ObjectId(idToDelete) })
  const appdata = await tasksCollect.find({owner: request.session.userId}).toArray()
  response.json(appdata)
})

app.put('/data', requireLogin, async function(request, response) {
  const { id, ...updates } = request.body
  const updatedItem = derivePriority({...updates, owner: request.session.userId})
  await tasksCollect.updateOne(
    { _id: new ObjectId(id), owner: request.session.userId },
    { $set: updatedItem }
  )
  const appdata = await tasksCollect.find({owner: request.session.userId}).toArray()
  response.json(appdata)
})

async function start() {
  await client.connect()
  const db = tasksCollect = client.db('todoApp').collection('tasks')
  tasksCollect = db
  usersCollect = client.db('todoApp').collection('users')

  console.log('Connected to MongoDB')

  app.listen(process.env.PORT || port)
}

start()