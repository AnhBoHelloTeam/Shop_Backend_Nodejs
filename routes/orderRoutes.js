const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Discount = require("../models/discount");
const User = require("../models/User");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const { confirmOrder, confirmDelivery, requestReturn, createReview, getReviews, getOrders, updateOrderStatus } = require("../controllers/orderController");

const router = express.Router();

// Đặt hàng từ giỏ hàng (có áp dụng mã giảm giá)
router.post("/checkout", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { discountCode } = req.body;

    if (userRole === "admin") {
      return res.status(403).json({ message: "Admin không thể mua hàng" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "User ID không hợp lệ" });
    }

    let cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống, không thể đặt hàng" });
    }

    let totalPrice = 0;
    for (const item of cart.items) {
      if (!item.product || typeof item.product.price !== "number") {
        return res.status(400).json({ message: "Sản phẩm không hợp lệ trong giỏ hàng" });
      }
      totalPrice += item.product.price * item.quantity;
    }

    if (totalPrice <= 0) {
      return res.status(400).json({ message: "Tổng giá trị đơn hàng không hợp lệ" });
    }

    let discountAmount = 0;
    let appliedDiscount = { code: null, amount: 0 };

    if (discountCode) {
      const discount = await Discount.findOne({
        code: discountCode.toUpperCase(),
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      });

      if (!discount) {
        return res.status(400).json({ message: "Mã giảm giá không hợp lệ hoặc đã hết hạn" });
      }

      if (totalPrice < discount.minOrderValue) {
        return res.status(400).json({ message: `Đơn hàng phải từ ${discount.minOrderValue} để áp dụng mã này` });
      }

      discountAmount = (totalPrice * discount.percentage) / 100;
      if (discount.maxDiscount !== Infinity && discountAmount > discount.maxDiscount) {
        discountAmount = discount.maxDiscount;
      }
      if (discountAmount < discount.minDiscount) {
        discountAmount = discount.minDiscount;
      }

      appliedDiscount = { code: discount.code, amount: discountAmount };
    }

    const newOrder = new Order({
      user: userId,
      items: cart.items,
      totalPrice: totalPrice - discountAmount,
      discount: appliedDiscount,
    });

    await newOrder.save();
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({ message: "Đặt hàng thành công", order: newOrder });
  } catch (error) {
    console.error("🔥 Lỗi khi đặt hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Admin lấy danh sách tất cả đơn hàng
router.get("/", authMiddleware, adminMiddleware, getOrders);

// Lấy lịch sử đơn hàng (admin hoặc người dùng)
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole === "admin") {
      const orders = await Order.find()
        .populate("user", "name email")
        .populate("items.product", "name image price")
        .sort({ createdAt: -1 });
      if (!orders.length) {
        return res.status(200).json({ message: "Chưa có đơn hàng nào" });
      }
      return res.status(200).json(orders);
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "User ID không hợp lệ" });
    }

    const orders = await Order.find({ user: userId })
      .populate("user", "name email")
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });
    if (!orders.length) {
      return res.status(200).json({ message: "Chưa có đơn hàng nào" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("🔥 Lỗi khi lấy lịch sử đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Lấy đơn hàng theo trạng thái
router.get("/status/:status", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { status } = req.params;

    const validStatuses = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled", "returned"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    let query = {};
    if (status !== "all") {
      query.status = status;
    }
    if (userRole !== "admin") {
      query.user = userId;
    }

    const orders = await Order.find(query)
      .populate("user", "name email")
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(200).json({ message: "Chưa có đơn hàng nào" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("🔥 Lỗi khi lấy đơn hàng theo trạng thái:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Admin cập nhật trạng thái đơn hàng
router.put("/:id/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    order.status = status;
    await order.save();

    // Cập nhật thứ hạng thành viên nếu đơn hàng hoàn thành
    if (status === "delivered") {
      const user = await User.findById(order.user);
      if (!user) {
        return res.status(404).json({ message: "Không tìm thấy người dùng" });
      }

      // Cập nhật totalSpent
      user.totalSpent = (user.totalSpent || 0) + order.totalPrice;
      await user.save();

      // Đếm số đơn hàng delivered
      const deliveredOrders = await Order.countDocuments({
        user: order.user,
        status: "delivered",
      });

      // Debug
      console.log(`📡 [Admin Update] User ${user._id}: totalSpent=${user.totalSpent}, deliveredOrders=${deliveredOrders}`);

      // Kiểm tra và cập nhật membershipTier
      let newTier = user.membershipTier;
      if (deliveredOrders >= 30 && user.totalSpent >= 240000) {
        newTier = "Diamond";
      } else if (deliveredOrders >= 20 && user.totalSpent >= 160000) {
        newTier = "Gold";
      } else if (deliveredOrders >= 10 && user.totalSpent >= 80000) {
        newTier = "Silver";
      } else {
        newTier = "Member";
      }

      if (newTier !== user.membershipTier) {
        user.membershipTier = newTier;
        await user.save();
        console.log(`📡 User ${user._id} upgraded to ${newTier}`);
      } else {
        console.log(`📡 User ${user._id} remains at ${user.membershipTier}`);
      }
    }

    res.json({ message: "Cập nhật trạng thái đơn hàng thành công", order });
  } catch (error) {
    console.error("🔥 Lỗi khi cập nhật trạng thái đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Admin xác nhận đơn hàng
router.put("/confirm/:id", authMiddleware, adminMiddleware, confirmOrder);

// Người dùng xác nhận nhận hàng
router.put("/deliver/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền xác nhận đơn hàng này" });
    }

    if (order.status !== "shipped") {
      return res.status(400).json({ message: "Đơn hàng chưa được giao để xác nhận" });
    }

    order.status = "delivered";
    await order.save();

    // Cập nhật thứ hạng thành viên
    const user = await User.findById(order.user);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.totalSpent = (user.totalSpent || 0) + order.totalPrice;
    await user.save();

    const deliveredOrders = await Order.countDocuments({
      user: order.user,
      status: "delivered",
    });

    console.log(`📡 [User Confirm] User ${user._id}: totalSpent=${user.totalSpent}, deliveredOrders=${deliveredOrders}`);

    let newTier = user.membershipTier;
    if (deliveredOrders >= 30 && user.totalSpent >= 240000) {
      newTier = "Diamond";
    } else if (deliveredOrders >= 20 && user.totalSpent >= 160000) {
      newTier = "Gold";
    } else if (deliveredOrders >= 10 && user.totalSpent >= 80000) {
      newTier = "Silver";
    } else {
      newTier = "Member";
    }

    if (newTier !== user.membershipTier) {
      user.membershipTier = newTier;
      await user.save();
      console.log(`📡 User ${user._id} upgraded to ${newTier}`);
    } else {
      console.log(`📡 User ${user._id} remains at ${user.membershipTier}`);
    }

    res.json({ message: "Xác nhận nhận hàng thành công", order });
  } catch (error) {
    console.error("🔥 Lỗi khi xác nhận nhận hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Người dùng yêu cầu trả hàng
router.put("/return/:id", authMiddleware, requestReturn);

// Người dùng đánh giá sản phẩm
router.post("/review", authMiddleware, createReview);

// Lấy danh sách đánh giá của sản phẩm
router.get("/review/:productId", getReviews);

module.exports = router;