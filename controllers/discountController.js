const mongoose = require("mongoose");
const Discount = require("../models/discount");

// Tạo mã giảm giá (Admin)
exports.createDiscount = async (req, res) => {
  try {
    const { code, percentage, minOrderValue, startDate, endDate, isActive } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!code || !percentage || !minOrderValue || !startDate || !endDate) {
      return res.status(400).json({ message: "Thiếu các trường bắt buộc: code, percentage, minOrderValue, startDate, endDate" });
    }
    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({ message: "Phần trăm giảm giá phải từ 0 đến 100" });
    }
    if (minOrderValue < 0) {
      return res.status(400).json({ message: "Giá trị đơn hàng tối thiểu không được âm" });
    }
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "Ngày bắt đầu phải trước ngày kết thúc" });
    }

    // Kiểm tra mã đã tồn tại
    const existingDiscount = await Discount.findOne({ code: code.toUpperCase() });
    if (existingDiscount) {
      return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
    }

    const discount = new Discount({
      code: code.toUpperCase(),
      percentage,
      minOrderValue,
      startDate,
      endDate,
      isActive: isActive !== undefined ? isActive : true,
    });

    await discount.save();
    res.status(201).json({ message: "Tạo mã giảm giá thành công", discount });
  } catch (error) {
    console.error("🔥 Lỗi khi tạo mã giảm giá:", error);
    res.status(500).json({ message: "Lỗi server khi tạo mã giảm giá", error: error.message });
  }
};

// Lấy danh sách mã giảm giá (Admin)
exports.getDiscounts = async (req, res) => {
  try {
    const now = new Date();
    const discounts = await Discount.find()
      .sort({ createdAt: -1 })
      .select("-__v");
    res.status(200).json(discounts);
  } catch (error) {
    console.error("🔥 Lỗi khi lấy danh sách mã giảm giá:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách mã giảm giá", error: error.message });
  }
};

// Cập nhật mã giảm giá (Admin)
exports.updateDiscount = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, percentage, minOrderValue, startDate, endDate, isActive } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID mã giảm giá không hợp lệ" });
    }

    // Kiểm tra dữ liệu cập nhật
    if (percentage && (percentage < 0 || percentage > 100)) {
      return res.status(400).json({ message: "Phần trăm giảm giá phải từ 0 đến 100" });
    }
    if (minOrderValue && minOrderValue < 0) {
      return res.status(400).json({ message: "Giá trị đơn hàng tối thiểu không được âm" });
    }
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: "Ngày bắt đầu phải trước ngày kết thúc" });
    }
    if (code) {
      const existingDiscount = await Discount.findOne({ code: code.toUpperCase(), _id: { $ne: id } });
      if (existingDiscount) {
        return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
      }
    }

    const updateData = {
      ...(code && { code: code.toUpperCase() }),
      ...(percentage && { percentage }),
      ...(minOrderValue && { minOrderValue }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(isActive !== undefined && { isActive }),
    };

    const discount = await Discount.findByIdAndUpdate(id, updateData, { new: true });
    if (!discount) {
      return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
    }

    res.status(200).json({ message: "Cập nhật mã giảm giá thành công", discount });
  } catch (error) {
    console.error("🔥 Lỗi khi cập nhật mã giảm giá:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật mã giảm giá", error: error.message });
  }
};

// Xóa mã giảm giá (Admin)
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

    res.status(200).json({ message: "Xóa mã giảm giá thành công" });
  } catch (error) {
    console.error("🔥 Lỗi khi xóa mã giảm giá:", error);
    res.status(500).json({ message: "Lỗi server khi xóa mã giảm giá", error: error.message });
  }
};

// Lấy mã giảm giá khả dụng (Người dùng)
exports.getAvailableDiscounts = async (req, res) => {
  try {
    const { cartItems, totalPrice, currentDate } = req.body;

    if (!cartItems || !totalPrice || !currentDate) {
      return res.status(400).json({ message: "Thiếu thông tin giỏ hàng hoặc ngày hiện tại" });
    }

    const now = new Date(currentDate);
    const discounts = await Discount.find({
      startDate: { $lte: now },
      endDate: { $gte: now },
      minOrderValue: { $lte: totalPrice },
      isActive: true,
    }).select("-__v");

    res.status(200).json(discounts);
  } catch (error) {
    console.error("🔥 Lỗi khi lấy mã giảm giá:", error);
    res.status(500).json({ message: "Lỗi server khi lấy mã giảm giá", error: error.message });
  }
};

// Áp dụng mã giảm giá (Người dùng)
exports.applyDiscount = async (req, res) => {
  try {
    const { code, cartItems, totalPrice } = req.body;

    if (!code || !cartItems || !totalPrice) {
      return res.status(400).json({ message: "Thiếu thông tin mã giảm giá hoặc giỏ hàng" });
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
      return res.status(400).json({ message: "Mã giảm giá không hợp lệ hoặc không áp dụng được" });
    }

    const discountAmount = (discount.percentage / 100) * totalPrice;
    const newTotalPrice = totalPrice - discountAmount;

    res.status(200).json({
      discountAmount,
      newTotalPrice,
    });
  } catch (error) {
    console.error("🔥 Lỗi khi áp dụng mã giảm giá:", error);
    res.status(500).json({ message: "Lỗi server khi áp dụng mã giảm giá", error: error.message });
  }
};