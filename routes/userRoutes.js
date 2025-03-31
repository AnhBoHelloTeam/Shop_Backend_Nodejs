const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// 📌 Lấy danh sách tất cả người dùng (Chỉ admin)
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Ẩn mật khẩu
        res.json(users);
    } catch (error) {
        console.error("🔥 Lỗi khi lấy danh sách người dùng:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// 📌 Lấy thông tin người dùng theo ID (Chỉ admin hoặc chính user đó)
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Kiểm tra xem ID có hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID người dùng không hợp lệ" });
        }

        const user = await User.findById(id).select("-password");

        // ✅ Kiểm tra nếu không tìm thấy user
        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        // ✅ Kiểm tra quyền truy cập
        if (req.user.role !== "admin" && req.user.userId !== user._id.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền xem thông tin này" });
        }

        res.json(user);
    } catch (error) {
        console.error("🔥 Lỗi khi lấy thông tin người dùng:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
});

module.exports = router;
