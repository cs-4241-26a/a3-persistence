"use strict"
/*
Security considerations + broken features (maybe fix?) !!!!

- user checks only occur on dataview but not data modification so
other users can modify other's data if they have the database ID (lol)

- Re-directs dont work (i tried fixing and couldnt get it to work)

- Serialization is based on the github id, but this is inadvisable
because it would prevent other providers from working... maybe switch to something
platfrom agnostic like the mongodb id but its too late lol


*/
// Imports
const express = require( 'express' ),
app = express(),
{ MongoClient, ServerApiVersion, ObjectId } = require('mongodb'),
http = require( 'dotenv' ).config(),
uri = process.env.MONGODB_URI,
passport = require('passport'),
GitHubStrategy = require('passport-github2').Strategy,
session = require('express-session'),
compression = require('compression'),
favicon = require('serve-favicon'),
path = require('path'),
morgan = require('morgan')

// legacy stuff
// might want to rewrite for better logic later but this can carry over
const calc_urgency = function (due, length) {
    let dateEntered = new Date(due);
    let dateNow = Date.now()

    // time left to do work
    let timeUntil = (dateEntered - dateNow) + (dateEntered.getTimezoneOffset() * 60 * 1000)

    let daysMs = function(days) {
        return days * 24 * 60 * 60 * 1000
    }
    // console.log(dateEntered)
    // console.log(dateNow)
    // console.log(timeUntil)

    let urgency = (due === "") ? "N/A" : "Low"

    const urgencyBias = {
        "Short": +2,
        "Normal": 0,
        "Long": -3
    };

    let bias_ms = (daysMs(urgencyBias[length]))
        // console.log(`BIAS: ${length}`)

    if (timeUntil < 0) {
        urgency = "Overdue"
    }
    else if (timeUntil + bias_ms < daysMs(1)) {
        urgency = "Danger"
    }
    else if (timeUntil + bias_ms < daysMs(3)) {
        urgency = "High"
    }
    else if (timeUntil + bias_ms < daysMs(7)) {
        urgency = "Normal"
    }

    return urgency
}


// Defined middleware
const logger = (req,res,next) => {
    console.log( 'url:', req.url )
    next()
}

// Registering general middleware or whatnot
// app.use( logger )
app.use(favicon('public/favicon.ico'));
app.use(compression());
app.use(session({ secret: process.env.PASSPORT_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use( express.static( 'public' ) )
app.use(morgan('combined'));


// app.use( ensureAuthenticated, express.static( 'app.html' ) )


// DB init
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
})
let collection = null
let users = null

// app.use( (req,res,next) => {
// if( collection !== null || users !== null) {
//     next()
// }else{
//     res.status( 503 ).send()
// }
// })


// from example code
app.get('/auth/github',
passport.authenticate('github', { scope: [ 'user:email' ] }));

// from example code
app.get('/auth/github/callback', 
passport.authenticate('github', { failureRedirect: '/' }),
function(req, res) {
    res.redirect('/app.html');
});

async function run() {
    await client.connect()
    collection = await client.db("todo").collection("items")
    users = await client.db("todo").collection("users")
    console.log('Connected to DB')

    console.log(process.env.GITHUB_CLIENTID)
    console.log(process.env.GITHUB_CLIENTSECRET)
    // auth callback and user search

    // from example code
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // from example code
    passport.deserializeUser(async function(obj, done) {
        const user = await users.findOne({ id: obj })
        console.log(`Deserializing: ${obj} --> ${JSON.stringify(user)}`)
        done(null, user);
    });
    
    // from example code
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENTID,
        clientSecret: process.env.GITHUB_CLIENTSECRET,
        callbackURL: "https://a3-dennisliu.onrender.com/auth/github/callback"
    },
    async function(accessToken, refreshToken, profile, done) {
        // console.log(JSON.stringify(profile))
        let user_obj = {id: profile.id, username: profile.username}
        const user = await users.findOne({ id: profile.id })

        if (!user) {
            const result = await users.insertOne( user_obj )
        }

        done(null, user_obj)
    }
    ));

    // Registering GET middleware
    app.get('/entries', ensureAuthenticated, async (req, res) => {
        if (collection !== null) {
            const docs = await collection.find({user: req.user.id}).toArray()
            res.json( docs )
        }
    })

    // from example code
    app.get('/logout', function(req, res, next){
        req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect('/');
        });
    });

    app.get('/user/username', function(req, res) {
        res.json(req.user.username)
    })
    
    // app.get("/docs", async (req, res) => {
    //     if (collection !== null) {
    //     const docs = await collection.find({}).toArray()
    //     res.json( docs )
    //     }
    // })

    // Registering POST middleware
    app.post( '/submit', ensureAuthenticated, express.json(), async ( req, res ) => {
        // new JSON Format => (_id, name, duration, urgency, due)
        // -1 id == new entry
        // empty name == delete entry
        console.log(`Submit: ${JSON.stringify( req.body )}`)
        if (req.body.id === -1) {
            // Add
            req.body.urgency = calc_urgency(req.body.due, req.body.duration)
            req.body.user = req.user.id
            console.log(`ADDING FOR USER ${JSON.stringify(req.user)})`)
            delete req.body.id
            const result = await collection.insertOne( req.body )
            // res.json( result )
            // appdata.push(req.body)
        }
        else if (req.body.name === "") {
            const result = await collection.deleteOne({ 
                _id:new ObjectId( req.body.id ) 
            })
        }
        else {
            // Edit
            const result = await collection.updateOne(
                { _id: new ObjectId( req.body.id ) },
                { $set:{ name:req.body.name, 
                    duration:req.body.duration,
                    due: req.body.due,
                    urgency:calc_urgency(req.body.due, req.body.duration) } }
            )
            // entryOverwrite(req.body.id, req.body.name, req.body.duration, req.body.due)
        }

        // res.writeHead( 200, { 'Content-Type': 'application/json'})
        // res.end( JSON.stringify( appdata ) )
        if (collection !== null) {
            const docs = await collection.find({user: req.user.id}).toArray()
            res.json( docs )
        }
    })
}

// open DB connection
run()

// Start listening for requests
app.listen( process.env.PORT || 3000 )

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}