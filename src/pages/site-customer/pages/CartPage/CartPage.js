import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
    fetchCartsApi,
    increaseCartItemApi,
    decreaseCartItemApi,
    removeFromCartApi,
} from "../../../../api/cartAPI";
import { checkoutCartAPI } from "../../../../api/checkoutAPI"; // Import API checkout
import { SCREEN_URL } from "../../../../constants/screen/PathScreen";
import Swal from "sweetalert2";

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]); // Danh sách sản phẩm trong giỏ
    const [loading, setLoading] = useState(false); // Trạng thái loading khi gọi API
    const navigate = useNavigate(); // Để chuyển hướng sau khi checkout

    // Lấy danh sách giỏ hàng từ API
    const fetchCartData = async () => {
        setLoading(true);
        try {
            const cartData = await fetchCartsApi();
            setCartItems(cartData?.items || []);
        } catch (error) {
            console.error("Error fetching cart:", error);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartData();
    }, []);

    // Tăng số lượng sản phẩm
    const handleIncrease = async (productId) => {
        setLoading(true);
        try {
            const response = await increaseCartItemApi(productId);
            const updatedItems = response.cart.items.map((newItem) => {
                const existingItem = cartItems.find(
                    (item) => item.product._id === newItem.product
                );
                return {
                    ...newItem,
                    product: existingItem ? existingItem.product : newItem.product,
                };
            });
            setCartItems(updatedItems);
        } catch (error) {
            console.error("Error increasing quantity:", error);
            alert("Không thể tăng số lượng. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    // Giảm số lượng sản phẩm
    const handleDecrease = async (productId) => {
        setLoading(true);
        try {
            const response = await decreaseCartItemApi(productId);
            const updatedItems = response.cart.items.map((newItem) => {
                const existingItem = cartItems.find(
                    (item) => item.product._id === newItem.product
                );
                return {
                    ...newItem,
                    product: existingItem ? existingItem.product : newItem.product,
                };
            });
            setCartItems(updatedItems);
        } catch (error) {
            console.error("Error decreasing quantity:", error);
            alert("Không thể giảm số lượng. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const handleRemove = async (productId) => {
        setLoading(true);
        try {
            await removeFromCartApi(productId);
            setCartItems(cartItems.filter((item) => item.product._id !== productId));
        } catch (error) {
            console.error("Error removing item:", error);
            alert("Không thể xóa sản phẩm. Vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    // Xử lý checkout
    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Giỏ hàng trống",
                text: "Vui lòng thêm sản phẩm trước khi thanh toán!",
            });
            return;
        }

        setLoading(true);
        try {
            const response = await checkoutCartAPI();
            Swal.fire({
                icon: "success",
                title: "Đặt hàng thành công!",
                text: response.message || "Đơn hàng của bạn đã được tạo.",
                confirmButtonText: "Xem lịch sử đơn hàng",
                showCancelButton: true,
                cancelButtonText: "Về trang chủ",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate(SCREEN_URL.ORDER_HISTORY); // Chuyển hướng đến lịch sử đơn hàng
                } else {
                    navigate(SCREEN_URL.HOME); // Quay về trang chủ
                }
            });
            setCartItems([]); // Xóa giỏ hàng trên client sau khi checkout thành công
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || "Không thể thanh toán. Vui lòng thử lại!";
            Swal.fire({
                icon: "error",
                title: "Lỗi thanh toán",
                text: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    // Tính tổng tiền
    const calculateTotal = () => {
        return cartItems.reduce(
            (total, item) => total + (item.product?.price || 0) * (item.quantity || 0),
            0
        );
    };

    return (
        <main className="container mt-5">
            <h2 className="mb-4">Shopping Cart</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="row mb-5">
                    <div className="col-8">
                        {cartItems.length === 0 ? (
                            <p>Giỏ hàng của bạn đang trống.</p>
                        ) : (
                            <table cellPadding="10" id="table-list-student">
                                <thead>
                                    <tr>
                                        <th style={{ opacity: "0" }}>Cover</th>
                                        <th>Product</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Subtotal</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item) => (
                                        <tr key={item.product?._id || item._id}>
                                            <td>
                                                <img
                                                    src={item.product?.image || "https://via.placeholder.com/70"}
                                                    alt={item.product?.name || "Product"}
                                                    width="70"
                                                    height="70"
                                                />
                                            </td>
                                            <td className="product-name">{item.product?.name || "N/A"}</td>
                                            <td className="product-price">
                                                {(item.product?.price || 0).toLocaleString("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                })}
                                            </td>
                                            <td className="product-quantity">
                                                <div className="quantity-control">
                                                    <Button
                                                        variant="outline-secondary"
                                                        className="quantity-button"
                                                        onClick={() => handleDecrease(item.product?._id)}
                                                        disabled={loading || (item.quantity || 0) <= 1}
                                                    >
                                                        -
                                                    </Button>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="quantity-input"
                                                    value={item.quantity || 0}
                                                    readOnly
                                                />
                                                <div className="quantity-control">
                                                    <Button
                                                        variant="outline-secondary"
                                                        className="quantity-button"
                                                        onClick={() => handleIncrease(item.product?._id)}
                                                        disabled={loading}
                                                    >
                                                        +
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="product-subtotal">
                                                {((item.product?.price || 0) * (item.quantity || 0)).toLocaleString(
                                                    "vi-VN",
                                                    {
                                                        style: "currency",
                                                        currency: "VND",
                                                    }
                                                )}
                                            </td>
                                            <td className="product-del">
                                                <Button
                                                    variant="outline-danger"
                                                    onClick={() => handleRemove(item.product?._id)}
                                                    disabled={loading}
                                                >
                                                    Remove
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className="col-4">
                        <div className="order-summary">
                            <h5 className="card-title p-2">Order Summary</h5>
                            <ul className="list-group p-2">
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    Total
                                    <span>
                                        {calculateTotal().toLocaleString("vi-VN", {
                                            style: "currency",
                                            currency: "VND",
                                        })}
                                    </span>
                                </li>
                            </ul>
                            <Button
                                variant="success"
                                className="btn-block mt-3"
                                onClick={handleCheckout}
                                disabled={loading || cartItems.length === 0}
                            >
                                {loading ? "Đang xử lý..." : "CHECKOUT"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default CartPage;