const cookies = require('cookie-session')
const {MongoClient} = require("mongodb")
const path = require('path')

/**
 * Attempts to add a new user to the databse. If successful, calls next()
 * @param {MongoClient} mongoConnection 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
const createNewUser = async function(mongoConnection, req, res, next){
    console.log('Request to create new user:')
    console.log(req.body)
    const players = mongoConnection.db('math-app').collection('players')

    const duplicate = await players.findOne({username: req.body.username})
    if (duplicate !== null){
        //Duplicate player username found.
        console.log('Cannot create new user with duplicate username: ' + req.body.username)
        res.redirect(`/register.html?user=${req.body.username}`)
    }
    else{
        //Actually add the data
        let newPlayer = {
            username: req.body.username, 
            correct_guesses: 0,
            total_guesses: 0
        }
        
        if (req.body.firstname !== '')
            newPlayer.firstname = req.body.firstname
        if (req.body.lastname !== '')
            newPlayer.lastname = req.body.lastname
        if (req.body.password !== '')
            newPlayer.password = req.body.password

        const result = await players.insertOne(newPlayer)

        if (result.acknowledged === true)
            next()
        else{
            console.log('ERROR: Could not insert new user into database')
            res.redirect('login.html')
        }
        
    }
}

/**
 * 
 * @param {MongoClient} mongoConnection 
 * @param {Request} req 
 * @param {Response} res 
 * @param {function} next 
 */
const attemptLogin = async function (mongoConnection, req, res, next) {
    const players = mongoConnection.db('math-app').collection('players')
    const targetPlayer = await players.findOne({username: req.body.username})

    // Check if Username Exists
    if (targetPlayer === null){
        console.log("NO USER FOUND: LOGIN FAILED")
        res.attempData = req.body
        res.redirect(`/login.html?fail=nouser&user=${req.body.username}`)
    }

    // Check if password is correct
    if (targetPlayer.password === undefined || req.body.password === targetPlayer.password){
        console.log("LOGIN SUCCESSFUL")
        req.session.login = true
        req.session.username = req.body.username
        res.redirect('../game.html')
    }
    else{
        console.log('INCORRECT PASSOWRD: LOGIN FAILED')
        res.redirect(`/login.html?fail=password&user=${req.body.username}`)
    }
}

/**
 * 
 * @param {MongoClient} mongoConnection 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const modifyUser = async function (mongoConnection, req, res, next){
    const players = mongoConnection.db('math-app').collection('players')
    const targetPlayer = await players.findOne({username: req.session.username})

    //Test if new Username equals another player's username
    const duplicate = await players.findOne({username: req.body.username})
    if (duplicate !== null && duplicate.username !== targetPlayer.username){
        console.log('ERROR: This username is already used')
        res.attempData = req.body
        res.redirect(`/changeinfo.html?user=${req.body.username}`)
    }
    
    //Actually Modify User's data
    else{
        console.log('ATTEMPTING TO MODIFY USER DATA')
        let update = {$set: {username: req.body.username}, $unset:{}}
        if (req.body.firstname === '')
            update.$unset.firstname = ''
        else
            update.$set.firstname = req.body.firstname
        
        if (req.body.lastname === '')
            update.$unset.lastname = ''
        else
            update.$set.lastname = req.body.lastname

        if (req.body.password === '')
            update.$unset.password = ''
        else
            update.$set.password = req.body.password
        
        console.log(update)

        await players.updateOne({username: req.session.username}, update)
        req.session.username = req.body.username
        res.redirect('/game.html')
    }
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @param {Function} next 
 */
const unauthRedirect = function(req, res, next){
    console.log(req.session)
    if (req.session.login === true){
        next()
    }
    else{
        res.redirect('login.html')
    }
}

const logout = function(req, res, next){
    console.log('attempting to log out user')
    req.session = null
    res.redirect('/login.html')
}

module.exports = {unauthRedirect, attemptLogin, logout, modifyUser, createNewUser}