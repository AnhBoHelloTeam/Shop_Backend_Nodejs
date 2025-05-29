const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  discount: {
    code: { type: String },
    amount: { type: Number, default: 0 },
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "shipped", "delivered", "returned", "cancelled"],
    default: "pending",
  },
  returnRequest: {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", null],
      default: null,
    },
    reason: { type: String },
    image: { type: String }, // URL ảnh minh chứng
    requestedAt: { type: Date },
    processedAt: { type: Date },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin xử lý
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);