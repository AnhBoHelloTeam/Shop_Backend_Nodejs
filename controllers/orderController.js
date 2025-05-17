const mongoose = require("mongoose");
const Order = require("../models/Order");
const Review = require("../models/review");

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
        await order.save();

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

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
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

        order.status = "returned";
        await order.save();

        res.json({ message: "Yêu cầu trả hàng thành công", order });
    } catch (error) {
        console.error("🔥 Lỗi khi yêu cầu trả hàng:", error);
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

        // Kiểm tra người dùng đã mua sản phẩm chưa
        const order = await Order.findOne({
            user: userId,
            "items.product": productId,
            status: "delivered"
        });

        if (!order) {
            return res.status(400).json({ message: "Bạn chưa mua sản phẩm này hoặc đơn hàng chưa được giao" });
        }

        // Kiểm tra xem đã đánh giá sản phẩm này chưa
        const existingReview = await Review.findOne({ user: userId, product: productId });
        if (existingReview) {
            return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này" });
        }

        const review = new Review({
            user: userId,
            product: productId,
            rating,
            comment
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