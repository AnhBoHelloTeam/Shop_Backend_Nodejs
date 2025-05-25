const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

// Import routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const discountRoutes = require("./routes/discountRoutes");
const walletRoutes = require("./routes/walletRoutes"); // Thêm route ví
const Notification = require("./models/Notification");
const { authMiddleware } = require("./middlewares/authMiddleware");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT"], // Thêm PUT để hỗ trợ API ví
  },
});

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads")); // Phục vụ file tĩnh từ thư mục uploads

// Pass socketIO to req
app.use((req, res, next) => {
  req.socketIO = io;
  next();
});

// Define API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/wallet", walletRoutes); // Thêm route ví

// Lấy danh sách thông báo
app.get("/api/notifications", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("order");
    res.status(200).json(notifications);
  } catch (error) {
    console.error("🔥 Lỗi khi lấy thông báo:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// Đánh dấu thông báo đã đọc
app.put("/api/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const notification = await Notification.findOne({ _id: req.params.id, user: userId });
    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: "Đã đánh dấu thông báo đã đọc" });
  } catch (error) {
    console.error("🔥 Lỗi khi đánh dấu thông báo:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// WebSocket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    if (userId === "admin") {
      socket.join("admin");
    }
    console.log(`User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = { app, server, socketIO: io };