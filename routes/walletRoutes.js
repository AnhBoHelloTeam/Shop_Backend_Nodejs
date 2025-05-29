const express = require('express');
const router = express.Router();
const Wallet = require('../models/TKBank/Wallet');
const DepositRequest = require('../models/TKBank/DepositRequest');
const Transaction = require('../models/TKBank/Transaction');
const Notification = require('../models/Notification');
const PaymentMethod = require('../models/TKBank/PaymentMethod');
const User = require('../models/User');
const Order = require('../models/Order'); // Thêm model Order
const Cart = require('../models/Cart'); // Thêm model Cart
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/qr_codes/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// User gửi yêu cầu nạp tiền
router.post('/deposit', authMiddleware, async (req, res) => {
  try {
    const { amount, transactionCode, paymentMethodId } = req.body;
    if (!amount || amount <= 0 || !transactionCode || !paymentMethodId) {
      return res.status(400).json({ error: 'Vui lòng nhập số tiền hợp lệ, mã giao dịch và phương thức thanh toán' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const paymentMethod = await PaymentMethod.findById(paymentMethodId);
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Không tìm thấy phương thức thanh toán' });
    }

    const depositRequest = new DepositRequest({
      userId: req.user.userId,
      amount,
      transactionCode,
      paymentMethodId,
    });

    await depositRequest.save();

    const adminNotification = new Notification({
      user: req.user.userId,
      message: `Người dùng ${user.name} yêu cầu nạp ${amount} VNĐ (Mã giao dịch: ${transactionCode})`,
    });
    await adminNotification.save();
    req.socketIO.to('admin').emit('notification', {
      _id: adminNotification._id,
      message: adminNotification.message,
      createdAt: adminNotification.createdAt,
      isRead: false,
    });

    res.status(201).json({ message: 'Yêu cầu nạp tiền đã được gửi', depositRequest });
  } catch (error) {
    console.error('🔥 Error creating deposit request:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin duyệt yêu cầu nạp tiền
router.post('/deposit/approve/:requestId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const depositRequest = await DepositRequest.findById(req.params.requestId).populate('userId');
    if (!depositRequest) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu nạp tiền' });
    }

    if (depositRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Yêu cầu đã được xử lý' });
    }

    depositRequest.status = 'approved';
    await depositRequest.save();

    let wallet = await Wallet.findOne({ userId: depositRequest.userId._id });
    if (!wallet) {
      wallet = new Wallet({ userId: depositRequest.userId._id, balance: 0 });
    }
    wallet.balance += depositRequest.amount;
    wallet.updatedAt = Date.now();
    await wallet.save();

    const transaction = new Transaction({
      userId: depositRequest.userId._id,
      type: 'deposit',
      amount: depositRequest.amount,
      status: 'completed',
      transactionCode: depositRequest.transactionCode,
      paymentMethodId: depositRequest.paymentMethodId,
    });
    await transaction.save();

    const userNotification = new Notification({
      user: depositRequest.userId._id,
      message: `Yêu cầu nạp ${depositRequest.amount} VNĐ của bạn đã được duyệt`,
    });
    await userNotification.save();
    req.socketIO.to(depositRequest.userId._id.toString()).emit('notification', {
      _id: userNotification._id,
      message: userNotification.message,
      createdAt: userNotification.createdAt,
      isRead: false,
    });

    res.json({ message: 'Yêu cầu nạp tiền đã được duyệt', wallet });
  } catch (error) {
    console.error('🔥 Error approving deposit:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin lấy danh sách yêu cầu nạp tiền đang chờ
router.get('/deposit/pending', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const requests = await DepositRequest.find({ status: 'pending' }).populate('userId', 'name email');
    res.json(requests);
  } catch (error) {
    console.error('🔥 Error fetching pending deposits:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy thông tin ví của user
router.get('/wallet', authMiddleware, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ userId: req.user.userId });
    if (!wallet) {
      return res.json({ balance: 0 });
    }
    res.json(wallet);
  } catch (error) {
    console.error('🔥 Error fetching wallet:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin lấy danh sách ví của tất cả user
router.get('/wallets', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const wallets = await Wallet.find().populate('userId', 'name email');
    res.json(wallets);
  } catch (error) {
    console.error('🔥 Error fetching wallets:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy lịch sử giao dịch của user
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('🔥 Error fetching transactions:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy danh sách phương thức thanh toán
router.get('/payment-methods', authMiddleware, async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find();
    res.json(paymentMethods);
  } catch (error) {
    console.error('🔥 Error fetching payment methods:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin thêm phương thức thanh toán
router.post('/payment-methods', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, type, details, qrCodeUrl } = req.body;
    if (!name || !type || !details) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ thông tin phương thức thanh toán' });
    }

    const paymentMethod = new PaymentMethod({ name, type, details, qrCodeUrl });
    await paymentMethod.save();
    res.status(201).json({ message: 'Thêm phương thức thanh toán thành công', paymentMethod });
  } catch (error) {
    console.error('🔥 Error adding payment method:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin tải ảnh QR cho phương thức thanh toán
router.post('/payment-methods/add-qr', authMiddleware, adminMiddleware, upload.single('qrCode'), async (req, res) => {
  try {
    const { name, type, details } = req.body;
    if (!name || !type || !details || !req.file) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin và ảnh QR' });
    }

    const qrCodeUrl = `/uploads/qr_codes/${req.file.filename}`;
    const paymentMethod = new PaymentMethod({
      name,
      type,
      details,
      qrCodeUrl,
    });
    await paymentMethod.save();

    res.status(201).json({ message: 'Thêm phương thức thanh toán với QR thành công', paymentMethod });
  } catch (error) {
    console.error('🔥 Error adding QR code:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Tạo mã giao dịch tự động
router.post('/transaction-code', authMiddleware, async (req, res) => {
  try {
    const { userId, amount, paymentMethodId } = req.body;
    if (!userId || !amount || amount <= 0 || !paymentMethodId) {
      return res.status(400).json({ error: 'Vui lòng cung cấp userId, số tiền hợp lệ và phương thức thanh toán' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const paymentMethod = await PaymentMethod.findById(paymentMethodId);
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Không tìm thấy phương thức thanh toán' });
    }

    const transactionCode = `TX-${uuidv4().slice(0, 8)}`;
    const depositRequest = new DepositRequest({
      userId,
      amount,
      transactionCode,
      paymentMethodId,
      status: 'pending',
    });
    await depositRequest.save();

    res.json({ transactionCode });
  } catch (error) {
    console.error('🔥 Error generating transaction code:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin xác minh mã giao dịch
router.post('/verify-transaction', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { transactionCode } = req.body;
    if (!transactionCode) {
      return res.status(400).json({ error: 'Vui lòng cung cấp mã giao dịch' });
    }

    const depositRequest = await DepositRequest.findOne({ transactionCode }).populate('userId', 'name email');
    if (!depositRequest) {
      return res.status(404).json({ error: 'Không tìm thấy giao dịch' });
    }

    res.json({
      userId: depositRequest.userId._id,
      userName: depositRequest.userId.name,
      userEmail: depositRequest.userId.email,
      amount: depositRequest.amount,
      paymentMethodId: depositRequest.paymentMethodId,
      transactionCode: depositRequest.transactionCode,
    });
  } catch (error) {
    console.error('🔥 Error verifying transaction:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin nạp tiền cho user
router.post('/admin/deposit', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, amount, transactionCode, paymentMethodId } = req.body;
    if (!userId || !amount || amount <= 0 || !transactionCode || !paymentMethodId) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const paymentMethod = await PaymentMethod.findById(paymentMethodId);
    if (!paymentMethod) {
      return res.status(404).json({ error: 'Không tìm thấy phương thức thanh toán' });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = new Wallet({ userId, balance: 0 });
    }
    wallet.balance += amount;
    wallet.updatedAt = Date.now();
    await wallet.save();

    const transaction = new Transaction({
      userId,
      type: 'deposit',
      amount,
      status: 'completed',
      transactionCode,
      paymentMethodId,
    });
    await transaction.save();

    const depositRequest = await DepositRequest.findOneAndUpdate(
      { transactionCode },
      { status: 'approved' },
      { new: true }
    );

    const userNotification = new Notification({
      user: userId,
      message: `Ví của bạn đã được nạp ${amount} VNĐ`,
    });
    await userNotification.save();
    req.socketIO.to(userId.toString()).emit('notification', {
      _id: userNotification._id,
      message: userNotification.message,
      createdAt: userNotification.createdAt,
      isRead: false,
    });

    res.status(201).json({ message: 'Nạp tiền thành công', balance: wallet.balance });
  } catch (error) {
    console.error('🔥 Error depositing for user:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Admin lấy danh sách tất cả người dùng
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('_id name email');
    res.json(users);
  } catch (error) {
    console.error('🔥 Error fetching users:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Trừ tiền từ ví
router.post('/deduct', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Vui lòng cung cấp số tiền hợp lệ' });
    }

    const wallet = await Wallet.findOne({ userId: req.user.userId });
    if (!wallet) {
      return res.status(404).json({ error: 'Không tìm thấy ví' });
    }
    if (wallet.balance < amount) {
      return res.status(400).json({ error: 'Số dư không đủ' });
    }

    wallet.balance -= amount;
    wallet.updatedAt = Date.now();
    await wallet.save();

    const transaction = new Transaction({
      userId: req.user.userId,
      type: 'payment',
      amount,
      status: 'completed',
      transactionCode: `PAY-${uuidv4().slice(0, 8)}`,
    });
    await transaction.save();

    const userNotification = new Notification({
      user: req.user.userId,
      message: `Thanh toán ${amount} VNĐ từ ví cho đơn hàng`,
    });
    await userNotification.save();
    req.socketIO.to(req.user.userId.toString()).emit('notification', {
      _id: userNotification._id,
      message: userNotification.message,
      createdAt: userNotification.createdAt,
      isRead: false,
    });

    res.json({ message: 'Trừ tiền thành công', balance: wallet.balance });
  } catch (error) {
    console.error('🔥 Error deducting from wallet:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Xử lý checkout (thêm vào nếu chưa có file orders.js)
router.post('/checkout', authMiddleware, async (req, res) => {
  try {
    const { items, discountCode, paymentMethod, shippingAddress, totalPrice } = req.body;
    if (!items || !paymentMethod || !totalPrice || totalPrice < 0) {
      return res.status(400).json({ error: 'Thông tin đơn hàng không hợp lệ' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    if (paymentMethod === 'WALLET') {
      const wallet = await Wallet.findOne({ userId: req.user.userId });
      if (!wallet) {
        return res.status(404).json({ error: 'Không tìm thấy ví' });
      }
      if (wallet.balance < totalPrice) {
        return res.status(400).json({ error: 'Số dư ví không đủ' });
      }

      wallet.balance -= totalPrice;
      wallet.updatedAt = Date.now();
      await wallet.save();

      const transaction = new Transaction({
        userId: req.user.userId,
        type: 'payment',
        amount: totalPrice,
        status: 'completed',
        transactionCode: `PAY-${uuidv4().slice(0, 8)}`,
      });
      await transaction.save();

      const userNotification = new Notification({
        user: req.user.userId,
        message: `Thanh toán ${totalPrice} VNĐ từ ví cho đơn hàng`,
      });
      await userNotification.save();
      req.socketIO.to(req.user.userId.toString()).emit('notification', {
        _id: userNotification._id,
        message: userNotification.message,
        createdAt: userNotification.createdAt,
        isRead: false,
      });
    }

    const order = new Order({
      userId: req.user.userId,
      items,
      discountCode,
      paymentMethod,
      shippingAddress,
      totalPrice,
      status: 'pending',
    });
    await order.save();

    await Cart.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: { items: [] } },
      { upsert: true }
    );

    res.status(201).json({ message: 'Đặt hàng thành công', order });
  } catch (error) {
    console.error('🔥 Error checking out:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;