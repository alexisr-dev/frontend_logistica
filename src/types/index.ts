export type Rol = 'cliente' | 'repartidor' | 'administrador';

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  nombre_completo: string;
  telefono?: string;
  rol: Rol;
  foto_url?: string;
  activo: boolean;
}

export interface UsuarioNuevo {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol: Rol;
  activo?: boolean;
}

export type UsuarioActualizar = Partial<UsuarioNuevo>;

export interface RespuestaEliminacion {
  resultado: 'eliminado' | 'desactivado';
  detail: string;
  referencias?: Record<string, number>;
  usuario?: Usuario | { id: number; email: string };
}

export interface EstadoPedido {
  id: number;
  codigo: string;
  nombre: string;
  orden: number;
}

export interface Direccion {
  id: number;
  alias?: string;
  calle: string;
  numero?: string;
  distrito?: string;
  ciudad?: string;
  referencia?: string;
  latitud: number;
  longitud: number;
  es_default: boolean;
}

export interface HistorialEstado {
  id: number;
  estado: EstadoPedido;
  comentario?: string;
  fecha: string;
}

export interface Pedido {
  id: number;
  codigo_seguimiento: string;
  cliente: Usuario;
  repartidor?: Usuario;
  direccion_origen: Direccion;
  direccion_destino: Direccion;
  estado: EstadoPedido;
  descripcion?: string;
  peso_kg?: number;
  costo_envio?: number;
  fecha_creacion: string;
  fecha_estimada_entrega?: string;
  fecha_entrega_real?: string;
  historial: HistorialEstado[];
  transiciones_permitidas: EstadoPedido[];
}

export interface UbicacionSeleccionada {
  calle: string;
  distrito?: string;
  ciudad?: string;
  lat: number | null;
  lng: number | null;
}

export interface DireccionNueva {
  usuario?: number;
  alias?: string;
  calle: string;
  numero?: string;
  distrito?: string;
  ciudad?: string;
  referencia?: string;
  latitud: number;
  longitud: number;
}

export interface PedidoNuevo {
  cliente?: number;
  repartidor?: number | null;
  direccion_origen: number;
  direccion_destino: number;
  descripcion?: string;
  peso_kg?: number;
  costo_envio?: number;
  fecha_estimada_entrega?: string;
}

export type EstadoRuta = 'planificada' | 'en_curso' | 'finalizada' | 'cancelada';

export interface ParadaRuta {
  id: number;
  pedido: number;
  codigo_seguimiento: string;
  orden_parada: number;
  estado_parada: 'pendiente' | 'entregado' | 'fallido';
  hora_estimada?: string | null;
  hora_real?: string | null;
  direccion?: string | null;
  distrito?: string | null;
  latitud?: number | null;
  longitud?: number | null;
}

export interface Ruta {
  id: number;
  repartidor: number;
  fecha: string;
  estado: EstadoRuta;
  distancia_total_km?: string | number | null;
  tiempo_estimado_min?: number | null;
  geometria_ruta?: string | null;
  fecha_creacion?: string;
  paradas: ParadaRuta[];
}

export interface RendimientoRepartidor {
  repartidor_id: number;
  repartidor: string;
  total_entregas: number;
  entregas_a_tiempo: number;
  entregas_tardias: number;
  tiempo_promedio_min: number | null;
  calificacion_promedio: number | null;
}

export interface Paginado<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
