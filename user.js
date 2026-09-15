const mongoose = require( 'mongoose' )

const userSchema = new mongoose.Schema({
    githubId: { type: String, required: true },
    username: { type: String, required: true },
    displayName: { type: String, required: true }
})

module.exports = mongoose.model('User', userSchema)