import apiClient from '../../../services/apiClient';
import type { Usuario } from '../../../types';

interface TokenResponse {
  access: string;
  refresh: string;
}

export const authApi = {
  async login(credenciales: { email: string; password: string }): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>('/auth/login/', credenciales);
    return data;
  },

  async yo(): Promise<Usuario> {
    const { data } = await apiClient.get<Usuario>('/usuarios/yo/');
    return data;
  },

  async solicitarCodigo(email: string): Promise<{ detail: string; expira_en_minutos: number }> {
    const { data } = await apiClient.post('/auth/password-reset/', { email });
    return data;
  },

  async confirmarCodigo(payload: {
    email: string;
    codigo: string;
    password_nueva: string;
  }): Promise<{ detail: string }> {
    const { data } = await apiClient.post('/auth/password-reset/confirmar/', payload);
    return data;
  },
};
