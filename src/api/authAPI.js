import axiosInstance from "../config/axiosConfig/axios.config";
import { API } from "../constants/hostAPI/hostAPI";

export const loginAPI = async (email, password) => {
    try {
        const res = await axiosInstance.post(`${API.AUTH}/login`, { email, password });
        return res.data;
    } catch (error) {
        throw error;
    }
};
export const regisAPI = async (register_body) => {
    try {
        const res = await axiosInstance.post(`${API.AUTH}/register`, register_body);
        return res.data;
    } catch (error) {
        console.log('err');
        throw error;
    }
};

