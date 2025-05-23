const express = require("express");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const { createDiscount, getDiscounts, updateDiscount, deleteDiscount, getAvailableDiscounts, applyDiscount } = require("../controllers/discountController");

const router = express.Router();

// Admin tạo mã giảm giá
router.post("/", authMiddleware, adminMiddleware, createDiscount);

// Admin xem danh sách mã giảm giá
router.get("/", authMiddleware, adminMiddleware, getDiscounts);

// Admin cập nhật mã giảm giá
router.put("/:id", authMiddleware, adminMiddleware, updateDiscount);

// Admin xóa mã giảm giá
router.delete("/:id", authMiddleware, adminMiddleware, deleteDiscount);

// Người dùng xem mã giảm giá khả dụng
router.post("/available", authMiddleware, getAvailableDiscounts);

// Người dùng áp dụng mã giảm giá
router.post("/apply", authMiddleware, applyDiscount);

module.exports = router;