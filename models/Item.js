const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  frequency: { type: String, required: true },
  nextDue: { type: String, required: true }
});

module.exports = mongoose.model('Item', itemSchema);