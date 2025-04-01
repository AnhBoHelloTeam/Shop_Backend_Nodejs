const express = require("express");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

// 📌 Thêm sản phẩm vào giỏ hàng
router.post("/add", authMiddleware, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.userId;

        if (!productId || !quantity) {
            return res.status(400).json({ message: "Thiếu productId hoặc quantity" });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({ message: "Số lượng phải là số nguyên dương" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const existingItem = cart.items.find(item => item.product.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        console.error("🔥 Lỗi khi thêm vào giỏ hàng:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});


// 📌 Xem giỏ hàng của user với tổng giá trị và số lượng
router.get("/", authMiddleware, async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user.userId;
        console.log("🛒 Đang lấy giỏ hàng cho user:", userId);

        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart) {
            console.log("⚠️ Không tìm thấy giỏ hàng trong DB");
            return res.status(200).json({ 
                message: "Giỏ hàng trống", 
                items: [], 
                totalQuantity: 0, 
                totalPrice: 0 
            });
        }

        // Tính tổng số lượng và tổng giá
        let totalQuantity = 0;
        let totalPrice = 0;

        const cartItems = cart.items.map(item => {
            const product = item.product;
            const quantity = item.quantity;
            const totalItemPrice = product.price * quantity;

            // Cộng dồn tổng số lượng và tổng giá
            totalQuantity += quantity;
            totalPrice += totalItemPrice;

            return {
                product: {
                    _id: product._id,
                    name: product.name,
                    image: product.image,
                    price: product.price
                },
                quantity,
                totalItemPrice
            };
        });

        // In ra console để kiểm tra giá trị tính toán
        console.log("Tổng số lượng:", totalQuantity);
        console.log("Tổng giá trị:", totalPrice);

        // Trả về dữ liệu
        res.json({
            items: cartItems,
            totalQuantity,   // trả về tổng số lượng
            totalPrice       // trả về tổng giá trị
        });

    } catch (error) {
        console.error("❌ Lỗi khi lấy giỏ hàng:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});



// 📌 Xóa sản phẩm khỏi giỏ hàng
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId;

        // Kiểm tra ID sản phẩm hợp lệ
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
        }

        // Tìm giỏ hàng của user
        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng trống" });
        }

        // Tìm sản phẩm trong giỏ hàng
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
        }

        // Xóa sản phẩm khỏi giỏ hàng
        cart.items.splice(itemIndex, 1);
        await cart.save();

        res.status(200).json({ message: "Sản phẩm đã được xóa khỏi giỏ hàng", cart });
    } catch (error) {
        console.error("🔥 Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});




// 📌 Giảm số lượng sản phẩm (hoặc xóa nếu số lượng = 0)
router.put("/decrease/:productId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng trống" });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
        }

        if (cart.items[itemIndex].quantity > 1) {
            cart.items[itemIndex].quantity -= 1;
        } else {
            cart.items.splice(itemIndex, 1);
        }

        await cart.save();
        res.status(200).json({ message: "Đã cập nhật giỏ hàng", cart });
    } catch (error) {
        console.error("🔥 Lỗi khi giảm số lượng:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});


// 📌 Tăng số lượng sản phẩm trong giỏ hàng
router.put("/increase/:productId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: "Giỏ hàng trống" });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: "Sản phẩm không tồn tại trong giỏ hàng" });
        }

        cart.items[itemIndex].quantity += 1;

        await cart.save();
        res.status(200).json({ message: "Đã cập nhật giỏ hàng", cart });
    } catch (error) {
        console.error("🔥 Lỗi khi tăng số lượng:", error);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
});



module.exports = router;
