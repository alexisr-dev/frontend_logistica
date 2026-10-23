import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, useMap, useMapEvents } from 'react-leaflet';
import CapaBase from '../../../components/CapaBase';
import { iconoPunto } from '../../../components/marcadores';
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
  letra = 'A',
  destino = false,
}: {
  titulo: string;
  punto: { lat: number; lng: number } | null;
  onElegir: (lat: number, lng: number) => void;
  vista?: { lat: number; lng: number } | null;
  color?: string;
  /** Letra del marcador: «A» para el origen, «B» para el destino. */
  letra?: string;
  destino?: boolean;
}) {
  const icono = useMemo(() => iconoPunto(letra, destino), [letra, destino]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{titulo}</span>
      <MapContainer
        center={punto ? [punto.lat, punto.lng] : CENTRO_INICIAL}
        zoom={12}
        className="mapa"
        style={{ height: 240 }}
      >
        <CapaBase />
        <CapturaClic onElegir={onElegir} />
        <CentrarEn vista={vista} />
        {punto && <Marker position={[punto.lat, punto.lng]} icon={icono} />}
      </MapContainer>
      <span style={{ fontSize: 13, color: punto ? color : 'var(--color-texto-suave)' }}>
        {punto
          ? `${punto.lat.toFixed(5)}, ${punto.lng.toFixed(5)}`
          : 'Haz clic en el mapa para marcar el punto.'}
      </span>
    </div>
  );
}
