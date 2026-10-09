const mongoose = require( 'mongoose' )

const PRIORITY_WINDOW_DAYS = { high: 1, medium: 3, low: 7 }

const todoSchema = new mongoose.Schema({
  owner:    { type: String, required: true },   // which user this todo belongs to
  task:     { type: String, required: true },
  priority: { type: String, enum: [ 'high', 'medium', 'low' ], default: 'medium' },
  created:  { type: Date, default: Date.now },
  deadline: { type: Date }
})

todoSchema.pre( 'save', function( next ) {
  const windowDays = PRIORITY_WINDOW_DAYS[ this.priority ]
  this.deadline = new Date( this.created.getTime() + windowDays * 24 * 60 * 60 * 1000 )
})

module.exports = mongoose.model( 'Todo', todoSchema )