import apiClient from '../../../services/apiClient';
import type { Pedido, Paginado, EstadoPedido, PedidoNuevo } from '../../../types';

export const pedidosApi = {
  async listar(params?: Record<string, string>): Promise<Paginado<Pedido>> {
    const { data } = await apiClient.get<Paginado<Pedido>>('/pedidos/', { params });
    return data;
  },

  async listarTodos(params: Record<string, string> = {}, maxPaginas = 20): Promise<Pedido[]> {
    const todos: Pedido[] = [];
    for (let pagina = 1; pagina <= maxPaginas; pagina += 1) {
      const { results, next } = await this.listar({
        ...params,
        page_size: '100',
        page: String(pagina),
      });
      todos.push(...results);
      if (!next) break;
    }
    return todos;
  },

  async obtener(id: number): Promise<Pedido> {
    const { data } = await apiClient.get<Pedido>(`/pedidos/${id}/`);
    return data;
  },

  async crear(payload: PedidoNuevo): Promise<Pedido> {
    const { data } = await apiClient.post<Pedido>('/pedidos/', payload);
    return data;
  },

  async actualizar(id: number, cambios: Partial<PedidoNuevo>): Promise<Pedido> {
    const { data } = await apiClient.patch<Pedido>(`/pedidos/${id}/`, cambios);
    return data;
  },

  async estados(): Promise<EstadoPedido[]> {
    const { data } = await apiClient.get<Paginado<EstadoPedido> | EstadoPedido[]>('/pedidos/estados/');
    return Array.isArray(data) ? data : data.results;
  },

  async cambiarEstado(id: number, codigo: string, comentario = ''): Promise<Pedido> {
    const { data } = await apiClient.post<Pedido>(`/pedidos/${id}/cambiar-estado/`, {
      codigo,
      comentario,
    });
    return data;
  },
};
