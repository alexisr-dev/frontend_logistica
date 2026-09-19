import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { pedidosApi } from './services/pedidosApi';
import type { Pedido } from '../../types';

interface PedidosState {
  lista: Pedido[];
  total: number;
  cargando: boolean;
  error: string | null;
}

const initialState: PedidosState = {
  lista: [],
  total: 0,
  cargando: false,
  error: null,
};

export const cargarPedidos = createAsyncThunk(
  'pedidos/cargar',
  async (params: Record<string, string> | undefined) => pedidosApi.listar(params),
);

const pedidosSlice = createSlice({
  name: 'pedidos',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(cargarPedidos.pending, (state) => {
        state.cargando = true;
        state.error = null;
      })
      .addCase(cargarPedidos.fulfilled, (state, action: PayloadAction<{ count: number; results: Pedido[] }>) => {
        state.cargando = false;
        state.lista = action.payload.results;
        state.total = action.payload.count;
      })
      .addCase(cargarPedidos.rejected, (state) => {
        state.cargando = false;
        state.error = 'No se pudieron cargar los pedidos';
      });
  },
});

export default pedidosSlice.reducer;
