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
import { horaDe, minutosDeRetraso, textoRetraso, useAhora } from '../../../utils/tiempo';

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
  { color: 'var(--color-amarillo)', texto: 'Pendiente' },
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

function fechaCorta(iso: string, ahora: Date): string {
  const fecha = new Date(`${iso}T00:00:00`);
  if (fecha.toDateString() === ahora.toDateString()) return 'Hoy';
  return fecha.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
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

export default function RutasPage() {
  const [parametros] = useSearchParams();
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [repartidores, setRepartidores] = useState<Usuario[]>([]);
  const [seleccionada, setSeleccionada] = useState<Ruta | null>(null);
  const [cargando, setCargando] = useState(true);
  const [fallo, setFallo] = useState(false);
  const ahora = useAhora(60_000);

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

  const ordenadas = seleccionada
    ? [...seleccionada.paradas].sort((a, b) => a.orden_parada - b.orden_parada)
    : [];
  // La siguiente parada es la primera que sigue pendiente.
  const siguiente = ordenadas.find((p) => p.estado_parada === 'pendiente');

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
          <Card className="card--salidas">
            <div className="card__cabecera">
              <h2>Rutas</h2>
              <span className="card__nota">0 recorridos</span>
            </div>
            <EstadoVacio
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
        <div className="dividido">
          <Card>
            <div className="card__cabecera">
              <h2>Rutas</h2>
              <span className="card__nota">
                {rutas.length} {rutas.length === 1 ? 'recorrido' : 'recorridos'}
              </span>
            </div>
            <ul className="rutas-lista">
              {rutas.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="ruta-item"
                    aria-pressed={seleccionada?.id === r.id}
                    onClick={() => setSeleccionada(r)}
                  >
                    <span className="ruta-item__num">#{r.id}</span>
                    <span>
                      <span className="ruta-item__repartidor">{nombreRepartidor(r.repartidor)}</span>
                      <span className="ruta-item__meta">
                        {fechaCorta(r.fecha, ahora)} · {r.paradas.length}{' '}
                        {r.paradas.length === 1 ? 'parada' : 'paradas'}
                      </span>
                      <BadgeEstado codigo={r.estado} nombre={NOMBRE_ESTADO[r.estado] ?? r.estado} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {seleccionada && (
            <Card>
              <div className="card__cabecera">
                <h2>Ruta #{seleccionada.id}</h2>
                <BadgeEstado
                  codigo={seleccionada.estado}
                  nombre={NOMBRE_ESTADO[seleccionada.estado] ?? seleccionada.estado}
                />
              </div>
              <p className="card__nota">
                La reparte {nombreRepartidor(seleccionada.repartidor)} el{' '}
                {fechaLegible(seleccionada.fecha)}.
              </p>

              <div className="datos" style={{ padding: 'var(--esp-5) 0' }}>
                <div>
                  <span className="dato__valor">{seleccionada.paradas.length}</span>
                  <span className="dato__etiqueta">Paradas</span>
                </div>
                <div>
                  <span className="dato__valor">{distancia(seleccionada.distancia_total_km)}</span>
                  <span className="dato__etiqueta">Distancia del recorrido</span>
                </div>
                <div>
                  <span className="dato__valor">{duracion(seleccionada.tiempo_estimado_min)}</span>
                  <span className="dato__etiqueta">Tiempo al volante</span>
                </div>
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

              <div className="ruta-cuerpo">
                <div className="ruta-cuerpo__mapa">
                  <MapaRuta geometria={seleccionada.geometria_ruta} paradas={paradas} />
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
                </div>

                <ol className="ruta-cuerpo__paradas paradas" aria-label="Paradas en orden de visita">
                  {ordenadas.map((p) => {
                    const esSiguiente = p.id === siguiente?.id;
                    const retraso =
                      esSiguiente ? minutosDeRetraso(p.hora_estimada, ahora) : null;
                    const estadoPunto = esSiguiente
                      ? 'siguiente'
                      : p.estado_parada === 'pendiente'
                        ? null
                        : p.estado_parada;
                    return (
                      <li
                        key={p.id}
                        className={`paradas__item${esSiguiente ? ' paradas__item--siguiente' : ''}`}
                      >
                        <span className="paradas__hora">
                          {horaDe(p.hora_real ?? p.hora_estimada)}
                          {p.hora_real && p.hora_estimada && (
                            <small>est. {horaDe(p.hora_estimada)}</small>
                          )}
                          {retraso !== null && (
                            <small className="hora__retraso">{textoRetraso(retraso)}</small>
                          )}
                        </span>
                        <span>
                          <i
                            className={`paradas__punto${
                              estadoPunto ? ` paradas__punto--${estadoPunto}` : ''
                            }`}
                          />
                        </span>
                        <div className="paradas__cuerpo">
                          <div className="paradas__titulo">
                            <b>{p.codigo_seguimiento}</b>
                            <span
                              className={`paradas__estado${
                                p.estado_parada === 'fallido' ? ' paradas__estado--fallido' : ''
                              }`}
                            >
                              {esSiguiente
                                ? 'Siguiente parada'
                                : NOMBRE_PARADA[p.estado_parada] ?? p.estado_parada}
                            </span>
                          </div>
                          <p className="paradas__direccion">
                            {[p.direccion, p.distrito].filter(Boolean).join(' · ') || 'Sin dirección'}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
