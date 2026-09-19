import { useEffect } from 'react';
import { MapContainer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import CapaBase from '../../../components/CapaBase';
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

const COLOR_PARADA: Record<string, string> = {
  pendiente: 'var(--color-primario)',
  entregado: 'var(--color-exito)',
  fallido: 'var(--color-alerta)',
};

function iconoParada(orden: number, estado: ParadaMapa['estado']) {
  const color = COLOR_PARADA[estado ?? 'pendiente'] ?? COLOR_PARADA.pendiente;
  return L.divIcon({
    className: '',
    html:
      `<div style="width:26px;height:26px;border-radius:50%;background:${color};` +
      'color:#fff;font:700 12px/26px system-ui,sans-serif;text-align:center;' +
      'box-shadow:0 0 0 2px #fff,0 1px 4px rgba(0,0,0,.4)">' +
      `${orden}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

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
    <MapContainer
      center={puntos[0] ?? CENTRO_INICIAL}
      zoom={13}
      style={{ height: 420, borderRadius: 12 }}
    >
      <CapaBase />
      <EncuadrarRuta puntos={puntos} firma={firma} />
      {trazado.length > 0 && (
        <Polyline positions={trazado} pathOptions={{ color: 'var(--color-primario)', weight: 5 }} />
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
