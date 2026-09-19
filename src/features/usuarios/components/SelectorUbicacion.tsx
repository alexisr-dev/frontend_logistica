import { useEffect } from 'react';
import { MapContainer, Marker, useMap, useMapEvents } from 'react-leaflet';
import CapaBase from '../../../components/CapaBase';
import type { LatLngExpression } from 'leaflet';

const CENTRO_INICIAL: LatLngExpression = [-12.0464, -77.0428];

function CapturaClic({ onElegir }: { onElegir: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onElegir(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function CentrarEn({ vista }: { vista: { lat: number; lng: number } | null }) {
  const mapa = useMap();
  useEffect(() => {
    if (vista) mapa.setView([vista.lat, vista.lng], Math.max(mapa.getZoom(), 16));
  }, [mapa, vista?.lat, vista?.lng]);
  return null;
}

export default function SelectorUbicacion({
  titulo,
  punto,
  onElegir,
  vista = null,
  color = 'var(--color-primario)',
}: {
  titulo: string;
  punto: { lat: number; lng: number } | null;
  onElegir: (lat: number, lng: number) => void;
  vista?: { lat: number; lng: number } | null;
  color?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{titulo}</span>
      <MapContainer
        center={punto ? [punto.lat, punto.lng] : CENTRO_INICIAL}
        zoom={12}
        style={{ height: 240, borderRadius: 10, border: '1px solid var(--color-borde)' }}
      >
        <CapaBase />
        <CapturaClic onElegir={onElegir} />
        <CentrarEn vista={vista} />
        {punto && <Marker position={[punto.lat, punto.lng]} />}
      </MapContainer>
      <span style={{ fontSize: 12, color: punto ? color : 'var(--color-texto-suave)' }}>
        {punto
          ? `${punto.lat.toFixed(5)}, ${punto.lng.toFixed(5)}`
          : 'Haz clic en el mapa para marcar el punto.'}
      </span>
    </div>
  );
}
