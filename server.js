require('dotenv').config()

const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcrypt')
const session = require('express-session')

const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const { rateLimit } = require('express-rate-limit')

const app = express()
const port = process.env.PORT || 3000

app.use(
  helmet({
    contentSecurityPolicy: false
  })
)

app.use(compression())


app.use(morgan('dev'))

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false
})

app.use('/api/login', authLimiter)
app.use('/api/register', authLimiter)

app.use(express.json())

app.use(express.static('public'))

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60
    }
  })
)


const client = new MongoClient(process.env.MONGODB_URI)

let movies
let users

async function connectToDatabase() {
  await client.connect()

  const db = client.db('movieWatchlist')

  movies = db.collection('movies')
  users = db.collection('users')
  await users.createIndex(
    { username: 1 },
    { unique: true }
  )

  console.log('Connected to MongoDB')
}


function requireLogin(req, res, next) {
  if (!req.session.username) {
    return res.status(401).json({
      error: 'You must be logged in.'
    })
  }

  next()
}

app.post('/api/register', async function(req, res) {
  try {
    const username = req.body.username?.trim()
    const password = req.body.password

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required.'
      })
    }

    const existingUser = await users.findOne({
      username: username
    })

    if (existingUser) {
      return res.status(400).json({
        error: 'Username already exists.'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await users.insertOne({
      username: username,
      password: hashedPassword
    })

    req.session.username = username

    res.status(201).json({
      message: 'Account created successfully.',
      username: username
    })
  } catch (error) {
    console.error(error)

    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Username already exists.'
      })
    }

    res.status(500).json({
      error: 'Unable to create account.'
    })
  }
})

app.post('/api/login', async function(req, res) {
  try {
    const username = req.body.username?.trim()
    const password = req.body.password

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required.'
      })
    }

    const user = await users.findOne({
      username: username
    })

    if (!user) {
      return res.status(401).json({
        error: 'Invalid username or password.'
      })
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    )

    if (!passwordMatches) {
      return res.status(401).json({
        error: 'Invalid username or password.'
      })
    }

    req.session.username = username

    res.json({
      message: 'Logged in successfully.',
      username: username
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Unable to log in.'
    })
  }
})


app.post('/api/logout', function(req, res) {
  req.session.destroy(function(error) {
    if (error) {
      console.error(error)

      return res.status(500).json({
        error: 'Unable to log out.'
      })
    }

    res.json({
      message: 'Logged out successfully.'
    })
  })
})

app.get('/api/user', function(req, res) {
  if (req.session.username) {
    res.json({
      loggedIn: true,
      username: req.session.username
    })
  } else {
    res.json({
      loggedIn: false
    })
  }
})


function getRecommendation(rating) {
  if (rating >= 8) {
    return 'Must Watch'
  }

  if (rating >= 6) {
    return 'Worth Watching'
  }

  return 'Skip'
}

app.get('/api/movies', requireLogin, async function(req, res) {
  try {
    const result = await movies
      .find({
        username: req.session.username
      })
      .toArray()

    res.json(result)
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Unable to load movies.'
    })
  }
})

app.post('/api/movies', requireLogin, async function(req, res) {
  try {
    const movie = req.body.movie?.trim()
    const genre = req.body.genre?.trim()
    const rating = Number(req.body.rating)

    if (
      !movie ||
      !genre ||
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 10
    ) {
      return res.status(400).json({
        error: 'Please enter a movie, genre, and rating from 1 to 10.'
      })
    }

    const newMovie = {
      username: req.session.username,
      movie: movie,
      genre: genre,
      rating: rating,
      recommendation: getRecommendation(rating)
    }

    const result = await movies.insertOne(newMovie)

    res.status(201).json({
      ...newMovie,
      _id: result.insertedId
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Unable to add movie.'
    })
  }
})

app.put('/api/movies/:id', requireLogin, async function(req, res) {
  try {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid movie ID.'
      })
    }

    const movie = req.body.movie?.trim()
    const genre = req.body.genre?.trim()
    const rating = Number(req.body.rating)

    if (
      !movie ||
      !genre ||
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 10
    ) {
      return res.status(400).json({
        error: 'Please enter a movie, genre, and rating from 1 to 10.'
      })
    }

    const updatedMovie = {
      movie: movie,
      genre: genre,
      rating: rating,
      recommendation: getRecommendation(rating)
    }

    const result = await movies.updateOne(
      {
        _id: new ObjectId(id),
        username: req.session.username
      },
      {
        $set: updatedMovie
      }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({
        error: 'Movie not found.'
      })
    }

    res.json({
      _id: id,
      username: req.session.username,
      ...updatedMovie
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Unable to update movie.'
    })
  }
})

app.delete('/api/movies/:id', requireLogin, async function(req, res) {
  try {
    const id = req.params.id

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid movie ID.'
      })
    }

    const result = await movies.deleteOne({
      _id: new ObjectId(id),
      username: req.session.username
    })

    if (result.deletedCount === 0) {
      return res.status(404).json({
        error: 'Movie not found.'
      })
    }

    res.json({
      message: 'Movie deleted successfully.'
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Unable to delete movie.'
    })
  }
})

app.delete('/api/movies', requireLogin, async function(req, res) {
  try {
    const result = await movies.deleteMany({
      username: req.session.username
    })

    res.json({
      message: 'Watchlist cleared successfully.',
      deletedCount: result.deletedCount
    })
  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Unable to clear watchlist.'
    })
  }
})


connectToDatabase()
  .then(function() {
    app.listen(port, function() {
      console.log(`Server running on port ${port}`)
    })
  })
  .catch(function(error) {
    console.error('MongoDB connection failed:', error)
  })