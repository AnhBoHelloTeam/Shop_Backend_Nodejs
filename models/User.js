const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        avatar: { type: String, default: "https://example.com/default-avatar.png" },
        role: { type: String, enum: ["user", "admin"], default: "user" }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
