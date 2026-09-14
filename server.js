require('dotenv').config()

const express = require('express')
const path = require('path')
const helmet = require('helmet')
const morgan = require('morgan')
const session = require('express-session')
const passport = require('passport')
const Auth0Strategy = require('passport-auth0')
const { MongoClient, ObjectId } = require('mongodb')

const app = express()
const port = process.env.PORT || 3000
const uri = process.env.MONGODB_URI
const auth0Enabled = Boolean(
  process.env.AUTH0_DOMAIN &&
  process.env.AUTH0_CLIENT_ID &&
  process.env.AUTH0_CLIENT_SECRET &&
  process.env.AUTH0_CALLBACK_URL
)

if (!uri) {
  console.error('Missing MONGODB_URI environment variable.')
  process.exit(1)
}

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 10000
})

const normalizeUsername = (value) => String(value || '').trim()

const getReadingTime = (pages, minutesPerDay) => {
  const pageCount = Number(pages)
  const minutes = Number(minutesPerDay)
  if (!pageCount || !minutes) return 0
  return Math.ceil(pageCount / (minutes * 2))
}

const normalizeItem = (item) => ({
  ...item,
  id: item._id ? item._id.toString() : item.id,
  title: String(item.title || '').trim(),
  author: String(item.author || '').trim(),
  pages: Number(item.pages),
  minutesPerDay: Number(item.minutesPerDay),
  readingTime: Number(item.readingTime || getReadingTime(item.pages, item.minutesPerDay))
})

app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SESSION_SECRET || 'local-dev-session-secret',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname, 'public')))

if (auth0Enabled) {
  passport.use(new Auth0Strategy({
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL,
    state: true
  }, (accessToken, refreshToken, extraParams, profile, done) => {
    const username = profile.displayName || profile.nickname || profile.username || profile.emails?.[0]?.value || 'auth0-user'
    return done(null, { id: profile.id, username })
  }))

  passport.serializeUser((user, done) => done(null, user))
  passport.deserializeUser((user, done) => done(null, user))
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/auth/login', (req, res, next) => {
  if (!auth0Enabled) {
    return res.status(503).json({ error: 'Auth0 is not configured for this app.' })
  }

  return passport.authenticate('auth0', { scope: 'openid profile email' })(req, res, next)
})

app.get('/callback', (req, res, next) => {
  if (!auth0Enabled) {
    return res.status(503).json({ error: 'Auth0 is not configured for this app.' })
  }

  passport.authenticate('auth0', (err, user) => {
    if (err) {
      return next(err)
    }

    if (!user) {
      return res.redirect('/')
    }

    return req.logIn(user, (loginErr) => {
      if (loginErr) {
        return next(loginErr)
      }

      const username = encodeURIComponent(user.username || 'auth0-user')
      return res.redirect(`/?user=${username}`)
    })
  })(req, res, next)
})

app.get('/auth/logout', (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.redirect('/')
    })
  })
})

app.post('/signup', async (req, res) => {
  const username = normalizeUsername(req.body.username)
  const password = String(req.body.password || '').trim()

  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter a username and password.' })
  }

  try {
    const db = client.db('a3db')
    const users = db.collection('users')
    const existingUser = await users.findOne({ username })

    if (existingUser) {
      return res.status(409).json({ error: 'That username already exists. Please sign in instead.' })
    }

    await users.insertOne({ username, password })
    return res.status(201).json({ username })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ error: 'Server error while creating your account.' })
  }
})

app.post('/login', async (req, res) => {
  const username = normalizeUsername(req.body.username)
  const password = String(req.body.password || '').trim()

  if (!username || !password) {
    return res.status(400).json({ error: 'Please enter a username and password.' })
  }

  try {
    const db = client.db('a3db')
    const users = db.collection('users')
    const existingUser = await users.findOne({ username })

    if (!existingUser) {
      return res.status(401).json({ error: 'No account found with that username. Please sign up first.' })
    }

    if (existingUser.password !== password) {
      return res.status(401).json({ error: 'Incorrect password.' })
    }

    return res.json({ username })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Server error while logging in.' })
  }
})

app.get('/data', async (req, res) => {
  const username = normalizeUsername(req.query.username)

  if (!username) {
    return res.status(400).json({ error: 'Username is required.' })
  }

  try {
    const db = client.db('a3db')
    const items = await db.collection('items').find({ username }).toArray()
    return res.json(items.map(normalizeItem))
  } catch (error) {
    console.error('Read error:', error)
    return res.status(500).json({ error: 'Unable to load data.' })
  }
})

app.post('/data', async (req, res) => {
  const username = normalizeUsername(req.body.username)
  const title = String(req.body.title || '').trim()
  const author = String(req.body.author || '').trim()
  const pages = Number(req.body.pages)
  const minutesPerDay = Number(req.body.minutesPerDay)

  if (!username || !title || !author || pages <= 0 || minutesPerDay <= 0) {
    return res.status(400).json({ error: 'Please complete every field.' })
  }

  try {
    const db = client.db('a3db')
    const item = {
      username,
      title,
      author,
      pages,
      minutesPerDay,
      readingTime: getReadingTime(pages, minutesPerDay)
    }

    const result = await db.collection('items').insertOne(item)
    return res.status(201).json({ ...item, id: result.insertedId.toString() })
  } catch (error) {
    console.error('Create error:', error)
    return res.status(500).json({ error: 'Unable to create item.' })
  }
})

app.put('/data', async (req, res) => {
  const username = normalizeUsername(req.body.username)
  const id = String(req.query.id || '')
  const title = String(req.body.title || '').trim()
  const author = String(req.body.author || '').trim()
  const pages = Number(req.body.pages)
  const minutesPerDay = Number(req.body.minutesPerDay)

  if (!username || !id || !title || !author || pages <= 0 || minutesPerDay <= 0) {
    return res.status(400).json({ error: 'Please complete every field.' })
  }

  try {
    const db = client.db('a3db')
    const item = {
      username,
      title,
      author,
      pages,
      minutesPerDay,
      readingTime: getReadingTime(pages, minutesPerDay)
    }

    const result = await db.collection('items').updateOne(
      { _id: new ObjectId(id), username },
      { $set: item }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Item not found for this user.' })
    }

    return res.json({ ...item, id })
  } catch (error) {
    console.error('Update error:', error)
    return res.status(500).json({ error: 'Unable to update item.' })
  }
})

app.delete('/data', async (req, res) => {
  const username = normalizeUsername(req.query.username)
  const id = String(req.query.id || '')

  if (!username || !id) {
    return res.status(400).json({ error: 'Missing username or item id.' })
  }

  try {
    const db = client.db('a3db')
    const result = await db.collection('items').deleteOne({ _id: new ObjectId(id), username })

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Item not found for this user.' })
    }

    return res.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return res.status(500).json({ error: 'Unable to delete item.' })
  }
})

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

async function startServer() {
  try {
    await client.connect()
    console.log('Connected to MongoDB')
    app.listen(port, () => {
      console.log(`Server running on ${port}`)
    })
  } catch (error) {
    console.error('MongoDB connection failed:')
    console.error(error)
    process.exit(1)
  }
}

startServer()