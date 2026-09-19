import { MapContainer, Marker, Popup, useMap } from 'react-leaflet';
import CapaBase from '../../../components/CapaBase';
import { useEffect } from 'react';
import { useWebSocketTracking } from '../hooks/useWebSocketTracking';

function Recentrar({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function MapaTiempoReal({ pedidoId }: { pedidoId: number }) {
  const { punto, error } = useWebSocketTracking(pedidoId);
  const centro: [number, number] = punto ? [punto.lat, punto.lng] : [0, 0];

  return (
    <div>
      <MapContainer center={centro} zoom={14} style={{ height: 400, borderRadius: 12 }}>
        <CapaBase />
        {punto && (
          <>
            <Marker position={[punto.lat, punto.lng]}>
              <Popup>
                Repartidor en camino
                {punto.velocidad != null && <> · {punto.velocidad} km/h</>}
              </Popup>
            </Marker>
            <Recentrar lat={punto.lat} lng={punto.lng} />
          </>
        )}
      </MapContainer>

      <p style={{ marginTop: 8, fontSize: 13, color: error ? 'var(--color-alerta)' : 'var(--color-texto-suave)' }}>
        {error
          ?? (punto
            ? 'Recibiendo la ubicación del repartidor en vivo.'
            : 'Esperando a que el repartidor active «En servicio» en la app móvil.')}
      </p>
    </div>
  );
}
