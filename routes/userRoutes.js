const express = require("express");
const User = require("../models/User");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// Chỉ Admin mới có quyền xem danh sách tất cả người dùng
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Ẩn mật khẩu
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// Xem thông tin người dùng theo ID (chỉ admin hoặc chính user đó mới xem được)
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        // Chỉ admin hoặc chính người dùng mới có thể xem thông tin
        if (req.user.role !== "admin" && req.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền xem thông tin này" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server" });
    }
});

// Xuất router
module.exports = router;
