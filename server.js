require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const morgan = require('morgan');
const express = require('express');
const app = express();
const session = require('express-session');
const bcrypt = require('bcryptjs'); // NOTE TO GRADER: Was having trouble with regular bycrypt package, but bycryptjs worked.

// Registers morgan middleware for logging HTTP requests
app.use(morgan('dev'));

// Registers JSON-parsing middleware
app.use(express.json());

// Registers session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // Users have to log in again after 1 day of inactivity
}));

// Middleware to check if user is logged in
function requireLogin(req, res, next) {
  if (!req.session.username) { // NOTE: This is set in POST /login middleware if the user successfully logs in
    res.status(401).json({ error: 'Unauthorized' });
  } else {
    next(); // Call next middleware function
  }
}

// Middleware for GET /app.html
// Uses requireLogin so that only logged-in users can access the app page
app.get('/app.html', requireLogin, (req, res) => {
  res.sendFile(__dirname + '/public/app.html');
});

// Makes sure that all requests to /lifts, /addLift, /deleteLift, and /updateLift can only be made by logged-in users
app.use(['/lifts', '/addLift', '/deleteLift', '/updateLift'], requireLogin);

// Registers static-file middleware
// This has to be last so it doesnt override any of the above middleware.
// If it was above, then requests to static files would be handled before logging in middleware, meaning users could access app.html without logging in.
app.use(express.static('public/'));

// NOTE: Weight will be in pounds, reps will be an integer, and ORM will be a float rounded to 2 decimal places.
let liftsCollection;
let usersCollection;

// ORM = One Rep Max
// Epley formula: ORM = weight * (1 + reps / 30)
const computeORM = function (weight, reps) {
  const unroundedORM = weight * (1 + reps / 30);
  const roundedORM = Math.round(unroundedORM * 100) / 100; // Round to 2 decimal places
  if (reps === 1) {
    return weight;
  }
  return roundedORM;
};

// Middleware for POST /login
app.post('/login', async (req, res) => {
  const data = req.body;
  const username = data.username;
  const password = data.password;

  // Look up if user exists
  const user = await usersCollection.findOne({ username });

  // If no user exists, then that means user is trying to sign in
  // STEPS
  // - Hash password
  // - Insert new user into DB {username, hashedPassword}
  // - Set session username to username
  // - Respond to client with a success flag true and newAccount flag true
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is a commonly used salt rounds value
    await usersCollection.insertOne({ username, hashedPassword });
    req.session.username = username;
    res.json({ success: true, newAccount: true, username: username });
  } else {
    // If user exists, then user is trying to log in
    // STEPS
    // - Compare password with hashedPassword (using bcrypt.compare())
    // - If matches, set session username to username and respond with a success flag true and newAccount flag false
    // - If doesn't match, respond with a success flag false and newAccount flag false
    const isMatch = await bcrypt.compare(password, user.hashedPassword); // NOTE: bycrypt.compare under the hood hashes the password (with hashedPassword's salt) and compares it to the hashedPassword
    if (isMatch) {
      req.session.username = username; // The moment this is called, a cookie is sent to client with session ID (specific to this user) and the server stores that pair of session ID and username.
      res.json({ success: true, newAccount: false, username: username });
    } else {
      res.json({ success: false, newAccount: false });
    }
  }
});

// Middleware for POST /logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true }); // Responds {success: true} to client after destroying session
  });
});

// Middleware for GET /lifts
app.get('/lifts', async (req, res) => {
  const liftsQuery = await liftsCollection.find({ username: req.session.username }).toArray(); // Queries DB for all lifts, converts to array
  res.json(liftsQuery); // Sets JSON content-type header and stringifies/sends the lifts array 
});

// Middleware for POST /addLift
app.post('/addLift', async (req, res) => {
  // Build new lift object, push to lifts array, and send back the whole array
  const data = req.body; // JSON-parsing middleware
  const newLift = {
    username: req.session.username,
    exercise: data.exercise,
    weight: data.weight,
    reps: data.reps,
    orm: computeORM(data.weight, data.reps)
  };
  await liftsCollection.insertOne(newLift); // Inserts new lift into DB
  const liftsQuery = await liftsCollection.find({ username: req.session.username }).toArray(); // Queries DB for all lifts, converts to array
  res.json(liftsQuery); // Sets JSON content-type header and stringifies/sends the lifts array back to client
});

// Middleware for POST /deleteLift
app.post('/deleteLift', async (req, res) => {
  const data = req.body; // JSON-parsing middleware
  const deleteID = new ObjectId(data.ID); // Converts string to ObjectId, MongoDB stores _id as type ObjectId
  await liftsCollection.deleteOne({ _id: deleteID, username: req.session.username }); // Deletes the lift from DB with the specified ID
  const liftsQuery = await liftsCollection.find({ username: req.session.username }).toArray(); // Queries DB for all lifts, converts to array
  res.json(liftsQuery); // Sets JSON content-type header and stringifies/sends the lifts array back to client
})

// Middleware for POST /updateLift
app.post('/updateLift', async (req, res) => {
  const data = req.body; // JSON-parsing middleware
  const updateID = new ObjectId(data.ID);
  const updatedFields = {
    exercise: data.exercise,
    weight: data.weight,
    reps: data.reps,
    orm: computeORM(data.weight, data.reps)
  }
  await liftsCollection.updateOne({ _id: updateID, username: req.session.username }, { $set: updatedFields })
  const liftsQuery = await liftsCollection.find({ username: req.session.username }).toArray(); // Queries DB for all lifts, converts to array
  res.json(liftsQuery); // Sets JSON content-type header and stringifies/sends the lifts array back to client
})

// Function template from MongoDB's Guide
async function run() {
  // Connect the client to the server	(optional starting in v4.7).
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("admin").command({ ping: 1 });
  console.log("Connected to DB");

  liftsCollection = client.db("a3-owen-nguyen").collection("lifts"); // Gets/creates lifts collections in DB
  usersCollection = client.db("a3-owen-nguyen").collection("users"); // Gets/creates users collection in DB

  // Starts listening for incoming requests
  app.listen(process.env.PORT || 3000);
}

run().catch(console.dir);