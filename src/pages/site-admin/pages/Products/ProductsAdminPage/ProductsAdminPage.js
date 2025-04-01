import React, { useEffect, useState } from "react";
import { Button, Pagination, Table, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { deleteProductAPI, fetchProductsApi } from "../../../../../api/productsAPI";
import { SCREEN_URL } from "../../../../../constants/screen/PathScreen";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [categoryFilter, setCategoryFilter] = useState("all");

    const productsPerPage = 5;

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = {
                    page: currentPage,
                    limit: productsPerPage,
                    category: categoryFilter === "all" ? undefined : categoryFilter,
                };
                const data = await fetchProductsApi(params);
                setProducts(data.products || data);
                setTotalPages(Math.ceil((data.total || data.length) / productsPerPage));
            } catch (err) {
                setError(err.message || "Không thể tải danh sách sản phẩm.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [currentPage, categoryFilter]);

    const handleDelete = async (productId) => {
        if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
            try {
                await deleteProductAPI(productId);
                setProducts(products.filter((product) => product._id !== productId));
            } catch (err) {
                setError(err.message || "Không thể xóa sản phẩm.");
            }
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCategoryChange = (e) => {
        setCategoryFilter(e.target.value);
        setCurrentPage(1);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
    };

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString("vi-VN") : "N/A";
    };

    return (
        <div>
            <div className="control d-flex justify-content-between mb-3">
                <Button variant="primary">
                    <Link style={{ color: "white", textDecoration: "none" }} to={SCREEN_URL.ADMIN_CREATE_PRODUCT}>
                        Tạo sản phẩm mới
                    </Link>
                </Button>
                <div>
                    <div className="d-flex justify-content-end align-items-center gap-3">
                        <Pagination>
                            <Pagination.Prev
                                disabled={currentPage === 1 || loading}
                                onClick={() => handlePageChange(currentPage - 1)}
                            />
                            {Array.from({ length: totalPages }, (_, i) => (
                                <Pagination.Item
                                    key={i + 1}
                                    active={i + 1 === currentPage}
                                    onClick={() => handlePageChange(i + 1)}
                                    disabled={loading}
                                >
                                    {i + 1}
                                </Pagination.Item>
                            ))}
                            <Pagination.Next
                                disabled={currentPage === totalPages || loading}
                                onClick={() => handlePageChange(currentPage + 1)}
                            />
                        </Pagination>
                        <Form.Select
                            value={categoryFilter}
                            onChange={handleCategoryChange}
                            style={{
                                padding: "5px 12px",
                                borderRadius: "5px",
                                background: "#0D5EFD",
                                color: "white",
                            }}
                            disabled={loading}
                        >
                            <option value="all">Tất cả</option>
                            <option value="Laptop">Laptop</option>
                            {/* Thêm các danh mục khác nếu cần */}
                        </Form.Select>
                    </div>
                </div>
            </div>

            {loading && <div>Đang tải dữ liệu...</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}

            {!loading && !error && (
                <Table striped bordered hover style={{ width: "1200px" }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ngày tạo</th>
                            <th>Ngày cập nhật</th>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá</th>
                            <th>Số lượng còn trong kho</th>
                            <th>Hành động</th> {/* Đổi tiêu đề cột */}
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td>{product._id}</td>
                                <td>{formatDate(product.createdAt)}</td>
                                <td>{formatDate(product.updatedAt)}</td>
                                <td>
                                    <img
                                        src={product.image || "https://via.placeholder.com/50"}
                                        alt={product.name}
                                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                    />
                                </td>
                                <td>{product.name}</td>
                                <td>{product.category}</td>
                                <td>{formatPrice(product.price)}</td>
                                <td>{product.stock}</td>
                                <td>
                                    <Button
                                        variant="warning"
                                        as={Link}
                                        to={SCREEN_URL.ADMIN_EDIT_PRODUCT.replace(":productId", product._id)}
                                        className="me-2"
                                        disabled={loading}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                    <Button
                                        variant="danger"
                                        onClick={() => handleDelete(product._id)}
                                        disabled={loading}
                                    >
                                        Xóa
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default Products;