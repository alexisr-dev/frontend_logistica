import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authApi } from './services/authApi';
import type { Usuario } from '../../types';

interface AuthState {
  usuario: Usuario | null;
  autenticado: boolean;
  cargando: boolean;
  error: string | null;
}

const initialState: AuthState = {
  usuario: null,
  autenticado: !!localStorage.getItem('access_token'),
  cargando: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credenciales: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { access, refresh } = await authApi.login(credenciales);
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      return await authApi.yo();
    } catch {
      return rejectWithValue('Credenciales inválidas');
    }
  },
);

export const cargarUsuario = createAsyncThunk('auth/yo', async () => authApi.yo());

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      localStorage.clear();
      state.usuario = null;
      state.autenticado = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<Usuario>) => {
        state.cargando = false;
        state.autenticado = true;
        state.usuario = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.cargando = false;
        state.error = action.payload as string;
      })
      .addCase(cargarUsuario.fulfilled, (state, action: PayloadAction<Usuario>) => {
        state.usuario = action.payload;
        state.autenticado = true;
      })
      .addCase(cargarUsuario.rejected, (state) => {
        localStorage.clear();
        state.usuario = null;
        state.autenticado = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
