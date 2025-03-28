const Product = require("../models/Product");

// Lấy danh sách tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Thêm sản phẩm mới
exports.createProduct = async (req, res) => {
    try {
        const { name, price, description, category, stock, image } = req.body;

        // Kiểm tra thiếu thông tin
        if (!name || !price || !description || !category || !stock || !image) {
            return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
        }

        // Tạo sản phẩm mới
        const newProduct = new Product({ name, price, description, category, stock, image });
        await newProduct.save();

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

// Xóa sản phẩm theo ID
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        res.json({ message: "Xóa sản phẩm thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};
