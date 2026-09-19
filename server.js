require('dotenv').config()

const express = require('express'),
{ MongoClient, ObjectId } = require('mongodb'),
bcrypt = require('bcryptjs'),
compression = require('compression'),
cookieParser = require('cookie-parser'),
cors = require('cors'),
morgan = require('morgan'),
responseTime = require('response-time'),
app = express()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASS}@${process.env.HOST}/?retryWrites=true&w=majority`
const client = new MongoClient(uri)

let collection = null
let users = null

async function connect() {
    await client.connect()
    collection = await client.db("readingtracker").collection("books")
    users = await client.db("readingtracker").collection("users")
}

connect()

app.use(compression())
app.use(cookieParser())
app.use(cors())
app.use(morgan('dev'))
app.use(responseTime())

app.get('/', (req, res) => {
    res.redirect('/login.html')
})

app.use( express.static( 'public') )
app.use( express.json() )

app.use((req, res, next) => {
    if (collection !== null && users !== null) {
        next()
    } else {
        res.status(503).send()
    }
})

app.get('/data', async (req, res) => {
    const userId = req.query.userId

    const books = await collection.find({
        userId: userId
    }).toArray()
    
    res.json(books)
})

app.post('/login', async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    
    let user = await users.findOne({ username: username })
    
    if (user === null) {
        const hashedPassword = await bcrypt.hash(password, 10)

        const result = await users.insertOne({
            username: username,
            password: hashedPassword
        })
        
        res.json({
            success: true,
            created: true,
            userId: result.insertedId
        })
    } else {
        const passwordMatches = await bcrypt.compare(password, user.password)

        if(passwordMatches) {
            res.json({
                success: true,
                created: false,
                userId: user._id
        })
    } else {
        res.json({
            success: false
        })
    }
}
})

app.post('/submit', async (req, res) => {
    const newBook = req.body
    delete newBook._id

    newBook.percentComplete = Math.round(
        (newBook.pagesRead / newBook.totalPages) * 100
    )

    const result = await collection.insertOne(newBook)

    res.json(result)
})

app.post('/delete', async (req, res) => {
    const result = await collection.deleteOne({
        _id: new ObjectId(req.body._id),
        userId: req.body.userId
    })

    res.json(result)
})

app.post('/update', async (req, res) => {
    const result = await collection.updateOne(
        { 
            _id: new ObjectId(req.body._id),
            userId: req.body.userId },
        {
            $set: {
                book: req.body.book,
                author: req.body.author,
                pagesRead: req.body.pagesRead,
                totalPages: req.body.totalPages,
                status: req.body.status,
                format: req.body.format,
                genre: req.body.genre,
                rating: req.body.rating,
                notes: req.body.notes,
                percentComplete: Math.round(
                    (req.body.pagesRead / req.body.totalPages) * 100
                )
            }
        }
    )
    res.json(result)
})
                
app.listen(process.env.PORT || 3000)