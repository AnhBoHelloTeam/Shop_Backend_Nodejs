const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const ReturnRequest = require('../models/ReturnRequest');
const Wallet = require('../models/TKBank/Wallet'); // Thêm Wallet
const Notification = require('../models/Notification'); // Thêm Notification
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware xử lý upload file
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ hỗ trợ JPEG/PNG'));
    }
  },
});

// Người dùng gửi yêu cầu trả hàng
router.post('/return', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    if (!orderId || !reason) {
      return res.status(400).json({ error: 'Thiếu orderId hoặc lý do' });
    }

    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== req.user._id) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'Đơn hàng chưa được giao' });
    }

    const existingRequest = await ReturnRequest.findOne({ order: orderId });
    if (existingRequest) {
      return res.status(400).json({ error: 'Yêu cầu trả hàng đã được gửi trước đó' });
    }

    const returnRequest = new ReturnRequest({
      order: orderId,
      user: req.user._id,
      reason,
      image: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await returnRequest.save();

    // Thông báo admin
    const adminNotification = new Notification({
      user: 'admin', // Giả sử có user admin
      message: `Yêu cầu trả hàng mới cho đơn #${orderId.substring(0, 8)}`,
      type: 'return_request',
      order: orderId,
    });
    await adminNotification.save();
    req.socketIO.to('admin').emit('notification', {
      _id: adminNotification._id,
      message: adminNotification.message,
      type: adminNotification.type,
      order: orderId,
      isRead: false,
      createdAt: adminNotification.createdAt,
    });

    res.status(200).json({ message: 'Yêu cầu trả hàng đã được gửi' });
  } catch (error) {
    console.error('🔥 Lỗi gửi yêu cầu trả hàng:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin lấy danh sách yêu cầu trả hàng
router.get('/return-requests', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const requests = await ReturnRequest.find()
      .populate('order')
      .populate('user', 'username email')
      .populate({
        path: 'order',
        populate: { path: 'items.product', select: 'name image' },
      });
    res.status(200).json(requests);
  } catch (error) {
    console.error('🔥 Lỗi lấy danh sách yêu cầu:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin xử lý yêu cầu trả hàng
router.put('/return/:orderId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { action } = req.body; // 'approve' hoặc 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Hành động không hợp lệ' });
    }

    const request = await ReturnRequest.findOne({ order: orderId });
    if (!request || request.status !== 'pending') {
      return res.status(404).json({ error: 'Yêu cầu trả hàng không tồn tại hoặc đã xử lý' });
    }

    request.status = action === 'approve' ? 'approved' : 'rejected';
    request.processedAt = new Date();
    request.processedBy = req.user._id;

    if (action === 'approve') {
      const order = await Order.findById(orderId);
      order.status = 'returned';

      // Hoàn tiền vào ví
      let wallet = await Wallet.findOne({ user: request.user });
      if (!wallet) {
        wallet = new Wallet({
          user: request.user,
          balance: order.totalPrice,
        });
      } else {
        wallet.balance += order.totalPrice;
      }
      await wallet.save();

      await order.save();
    }

    await request.save();

    // Thông báo người dùng
    const userNotification = new Notification({
      user: request.user,
      message: `Yêu cầu trả hàng cho đơn #${orderId.substring(0, 8)} đã được ${action === 'approve' ? 'chấp nhận' : 'từ chối'}`,
      type: action === 'approve' ? 'return_approved' : 'return_rejected',
      order: orderId,
    });
    await userNotification.save();
    req.socketIO.to(request.user.toString()).emit('notification', {
      _id: userNotification._id,
      message: userNotification.message,
      type: userNotification.type,
      order: orderId,
      isRead: false,
      createdAt: userNotification.createdAt,
    });

    res.status(200).json({ message: `Yêu cầu trả hàng đã được ${action === 'approve' ? 'xác nhận' : 'từ chối'}` });
  } catch (error) {
    console.error('🔥 Lỗi xử lý yêu cầu trả hàng:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;