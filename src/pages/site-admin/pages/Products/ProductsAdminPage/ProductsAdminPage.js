import React from "react";
import { Button, Pagination, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

const Products = () => {
    return (
        <div>
            <div className="control d-flex justify-content-between">
                <Button variant="primary">
                    <Link style={{ color: 'white' }} to="#">Tạo sản phẩm mới</Link>
                </Button>
                <div>
                    <div className="d-flex justify-content-end">
                        <Pagination>
                            <Pagination.Prev disabled />
                            <Pagination.Item active>1</Pagination.Item>
                            <Pagination.Next disabled />
                        </Pagination>
                    </div>
                    <select
                        style={{
                            padding: "5px 12px",
                            borderRadius: "5px",
                            background: "#0D5EFD",
                            color: "white",
                        }}
                    >
                        <option value="all">Tất cả</option>
                        <option value="1">Danh mục 1</option>
                        <option value="2">Danh mục 2</option>
                    </select>
                </div>
            </div>
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
                        <th>Xoá sản phẩm</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>01/03/2025</td>
                        <td>05/03/2025</td>
                        <td><img src="https://via.placeholder.com/50" alt="Product" /></td>
                        <td>Sản phẩm A</td>
                        <td>Danh mục 1</td>
                        <td>500.000đ</td>
                        <td>10</td>
                        <td><Button variant="danger">Xóa</Button></td>
                    </tr>
                </tbody>
            </Table>
        </div>
    );
};

export default Products;
