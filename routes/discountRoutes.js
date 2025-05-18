const express = require('express');
const router = express.Router();
const Discount = require('../models/discount');
const authMiddleware = require('../middleware/auth');

// Get available discounts
router.post('/available', authMiddleware, async (req, res) => {
  try {
    const { cartItems, totalPrice, currentDate } = req.body;

    if (!cartItems || !totalPrice || !currentDate) {
      return res.status(400).json({ message: 'Thiếu thông tin giỏ hàng hoặc ngày hiện tại' });
    }

    const now = new Date(currentDate);
    const discounts = await Discount.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      minOrderValue: { $lte: totalPrice },
      isActive: true,
    });

    res.status(200).json(discounts);
  } catch (error) {
    console.error('Lỗi khi lấy mã giảm giá:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy mã giảm giá' });
  }
});

// Apply discount code
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { code, cartItems, totalPrice } = req.body;

    if (!code || !cartItems || !totalPrice) {
      return res.status(400).json({ message: 'Thiếu thông tin mã giảm giá hoặc giỏ hàng' });
    }

    const now = new Date();
    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      startDate: { $lte: now },
      endDate: { $gte: now },
      minOrderValue: { $lte: totalPrice },
      isActive: true,
    });

    if (!discount) {
      return res.status(400).json({ message: 'Mã giảm giá không hợp lệ hoặc không áp dụng được' });
    }

    const discountAmount = (discount.percentage / 100) * totalPrice;
    const newTotalPrice = totalPrice - discountAmount;

    res.status(200).json({
      discountAmount,
      newTotalPrice,
    });
  } catch (error) {
    console.error('Lỗi khi áp dụng mã giảm giá:', error);
    res.status(500).json({ message: 'Lỗi server khi áp dụng mã giảm giá' });
  }
});

module.exports = router;