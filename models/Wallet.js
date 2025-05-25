const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["deposit"], required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
});

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  balance: { type: Number, default: 0, min: 0 },
  transactions: [transactionSchema],
  qrCode: { type: String }, // Lưu đường dẫn đến mã QR
});

module.exports = mongoose.model("Wallet", walletSchema);