const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Discount = require("../models/discount");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");
const {
  confirmOrder,
  confirmDelivery,
  requestReturn,
  createReview,
  getReviews,
  getOrders,
  updateOrderStatus,
  approveReturn,
  rejectReturn,
} = require("../controllers/orderController");
const multer = require("multer");
const path = require("path");

// Cấu hình multer để lưu ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/return_images/");
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
    }
    cb(new Error("Chỉ chấp nhận file JPEG hoặc PNG"));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const router = express.Router();

// Đặt hàng từ giỏ hàng (có áp dụng mã giảm giá)
router.post("/checkout", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { discountCode, paymentMethod } = req.body;

    if (userRole === "admin") {
      return res.status(403).json({ message: "Admin không thể mua hàng" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "User ID không hợp lệ" });
    }

    if (!paymentMethod || !["COD", "CARD"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
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
      paymentMethod,
      status: "pending",
    });

    await newOrder.save();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const shortId = newOrder._id.toString().substring(0, 8);
    const notification = new Notification({
      user: userId,
      message: `Đơn hàng #${shortId} đã được tạo, đang chờ xác nhận`,
      order: newOrder._id,
      isRead: false,
    });
    await notification.save();

    req.socketIO.to(userId).emit("notification", {
      _id: notification._id,
      user: userId,
      message: notification.message,
      order: newOrder._id,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });

    const adminNotification = new Notification({
      user: null,
      message: `Đơn hàng #${shortId} mới được tạo bởi ${user.name}`,
      order: newOrder._id,
      isRead: false,
    });
    await adminNotification.save();

    req.socketIO.to("admin").emit("notification", {
      _id: adminNotification._id,
      user: null,
      message: adminNotification.message,
      order: newOrder._id,
      isRead: false,
      createdAt: adminNotification.createdAt,
    });

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

    const validStatuses = ["all", "pending", "confirmed", "shipped", "delivered", "cancelled", "returned", "return_requested"];
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
router.put("/:id/status", authMiddleware, adminMiddleware, updateOrderStatus);

// Admin xác nhận đơn hàng
router.put("/confirm/:id", authMiddleware, adminMiddleware, confirmOrder);

// Người dùng xác nhận nhận hàng
router.put("/deliver/:id", authMiddleware, confirmDelivery);

// Người dùng yêu cầu trả hàng
router.put("/return/:id", authMiddleware, upload.single("image"), requestReturn);

// Admin duyệt yêu cầu trả hàng
router.put("/return/:id/approve", authMiddleware, adminMiddleware, approveReturn);

// Admin từ chối yêu cầu trả hàng
router.put("/return/:id/reject", authMiddleware, adminMiddleware, rejectReturn);

// Người dùng đánh giá sản phẩm
router.post("/review", authMiddleware, createReview);

// Lấy danh sách đánh giá của sản phẩm
router.get("/review/:productId", getReviews);

// Đồng bộ thứ hạng thành viên
router.post("/sync-membership", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "User ID không hợp lệ" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const deliveredOrders = await Order.countDocuments({
      user: userId,
      status: "delivered",
    });

    const orders = await Order.find({ user: userId, status: "delivered" });
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    console.log(`📡 [Sync Membership] User ${user._id}: totalSpent=${totalSpent}, deliveredOrders=${deliveredOrders}`);

    let newTier = user.membershipTier;
    if (deliveredOrders >= 30 && totalSpent >= 240000) {
      newTier = "Diamond";
    } else if (deliveredOrders >= 20 && totalSpent >= 160000) {
      newTier = "Gold";
    } else if (deliveredOrders >= 10 && totalSpent >= 80000) {
      newTier = "Silver";
    } else {
      newTier = "Member";
    }

    if (newTier !== user.membershipTier) {
      user.membershipTier = newTier;
      user.totalSpent = totalSpent;
      await user.save();
      console.log(`📡 User ${user._id} upgraded to ${newTier}`);
    } else {
      console.log(`📡 User ${user._id} remains at ${user.membershipTier}`);
    }

    res.json({ message: "Đồng bộ thứ hạng thành công", membershipTier: newTier });
  } catch (error) {
    console.error("🔥 Lỗi khi đồng bộ thứ hạng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

module.exports = router;