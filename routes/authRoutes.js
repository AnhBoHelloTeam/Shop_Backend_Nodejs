const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Đăng ký tài khoản
// router.post("/register", async (req, res) => {
//     try {
//         const { name, email, password, phone, address, avatar, role } = req.body;

//         if (!["user", "admin"].includes(role)) {
//             return res.status(400).json({ message: "Invalid role" });
//         }

//         let user = await User.findOne({ email });
//         if (user) return res.status(400).json({ message: "Email đã tồn tại" });

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const newUser = new User({
//             name,
//             email,
//             password: hashedPassword,
//             phone,
//             address,
//             avatar,
//             role
//         });

//         await newUser.save();
//         res.status(201).json({ message: "Đăng ký thành công", user: newUser });
//     } catch (error) {
//         res.status(500).json({ message: "Lỗi server" });
//     }
// });
// Đăng ký tài khoản
router.post("/register", async (req, res) => {
    try {
        let { name, email, password, phone, address, avatar, role } = req.body;

        // Kiểm tra thiếu thông tin
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ name, email và password" });
        }

        // Kiểm tra định dạng email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }

        // Kiểm tra mật khẩu ít nhất 6 ký tự
        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }

        // Gán giá trị mặc định là "user" nếu không có role
        role = role || "user";

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Kiểm tra email đã tồn tại chưa
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
// router.post("/login", async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });
//         if (!user) return res.status(400).json({ message: "Invalid credentials" });

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//         const token = jwt.sign(
//             { userId: user._id, role: user.role },
//             process.env.JWT_SECRET,
//             { expiresIn: "1h" }
//         );

//         res.json({ token, user });
//     } catch (error) {
//         res.status(500).json({ message: "Server error" });
//     }
// });
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra thiếu thông tin
        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
        }

        // Kiểm tra định dạng email hợp lệ
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }

        // Kiểm tra xem email có tồn tại trong DB không
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Tài khoản không tồn tại" });
        }

        // Kiểm tra mật khẩu có khớp không
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Sai mật khẩu" });
        }

        // Tạo token JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Đăng nhập thành công", token, user });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});


module.exports = router;
