require("dotenv").config()
// Express const
const express = require( 'express' ),
    cookie = require( 'cookie-session' ),
    favicon = require( 'serve-favicon' ),
    path = require( 'path' ),
    bodyParser = require('body-parser'),
    app = express(),
    user = "" 

// Cookies middleware:
app.use( cookie({
  name: 'login',
  keys: [process.env.KEY1, process.env.KEY2],
  // Save for 1 hour
  signed: true,
  httpOnly: false,
  maxAge: 60 * 60 * 1000
}))

// Have an Icon!
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')))

// Pre-parse the json in functions! Sorry express but we hae a new thing that does this!
app.use(bodyParser.json())
//app.use( express.json() )

// Mongo DB stuff
const { MongoClient, ServerApiVersion } = require('mongodb')
const uri = `mongodb+srv://${process.env.MY_USERNAME}:${process.env.PASSWORD}@${process.env.DATABASE_URL}/?appName=CS4241-Webware` 
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

async function run() {
    await client.connect()
    // route to get all docs for a user
    app.get("/docs", async (req, res) => {
        
        // check cookies before returning a clients info
        // Req.session returns an object, but the only cookie we care about is the login one
        // So turn it into an array with Object.entries filter for just that one
        // and then its [0] since its only thing in array and [1] because we only care about the value
        const authenticatedUser = Object.entries(req.session).filter(([cookie, value]) => cookie == `login`)[0][1]
        if (authenticatedUser != null) {
            //return collection of just that clients info
            collection = await client.db("datatest").collection(authenticatedUser)
            if (collection !== null) {
                const docs = await collection.find({}).toArray()
                res.json( docs )
            }
            else {
                // This situation would be an error in the database call
                // I don't have a solution for somthing is wrong on thier end, so just return nothing
                res.json( {} )
            }
        }
        else {
            res.json(JSON.stringify(["Your login seems to have timed out please log in"]) )
        }
    })

    app.post( '/submit', async (req, res) => {
        
        // same thing as above for getting the user
        const authenticatedUser = Object.entries(req.session).filter(([cookie, value]) => cookie == `login`)[0][1]
        if (authenticatedUser != null) {
            // Mess with just your data
            collection = await client.db("datatest").collection(authenticatedUser)
            // Do whatever option was given in submit
            if (req.body.option == "Change Username") {
                // Without mongodb verion 8.1 can't really support changing collection name to do this
                // If it turned strict off I could call stuff from that, but that seemed to make the database be slow when I tried onces
                // But we can call the user whatever they want to be called
                const result = await collection.updateOne({
                    "username": { $exists: true }}, {
                    $set:{ 
                        "username":req.body.newUsername
                    }
                })
            }
            else if (req.body.option == "Change Password") {
                //change password stored in collection
                const result = await collection.updateOne({
                    "password": { $exists: true }}, {
                    $set:{ 
                        "password":req.body.newPassword
                    }
                })
            }
            else if (req.body.option == "Change Profile Picture") {
                //change picture stored in collection
                //You do not have to have a pfp, but if so it will be stored in same doc as username and password
                const result = await collection.updateOne({
                    "username": { $exists: true }}, {
                    $set:{ 
                        "pfp":req.body.pfp
                    }
                })

            }
            else if (req.body.option == "Add Score") {
                //add game score pair to collection
                const result = await collection.insertOne({
                    "game": req.body.game, 
                    "highscore": req.body.highscore
                })
                // return result of this call to db
                res.writeHead( 200, { 'Content-Type': 'application/json' })
                res.end( JSON.stringify( result ) )
            }
            else if (req.body.option == "Modify Score") {
                //modify score for game
                const result = await collection.updateOne({
                    "game":req.body.game}, {
                    $set:{ 
                        "highscore":req.body.highscore
                    }
                })
                // return result of this call to db
                res.writeHead( 200, { 'Content-Type': 'application/json' })
                res.end( JSON.stringify( result ) )
            }
            else if (req.body.option == "Delete Score") {
                //remove game and score from collection
                const result = await collection.deleteOne({ 
                    "game":req.body.game
                })
                // return result of this call to db
                res.writeHead( 200, { 'Content-Type': 'application/json' })
                res.end( JSON.stringify( result ) )    
            }
        }
        else {
            res.writeHead( 403, { 'Content-Type': 'application/json' })
            res.end( JSON.stringify( "Your Login Has Timed Out Please Log In" ) )
        }
    })

    app.post( '/login', async (req, res) => {
        
        // same as above for getting user
        //const authenticatedUser = Object.entries(req.session).filter(([cookie, value]) => cookie == `login`)[0][1]
        if (req.body.username != "") {
            //return collection
            collection = await client.db("datatest").collection(req.body.username)
            const passwordToCheck = await collection.findOne({"password": { $exists: true }} )
            if (req.body.mode === 'Login') {
                if (passwordToCheck == null) {
                    res.writeHead( 401, { 'Content-Type': 'application/json' })
                    res.end( JSON.stringify( "That Account Does Not Exist, Please Check Your Username" ) )
                }
                //Check password
                else if (req.body.password == passwordToCheck.password ) {
                    req.session.login = req.body.username
                    res.writeHead( 200, { 'Content-Type': 'application/json' })
                    res.end( JSON.stringify( "Login Sucessfull" ) )
                }
                else {
                    res.writeHead( 401, { 'Content-Type': 'application/json' })
                    res.end( JSON.stringify( "Login Failed, Please Check Your Password" ) )
                }
            }
            else {
                // check that there is not existing account with this username
                if (passwordToCheck == null) {
                    // create password
                    const result = await collection.insertOne({
                        "username": req.body.username,
                        "password": req.body.password
                    })
                    // log in
                    req.session.login = req.body.username
                    res.writeHead( 200, { 'Content-Type': 'application/json' })
                    res.end( JSON.stringify( 'Login Sucessfull' ) )
                }
                else {
                    res.writeHead( 403, { 'Content-Type': 'application/json' })
                    res.end( JSON.stringify('There is already an account with that username, Please choose a unique username' ) )
                }
            }
        }
        else{
            res.writeHead( 400, { 'Content-Type': 'application/json' })
            res.end( JSON.stringify('Username can not be blank' ) )
        }
    })

    app.post( '/logout', (req, res) => {
        req.session.login = null
        res.writeHead( 200, { 'Content-Type': 'application/json' })
        res.end( JSON.stringify( "Logout Sucessfull" ) )
    })

}

run()

app.use( express.static('public') )

app.listen( process.env.PORT || 3000 )