const express = require('express') //for express
const cookie  = require('cookie-session') //for cookies
const loadenvfile = require('process') //for loading .env
const { MongoClient, ObjectId } = require("mongodb") //for mongodb
const favicon = require('serve-favicon') //for serving favicon
const path = require('path') //helps with favicon
const morgan = require('morgan') //http request logger
const compression = require('compression') //compresses http files sent
const responseTime = require('response-time') //adds response time to http header

const app = express()

//NEEDED for localhost. but can't be there for render
//process.loadEnvFile() //puts stuff from .env into process.env

// adds the time that the server spent thinking to the header of http responses sent to the client
app.use(responseTime())
//logs http requests to the console for debugging
app.use(morgan('tiny'))
//serves favicon if the request is for that
app.use(favicon(path.join(__dirname, 'public', 'lilcalc.png')))
//compresses all http responses for better network speed
app.use(compression())
// use express.urlencoded to get data sent by defaut form actions
//  or GET requests. used for cookies. 
app.use( express.urlencoded({ extended:true }) )
// cookie middleware! The keys are used for encryption and have been changed
app.use( cookie({
  name: 'session',
  keys: [process.env.COOKIEKEY1, process.env.COOKIEKEY2]
}))

// add some middleware that always sends unauthenicaetd users to the login page
app.use( function( req,res,next) {
    if( req.session.login === true ) {
        next()
    }
    else {
        //if the user isn't logged in
        if (req.originalUrl === "/main.html") { //trying to go to the main page w/o a username
            res.sendFile( __dirname + '/public/index.html' ) //prevent that, make them log in
        } else { //trying to get any other file unauthenticated (ex. index.js)
            next() //allowed, because otherwise my javascript file would be overridden by index.html
        }
    }
})

//makes the "public" directory available to send files from. 
app.use( express.static( 'public' ) )

app.post( '/login', async (req,res)=> {
    // express.urlencoded will put your key value pairs 
    // into an object, where the key is the name of each
    // form field and the value is whatever the user entered
    console.log( req.body )

    const userdata = await collection.findOne({username: {$eq: req.body.username}})
    console.log(userdata)

    if (userdata === null) {
        //no user in the database with that name
        //send back to login page with an error of status=nouser
        res.redirect('index.html?status=nouser')
    } else if( req.body.password === userdata.password ) {
        // define a variable that we can check in other middleware
        // the session object is added to our requests by the cookie-session middleware
        req.session.login = true
        req.session.username = req.body.username
        
        // since login was successful, send the user to the main content
        // use redirect to avoid authentication problems when refreshing
        // the page or using the back button, for details see:
        // https://stackoverflow.com/questions/10827242/understanding-the-post-redirect-get-pattern 
        res.redirect( 'main.html' )
    } else {
        // user found, but password doesn't match
        //send back to login page with an error of status=wrongpassword
        res.redirect('index.html?status=wrongpassword')
    }
})

app.post( '/newacc', async (req,res)=> {
    // req.body.username, .password, .passwordconfirm present in request
    console.log( req.body )

    //check if there's already a user with that username
    const userdata = await collection.findOne({username: {$eq: req.body.username}})
    console.log(userdata)

    if (userdata !== null) {
        //there's already a user named that
        //send them back to login with an error message
        res.redirect('index.html?status=userexists')
    } else if( req.body.password !== req.body.passwordconfirm ) {
        //password doesn't match in both fields
        //send them back to login with an error message
        res.redirect( 'index.html?status=passwordmismatch' )
    } else {
        //username doesn't already exist, password matches. perfect. 
        //create a new mongodb entry for the new guy
        const adduser = await collection.insertOne({
            "username": req.body.username, 
            "password": req.body.password, 
            "data": {}, 
            "editedLast": false, 
            "illustriousness": 0, 
            "nextID": 0
        })
        //send them back to the login screen with a prompt to log in with that new user
        res.redirect('index.html?status=usercreated')
    }
})

app.post('/submit', async (req, res) => {
    //get request data into a string
    let dataString = ''
    req.on( 'data', function( data ) {
        dataString += data 
    })
    req.on( 'end', async function() {
        //dataString now contains the request data in a way we can access
        //turn it into a json object
        jsonresult = JSON.parse( dataString )
        console.log(jsonresult)

        //GET MONGODB STUFF
        const userdata = await collection.findOne({"username": req.session.username})
            
        if ('n1' in jsonresult) { //ADD NEW ENTRY:
            editedLast = false
            //parse json entries into floating point numbers
            const n1 = parseFloat(jsonresult.n1)
            const n2 = parseFloat(jsonresult.n2)
            let optype = ""
            let illustriousnessNew = userdata.illustriousness
            //check what type of calculation it will be
            if (isNaN(n1) || isNaN(n2)) {
                optype = "nan"
                jsonresult["res"] = "NaN"
                illustriousnessNew -= 1
            } else if ((n1 < 0) && (n2 < 0)) {
                optype = "two negatives"
                jsonresult["res"] = "(UNKNOWN)"
                illustriousnessNew -= 2
            } else if ((n1 < 0) || (n2 < 0)) {
                optype =  "one negative"
                jsonresult["res"] = "(UNKNOWN)"
                illustriousnessNew -= 1
            } else {
                optype = "regular"
                jsonresult["res"] = n1 * n2 + (2 * (Math.random() - 0.5))
                illustriousnessNew += 1
            }
            //generate an illustrious comment
            jsonresult["comment"] = illustriousComment(optype, illustriousnessNew, userdata.editedLast)
            //push new data to mongodb
            const pushData = await collection.updateOne(
                {"username": req.session.username}, 
                {"$set": 
                    {[`data.${userdata.nextID}`]: jsonresult, //add in new entry
                    "illustriousness": illustriousnessNew, //update illustriousness
                    "nextID": userdata.nextID + 1, //make next id one larger (because we just used an id for the new entry)
                    "editedLast": false} //un-set editedLast, because it's no longer true once a new entry has been added. 
                }
            )
        } else if ('delete' in jsonresult) { //DELETE AN ENTRY:
            //"update" the user's data to un-set that entry's value
            const deleteData = await collection.updateOne(
                {"username": req.session.username}, 
                {"$unset": {[`data.${jsonresult.delete}`]: ""}}
            )
        } else if ('editid' in jsonresult) { //EDIT AN ENTRY
            //change "res" value in an entry. also, decrease illustriousness and set editedLast. 
            const editeData = await collection.updateOne(
                {"username": req.session.username}, 
                {"$set": 
                    {[`data.${jsonresult.editid}.res`]: jsonresult.newVal, 
                    "illustriousness": userdata.illustriousness - 2, 
                    "editedLast": true}
                }
            )
        }

        //even if the data won't parse, return the current state of the server
        res.writeHead( 200, "OK", {'Content-Type': 'text/plain' })

        // change this to incorporate data
        const newdata = await collection.findOne({"username": req.session.username})
        res.end(JSON.stringify(newdata.data))
    })
})

//returns a string: the calculator's comment on a particular calculation
//type is what the calculation was like. can be "nan", "one negative", "two negatives", or "regular"
//illustriousness is the calculator's mood (integer), editedLast is whether a field was edited after the last calculation (boolean)
const illustriousComment = function(type, illustriousness, editedLast) {
    if (editedLast) {
        return "you edited one of my calculations...did i do something wrong?"
    } 
    else if (type === "nan") {
        if (illustriousness >= 3) {return "one of these isn't a number, but we all make mistakes sometimes. "}
        else if (illustriousness >= 0) {return "sorry, just can't calculate with non-numbers. "}
        else {return "they're not even numbers...what am i supposed to do..."}
    }
    else if (type === "one negative") {
        if (illustriousness >= 3) {return "a negative number? sorry, i have to step away for a moment"}
        else if (illustriousness >= 0) {return "it's negative? oh no. i'm sorry about this..."}
        else {return "what kind of calculator can't handle a negative number? i'm a failure..."}
    }
    else if (type === "two negatives") {
        if (illustriousness >= 3) {return "two? two negative numbers? i need a coffee break. "}
        else if (illustriousness >= 0) {return "they're so negative...i never stood a chance..."}
        else {return "both are negative numbers...i don't even want to think about them..."}
    }
    else if (type === "regular") {
        if (illustriousness >= 3) {return "i love calculating numbers!"}
        else if (illustriousness >= 0) {return "ahh, nice pure calculating."}
        else {return "thank god, normal numbers."}
    }
    else {
        return "oh no. "
    }
}

//set up mongodb
const uri = process.env.MONGODB_URI
const client = new MongoClient( uri )
let collection = null
//connects to mongodb
async function run() {
    await client.connect()
    collection = await client.db("dbmain").collection("users")
}
run() //actually runs the above connection code

//middleware to ensure that mongodb collection is still there
// if not working, send an error
app.use( (req,res,next) => {
    if( collection !== null ) {
        //normal case. collection is there
        next()
    } else {
        //abnormal case. collection is null, this is bad. send an error
        res.status(503).send()
    }
})

app.listen( process.env.PORT )