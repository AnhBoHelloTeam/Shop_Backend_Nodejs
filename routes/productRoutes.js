const express = require("express");
const Product = require("../models/Product");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// 📌 Lấy danh sách tất cả sản phẩm (có phân trang, lọc theo danh mục, khoảng giá, tên)
router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 50, category, minPrice, maxPrice, name } = req.query;
        const filter = {};

        if (category) filter.category = category;
        if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
        if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
        if (name) filter.name = new RegExp(name, "i");

        const products = await Product.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// 📌 Lấy danh sách tất cả danh mục (từ trường 'category' trong các sản phẩm)
router.get("/categories", async (req, res) => {
    try {
        // Lấy danh sách tất cả danh mục duy nhất từ trường 'category' của sản phẩm
        const categories = await Product.distinct("category");

        // Trả về danh sách danh mục
        res.json(categories);
    } catch (error) {
        console.error("Lỗi khi lấy danh mục:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});


// 📌 Lấy thông tin sản phẩm theo ID
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// 📌 Thêm sản phẩm (Chỉ admin)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { name, price, description, category, stock, image } = req.body;
        if (!name || !price || !description || !category || !stock || !image) {
            return res.status(400).json({ message: "Thiếu thông tin sản phẩm" });
        }
        if (price <= 0 || stock < 0) {
            return res.status(400).json({ message: "Giá và số lượng phải là số dương" });
        }

        const newProduct = new Product({ name, price, description, category, stock, image });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("🔥 Lỗi khi thêm sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

// 📌 Xóa sản phẩm (Chỉ admin)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        res.json({ message: "Xóa sản phẩm thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});




// 📌 Cập nhật sản phẩm theo ID
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const updateData = {};
        const fields = ["name", "price", "description", "category", "stock", "image"];

        fields.forEach(field => {
            if (req.body[field] !== undefined) updateData[field] = req.body[field];
        });

        if (updateData.price !== undefined && updateData.price <= 0) {
            return res.status(400).json({ message: "Giá phải là số dương" });
        }
        if (updateData.stock !== undefined && updateData.stock < 0) {
            return res.status(400).json({ message: "Số lượng không thể âm" });
        }

        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        res.json(updatedProduct);
    } catch (error) {
        console.error("🔥 Lỗi cập nhật sản phẩm:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});

module.exports = router;
