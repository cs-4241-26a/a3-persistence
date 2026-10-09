const express = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

const router = express.Router()

router.post( '/login', async (request, response) => {
  const { username, password } = request.body
  
  if (!username || !password) {
    return response.status(400).json({ message: 'Username and password are required' })
  }

  let user = await User.findOne({ username })
  let isNewAccount = false

  if (!user) {
    // If the user does not exist, create a new account
    const passwordHash = await bcrypt.hash(password, 10)
    user = await User.create({username, passwordHash })
    isNewAccount = true
  }else{
    const passwordValid = await bcrypt.compare(password, user.passwordHash)
    if (!passwordValid) {
      return response.status(400).json({ message: 'Invalid password' })
    }
  }

  request.session.username = user.username
  response.json({username: user.username, isNewAccount})})

router.post( '/logout', function(request, response){
    request.session.destroy(function() {
        response.json ({ok: true})
    })
} )

router.get( '/api/me', function( request, response ) {
  if( !request.session.username ) return response.status( 401 ).json({ error: 'not logged in' })
  response.json({ username: request.session.username })
})

module.exports = router