import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { rutasApi } from '../services/rutasApi';
import { usuariosApi } from '../../usuarios/services/usuariosApi';
import type { Ruta, Usuario } from '../../../types';
import { Card, Boton, BadgeEstado, Aviso, PageHeader } from '../../../components/ui';
import { EstadoCarga, EstadoVacio, EstadoError } from '../../../components/Estados';
import MapaRuta from './MapaRuta';
import type { ParadaMapa } from './MapaRuta';
import ComoFunciona from './ComoFunciona';
import TiraRecorrido from './TiraRecorrido';

const NOMBRE_ESTADO: Record<string, string> = {
  planificada: 'Planificada',
  en_curso: 'En curso',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
};

const NOMBRE_PARADA: Record<string, string> = {
  pendiente: 'Pendiente',
  entregado: 'Entregado',
  fallido: 'No se pudo entregar',
};

const LEYENDA = [
  { color: 'var(--color-estado-camino)', texto: 'Pendiente' },
  { color: 'var(--color-exito)', texto: 'Entregada' },
  { color: 'var(--color-alerta)', texto: 'No se pudo entregar' },
];

function aNumero(valor: Ruta['distancia_total_km']): number | null {
  if (valor === null || valor === undefined) return null;
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function distancia(valor: Ruta['distancia_total_km']): string {
  const km = aNumero(valor);
  if (km === null) return '—';
  return `${km.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km`;
}

function duracion(minutos?: number | null): string {
  if (minutos === null || minutos === undefined) return '—';
  if (minutos < 60) return `${Math.round(minutos)} min`;
  const horas = Math.floor(minutos / 60);
  const resto = Math.round(minutos % 60);
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

function fechaLegible(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function paradasDelMapa(ruta: Ruta): ParadaMapa[] {
  return ruta.paradas
    .filter((p) => typeof p.latitud === 'number' && typeof p.longitud === 'number')
    .map((p) => ({
      lat: p.latitud as number,
      lng: p.longitud as number,
      orden: p.orden_parada,
      etiqueta: [p.codigo_seguimiento, p.direccion, p.distrito].filter(Boolean).join(' · '),
      estado: p.estado_parada,
    }));
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <p className="kpi__titulo">{etiqueta}</p>
      <p style={{ fontSize: 'var(--texto-lg)', fontWeight: 'var(--peso-medio)' }}>{valor}</p>
    </div>
  );
}

export default function RutasPage() {
  const [parametros] = useSearchParams();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [repartidores, setRepartidores] = useState<Usuario[]>([]);
  const [seleccionada, setSeleccionada] = useState<Ruta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [fallo, setFallo] = useState(false);

  const cargar = useCallback(() => {
    setCargando(true);
    setFallo(false);
    rutasApi
      .listar()
      .then((r) => {
        setRutas(r);
        const recien = parametros.get('ruta');
        const destacada = recien ? r.find((x) => x.id === Number(recien)) : undefined;
        setSeleccionada(destacada ?? r[0] ?? null);
      })
      .catch(() => {
        setRutas([]);
        setFallo(true);
      })
      .finally(() => setCargando(false));
  }, [parametros]);

  useEffect(cargar, [cargar]);

  useEffect(() => {
    usuariosApi.repartidores().then(setRepartidores).catch(() => setRepartidores([]));
  }, []);

  function nombreRepartidor(id: number): string {
    return repartidores.find((r) => r.id === id)?.nombre_completo ?? `Repartidor #${id}`;
  }

  const paradas = seleccionada ? paradasDelMapa(seleccionada) : [];
  const sitiosDistintos = new Set(paradas.map((p) => `${p.lat},${p.lng}`)).size;

  return (
    <div className="pila">
      <PageHeader
        titulo="Rutas de reparto"
        subtitulo="El recorrido de cada repartidor: qué pedidos lleva, en qué orden los visita y por dónde pasa."
        acciones={
          <Link to="/rutas/nueva">
            <Boton type="button">Planificar ruta</Boton>
          </Link>
        }
      />

      {cargando ? (
        <Card>
          <EstadoCarga filas={5} etiqueta="Cargando las rutas…" />
        </Card>
      ) : fallo ? (
        <Card>
          <EstadoError
            titulo="No pudimos cargar las rutas"
            detalle="El listado de recorridos no está disponible ahora mismo."
            onReintentar={cargar}
          />
        </Card>
      ) : rutas.length === 0 ? (
        <>
          <Card>
            <EstadoVacio
              icono="🗺️"
              titulo="Todavía no hay ninguna ruta planificada"
              detalle="Una ruta agrupa varios pedidos en un recorrido para un repartidor y un día."
              accion={
                <Link to="/rutas/nueva">
                  <Boton type="button">Planificar la primera</Boton>
                </Link>
              }
            />
          </Card>
          <ComoFunciona />
        </>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 'var(--esp-2)', flexWrap: 'wrap' }}>
            {rutas.map((r) => {
              const activa = seleccionada?.id === r.id;
              return (
                <Boton
                  key={r.id}
                  type="button"
                  variante={activa ? 'primario' : 'neutro'}
                  aria-pressed={activa}
                  onClick={() => setSeleccionada(r)}
                >
                  Ruta #{r.id} · {r.fecha} · {r.paradas.length} paradas
                </Boton>
              );
            })}
          </div>

          {seleccionada && (
            <Card>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--esp-3)',
                  flexWrap: 'wrap',
                }}
              >
                <h2>Ruta #{seleccionada.id}</h2>
                <BadgeEstado
                  codigo={seleccionada.estado}
                  nombre={NOMBRE_ESTADO[seleccionada.estado] ?? seleccionada.estado}
                />
              </div>
              <p className="page-header__subtitulo">
                La reparte {nombreRepartidor(seleccionada.repartidor)} el{' '}
                {fechaLegible(seleccionada.fecha)}.
              </p>

              <div
                className="rejilla-kpi"
                style={{
                  padding: 'var(--esp-4) 0',
                  margin: 'var(--esp-4) 0',
                  borderTop: '1px solid var(--color-borde)',
                  borderBottom: '1px solid var(--color-borde)',
                }}
              >
                <Dato etiqueta="Paradas" valor={String(seleccionada.paradas.length)} />
                <Dato
                  etiqueta="Distancia del recorrido"
                  valor={distancia(seleccionada.distancia_total_km)}
                />
                <Dato
                  etiqueta="Tiempo al volante"
                  valor={duracion(seleccionada.tiempo_estimado_min)}
                />
              </div>

              {/* Una ruta puede guardarse «bien» y no llevar a ninguna parte: si
                  todas las paradas caen en el mismo punto, no hay camino que trazar. */}
              {paradas.length >= 2 && sitiosDistintos < 2 && (
                <div style={{ marginBottom: 'var(--esp-4)' }}>
                  <Aviso tono="error">
                    Las {paradas.length} paradas de esta ruta están registradas en la misma
                    dirección, así que el recorrido salió de 0 km y no hay nada que dibujar en el
                    mapa. Corrige la dirección de entrega de esos pedidos y vuelve a planificarla.
                  </Aviso>
                </div>
              )}
              {!seleccionada.geometria_ruta && (
                <div style={{ marginBottom: 'var(--esp-4)' }}>
                  <Aviso tono="error">
                    Esta ruta no tiene ningún recorrido guardado: no se llegó a trazar el camino
                    entre sus paradas. Vuelve a planificarla para calcularlo.
                  </Aviso>
                </div>
              )}

              <TiraRecorrido
                puntos={paradas.map((p) => ({
                  lat: p.lat,
                  lng: p.lng,
                  etiqueta: p.etiqueta.split(' · ').slice(1).join(' · ') || p.etiqueta,
                  estado: p.estado,
                }))}
              />

              <div style={{ marginTop: 'var(--esp-4)' }}>
                <MapaRuta geometria={seleccionada.geometria_ruta} paradas={paradas} />
              </div>

              <ul className="leyenda">
                <li>Los números marcan el orden de visita.</li>
                {LEYENDA.map((l) => (
                  <li key={l.texto}>
                    <span
                      className="leyenda__punto"
                      style={{ background: l.color }}
                      aria-hidden
                    />
                    {l.texto}
                  </li>
                ))}
              </ul>

              <ol className="paradas">
                {seleccionada.paradas.map((p) => (
                  <li key={p.id} className="paradas__item">
                    <span className="paradas__orden">{p.orden_parada}</span>
                    <strong>{p.codigo_seguimiento}</strong>
                    <BadgeEstado
                      codigo={p.estado_parada}
                      nombre={NOMBRE_PARADA[p.estado_parada] ?? p.estado_parada}
                    />
                    <span style={{ color: 'var(--color-texto-suave)', fontSize: 'var(--texto-sm)' }}>
                      {[p.direccion, p.distrito].filter(Boolean).join(' · ') || 'Sin dirección'}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
