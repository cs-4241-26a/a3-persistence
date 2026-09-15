require("dotenv").config();

const express = require("express"),
  { MongoClient, ObjectId } = require("mongodb"),
  app = express();

const session = require("express-session");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@${process.env.HOST}`;
// check for sanity
console.log("uri:", uri);
const client = new MongoClient(uri);

let collection = null;

async function run() {
  await client.connect();
  collection = client.db("a3").collection("data");
}

// session
app.use(
  session({ secret: "secret-garden", resave: false, saveUninitialized: false }),
);

app.use((req, res, next) => {
  if (collection !== null) {
    next();
  } else {
    res.status(503).send();
  }
});

// requests
app.post("/submit", async (req, res) => {
  const result = await collection.insertOne({
    title: req.body.title,
    message: req.body.message,
    drink: req.body.drink,
    date: req.body.date,
    userID: req.session.userId,
  });
  res.json(result);
});

app.get("/data", async (req, res) => {
  if (collection !== null) {
    const data = await collection
      .find({ userID: req.session.userId })
      .toArray();
    res.json(data);
  }
});

// assumes req.body takes form { _id:5d91fb30f3f81b282d7be0dd } etc.
app.delete("/delete", async (req, res) => {
  const result = await collection.deleteOne({
    _id: new ObjectId(req.body._id),
  });

  res.json(result);
});

app.put("/update", async (req, res) => {
  const result = await collection.updateOne(
    { _id: new ObjectId(req.body._id) },
    {
      $set: {
        title: req.body.title,
        message: req.body.message,
        drink: req.body.drink,
        date: req.body.date,
      },
    },
  );

  res.json(result);
});

// if user's username does not exist, registers a new account
app.post("/login", async (req, res) => {
  const name = req.body.username;
  const pass = req.body.password;
  const user = await collection.findOne({ username: name });

  if (user != null) {
    if (user.password === pass) {
      req.session.userId = user._id.toString();
      return res.redirect("/home.html");
    } else {
      return res.status(401).send("invalid login");
    }
  } else {
    const newUser = await collection.insertOne({
      username: name,
      password: pass,
    });
    req.session.userId = newUser.insertedId.toString();
    return res.status(201).json(newUser);
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("error logging out");
    }

    res.redirect("/");
  });
});

run();
app.listen(process.env.PORT || 3000);
