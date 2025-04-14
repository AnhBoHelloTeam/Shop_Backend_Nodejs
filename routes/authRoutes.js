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
router.post("/register", async (req, res) => {
    try {
        let { name, email, password, phone, address, avatar, role } = req.body;

        console.log("📥 Nhận dữ liệu đăng ký:", { name, email, password, phone, address, avatar, role });

        // 1. Kiểm tra name
        if (!name || name.trim() === "") {
            const msg = "Vui lòng nhập họ tên";
            console.log("❌", msg);
            return res.status(400).json({ error: msg });
        }

        // 2. Kiểm tra email
        if (!email || email.includes(" ")) {
            const msg = "Email không được để trống hoặc chứa khoảng trắng";
            console.log("❌", msg);
            return res.status(400).json({ error: msg });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const msg = "Email không hợp lệ";
            console.log("❌", msg);
            return res.status(400).json({ error: msg });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const msg = "Email đã tồn tại";
            console.log("❌", msg);
            return res.status(400).json({ error: msg });
        }

        // 3. Kiểm tra password
        if (!password || password.includes(" ") || password.length < 6) {
            const msg = "Mật khẩu không hợp lệ (phải >= 6 ký tự, không khoảng trắng)";
            console.log("❌", msg);
            return res.status(400).json({ error: msg });
        }

        // 4. Kiểm tra confirmPassword (nếu có)
        if (!req.body.confirmPassword || req.body.confirmPassword !== password) {
            const msg = "Mật khẩu xác nhận không khớp";
            console.log("❌", msg);
            return res.status(400).json({ error: msg });
        }

        // 5. Kiểm tra address
        if (!address || address.trim() === "") {
            const msg = "Vui lòng nhập địa chỉ";
            console.log("❌", msg);
            return res.status(400).json({ error: msg });
        }

        // 6. Kiểm tra phone nếu có
        if (phone && !/^\d{9,12}$/.test(phone)) {
            const msg = "Số điện thoại không hợp lệ (chỉ số, 9-12 chữ số)";
            console.log("❌", msg);
            return res.status(400).json({ error: msg });
        }

        // 7. Kiểm tra role (user/admin)
        role = role || "user";
        if (!["user", "admin"].includes(role)) {
            const msg = "Vai trò không hợp lệ";
            console.log("❌", msg);
            return res.status(400).json({ error: msg });
        }

        // 8. Tạo user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            avatar: avatar || "https://default-avatar.com/img.png",
            role
        });

        await newUser.save();
        console.log("✅ Đăng ký thành công:", newUser._id);
        res.status(201).json({ message: "Đăng ký thành công", user: newUser });

    } catch (error) {
        console.error("❗ Lỗi server:", error.message);
        res.status(500).json({ error: "Lỗi server" });
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
        let { email, password } = req.body;

        // Xóa khoảng trắng đầu và cuối
        email = email.trim();
        password = password.trim();

        // Kiểm tra thiếu thông tin
        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
        }

        // ✅ Kiểm tra khoảng trắng ở giữa (sau khi đã trim)
        if (email.includes(' ') || password.includes(' ')) {
            return res.status(400).json({ message: "Email và mật khẩu không được chứa khoảng trắng ở giữa" });
        }

        // Kiểm tra độ dài mật khẩu
        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
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
