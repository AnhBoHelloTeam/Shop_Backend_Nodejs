import { createSlice } from "@reduxjs/toolkit";
import * as actions from './asynsActions';

export const userSlice = createSlice({
    name: "user",
    initialState: {
        isLoggedIn: false,
        current: null,
        token: null,
        isLoading: false,
        errorMessage: ""
    },
    reducers: {
        login: (state, action) => {
            console.log(action.payload);
            state.isLoggedIn = action.payload.isLoggedIn
            state.current = action.payload.userData
            state.token = action.payload.token
        },
        logout: (state, action) => {
            state.isLoggedIn = false
            state.current = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(actions.getCurrent.pending, (state, actions) => {
                state.isLoading = true;
            })
            .addCase(actions.getCurrent.fulfilled, (state, action) => {
                state.isLoading = false;
                state.current = action.payload;
            })
            .addCase(actions.getCurrent.rejected, (state, actions) => {
                state.isLoading = false;
                state.current = null;
            });
    }
});
export const { login, logout } = userSlice.actions

export default userSlice.reducer;
