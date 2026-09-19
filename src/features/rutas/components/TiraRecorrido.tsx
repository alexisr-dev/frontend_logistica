import { Fragment } from 'react';

export interface PuntoRecorrido {
  lat: number;
  lng: number;
  etiqueta: string;
  estado?: 'pendiente' | 'entregado' | 'fallido';
}

const COLOR: Record<string, string> = {
  pendiente: 'var(--color-primario)',
  entregado: 'var(--color-exito)',
  fallido: 'var(--color-alerta)',
};

interface Lugar {
  clave: string;
  etiqueta: string;
  estado: PuntoRecorrido['estado'];
  cuantas: number;
}

function porLugar(puntos: PuntoRecorrido[]): Lugar[] {
  const lugares: Lugar[] = [];
  puntos.forEach((p) => {
    const clave = `${p.lat},${p.lng}`;
    const repetido = lugares.find((l) => l.clave === clave);
    if (repetido) {
      repetido.cuantas += 1;
      return;
    }
    lugares.push({ clave, etiqueta: p.etiqueta, estado: p.estado, cuantas: 1 });
  });
  return lugares;
}

export default function TiraRecorrido({ puntos }: { puntos: PuntoRecorrido[] }) {
  const lugares = porLugar(puntos);
  if (lugares.length === 0) return null;

  return (
    <div style={{ overflowX: 'auto', padding: '4px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 'min-content' }}>
        {lugares.map((lugar, i) => (
          <Fragment key={lugar.clave}>
            {i > 0 && (
              <div
                aria-hidden
                style={{
                  flex: '1 1 24px',
                  minWidth: 24,
                  maxWidth: 96,
                  height: 3,
                  borderRadius: 2,
                  background: 'var(--color-borde)',
                  marginTop: 15,
                }}
              />
            )}
            <div style={{ width: 132, flex: '0 0 132px', textAlign: 'center' }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  margin: '0 auto',
                  borderRadius: '50%',
                  background: COLOR[lugar.estado ?? 'pendiente'] ?? COLOR.pendiente,
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 0 0 3px #fff, 0 1px 4px rgba(0,0,0,.25)',
                }}
              >
                {i + 1}
              </div>
              <p
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  lineHeight: 1.35,
                  color: 'var(--color-texto)',
                  wordBreak: 'break-word',
                }}
              >
                {lugar.etiqueta}
              </p>
              {lugar.cuantas > 1 && (
                <p style={{ fontSize: 11, color: 'var(--color-texto-suave)', marginTop: 2 }}>
                  {lugar.cuantas} pedidos aquí
                </p>
              )}
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
