const mongoose = require( 'mongoose' )
const taskSchema = new mongoose.Schema( {
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: [ 'high', 'medium', 'low' ],
    default: 'medium'
  },
  created: {
    type: String, // date stored as YYYY-MM-DD to match the front end
    required: true
  },
  deadline: {
    type: String, // derived field, computed server-side
    required: true
  }
} )

module.exports = mongoose.model( 'Task', taskSchema )
