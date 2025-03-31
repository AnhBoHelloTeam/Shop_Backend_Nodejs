import React, { useEffect } from 'react'
import { useState } from 'react';
import DetailProduct from '../../../../site-customer/components/molecules/DetailProduct/DetailProduct';
import { CreateProductsAPI, createProductsAPI, fetchProductsApi } from '../../../../../api/productsAPI';
import './style.css'
import { toast } from 'react-toastify';

const ProductCreateAdminPage = () => {
    // Khởi tạo State 
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('')
    const [description, setDescription] = useState('')
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);




    const fetchData = async () => {
        try {
            const fetchedProducts = await fetchProductsApi();
            setProducts(fetchedProducts.data.products);

        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);



    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewImage(null);
        }
    };
    // Handle Event
    return (
        <main className='content'>


            <div id="form">
                <h3>Chỉnh sửa sản phẩm</h3>
                <input type="hidden" id="ID" />
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
                    <input type="file" id="img" onChange={handleImageChange} />
                    {previewImage && (
                        <img src={previewImage} alt="Image Preview" className="img-preview" />
                    )}
                </div>
                <div className="">
                    <input type="submit" value="Thêm sản phẩm" onClick={null} />
                </div>
            </div>
        </main>
    );
}

export default ProductCreateAdminPage
