import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import CapaBase from '../../../components/CapaBase';
import { iconoRepartidor } from '../../../components/marcadores';
import { useEffect } from 'react';
import { useWebSocketTracking } from '../hooks/useWebSocketTracking';

function Recentrar({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

const ICONO_REPARTIDOR = iconoRepartidor();

export default function MapaTiempoReal({
  pedidoId,
  finalizado = false,
  centroInicial,
}: {
  pedidoId: number;
  /** El pedido ya está cerrado: no se espera a ningún repartidor. */
  finalizado?: boolean;
  /** Dónde mirar mientras no llega la posición del repartidor (p. ej. el destino). */
  centroInicial?: [number, number];
}) {
  const { punto, error } = useWebSocketTracking(pedidoId);
  const centro: [number, number] = punto ? [punto.lat, punto.lng] : (centroInicial ?? [0, 0]);

  const mensaje =
    error ??
    (punto
      ? 'Recibiendo la ubicación del repartidor en vivo.'
      : finalizado
        ? 'Este pedido ya está cerrado: el seguimiento en vivo terminó.'
        : 'Esperando a que el repartidor active «En servicio» en la app móvil.');

  return (
    <div>
      <MapContainer center={centro} zoom={14} className="mapa" style={{ height: 400 }}>
        <CapaBase />
        {punto && (
          <>
            <Marker position={[punto.lat, punto.lng]} icon={ICONO_REPARTIDOR}>
              <Popup>
                Repartidor en camino
                {punto.velocidad != null && <> · {punto.velocidad} km/h</>}
              </Popup>
            </Marker>
            <Recentrar lat={punto.lat} lng={punto.lng} />
          </>
        )}
      </MapContainer>

      <p
        role="status"
        style={{
          marginTop: 8,
          fontSize: 13.5,
          fontWeight: 500,
          color: error ? 'var(--color-alerta)' : 'var(--color-texto-suave)',
        }}
      >
        {mensaje}
      </p>
    </div>
  );
}
