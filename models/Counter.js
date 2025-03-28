const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
    model: { type: String, required: true, unique: true }, // Tên bảng (User, Product)
    count: { type: Number, default: 0 } // ID hiện tại
});

module.exports = mongoose.model("Counter", CounterSchema);
