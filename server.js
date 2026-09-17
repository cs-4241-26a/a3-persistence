require( 'dotenv' ).config()
const express = require ('express'),
    cookie = require('cookie-session'),
    { MongoClient, ObjectId } = require("mongodb"),
    app = express(),
    entries = []
    users = []

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.PASSWORD}@${process.env.HOST}`
const client = new MongoClient( uri )

app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use( cookie({
    name: 'session',
    keys: ['key1', 'key2']
}))
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

app.post('/login', async (req, res) =>{
    const {username, password} = req.body
    const user = await collection.findOne({username: username})
    if (user && user.password ===password){
        req.session.login = true
        req.session.username = user.username
        res.redirect('/main.html')
    } else{
        return res.status(401).json({ success: false, message: "Invalid username or password." })    }
})
app.get('/logout', async (req,res) =>{
    req.session = null
    return res.redirect('/')
})

app.post('/register', async (req, res) =>{
    const {username, password} = req.body
    const existingUser = await collection.findOne({ username: username })
    if (existingUser) {
        return res.status(400).json({ success: false, message: "Username is already taken." })
    }
    await collection.insertOne({username: username, password: password})
    return res.status(201).json({ success: true, message: "Account created successfully! You can now log in." })
})

app.use(function(req, res, next){
    if (req.session.login && req.session.login === true){
        next()
    } else{
        res.sendFile(__dirname + '/public/index.html')
    }
})

app.post('/submit', (req, res) => {
    const {yourname, assignmenttype, gradeletter, cmts} = req.body
    const formTable = client.db("dbName").collection("entries")
    
    const newEntry = {
        yourname: yourname,
        assignmenttype: assignmenttype,
        gradeletter: gradeletter,
        cmts: cmts,
        user: req.session.username
    }
    formTable.insertOne(newEntry)
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(entries))
})

app.get('/get-entries', async (req, res) => {
    const entriesCollection = client.db("dbName").collection("entries")
    const userEntries = await entriesCollection
    .find({ user: req.session.username })
            .toArray()

    return res.json(userEntries)
 
})

app.delete('/remove', async (req,res) =>{
    const {id} = req.body
    const entriesCollection = client.db("dbName").collection("entries")
    const removeEntry = await entriesCollection.deleteOne(
        {_id : new ObjectId(id)})
    return res.json(removeEntry)
})

app.put('/edit', async (req, res) =>{
    const { id, assignmenttype, gradeletter, cmts } = req.body
    const entriesCollection = client.db("dbName").collection("entries")
    const result = await entriesCollection.updateOne(
        { 
            _id: new ObjectId(id), 
        },
        { 
            $set: { 
                assignmenttype: assignmenttype,
                gradeletter: gradeletter,
                cmts: cmts
            } 
        }
    )
    return res.json({success: true})
})


async function run() {
    await client.connect()
    collection = await client.db("dbName").collection("users")
}

run().then(() => {
    app.listen(process.env.PORT || 3000)
})
