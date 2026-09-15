require ('dotenv').config()

const express = require('express')
const session = require('cookie-session')
const app = express()
const { MongoClient, ObjectId } = require('mongodb')

app.use( express.urlencoded({ extended:true }) )
app.use(express.json())

app.use(session({
    name: 'session',
    keys: ['changeme-key-1', 'changeme-key-2']
}))

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@${process.env.HOST}`
const client = new MongoClient(uri)

let usersCollection = null
let todosCollection = null

async function run() {
    await client.connect()
    usersCollection = client.db('a3data').collection('users')
    todosCollection = client.db('a3data').collection('todos')
    console.log('connected to MongoDB')
}
run()

app.use((req, res, next) => {
    if (usersCollection !== null && todosCollection !== null) {
        next()
    } else {
        res.status(503).send('Server starting up, try again shortly')
    }
})


const addDerivedFields = function (item) {
    const daysbypriority = { high: 1, medium: 3, low: 7 }
    const daysToAdd = daysbypriority[item.priority] || 3
    const deadline = item.created + daysToAdd * 24 * 60 * 60 * 1000
    return { ...item, deadline }
}

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html')
})

app.post('/login', async (req, res) => {
    console.log('login attempt', req.body)
    const {username, password} = req.body
    const existingUser = await usersCollection.findOne({ username })

    if (existingUser) {
        if(existingUser.password === password) {
            req.session.login = true
            req.session.username = username
            res.redirect('/')
        }
        else {
            res.sendFile(__dirname + '/public/login.html')
        }
    }
    else {
        await usersCollection.insertOne({ username, password })
        req.session.login = true
        req.session.username = username
        req.session.newAccount = true
        res.redirect('/')
    }
})


app.use((req, res, next) => {
    if(req.session.login === true){
        next()
    }
    else {
        res.sendFile(__dirname + '/public/login.html')
    }
})

app.get('/api/todos', async (req, res) => {
    const todos = await todosCollection.find({username: req.session.username}).toArray()
    res.json(todos)
})

app.post('/add', async(req, res) => {
    const newTodo = addDerivedFields({
        username: req.session.username, // NEW — ties this todo to the logged-in user
        task: req.body.task,
        priority: req.body.priority,
        created: Date.now()
    })

    await todosCollection.insertOne(newTodo)
    const todos = await todosCollection.find({username: req.session.username}).toArray()
    res.json(todos)
})

app.post('/delete', async(req, res) => {
    await todosCollection.deleteOne({
        _id: new ObjectId(req.body.id),
        username: req.session.username
    })
    const todos = await todosCollection.find({ username: req.session.username }).toArray()
    res.json(todos)
})

app.post('/update', async (req, res) => {
    const updated = addDerivedFields({
        task: req.body.task,
        priority: req.body.priority,
        created: Number(req.body.created)
    })

    await todosCollection.updateOne(
        { _id: new ObjectId(req.body.id), username: req.session.username },
        { $set: { task: updated.task, priority: updated.priority, deadline: updated.deadline } }
    )

    const todos = await todosCollection.find({ username: req.session.username }).toArray()
    res.json(todos)
})

app.use(express.static('public'))
app.listen(process.env.PORT || 3000)

