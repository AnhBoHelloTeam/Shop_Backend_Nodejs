import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiGetCurrent } from "../../api/usersAPI";

export const getCurrent = createAsyncThunk(
    'user/getUser',
    async (data, { rejectWithValue }) => {
        const response = await apiGetCurrent();
        if (!response.success) return rejectWithValue(response.error);
        return response.response;
    }
)
