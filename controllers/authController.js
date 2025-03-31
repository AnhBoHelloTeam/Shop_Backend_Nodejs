const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, address, avatar } = req.body;

        // ✅ Kiểm tra dữ liệu đầu vào
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }

        // ✅ Kiểm tra email đã tồn tại chưa
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "Email đã tồn tại" });

        // ✅ Hash password trước khi lưu
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword, phone, address, avatar });

        await user.save();
        res.status(201).json({ message: "Đăng ký thành công" });
    } catch (error) {
        console.error("🔥 Lỗi khi đăng ký:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ✅ Kiểm tra dữ liệu đầu vào
        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
        }
        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }

        // ✅ Kiểm tra email có tồn tại không
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });

        // ✅ Kiểm tra mật khẩu có đúng không
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });

        // ✅ Tạo token
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // ✅ Chỉ trả về thông tin cần thiết
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
            },
        });
    } catch (error) {
        console.error("🔥 Lỗi khi đăng nhập:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};
