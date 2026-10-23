import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { pedidosApi } from '../services/pedidosApi';
import { usuariosApi } from '../../usuarios/services/usuariosApi';
import type { Direccion, Pedido, Usuario } from '../../../types';
import { Card, BadgeEstado, Campo, Select, Input, Boton, Aviso } from '../../../components/ui';
import { EstadoCarga, EstadoError } from '../../../components/Estados';
import { mensajeDeError } from '../../../utils/errores';
import {
  diaSiNoEsHoy,
  horaDe,
  minutosDeRetraso,
  textoRetraso,
  useAhora,
} from '../../../utils/tiempo';
import MapaTiempoReal from '../../tracking/components/MapaTiempoReal';

const CERRADOS = ['entregado', 'cancelado', 'devuelto'];

function direccionLarga(d: Direccion): string {
  return [[d.calle, d.numero].filter(Boolean).join(' '), d.distrito].filter(Boolean).join(' · ');
}

function dinero(valor?: number | string | null): string | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return null;
  return numero.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });
}

function kilos(valor?: number | string | null): string | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return null;
  return `${numero.toLocaleString('es-PE')} kg`;
}

function fechaHora(iso?: string | null): string | null {
  if (!iso) return null;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return null;
  return `${fecha.toLocaleDateString('es-PE')} · ${horaDe(iso)}`;
}

export default function PedidoDetalle() {
  const { id } = useParams();
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [repartidores, setRepartidores] = useState<Usuario[]>([]);

  const [nuevoEstado, setNuevoEstado] = useState('');
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [falloCarga, setFalloCarga] = useState(false);
  const ahora = useAhora(60_000);

  const cargar = useCallback(() => {
    if (!id) return;
    setCargando(true);
    setFalloCarga(false);
    pedidosApi
      .obtener(Number(id))
      .then((p) => setPedido(p))
      .catch(() => {
        setPedido(null);
        setFalloCarga(true);
      })
      .finally(() => setCargando(false));
  }, [id]);

  useEffect(cargar, [cargar]);
  useEffect(() => {
    usuariosApi.repartidores().then(setRepartidores).catch(() => setRepartidores([]));
  }, []);

  if (cargando) {
    return (
      <Card>
        <EstadoCarga filas={6} etiqueta="Cargando el pedido…" />
      </Card>
    );
  }

  if (falloCarga || !pedido) {
    return (
      <Card>
        <EstadoError
          titulo="No encontramos ese pedido"
          detalle="Puede que se haya eliminado o que el enlace esté mal."
          onReintentar={cargar}
        />
        <div className="barra-acciones">
          <Link to="/pedidos">
            <Boton type="button" variante="neutro">
              Volver a pedidos
            </Boton>
          </Link>
        </div>
      </Card>
    );
  }

  async function ejecutar(accion: () => Promise<Pedido>) {
    setOcupado(true);
    setError(null);
    try {
      setPedido(await accion());
      setNuevoEstado('');
      setComentario('');
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo aplicar el cambio.'));
    } finally {
      setOcupado(false);
    }
  }

  const cambiarEstado = (e: React.FormEvent) => {
    e.preventDefault();
    ejecutar(() => pedidosApi.cambiarEstado(pedido.id, nuevoEstado, comentario));
  };

  const asignar = (repartidor: string) =>
    ejecutar(() =>
      pedidosApi.actualizar(pedido.id, { repartidor: repartidor ? Number(repartidor) : null }),
    );

  const cerrado = CERRADOS.includes(pedido.estado.codigo);
  const retraso = cerrado ? null : minutosDeRetraso(pedido.fecha_estimada_entrega, ahora);

  // El historial se lee de arriba abajo, en el orden en que ocurrió.
  const historial = [...pedido.historial].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
  );

  const filasDatos: { etiqueta: string; valor: string | null; secundario?: string }[] = [
    { etiqueta: 'Cliente', valor: pedido.cliente.nombre_completo, secundario: pedido.cliente.email },
    { etiqueta: 'Origen', valor: direccionLarga(pedido.direccion_origen) },
    { etiqueta: 'Destino', valor: direccionLarga(pedido.direccion_destino) },
    { etiqueta: 'Entrega estimada', valor: fechaHora(pedido.fecha_estimada_entrega) },
    { etiqueta: 'Entrega real', valor: fechaHora(pedido.fecha_entrega_real) },
    { etiqueta: 'Peso', valor: kilos(pedido.peso_kg) },
    { etiqueta: 'Costo de envío', valor: dinero(pedido.costo_envio) },
  ];

  return (
    <div className="pila">
      <header>
        <Link to="/pedidos" className="volver">
          ← Volver a pedidos
        </Link>
        <h1 className="titulo-pedido">
          {pedido.codigo_seguimiento}
          <BadgeEstado codigo={pedido.estado.codigo} nombre={pedido.estado.nombre} grande />
        </h1>
        <p className="page-header__subtitulo">
          Creado el {new Date(pedido.fecha_creacion).toLocaleDateString('es-PE')} · de{' '}
          {pedido.direccion_origen.calle} a {pedido.direccion_destino.calle}
          {!cerrado && pedido.fecha_estimada_entrega && (
            <>
              {' '}
              · llega a las <b>{horaDe(pedido.fecha_estimada_entrega)}</b>
              {retraso !== null && (
                <b className="hora__retraso" style={{ display: 'inline', marginLeft: 6 }}>
                  ({textoRetraso(retraso)})
                </b>
              )}
            </>
          )}
          {pedido.fecha_entrega_real && (
            <>
              {' '}
              · llegó a las <b>{horaDe(pedido.fecha_entrega_real)}</b>
            </>
          )}
        </p>
      </header>

      {error && <Aviso tono="error">{error}</Aviso>}

      <div className="columnas columnas--accion-primero">
        <div className="columnas__principal">
          <Card>
            <div className="card__cabecera">
              <h2>Seguimiento en tiempo real</h2>
              {pedido.repartidor && (
                <span className="card__nota">{pedido.repartidor.nombre_completo}</span>
              )}
            </div>
            <MapaTiempoReal
              pedidoId={pedido.id}
              finalizado={cerrado}
              centroInicial={[pedido.direccion_destino.latitud, pedido.direccion_destino.longitud]}
            />
          </Card>

          <Card>
            <div className="card__cabecera">
              <h2>Línea de tiempo</h2>
              <span className="card__nota">Historial de estados</span>
            </div>
            <ol className="tiempo">
              {historial.map((h, i) => {
                const actual = i === historial.length - 1;
                const dia = diaSiNoEsHoy(h.fecha, ahora);
                const entregado = actual && h.estado.codigo === 'entregado';
                return (
                  <li key={h.id} className="tiempo__item">
                    <span className="tiempo__hora">
                      {horaDe(h.fecha)}
                      {dia && <small>{dia}</small>}
                    </span>
                    <span>
                      <i
                        className={`tiempo__punto${
                          entregado ? ' tiempo__punto--ok' : actual ? ' tiempo__punto--ahora' : ''
                        }`}
                      />
                    </span>
                    <div className="tiempo__cuerpo">
                      <b>{h.estado.nombre}</b>
                      {h.comentario && <p>{h.comentario}</p>}
                    </div>
                  </li>
                );
              })}
              {!cerrado && pedido.fecha_estimada_entrega && (
                <li className="tiempo__item tiempo__item--futuro">
                  <span className="tiempo__hora" style={{ color: 'var(--color-texto-suave)' }}>
                    {horaDe(pedido.fecha_estimada_entrega)}
                  </span>
                  <span>
                    <i className="tiempo__punto tiempo__punto--futuro" />
                  </span>
                  <div className="tiempo__cuerpo">
                    <b style={{ color: 'var(--color-texto-suave)' }}>Entrega estimada</b>
                    <p>{direccionLarga(pedido.direccion_destino)}</p>
                  </div>
                </li>
              )}
            </ol>
          </Card>
        </div>

        <div className="columnas__lateral">
          <Card className="card--salidas">
            <h2 style={{ marginBottom: 'var(--esp-3)' }}>Avanzar el pedido</h2>
            {pedido.transiciones_permitidas.length === 0 ? (
              <p>
                <b>«{pedido.estado.nombre}» es un estado final:</b> no admite más cambios.
              </p>
            ) : (
              <form onSubmit={cambiarEstado} className="pila" style={{ gap: 'var(--esp-4)' }}>
                <Campo etiqueta="Nuevo estado">
                  <Select
                    value={nuevoEstado}
                    onChange={(e) => setNuevoEstado(e.target.value)}
                    required
                  >
                    <option value="">Selecciona…</option>
                    {pedido.transiciones_permitidas.map((t) => (
                      <option key={t.id} value={t.codigo}>{t.nombre}</option>
                    ))}
                  </Select>
                </Campo>
                <Campo etiqueta="Comentario (opcional)">
                  <Input
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Motivo o nota para el historial"
                  />
                </Campo>
                <Boton type="submit" disabled={!nuevoEstado || ocupado}>
                  {ocupado ? 'Aplicando…' : 'Aplicar cambio'}
                </Boton>
              </form>
            )}
          </Card>

          <Card>
            <h2 style={{ marginBottom: 'var(--esp-3)' }}>Repartidor</h2>
            <Campo etiqueta="Asignado a">
              <Select
                value={pedido.repartidor?.id ?? ''}
                disabled={ocupado}
                onChange={(e) => asignar(e.target.value)}
              >
                <option value="">Sin asignar</option>
                {repartidores.map((r) => (
                  <option key={r.id} value={r.id}>{r.nombre_completo}</option>
                ))}
              </Select>
            </Campo>
          </Card>

          <Card>
            <h2 style={{ marginBottom: 'var(--esp-2)' }}>Cliente y envío</h2>
            <dl className="lista-datos">
              {filasDatos
                .filter((f) => f.valor)
                .map((f) => (
                  <div key={f.etiqueta}>
                    <dt>{f.etiqueta}</dt>
                    <dd>
                      {f.valor}
                      {f.secundario && <small>{f.secundario}</small>}
                    </dd>
                  </div>
                ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
