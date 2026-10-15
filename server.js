require('dotenv').config({ path: 'atlas-credentials.env' })

const express = require('express')
const {MongoClient, ObjectId} = require('mongodb')
const app = express()
const port = 3000

app.use(express.json())
app.use(express.static('public'))

const uri = process.env.MONGODB_URI
if (!uri) {
  throw new Error('MONGODB_URI is not set. Check atlas-credentials.env.')
}

const client = new MongoClient(uri)

let db;
let bricks;

async function startServer() {
  await client.connect()
  
  console.log('Connected to MongoDB Atlas')
   
  
  db = client.db("brickWall") // Use the "brickWall" database
  bricks = db.collection('bricks')
  users = db.collection('users')

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  });
}

//Login and if no user exists, create a new user with the given username and password
app.post('/api/login', async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }

    const user = await users.findOne({ username })
    console.log(username, password, user)
    if (!user) {
      const result = await users.insertOne({ username, password })
      return res.status(201).json({ message: 'New user created', userID: result.insertedId.toString() })
    }

    const passwordCorrect = password === user.password

    if (!passwordCorrect) {
      return res.status(400).json({ message: 'Invalid password' })
    }

    return res.json({ message: 'Login successful', userID: user._id.toString() })
  } catch (error) {
    console.error('Error logging in:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

app.post('/api/bricks', async (req, res) => {
  
  try{

    const newBrick = {
      id: req.body.id,
      title: req.body.title,
      body: req.body.body,
      parentID: req.body.parentID || -1, // Default to -1 if not provided
      userID: req.body.userID || null // Default to null if not provided
    }

    const result = await bricks.insertOne(newBrick);
    res.status(201).json({
      newBrick
    })

  } catch (error) {
    console.error('Error creating brick:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

app.get('/api/bricks', async (req, res) => {

  try{
    const allBricks = await bricks.find().toArray()

    res.json(allBricks)
  } catch (error) {
    console.error('Error fetching bricks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

})
//await bricks.deleteOne({ id: brickID });
app.delete('/api/bricks', async (req, res) => {
  try {
    const deletingUserID = req.body.userID
    await bricks.deleteMany({
      userID: deletingUserID
    })
    res.json({ message: 'All bricks deleted successfully' });
  } catch (error) {
    console.error('Error deleting brick:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put("/api/bricks/:id", async (req,res) => {

  const id = Number(req.params.id);

  console.log("Editing brick:",id);

  const result = await bricks.updateOne(
    {id: id},
    {
      $set: {
        title: req.body.title,
        body: req.body.body
      }
    }
  );

  res.json(result);
});

(async function() {
  await startServer()

})()
/*
await startServer().catch((error) => {
  console.error('Unable to start server:', error)
  process.exitCode = 1
})*/

