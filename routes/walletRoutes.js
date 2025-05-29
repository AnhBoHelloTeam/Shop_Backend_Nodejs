const express = require('express');
const router = express.Router();
const Wallet = require('../models/TKBank/Wallet');
const DepositRequest = require('../models/TKBank/DepositRequest');
const Transaction = require('../models/TKBank/Transaction');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// User gửi yêu cầu nạp tiền
router.post('/deposit', authMiddleware, async (req, res) => {
  try {
    const { amount, transactionCode } = req.body;
    if (!amount || amount <= 0 || !transactionCode) {
      return res.status(400).json({ error: 'Vui lòng nhập số tiền hợp lệ và mã giao dịch' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    const depositRequest = new DepositRequest({
      userId: req.user.userId,
      amount,
      transactionCode,
    });

    await depositRequest.save();

    // Gửi thông báo đến admin
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

    // Cập nhật số dư ví
    let wallet = await Wallet.findOne({ userId: depositRequest.userId._id });
    if (!wallet) {
      wallet = new Wallet({ userId: depositRequest.userId._id, balance: 0 });
    }
    wallet.balance += depositRequest.amount;
    wallet.updatedAt = Date.now();
    await wallet.save();

    // Lưu giao dịch
    const transaction = new Transaction({
      userId: depositRequest.userId._id,
      type: 'deposit',
      amount: depositRequest.amount,
      status: 'completed',
    });
    await transaction.save();

    // Gửi thông báo đến user
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

module.exports = router;