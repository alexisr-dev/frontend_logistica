import apiClient from '../../../services/apiClient';
import type {
  Usuario,
  UsuarioNuevo,
  UsuarioActualizar,
  RespuestaEliminacion,
  Direccion,
  DireccionNueva,
  Paginado,
} from '../../../types';

function desempaquetar<T>(data: Paginado<T> | T[]): T[] {
  return Array.isArray(data) ? data : data.results;
}

export interface FiltrosUsuarios {
  search?: string;
  rol?: string;
  activo?: string;
  page?: number;
}

export const usuariosApi = {
  async repartidores(): Promise<Usuario[]> {
    const { data } = await apiClient.get<Paginado<Usuario> | Usuario[]>('/usuarios/repartidores/');
    return desempaquetar(data);
  },

  async clientes(): Promise<Usuario[]> {
    const { data } = await apiClient.get<Paginado<Usuario> | Usuario[]>('/usuarios/', {
      params: { rol: 'cliente', activo: 'true' },
    });
    return desempaquetar(data);
  },

  async listar(filtros: FiltrosUsuarios = {}): Promise<Paginado<Usuario>> {
    const params: Record<string, string> = {};
    if (filtros.search) params.search = filtros.search;
    if (filtros.rol) params.rol = filtros.rol;
    if (filtros.activo) params.activo = filtros.activo;
    if (filtros.page && filtros.page > 1) params.page = String(filtros.page);

    const { data } = await apiClient.get<Paginado<Usuario>>('/usuarios/', { params });
    return data;
  },

  async obtener(id: number): Promise<Usuario> {
    const { data } = await apiClient.get<Usuario>(`/usuarios/${id}/`);
    return data;
  },

  async crear(payload: UsuarioNuevo): Promise<Usuario> {
    const { data } = await apiClient.post<Usuario>('/usuarios/', payload);
    return data;
  },

  async actualizar(id: number, payload: UsuarioActualizar): Promise<Usuario> {
    const { data } = await apiClient.patch<Usuario>(`/usuarios/${id}/`, payload);
    return data;
  },

  async eliminar(id: number): Promise<RespuestaEliminacion> {
    const { data } = await apiClient.delete<RespuestaEliminacion>(`/usuarios/${id}/`);
    return data;
  },
};

export const direccionesApi = {
  async listar(usuarioId?: number): Promise<Direccion[]> {
    const { data } = await apiClient.get<Paginado<Direccion> | Direccion[]>('/usuarios/direcciones/', {
      params: usuarioId ? { usuario: String(usuarioId) } : undefined,
    });
    return desempaquetar(data);
  },

  async crear(payload: DireccionNueva): Promise<Direccion> {
    const { data } = await apiClient.post<Direccion>('/usuarios/direcciones/', payload);
    return data;
  },
};
