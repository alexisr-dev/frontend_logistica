import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import pedidosReducer from '../features/pedidos/pedidosSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pedidos: pedidosReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
