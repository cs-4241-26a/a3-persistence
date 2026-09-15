require("dotenv").config();

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const { auth, requiresAuth } = require("express-openid-connect");
const escape = require("escape-html");
const app = express();
const port = 3000;
const path = require("path");
const dir = path.join(__dirname, "public");
const client = new MongoClient(process.env.MONGODB_URI);
let db, items;

let appdata = [];
let nextId = 1;

function computePriority(item) {
  if (item.urgent) {
    return "High";
  }

  let today = new Date();
  let due = new Date(item.date);
  let diffDays = (due - today) / (1000 * 60 * 60 * 24);

  if (diffDays <= 3) return "High";
  if (diffDays <= 7) return "Medium";
  return "Low";
}

app.use(
  auth({
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
  }),
);

app.use(express.json());
app.get("/", requiresAuth(), (request, response) => {
  response.sendFile(path.join(__dirname, "public", "index.html"));
});
app.use(express.static(dir));

app.get("/data", requiresAuth(), async (request, response) => {
  const data = await items.find({ owner: request.oidc.user.sub }).toArray();
  response.json(data);
});

app.post("/data", requiresAuth(), async (request, response) => {
  const item = request.body;
  item.owner = request.oidc.user.sub;
  item.priority = computePriority(item);

  const result = await items.insertOne(item);
  item._id = result.insertedId;

  const data = await items.find({ owner: request.oidc.user.sub }).toArray();
  response.json(data);
});

app.put("/data", requiresAuth(), async (request, response) => {
  const updated = request.body;
  const id = updated._id;
  delete updated._id;

  updated.owner = request.oidc.user.sub;
  updated.priority = computePriority(updated);

  await items.updateOne({ _id: new ObjectId(id) }, { $set: updated });

  const data = await items.find({ owner: request.oidc.user.sub }).toArray();
  response.json(data);
});

app.delete("/data", requiresAuth(), async (request, response) => {
  const idToDelete = request.body;

  await items.deleteOne({ _id: new ObjectId(idToDelete) });
  const data = await items.find({ owner: request.oidc.user.sub }).toArray();
  response.json(data);
});

app.use(function (request, response) {
  response.status(404).send("404 Error: File Not Found");
});

async function startServer() {
  await client.connect();
  db = client.db("a3database");
  items = db.collection("items");
  console.log("Connected to MongoDB");

  app.listen(process.env.PORT || port, () => {
    console.log("Server listening on port", process.env.PORT || port);
  });
}

startServer();
