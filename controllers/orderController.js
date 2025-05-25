const mongoose = require("mongoose");
const Order = require("../models/Order");
const Review = require("../models/review");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { io } = require("../server");

const sendNotification = async (userId, orderId, message, isAdmin = false) => {
  try {
    const notification = new Notification({
      user: isAdmin ? null : userId,
      message,
      order: orderId,
      isRead: false,
    });
    await notification.save();

    if (!isAdmin) {
      io.to(userId.toString()).emit("notification", notification);
    }
    io.to("admin").emit("notification", notification);
  } catch (error) {
    console.error("🔥 Lỗi khi gửi thông báo:", error);
  }
};

// Admin lấy danh sách tất cả đơn hàng
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });
    if (!orders.length) {
      return res.status(200).json({ message: "Chưa có đơn hàng nào" });
    }
    res.status(200).json(orders);
  } catch (error) {
    console.error("🔥 Lỗi khi lấy danh sách đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách đơn hàng", error: error.message });
  }
};

// Admin cập nhật trạng thái đơn hàng
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "returned", "cancelled", "return_requested"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    order.status = status;
    if (status === "delivered") {
      order.deliveredAt = new Date();
    }
    await order.save();

    const user = await User.findById(order.user);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const shortId = order._id.toString().substring(0, 8);
    const statusMessages = {
      pending: `Đơn hàng #${shortId} đang chờ xác nhận`,
      confirmed: `Đơn hàng #${shortId} đã được xác nhận`,
      shipped: `Đơn hàng #${shortId} đang được vận chuyển`,
      delivered: `Đơn hàng #${shortId} đã được giao`,
      returned: `Đơn hàng #${shortId} đã được trả lại`,
      cancelled: `Đơn hàng #${shortId} đã bị hủy`,
      return_requested: `Đơn hàng #${shortId} đang chờ duyệt trả hàng`,
    };

    await sendNotification(order.user, order._id, statusMessages[status]);
    await sendNotification(null, order._id, `Đã cập nhật trạng thái đơn hàng #${shortId} của ${user.name} thành ${status}`, true);

    res.status(200).json({ message: "Cập nhật trạng thái đơn hàng thành công", order });
  } catch (error) {
    console.error("🔥 Lỗi khi cập nhật trạng thái đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật trạng thái", error: error.message });
  }
};

// Admin xác nhận đơn hàng
exports.confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Đơn hàng không ở trạng thái chờ xác nhận" });
    }

    order.status = "confirmed";
    await order.save();

    const user = await User.findById(order.user);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const shortId = order._id.toString().substring(0, 8);
    await sendNotification(order.user, order._id, `Đơn hàng #${shortId} đã được xác nhận`);
    await sendNotification(null, order._id, `Đã xác nhận đơn hàng #${shortId} của ${user.name}`, true);

    res.json({ message: "Xác nhận đơn hàng thành công", order });
  } catch (error) {
    console.error("🔥 Lỗi khi xác nhận đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Người dùng xác nhận nhận hàng
exports.confirmDelivery = async (req, res) => {
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
    order.deliveredAt = new Date();
    await order.save();

    const user = await User.findById(order.user);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const shortId = order._id.toString().substring(0, 8);
    await sendNotification(userId, order._id, `Đơn hàng #${shortId} đã được giao`);
    await sendNotification(null, order._id, `${user.name} đã xác nhận nhận đơn hàng #${shortId}`, true);

    res.json({ message: "Xác nhận nhận hàng thành công", order });
  } catch (error) {
    console.error("🔥 Lỗi khi xác nhận nhận hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Người dùng yêu cầu trả hàng
exports.requestReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { reason } = req.body;
    const image = req.file ? `/uploads/return_images/${req.file.filename}` : null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return res.status(400).json({ message: "Lý do trả hàng không hợp lệ" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.user.toString() !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền yêu cầu trả hàng" });
    }

    if (order.status !== "delivered") {
      return res.status(400).json({ message: "Đơn hàng phải ở trạng thái đã giao để trả hàng" });
    }

    if (!order.deliveredAt) {
      return res.status(400).json({ message: "Đơn hàng chưa có ngày giao hàng" });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (order.deliveredAt < sevenDaysAgo) {
      return res.status(400).json({ message: "Đơn hàng đã quá 7 ngày kể từ khi giao, không thể trả hàng" });
    }

    order.status = "return_requested";
    order.returnReason = reason;
    order.returnImage = image;
    order.returnRequestedAt = new Date();
    await order.save();

    const user = await User.findById(order.user);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const shortId = order._id.toString().substring(0, 8);
    await sendNotification(userId, order._id, `Yêu cầu trả hàng cho đơn hàng #${shortId} đã được gửi (lý do: ${reason})`);
    await sendNotification(null, order._id, `${user.name} yêu cầu trả đơn hàng #${shortId} (lý do: ${reason})`, true);

    res.json({ message: "Yêu cầu trả hàng thành công, đang chờ duyệt", order });
  } catch (error) {
    console.error("🔥 Lỗi khi yêu cầu trả hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Admin duyệt yêu cầu trả hàng
exports.approveReturn = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.status !== "return_requested") {
      return res.status(400).json({ message: "Đơn hàng không ở trạng thái chờ duyệt trả hàng" });
    }

    order.status = "returned";
    await order.save();

    const user = await User.findById(order.user);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const shortId = order._id.toString().substring(0, 8);
    await sendNotification(order.user, order._id, `Yêu cầu trả hàng cho đơn hàng #${shortId} đã được duyệt`);
    await sendNotification(null, order._id, `Đã duyệt yêu cầu trả hàng của ${user.name} cho đơn hàng #${shortId}`, true);

    res.json({ message: "Duyệt yêu cầu trả hàng thành công", order });
  } catch (error) {
    console.error("🔥 Lỗi khi duyệt yêu cầu trả hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Admin từ chối yêu cầu trả hàng
exports.rejectReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
    }

    if (!rejectionReason || typeof rejectionReason !== "string" || rejectionReason.trim().length === 0) {
      return res.status(400).json({ message: "Lý do từ chối không hợp lệ" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    if (order.status !== "return_requested") {
      return res.status(400).json({ message: "Đơn hàng không ở trạng thái chờ duyệt trả hàng" });
    }

    order.status = "delivered";
    order.returnRejectionReason = rejectionReason;
    await order.save();

    const user = await User.findById(order.user);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const shortId = order._id.toString().substring(0, 8);
    await sendNotification(order.user, order._id, `Yêu cầu trả hàng cho đơn hàng #${shortId} bị từ chối (lý do: ${rejectionReason})`);
    await sendNotification(null, order._id, `Đã từ chối yêu cầu trả hàng của ${user.name} cho đơn hàng #${shortId} (lý do: ${rejectionReason})`, true);

    res.json({ message: "Từ chối yêu cầu trả hàng thành công", order });
  } catch (error) {
    console.error("🔥 Lỗi khi từ chối yêu cầu trả hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Người dùng đánh giá sản phẩm
exports.createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Điểm đánh giá phải từ 1 đến 5" });
    }

    const order = await Order.findOne({
      user: userId,
      "items.product": productId,
      status: "delivered",
    });

    if (!order) {
      return res.status(400).json({ message: "Bạn chưa mua sản phẩm này hoặc đơn hàng chưa được giao" });
    }

    const existingReview = await Review.findOne({ user: userId, product: productId });
    if (existingReview) {
      return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này" });
    }

    const review = new Review({
      user: userId,
      product: productId,
      rating,
      comment,
    });

    await review.save();
    res.status(201).json({ message: "Đánh giá sản phẩm thành công", review });
  } catch (error) {
    console.error("🔥 Lỗi khi đánh giá sản phẩm:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy danh sách đánh giá của sản phẩm
exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    const reviews = await Review.find({ product: productId }).populate("user", "name avatar");
    res.json(reviews);
  } catch (error) {
    console.error("🔥 Lỗi khi lấy đánh giá:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};