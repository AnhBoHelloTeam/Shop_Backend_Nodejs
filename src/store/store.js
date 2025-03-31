import { configureStore } from '@reduxjs/toolkit';
import userSlice from './user/userSlice';
import storage from 'redux-persist/lib/storage';
import { persistStore, persistReducer } from 'redux-persist';

// Cấu hình chung cho redux-persist
const commonConfig = {
  key: 'shop/user',
  storage
};

// Cấu hình cụ thể cho user reducer
const userConfig = {
  ...commonConfig,
  whitelist: ['isLoggedIn', 'token'],
};

// Tạo store với reducer đã được persist
export const store = configureStore({
  reducer: {
    user: persistReducer(userConfig, userSlice)
  },
});

// Xuất persistor để sử dụng với PersistGate
export const persistor = persistStore(store);