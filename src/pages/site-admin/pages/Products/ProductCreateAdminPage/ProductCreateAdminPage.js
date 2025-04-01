import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProductsAPI, fetchProductsApi } from "../../../../../api/productsAPI"; // Đường dẫn tới API
import "./style.css";
import { toast } from "react-toastify";

const ProductCreateAdminPage = () => {
    const navigate = useNavigate();

    // Khởi tạo State
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState(""); // Thay imageFile bằng imageUrl
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([
        { id: "Laptop", name: "Laptop" }, // Giả lập danh mục
    ]);

    // Lấy danh sách sản phẩm (nếu cần để kiểm tra)
    const fetchData = async () => {
        try {
            const fetchedProducts = await fetchProductsApi();
            console.log("Fetched products:", fetchedProducts.data.products);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchData();
        // Nếu có API lấy danh mục, gọi ở đây
        // fetchCategories().then(data => setCategories(data));
    }, []);

    // Xử lý thêm sản phẩm
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Tạo object dữ liệu để gửi
        const productData = {
            name,
            description,
            price: Number(price), // Chuyển thành số
            stock: Number(stock), // Chuyển thành số
            category,
            image: imageUrl, // Gửi URL hình ảnh
        };

        try {
            const newProduct = await createProductsAPI(productData);
            toast.success("Thêm sản phẩm thành công!");
            console.log("New product:", newProduct);

            // Reset form sau khi thêm thành công
            setName("");
            setCategory("");
            setPrice("");
            setStock("");
            setDescription("");
            setImageUrl("");

            // Chuyển hướng về trang danh sách sản phẩm
            navigate("/admin/products");
        } catch (error) {
            toast.error(error.message || "Không thể thêm sản phẩm.");
            console.error("Error creating product:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="content">
            <div id="form">
                <h3>Thêm sản phẩm mới</h3>
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
                            value={loading ? "Đang thêm..." : "Thêm sản phẩm"}
                            disabled={loading}
                        />
                    </div>
                </form>
            </div>
        </main>
    );
};

export default ProductCreateAdminPage;