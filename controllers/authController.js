const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

exports.register = async (req, res) => {
    try {
        let { name, email, password, confirmPassword, phone, address, avatar } = req.body;

        // ✅ Xử lý khoảng trắng và chuẩn hóa dữ liệu
        name = name?.trim();
        email = email?.trim().toLowerCase();
        password = password?.trim();
        confirmPassword = confirmPassword?.trim();

        // ✅ Kiểm tra dữ liệu đầu vào
        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin" });
        }

        if (/\s/.test(email)) {
            return res.status(400).json({ message: "Email không được chứa khoảng trắng" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }

        if (/\s/.test(password)) {
            return res.status(400).json({ message: "Mật khẩu không được chứa khoảng trắng" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
        }

        // ❗ Có thể thêm kiểm tra mật khẩu mạnh nếu muốn
        // if (!validator.isStrongPassword(password)) {
        //     return res.status(400).json({ message: "Mật khẩu quá yếu" });
        // }

        // ❗ Kiểm tra số điện thoại nếu cần
        // if (phone && !validator.isMobilePhone(phone, 'vi-VN')) {
        //     return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
        // }

        // ✅ Kiểm tra email đã tồn tại
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        // ✅ Hash mật khẩu và lưu vào database
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            address,
            avatar
        });

        await user.save();

        res.status(201).json({ message: "Đăng ký thành công" });

    } catch (error) {
        console.error("🔥 Lỗi khi đăng ký:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};


exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;

        // ✅ Loại bỏ khoảng trắng đầu/cuối nếu có
        email = email?.trim();
        password = password?.trim();

        // ✅ Kiểm tra dữ liệu đầu vào
        if (!email || !password) {
            return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
        }

        if (/\s/.test(email)) {
            return res.status(400).json({ message: "Email không được chứa khoảng trắng" });
        }

        if (/\s/.test(password)) {
            return res.status(400).json({ message: "Mật khẩu không được chứa khoảng trắng" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ message: "Email không hợp lệ" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
        }

        // ✅ Kiểm tra email có tồn tại không
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email không tồn tại" });
        }

        // ✅ Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
        }

        // ✅ Tạo token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // ✅ Đăng nhập thành công
        res.json({
            message: "Đăng nhập thành công",
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

