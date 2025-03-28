const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// 📌 Đặt hàng từ giỏ hàng
router.post("/checkout", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Lấy giỏ hàng của user
        let cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng trống, không thể đặt hàng." });
        }

        // Tính tổng tiền
        const totalPrice = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

        // Tạo đơn hàng mới
        const newOrder = new Order({
            user: userId,
            items: cart.items,
            totalPrice
        });

        await newOrder.save();

        // Xóa giỏ hàng sau khi đặt hàng thành công
        await Cart.findOneAndDelete({ user: userId });

        res.status(201).json({ message: "Đặt hàng thành công!", order: newOrder });
    } catch (error) {
        console.error("\ud83d\udd25 Lỗi khi đặt hàng:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// 📌 Xem lịch sử đơn hàng của user
router.get("/history", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

        if (!orders.length) {
            return res.status(200).json({ message: "Chưa có đơn hàng nào." });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error("\ud83d\udd25 Lỗi khi lấy lịch sử đơn hàng:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

module.exports = router;
