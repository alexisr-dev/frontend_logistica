import apiClient from '../../../services/apiClient';
import type { Ruta, Paginado } from '../../../types';

export const rutasApi = {
  async listar(): Promise<Ruta[]> {
    const { data } = await apiClient.get<Paginado<Ruta> | Ruta[]>('/rutas/');
    return Array.isArray(data) ? data : data.results;
  },

  async planificar(payload: { repartidor: number; fecha: string; pedidos: number[] }): Promise<Ruta> {
    const { data } = await apiClient.post<Ruta>('/rutas/planificar/', payload);
    return data;
  },
};
