const Product = require("../models/Product");

// 📌 Lấy danh sách tất cả sản phẩm với bộ lọc và phân trang
exports.getAllProducts = async (req, res) => {
    try {
        let { page = 1, limit = 10, category, minPrice, maxPrice } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        // Xây dựng bộ lọc sản phẩm
        let filter = {};
        if (category) filter.category = category;
        if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
        if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };

        // Lấy danh sách sản phẩm theo phân trang và bộ lọc
        const products = await Product.find(filter)
            .skip((page - 1) * limit)
            .limit(limit);

        const totalProducts = await Product.countDocuments(filter);

        res.json({
            total: totalProducts,
            page,
            totalPages: Math.ceil(totalProducts / limit),
            products,
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Thêm sản phẩm mới
exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock, image } = req.body;

        // ✅ Kiểm tra thiếu thông tin
        if (!name || !price || !description || !category || !stock || !image) {
            return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
        }

        // ✅ Kiểm tra dữ liệu hợp lệ
        if (typeof price !== "number" || price <= 0) {
            return res.status(400).json({ message: "Giá sản phẩm phải là số dương" });
        }
        if (typeof stock !== "number" || stock < 0) {
            return res.status(400).json({ message: "Số lượng sản phẩm không hợp lệ" });
        }

        // ✅ Tạo sản phẩm mới
        const newProduct = new Product({ name, price, description, category, stock, image });
        await newProduct.save();

        res.status(201).json({ message: "Thêm sản phẩm thành công", product: newProduct });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// 📌 Xóa sản phẩm theo ID
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ Kiểm tra ID hợp lệ
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
        }

        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        res.json({ message: "Xóa sản phẩm thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
