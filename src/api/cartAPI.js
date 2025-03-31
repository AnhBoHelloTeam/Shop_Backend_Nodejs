import axiosInstance from "../config/axiosConfig/axios.config";
import { API } from "../constants/hostAPI/hostAPI";

// Lấy toàn bộ giỏ hàng của user
export const fetchCartsApi = async () => {
    try {
        const response = await axiosInstance.get(API.CART);
        return response.data;
    } catch (error) {
        console.error("Error fetching CARTS data:", error);
        throw error;
    }
};

// Lấy giỏ hàng theo ID (nếu cần trong trường hợp quản lý nhiều giỏ hàng)
export const fetchCartByIDApi = async (id) => {
    try {
        const response = await axiosInstance.get(`${API.CART}/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching Cart data by ID:", error);
        throw error;
    }
};

// Thêm sản phẩm vào giỏ hàng
export const addToCartApi = async (productId, quantity) => {
    try {
        const response = await axiosInstance.post(`${API.CART}/add`, {
            productId,
            quantity,
        });
        return response.data;
    } catch (error) {
        console.error("Error adding product to cart:", error);
        throw error;
    }
};

// Xóa sản phẩm khỏi giỏ hàng
export const removeFromCartApi = async (productId) => {
    try {
        const response = await axiosInstance.delete(`${API.CART}/remove/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error removing product from cart:", error);
        throw error;
    }
};

// Giảm số lượng sản phẩm trong giỏ hàng
export const decreaseCartItemApi = async (productId) => {
    try {
        const response = await axiosInstance.put(`${API.CART}/decrease/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error decreasing cart item quantity:", error);
        throw error;
    }
};

// Tăng số lượng sản phẩm trong giỏ hàng
export const increaseCartItemApi = async (productId) => {
    try {
        const response = await axiosInstance.put(`${API.CART}/increase/${productId}`);
        return response.data;
    } catch (error) {
        console.error("Error increasing cart item quantity:", error);
        throw error;
    }
};
