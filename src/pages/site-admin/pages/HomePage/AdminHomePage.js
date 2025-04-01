import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SCREEN_URL } from "../../../../constants/screen/PathScreen";
import { Card, Col, Row, Button } from "react-bootstrap";
import { FaBox, FaUsers, FaShoppingCart, FaPlus } from "react-icons/fa"; // Thêm icon từ react-icons
import "./style.css"; // Thêm file CSS nếu cần

const AdminHomePage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        products: 0,
        users: 0,
        orders: 0,
    });

    // Giả lập lấy dữ liệu thống kê (thay bằng API thực tế nếu có)
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Giả lập dữ liệu, thay bằng API thật nếu cần
                const mockStats = {
                    products: 16, // Từ dữ liệu sản phẩm bạn cung cấp trước đó
                    users: 50,    // Giả lập
                    orders: 25,   // Giả lập
                };
                setStats(mockStats);
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };
        fetchStats();
    }, []);

    // Điều hướng nhanh
    const handleNavigate = (path) => {
        navigate(path);
    };

    return (
        <div className="admin-home-container">
            <h2 className="mb-4 text-center">Bảng Điều Khiển Admin</h2>

            {/* Thống kê nhanh */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="text-center shadow-sm">
                        <Card.Body>
                            <FaBox size={40} className="text-primary mb-2" />
                            <Card.Title>Sản Phẩm</Card.Title>
                            <Card.Text className="display-6">{stats.products}</Card.Text>
                            <Button
                                variant="outline-primary"
                                onClick={() => handleNavigate(SCREEN_URL.ADMIN_PRODUCTS)}
                            >
                                Xem danh sách
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center shadow-sm">
                        <Card.Body>
                            <FaUsers size={40} className="text-success mb-2" />
                            <Card.Title>Người Dùng</Card.Title>
                            <Card.Text className="display-6">{stats.users}</Card.Text>
                            <Button variant="outline-success" onClick={() => handleNavigate("/admin/users")}>
                                Quản lý
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="text-center shadow-sm">
                        <Card.Body>
                            <FaShoppingCart size={40} className="text-warning mb-2" />
                            <Card.Title>Đơn Hàng</Card.Title>
                            <Card.Text className="display-6">{stats.orders}</Card.Text>
                            <Button variant="outline-warning" onClick={() => handleNavigate("/admin/orders")}>
                                Xem chi tiết
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Nút điều hướng nhanh */}
            <Row className="mb-4">
                <Col md={6} className="mb-3">
                    <Button
                        variant="primary"
                        size="lg"
                        block
                        onClick={() => handleNavigate(SCREEN_URL.ADMIN_CREATE_PRODUCT)}
                    >
                        <FaPlus className="me-2" /> Tạo Sản Phẩm Mới
                    </Button>
                </Col>
                <Col md={6} className="mb-3">
                    <Button
                        variant="secondary"
                        size="lg"
                        block
                        onClick={() => handleNavigate(SCREEN_URL.ADMIN_PRODUCTS)}
                    >
                        <FaBox className="me-2" /> Quản Lý Sản Phẩm
                    </Button>
                </Col>
            </Row>

            {/* Thông tin bổ sung hoặc widget */}
            <Row>
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Card.Title>Chào mừng đến với Bảng Điều Khiển</Card.Title>
                            <Card.Text>
                                Đây là trung tâm quản lý của bạn. Từ đây, bạn có thể quản lý sản phẩm, người dùng, đơn hàng và nhiều hơn nữa. Hãy bắt đầu bằng cách kiểm tra các số liệu thống kê hoặc tạo sản phẩm mới!
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AdminHomePage;