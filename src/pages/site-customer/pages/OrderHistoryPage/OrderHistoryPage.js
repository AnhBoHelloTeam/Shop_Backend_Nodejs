import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css"; // Tạo file CSS nếu cần
import { Table, Container } from "react-bootstrap";
import { fetchOrderHistoryAPI } from "../../../../api/checkoutAPI";

const OrderHistoryPage = () => {
    const [orders, setOrders] = useState([]); // Danh sách đơn hàng
    const [loading, setLoading] = useState(false); // Trạng thái loading khi gọi API
    const [error, setError] = useState(""); // Lưu thông báo lỗi nếu có

    // Lấy lịch sử đơn hàng từ API
    const fetchOrderHistory = async () => {
        setLoading(true);
        setError(""); // Reset lỗi trước khi gọi API
        try {
            const response = await fetchOrderHistoryAPI();
            if (Array.isArray(response)) {
                setOrders(response);
            } else {
                setOrders([]); // Nếu không có đơn hàng, đặt về mảng rỗng
                setError(response.message || "Chưa có đơn hàng nào.");
            }
        } catch (error) {
            console.error("Error fetching order history:", error);
            setError(error.response?.data?.message || "Không thể tải lịch sử đơn hàng.");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    // Format ngày
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("vi-VN", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    return (
        <Container className="mt-5">
            <h2 className="mb-4">Lịch Sử Đơn Hàng</h2>
            {loading ? (
                <p>Đang tải...</p>
            ) : error ? (
                <p className="text-muted">{error}</p>
            ) : orders.length === 0 ? (
                <p className="text-muted">Chưa có đơn hàng nào.</p>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Mã Đơn Hàng</th>
                            <th>Ngày Đặt</th>
                            <th>Sản Phẩm</th>
                            <th>Tổng Tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>{formatDate(order.createdAt)}</td>
                                <td>
                                    <ul className="mb-0">
                                        {order.items.map((item) => (
                                            <li key={item._id}>
                                                {item.product.name} (x{item.quantity}) -{" "}
                                                {(item.product.price * item.quantity).toLocaleString("vi-VN", {
                                                    style: "currency",
                                                    currency: "VND",
                                                })}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td>
                                    {order.totalPrice.toLocaleString("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default OrderHistoryPage;