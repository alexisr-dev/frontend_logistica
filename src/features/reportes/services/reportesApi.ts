import apiClient from '../../../services/apiClient';
import type { RendimientoRepartidor } from '../../../types';

export const reportesApi = {
  async rendimiento(): Promise<RendimientoRepartidor[]> {
    const { data } = await apiClient.get<RendimientoRepartidor[]>(
      '/reportes/rendimiento-repartidores/',
    );
    return data;
  },

  async resumen(): Promise<{
    total_pedidos: number;
    entregados: number;
    en_camino: number;
    cancelados: number;
  }> {
    const { data } = await apiClient.get('/reportes/resumen/');
    return data;
  },
};
