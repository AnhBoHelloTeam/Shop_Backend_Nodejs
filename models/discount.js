const mongoose = require("mongoose");

const DiscountSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    minOrderValue: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, required: true, min: 0 },
    minDiscount: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Discount", DiscountSchema);