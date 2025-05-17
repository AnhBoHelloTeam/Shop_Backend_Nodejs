const mongoose = require("mongoose");
const Discount = require("../models/discount");

// Tạo mã giảm giá
exports.createDiscount = async (req, res) => {
    try {
        const { code, description, percentage, minOrderValue, maxDiscount, minDiscount, startDate, endDate } = req.body;

        // Kiểm tra dữ liệu đầu vào
        if (!code || !percentage || !minOrderValue || !maxDiscount || !startDate || !endDate) {
            return res.status(400).json({ message: "Thiếu thông tin mã giảm giá" });
        }
        if (percentage < 0 || percentage > 100) {
            return res.status(400).json({ message: "Phần trăm giảm giá không hợp lệ" });
        }
        if (minOrderValue < 0 || maxDiscount < 0 || minDiscount < 0) {
            return res.status(400).json({ message: "Giá trị không được âm" });
        }
        if (new Date(startDate) >= new Date(endDate)) {
            return res.status(400).json({ message: "Ngày bắt đầu phải trước ngày kết thúc" });
        }

        // Kiểm tra mã đã tồn tại
        const existingDiscount = await Discount.findOne({ code });
        if (existingDiscount) {
            return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
        }

        const discount = new Discount({
            code: code.toUpperCase(),
            description,
            percentage,
            minOrderValue,
            maxDiscount,
            minDiscount,
            startDate,
            endDate
        });

        await discount.save();
        res.status(201).json({ message: "Tạo mã giảm giá thành công", discount });
    } catch (error) {
        console.error("🔥 Lỗi khi tạo mã giảm giá:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Lấy danh sách mã giảm giá
exports.getDiscounts = async (req, res) => {
    try {
        const discounts = await Discount.find().sort({ createdAt: -1 });
        res.json(discounts);
    } catch (error) {
        console.error("🔥 Lỗi khi lấy mã giảm giá:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Cập nhật mã giảm giá
exports.updateDiscount = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID mã giảm giá không hợp lệ" });
        }

        if (updateData.percentage && (updateData.percentage < 0 || updateData.percentage > 100)) {
            return res.status(400).json({ message: "Phần trăm giảm giá không hợp lệ" });
        }
        if (updateData.minOrderValue && updateData.minOrderValue < 0) {
            return res.status(400).json({ message: "Giá trị đơn hàng tối thiểu không hợp lệ" });
        }
        if (updateData.maxDiscount && updateData.maxDiscount < 0) {
            return res.status(400).json({ message: "Giá trị giảm tối đa không hợp lệ" });
        }
        if (updateData.startDate && updateData.endDate && new Date(updateData.startDate) >= new Date(updateData.endDate)) {
            return res.status(400).json({ message: "Ngày bắt đầu phải trước ngày kết thúc" });
        }

        const discount = await Discount.findByIdAndUpdate(id, updateData, { new: true });
        if (!discount) {
            return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
        }

        res.json({ message: "Cập nhật mã giảm giá thành công", discount });
    } catch (error) {
        console.error("🔥 Lỗi khi cập nhật mã giảm giá:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Xóa mã giảm giá
exports.deleteDiscount = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID mã giảm giá không hợp lệ" });
        }

        const discount = await Discount.findByIdAndDelete(id);
        if (!discount) {
            return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
        }

        res.json({ message: "Xóa mã giảm giá thành công" });
    } catch (error) {
        console.error("🔥 Lỗi khi xóa mã giảm giá:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};