import { useEffect, useRef, useState } from 'react';

export interface PuntoTracking {
  lat: number;
  lng: number;
  velocidad?: number;
}

const MOTIVOS: Record<number, string> = {
  4401: 'Tu sesión expiró. Vuelve a iniciar sesión para ver el seguimiento.',
  4403: 'No tienes permiso para seguir este pedido.',
  4404: 'El pedido ya no existe.',
  4503: 'El servidor de tiempo real no está disponible (falta Redis o la capa en memoria).',
};

export interface EstadoTracking {
  punto: PuntoTracking | null;
  error: string | null;
}

export function useWebSocketTracking(pedidoId: number | null): EstadoTracking {
  const [punto, setPunto] = useState<PuntoTracking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (pedidoId == null) return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError(MOTIVOS[4401]);
      return;
    }

    setPunto(null);
    setError(null);

    const base = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000';
    const ws = new WebSocket(
      `${base}/ws/tracking/${pedidoId}/?token=${encodeURIComponent(token)}`,
    );
    socketRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as PuntoTracking;
        setPunto(data);
      } catch {
        /* ignora mensajes malformados */
      }
    };

    ws.onclose = (event) => {
      const motivo = MOTIVOS[event.code];
      if (motivo) setError(motivo);
    };

    return () => ws.close();
  }, [pedidoId]);

  return { punto, error };
}
