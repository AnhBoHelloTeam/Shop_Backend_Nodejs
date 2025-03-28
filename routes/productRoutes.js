const express = require("express");
const Product = require("../models/Product");
const { authMiddleware, adminMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// 📌 Lấy danh sách tất cả sản phẩm
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
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
