import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProductAPIByID, updateProductsAPI } from "../../../../../api/productsAPI";
import "./style.css";
import { toast } from "react-toastify";

const ProductEditAdminPage = () => {
    const params = useParams();
    const [product, setProduct] = useState(null);

    // State cho dữ liệu sản phẩm và ảnh
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [quantity, setQuantity] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [description, setDescription] = useState('')



    const [categories, setCategories] = useState([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentProduct = await fetchProductAPIByID(params.productId);
                setProduct(currentProduct.data);
                setName(currentProduct.data.name);
                setImageUrl(currentProduct.data.image);
                setCategory(currentProduct.data.category.id);
                setPrice(currentProduct.data.price);
                setQuantity(currentProduct.data.quantity);
                setDescription(currentProduct.data.description);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, [params.productId]);
    return (
        <main className="content">
            <div id="form">
                <h3>Chỉnh sửa sản phẩm</h3>
                <div className="input-group">
                    <label htmlFor="name">Tên sản phẩm</label>
                    <input type="text" id="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="input-group">
                    <label htmlFor="categorySelect">Danh mục</label>
                    <select id="categorySelect" name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="">===Chọn Danh Mục===</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="input-group">
                    <label htmlFor="price">Giá cả</label>
                    <input type="text" id="price" placeholder="Giá cả" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="input-group">
                    <label htmlFor="description">Miêu tả</label>
                    <input type="text" id="description" placeholder="Miêu tả" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="input-group">
                    <label htmlFor="quantity">Số lượng còn trong kho</label>
                    <input type="text" id="quantity" placeholder="Số lượng còn trong kho" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>


                <div className="input-group">
                    <label htmlFor="img">Hình ảnh:</label>
                    <input type="file" id="img" onChange={null} />
                    {previewImage ? (
                        <img src={previewImage} alt="Image Preview" className="img-preview" />
                    ) : (
                        imageUrl && <img src={imageUrl} alt="Product" style={{ width: "100px", objectFit: "contain" }} />
                    )}
                </div>
                <div className="">
                    <input type="submit" value="Cập nhật" onClick={null} />
                </div>
            </div>
        </main>
    );
};

export default ProductEditAdminPage;
