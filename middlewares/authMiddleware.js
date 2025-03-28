const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Không có token" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        console.log("✅ Decoded Token:", decoded); // 🛠 In ra token đã giải mã

        req.user = decoded; // Gán thông tin user vào request
        next();
    } catch (error) {
        res.status(401).json({ message: "Token không hợp lệ" });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    next();
};



module.exports = { authMiddleware, adminMiddleware };
