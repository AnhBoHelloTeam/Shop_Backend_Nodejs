const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        avatar: { type: String, default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGEZghB-stFaphAohNqDAhEaXOWQJ9XvHKJw&s" },
        role: { type: String, enum: ["user", "admin"], default: "user" },
        // danh hiệu thành việ
        membershipTier: {
            type: String,
            enum: ["Member" ,"Silver", "Gold", "Diamond"],
            default: "Member",
        },
        //tăng lên để phân dựa theo totalPrice của đơn hàng
        totalSpent:{
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
