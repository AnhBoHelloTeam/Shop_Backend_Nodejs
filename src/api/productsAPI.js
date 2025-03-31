import axiosInstance from "../config/axiosConfig/axios.config";
import { API } from "../constants/hostAPI/hostAPI";

// Lấy danh sách tất cả sản phẩm
export const fetchProductsApi = async (params) => {
    try {
        const response = await axiosInstance.get(API.PRODUCTS, {
            params: params,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching Products data:", error);
        throw error;
    }
};

// Lấy thông tin sản phẩm theo ID
export const fetchProductAPIByID = async (id) => {
    try {
        const response = await axiosInstance.get(`${API.PRODUCTS}/${id}`);
        return response.data; // Backend trả về object sản phẩm
    } catch (error) {
        console.error("Error fetching Product by ID:", error);
        throw error;
    }
};


// Thêm sản phẩm mới (Chỉ admin)
export const createProductsAPI = async (productData) => {
    try {
        const response = await axiosInstance.post(API.PRODUCTS, productData);
        return response.data; // Backend trả về sản phẩm vừa tạo
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401 || error.response.status === 403) {
                throw new Error("Không có quyền thực hiện hành động này.");
            } else if (error.response.status === 400) {
                throw new Error("Thiếu thông tin sản phẩm. Vui lòng kiểm tra lại.");
            } else {
                throw new Error("Đã có lỗi xảy ra. Vui lòng thử lại.");
            }
        } else {
            throw new Error("Không thể kết nối đến máy chủ.");
        }
    }
};

// Cập nhật sản phẩm theo ID (Chỉ admin)
export const updateProductsAPI = async (productData) => {
    try {
        const { id, ...updateData } = productData; // Tách id ra khỏi dữ liệu cập nhật
        const response = await axiosInstance.put(`${API.PRODUCTS}/${id}`, updateData);
        return response.data; // Backend trả về sản phẩm đã cập nhật
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401 || error.response.status === 403) {
                throw new Error("Không có quyền thực hiện hành động này.");
            } else if (error.response.status === 404) {
                throw new Error("Không tìm thấy sản phẩm.");
            } else {
                throw new Error("Đã có lỗi xảy ra. Vui lòng thử lại.");
            }
        } else {
            throw new Error("Không thể kết nối đến máy chủ.");
        }
    }
};

// Xóa sản phẩm theo ID (Chỉ admin)
export const deleteProductAPI = async (productId) => {
    try {
        const response = await axiosInstance.delete(`${API.PRODUCTS}/${productId}`);
        return response.data || { message: "Sản phẩm đã xóa thành công." }; // Backend trả về thông báo
    } catch (error) {
        if (error.response) {
            if (error.response.status === 401 || error.response.status === 403) {
                throw new Error("Không có quyền thực hiện hành động này.");
            } else if (error.response.status === 404) {
                throw new Error("Không tìm thấy sản phẩm.");
            } else {
                throw new Error("Đã có lỗi xảy ra. Vui lòng thử lại.");
            }
        } else {
            throw new Error("Không thể kết nối đến máy chủ.");
        }
    }
};