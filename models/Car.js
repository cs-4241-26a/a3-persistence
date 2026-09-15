const mongoose = require( 'mongoose' )

const carSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  mpg: { type: Number, required: true },
  fuelType: { type: String, enum: [ 'Gasoline', 'Diesel', 'Electric', 'Hybrid' ], default: 'Gasoline' },
  notes: { type: String, trim: true, default: '' },
  favorite: { type: Boolean, default: false }
})

module.exports = mongoose.model( 'Car', carSchema )
