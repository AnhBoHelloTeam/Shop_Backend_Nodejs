const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Đăng ký tài khoản
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone, address, avatar, role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email đã tồn tại" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            avatar,
            role
        });

        await newUser.save();
        res.status(201).json({ message: "Đăng ký thành công", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// Đăng nhập
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
