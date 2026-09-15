import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import passport from "passport";
import bcrypt from 'bcrypt'
import { Strategy as LocalStrategy } from "passport-local";
import session from 'express-session';

const port = 3000;
const app = express();

dotenv.config({ path: "atlas-credentials.env" });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ConnectDB = async () => {
    try{
        await client.connect();
        console.log("Connected");
    }catch(e){
        console.error(e);
    }
}

await ConnectDB();
const db  = client.db("4432COLLECTION");

// Serve files from the public folder
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}))

app.use(passport.initialize());
app.use(passport.session());

app.post('/api/submit-expense', async(req, res) => {
    const expense = {
        "expenseDate": req.body.expenseDate,
        "expenseName": req.body.expenseName,
        "expenseAmount": req.body.expenseAmount,
        "expenseCategory": req.body.expenseCategory,
        "expenseDescription": req.body.expenseDescription,
        "userId": req.user.username,
    };

    console.log("user: ",req.user.username); // logged-in user

    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
    }

    console.log("BODY:", req.body);
    console.log("EXPENSE:", expense);

    try {
        const expenses = await db.collection("expenses");
        await expenses.insertOne(expense);
    }catch(err) {
        console.error(err);
    }

    // Send a response back to the client
    res.status(200).json({
        status: "success",
        message: "Data successfully received!",
    });
});

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try{
            // Check username/password here
            const users = db.collection("logins");
            const user = await users.findOne({ username: username });

            if (!user) {
                return done(null, false);
            }

            const validPassword = await bcrypt.compare(password, user.password);

            if (!validPassword) {
                return done(null, false);
            }

            return done(null, user);
        }catch(e){
            return done(e);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async(id, done) => {
    try{
        const users = db.collection("logins");
        const user = await users.findOne({
            _id: new ObjectId(id)
        });

        if (!user) {
            return done(null, false);
        }

        done(null, user);
    }catch(e){
        return done(e);
    }
})

app.post(
    "/authenticate",
    passport.authenticate("local"),
    (req, res) => {
        res.json({
            success: true,
            username: req.user.username
        });
    }
);

//TODO: change to returning a list of expenses to display
app.get("/expenses", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            message: "Not logged in"
        });
    }

    const expenses = await db.collection("expenses").find({userId: req.user.username }).project({
        userId: 0,
        _id: 0
    }).toArray();
    res.send(expenses);
});

app.post("/register", async(req, res) => {
    const username = req.body.username;
    const password = await bcrypt.hash(req.body.password, 10);

    const loginInfo = {
        "username": username,
        "password": password
    };

    const users = db.collection("logins");
    const user = await users.findOne({ username: username });
    if (!user) {
        await users.insertOne(loginInfo);
        res.send(200)
    }else{
        res.status(500).json({
            message: "Signup failed"
        });
    }
})

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});