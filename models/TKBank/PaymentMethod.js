const mongoose = require('mongoose');

const paymentMethodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['bank', 'ewallet'] },
  details: { type: String, required: true },
  qrCodeUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);