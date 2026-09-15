const mongoose = require( 'mongoose' )

const reviewSchema = new mongoose.Schema({
    username: { type: String, required: true },
    displayName: { type: String, rquired: true },
    profilePicURL : { type: String },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, required: true }
})

module.exports = mongoose.model('Review', reviewSchema)