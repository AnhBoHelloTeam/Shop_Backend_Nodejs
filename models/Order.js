const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
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
    paymentMethod: { type: String, enum: ["COD", "CARD"], required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "returned", "cancelled", "return_requested"],
      default: "pending",
    },
    returnReason: { type: String, default: null },
    returnImage: { type: String, default: null },
    returnRequestedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    returnRejectionReason: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Order || mongoose.model("Order", OrderSchema);