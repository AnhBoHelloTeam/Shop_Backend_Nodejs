import axiosInstance from "../config/axiosConfig/axios.config";
import { API } from "../constants/hostAPI/hostAPI";

// Checkout giỏ hàng
export const checkoutCartAPI = async () => {
    try {
        const response = await axiosInstance.post(`${API.ORDER}/checkout`);
        return response.data;
    } catch (error) {
        console.error("Error during checkout:", error);
        throw error;
    }
};

// Lấy lịch sử đơn hàng của user
export const fetchOrderHistoryAPI = async () => {
    try {
        const response = await axiosInstance.get(`${API.ORDER}/history`);
        return response.data;
    } catch (error) {
        console.error("Error fetching order history:", error);
        throw error;
    }
};