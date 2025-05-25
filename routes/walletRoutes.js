const express = require("express");
const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const Notification = require("../models/Notification");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file JPEG, JPG hoặc PNG"));
    }
  },
});

const router = express.Router();

// Lấy thông tin ví của người dùng
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.userId;
    const userRole = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "User ID không hợp lệ" });
    }

    if (userRole !== "admin" && userId !== currentUserId) {
      return res.status(403).json({ message: "Bạn không có quyền xem ví này" });
    }

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
      await wallet.save();
    }

    res.status(200).json(wallet);
  } catch (error) {
    console.error("🔥 Lỗi khi lấy thông tin ví:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Nạp tiền vào ví
router.post("/deposit", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Số tiền nạp không hợp lệ" });
    }

    let wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      wallet = new Wallet({ user: userId, balance: 0, transactions: [] });
    }

    const transaction = {
      type: "deposit",
      amount,
      status: "completed",
      createdAt: new Date(),
    };

    wallet.transactions.push(transaction);
    wallet.balance += amount;
    await wallet.save();

    const notification = new Notification({
      user: userId,
      message: `Nạp ${amount.toLocaleString("vi-VN")} VNĐ vào ví thành công`,
      isRead: false,
    });
    await notification.save();

    req.socketIO.to(userId).emit("notification", {
      _id: notification._id,
      user: userId,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });

    res.status(200).json({ message: "Nạp tiền thành công", wallet });
  } catch (error) {
    console.error("🔥 Lỗi khi nạp tiền:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Admin tải lên mã QR
router.post("/qr", authMiddleware, adminMiddleware, upload.single("qrCode"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng tải lên mã QR" });
    }

    const qrCodeUrl = `/uploads/${req.file.filename}`;

    await Wallet.updateMany({}, { qrCode: qrCodeUrl });

    const notification = new Notification({
      user: null,
      message: "Mã QR thanh toán đã được cập nhật",
      isRead: false,
    });
    await notification.save();

    req.socketIO.to("admin").emit("notification", {
      _id: notification._id,
      user: null,
      message: notification.message,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });

    res.status(200).json({ message: "Tải mã QR thành công", qrCode: qrCodeUrl });
  } catch (error) {
    console.error("🔥 Lỗi khi tải mã QR:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Lấy mã QR hiện tại
router.get("/qr", authMiddleware, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.userId });
    const qrCode = wallet?.qrCode || null;

    if (!qrCode) {
      return res.status(404).json({ message: "Chưa có mã QR nào được thiết lập" });
    }

    res.status(200).json({ qrCode });
  } catch (error) {
    console.error("🔥 Lỗi khi lấy mã QR:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

module.exports = router;