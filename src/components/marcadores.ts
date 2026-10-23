import L from 'leaflet';

/**
 * Marcadores de mapa con la misma geometría que el resto de la interfaz:
 * paradas numeradas, puntos A/B cuadrados y un rombo amarillo para el
 * repartidor. El aspecto vive en componentes.css (`.marcador*`).
 */

type EstadoParada = 'pendiente' | 'entregado' | 'fallido' | undefined;

export function iconoParada(orden: number, estado: EstadoParada): L.DivIcon {
  const variante = estado === 'entregado' || estado === 'fallido' ? ` marcador--${estado}` : '';
  return L.divIcon({
    className: `marcador marcador--parada${variante}`,
    html: String(orden),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -16],
  });
}

/** Punto de origen (cuadrado negro) o de destino (cuadrado blanco), con su letra. */
export function iconoPunto(letra: string, destino = false): L.DivIcon {
  return L.divIcon({
    className: `marcador marcador--punto${destino ? ' marcador--punto-destino' : ''}`,
    html: letra,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function iconoRepartidor(): L.DivIcon {
  return L.divIcon({
    className: 'marcador marcador--repartidor',
    html: '',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });
}
