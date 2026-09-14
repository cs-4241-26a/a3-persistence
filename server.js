require('dotenv').config()
const express = require('express'),
      cookie = require('cookie-session')
      app = express(),
      { MongoClient, ObjectId } = require("mongodb"),
      port = process.env.PORT || 3000
      publicFiles = ['/index.html', '/login-fail.html', '/new-account.html', '/css/main.css']

app.use(express.json())
app.use(express.urlencoded())
app.use(cookie({
    name: 'session',
    keys: ['xKu1T2k*4P%sVuZ!']
}))

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

//will be set by middleware on first request
let gameCollection
let userCollection

app.use(async (req, res, next) => {
    if (!gameCollection) { 
        gameCollection = await client.db("a3").collection("game-data")
        userCollection = await client.db("a3").collection("user-data")
    }
    next()
})

const login = async (req, res) => {
    const dbUser = await userCollection.findOne({ username: req.body.username })
    if(!dbUser) {
        res.redirect('new-account.html')
    }
    else if(dbUser.password === req.body.password) {
        req.session.login = true
        req.session.username = req.body.username
        res.redirect('main.html')
    }
    else {
        res.redirect('login-fail.html')
    }}

app.post('/login', login)

app.post('/register', async (req, res) => {
    const username = req.body.username
    const password = req.body.password
    if (!username || !password) { res.redirect('/register') }
    else {
        const id = await userCollection.insertOne({username, password})
        await login(req, res)
    }
})

//require the user to be logged in to access anything else
app.use((req, res, next) => {
    if(req.session.login) { next() }
    else if(publicFiles.includes(req.path)) { res.sendFile(__dirname + `/public/${req.path}`) }
    else { res.redirect('/index.html') }
})            

app.use(express.static('public'))

const setResult = (data) => {
    if(data.userScore > data.oppScore) { data.result = "Win" }
    else if(data.userScore < data.oppScore) { data.result = "Loss" }
    else { data.result = "Tie" }
}

const sendData = async (req, res) => {
    const userGames = await getGames(req.session.username)
    res.status(200).send(userGames)
}

const getGames = async (username) => {
    const games = await gameCollection.find({authName: username}).toArray()
    return games
}

const addGame = async (game) => {
    const id = await gameCollection.insertOne(game)
}

const deleteGame = async (deleteId) => {
    const result = await gameCollection.deleteOne({_id: new ObjectId(deleteId)})
}

const modifyGame = async (game) => {
    const modifyingId = game.modifyingId
    delete game.modifyingId //prevent it from getting pushed to db
    const query = { _id: new ObjectId(modifyingId) }
    const result = await gameCollection.replaceOne(query, game)
}

app.get('/games', sendData)

app.post('/submit', async (req, res) => {
    const game = req.body
    setResult(game)
    game.authName = req.session.username
    await addGame(game)
    await sendData(req, res)
})

app.post('/delete', async (req, res) => {
    const deleteId = req.body.id
    await deleteGame(deleteId)
    await sendData(req, res)
})

app.post('/modify', async (req, res) => {
    const game = req.body
    setResult(game)
    game.authName = req.session.username
    await modifyGame(game)
    await sendData(req, res)
})

app.listen(port)
console.log("Listening on port " + port)
