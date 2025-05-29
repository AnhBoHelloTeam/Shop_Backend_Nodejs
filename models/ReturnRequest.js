const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reason: { type: String, required: true },
  image: { type: String }, // URL ảnh minh chứng
  requestedAt: { type: Date, default: Date.now },
  processedAt: { type: Date },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin xử lý
});

module.exports = mongoose.models.ReturnRequest || mongoose.model('ReturnRequest', returnRequestSchema);