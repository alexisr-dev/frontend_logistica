import { useEffect } from 'react';
import { MapContainer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import CapaBase from '../../../components/CapaBase';
import { iconoParada } from '../../../components/marcadores';
import L from 'leaflet';
import { decodePolyline } from '../../../utils/polyline';

export interface ParadaMapa {
  lat: number;
  lng: number;
  orden: number;
  etiqueta: string;
  estado?: 'pendiente' | 'entregado' | 'fallido';
}

const CENTRO_INICIAL: [number, number] = [-12.0464, -77.0428];

function EncuadrarRuta({ puntos, firma }: { puntos: [number, number][]; firma: string }) {
  const mapa = useMap();
  useEffect(() => {
    if (puntos.length === 0) return;
    const limites = L.latLngBounds(puntos);
    if (limites.getNorthEast().equals(limites.getSouthWest())) {
      mapa.setView(limites.getCenter(), 16);
    } else {
      mapa.fitBounds(limites, { padding: [30, 30] });
    }
  }, [mapa, firma]);
  return null;
}

export default function MapaRuta({
  geometria,
  paradas = [],
}: {
  geometria?: string | null;
  paradas?: ParadaMapa[];
}) {
  const trazado = geometria ? decodePolyline(geometria) : [];
  const puntos: [number, number][] = [
    ...trazado,
    ...paradas.map((p) => [p.lat, p.lng] as [number, number]),
  ];
  const firma = puntos.length
    ? `${puntos.length}|${puntos[0].join()}|${puntos[puntos.length - 1].join()}`
    : '';

  return (
    <MapContainer center={puntos[0] ?? CENTRO_INICIAL} zoom={13} className="mapa" style={{ height: 420 }}>
      <CapaBase />
      <EncuadrarRuta puntos={puntos} firma={firma} />
      {trazado.length > 0 && (
        <>
          {/* Un borde blanco bajo la línea negra: se lee sobre cualquier calle. */}
          <Polyline positions={trazado} pathOptions={{ color: '#ffffff', weight: 9, opacity: 0.9 }} />
          <Polyline positions={trazado} pathOptions={{ color: '#14130f', weight: 5 }} />
        </>
      )}
      {paradas.map((p) => (
        <Marker key={p.orden} position={[p.lat, p.lng]} icon={iconoParada(p.orden, p.estado)}>
          <Popup>
            <strong>Parada {p.orden}</strong>
            <br />
            {p.etiqueta}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
