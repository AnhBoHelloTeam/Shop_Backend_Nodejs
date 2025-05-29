const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const morgan = require("morgan");
const fs = require("fs");

// Import routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const discountRoutes = require("./routes/discountRoutes");
const walletRoutes = require("./routes/walletRoutes");
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
    origin: [
      "http://localhost:3000", // Frontend dev
      "http://localhost:8080", // Có thể thêm các origin khác
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads", "qr_codes");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8080",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(morgan("dev")); // HTTP request logging
app.use(express.static(path.join(__dirname, "uploads"))); // Serve static files from uploads

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
app.use("/api/wallet", walletRoutes);

// Get notifications
app.get("/api/notifications", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("order");
    res.status(200).json(notifications);
  } catch (error) {
    console.error("🔥 Error fetching notifications:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Mark notification as read
app.put("/api/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const notification = await Notification.findOne({ _id: req.params.id, user: userId });
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.isRead = true;
    await notification.save();
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("🔥 Error marking notification as read:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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

// Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Global error:", err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = { app, server, socketIO: io };