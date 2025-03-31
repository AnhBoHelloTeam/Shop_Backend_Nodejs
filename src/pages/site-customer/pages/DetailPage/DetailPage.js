import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Accordion, Button, Form } from "react-bootstrap";
import "./style.css";
import { fetchProductAPIByID } from "../../../../api/productsAPI";
import { addToCartApi } from "../../../../api/cartAPI";

const DetailPage = () => {
    const { productId } = useParams(); // Chỉ cần productId từ params
    const [product, setProduct] = useState({});
    const [quantity, setQuantity] = useState(1); // Số lượng mặc định là 1
    const [loading, setLoading] = useState(false); // Trạng thái loading khi gọi API

    // Lấy thông tin sản phẩm
    const fetchProductData = async () => {
        try {
            const fetchedProduct = await fetchProductAPIByID(productId);
            console.log("Fetched Product:", fetchedProduct);
            setProduct(fetchedProduct || {});
        } catch (error) {
            console.error("Error fetching product:", error);
            setProduct({});
        }
    };

    useEffect(() => {
        fetchProductData();
    }, [productId]);

    // Tăng số lượng
    const handleIncrease = () => {
        if (quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    // Giảm số lượng
    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    // Xử lý thay đổi số lượng từ input
    const handleQuantityChange = (e) => {
        const value = Number(e.target.value);
        if (value >= 1 && value <= product.stock) {
            setQuantity(value);
        }
    };

    // Thêm sản phẩm vào giỏ hàng
    const handleAddToCart = async () => {
        setLoading(true);
        try {
            await addToCartApi(productId, quantity); // Gọi API với số lượng đã chọn
            alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
            setQuantity(1)
        } catch (error) {
            console.error("Error adding to cart:", error);
            alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="container content my-4">
            <div className="row">
                <div className="col-md-6">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="img-fluid rounded"
                    />
                </div>
                <div className="col-md-6">
                    <h1 className="mb-3">{product.name || "Loading..."}</h1>
                    <p className="lead fw-bold text-primary">
                        {product.price?.toLocaleString("vi-VN", {
                            style: "currency",
                            currency: "VND",
                        }) || "N/A"}
                    </p>
                    <p className="text-muted">
                        Stock: {product.stock !== undefined ? product.stock : "N/A"}
                    </p>
                    <p className="text-muted">Category: {product.category || "N/A"}</p>

                    {/* Điều chỉnh số lượng và nút thêm vào giỏ hàng */}
                    <div className="mt-4">
                        <div className="d-flex align-items-center mb-3">
                            <Button
                                variant="outline-primary"
                                onClick={handleDecrease}
                                disabled={loading || quantity <= 1}
                                className="me-2"
                            >
                                -
                            </Button>
                            <Form.Control
                                type="number"
                                value={quantity}
                                onChange={handleQuantityChange}
                                min={1}
                                max={product.stock}
                                className="text-center"
                                style={{ width: "60px" }}
                            />
                            <Button
                                variant="outline-primary"
                                onClick={handleIncrease}
                                disabled={loading || quantity >= product.stock}
                                className="ms-2"
                            >
                                +
                            </Button>
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleAddToCart}
                            disabled={loading || product.stock <= 0}
                        >
                            {loading ? "Đang thêm..." : "Thêm vào giỏ hàng"}
                        </Button>
                    </div>
                </div>
            </div>
            <Accordion className="my-4">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Description</Accordion.Header>
                    <Accordion.Body>
                        {product.description || "No description available."}
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </main>
    );
};

export default DetailPage;