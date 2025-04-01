import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductAPIByID, updateProductsAPI } from "../../../../../api/productsAPI";
import "./style.css";
import { toast } from "react-toastify";

const ProductEditAdminPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    // State cho dữ liệu sản phẩm
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState(""); // Đổi quantity thành stock
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([
        { id: "Laptop", name: "Laptop" }, // Giả lập danh mục
    ]);

    // Lấy dữ liệu sản phẩm theo ID
    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentProduct = await fetchProductAPIByID(productId);
                const productData = currentProduct.data || currentProduct; // Điều chỉnh theo cấu trúc API
                setName(productData.name);
                setCategory(productData.category); // Giả định category là string, không phải object
                setPrice(productData.price);
                setStock(productData.stock); // Đổi từ quantity thành stock
                setDescription(productData.description);
                setImageUrl(productData.image);
            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Không thể tải thông tin sản phẩm.");
            }
        };
        fetchData();
    }, [productId]);

    // Xử lý cập nhật sản phẩm
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updatedProduct = {
            id: productId,
            name,
            category,
            price: Number(price),
            stock: Number(stock),
            description,
            image: imageUrl, // Gửi URL hình ảnh
        };

        try {
            await updateProductsAPI(updatedProduct);
            toast.success("Cập nhật sản phẩm thành công!");
            navigate("/admin/product"); // Chuyển hướng về danh sách sản phẩm
        } catch (error) {
            toast.error(error.message || "Không thể cập nhật sản phẩm.");
            console.error("Error updating product:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="content">
            <div id="form">
                <h3>Chỉnh sửa sản phẩm</h3>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="name">Tên sản phẩm</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Tên sản phẩm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="categorySelect">Danh mục</label>
                        <select
                            id="categorySelect"
                            name="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        >
                            <option value="">===Chọn Danh Mục===</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="input-group">
                        <label htmlFor="price">Giá cả</label>
                        <input
                            type="number"
                            id="price"
                            placeholder="Giá cả"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            min="0"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="description">Miêu tả</label>
                        <textarea
                            id="description"
                            placeholder="Miêu tả"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="stock">Số lượng còn trong kho</label>
                        <input
                            type="number"
                            id="stock"
                            placeholder="Số lượng còn trong kho"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                            min="0"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="imageUrl">URL Hình ảnh</label>
                        <input
                            type="text"
                            id="imageUrl"
                            placeholder="Dán URL hình ảnh"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            required
                        />
                        {imageUrl && (
                            <img
                                src={imageUrl}
                                alt="Image Preview"
                                className="img-preview"
                                style={{ maxWidth: "200px", marginTop: "10px" }}
                                onError={() => toast.error("URL hình ảnh không hợp lệ")}
                            />
                        )}
                    </div>
                    <div className="input-group">
                        <input
                            type="submit"
                            value={loading ? "Đang cập nhật..." : "Cập nhật"}
                            disabled={loading}
                        />
                    </div>
                </form>
            </div>
        </main>
    );
};

export default ProductEditAdminPage;