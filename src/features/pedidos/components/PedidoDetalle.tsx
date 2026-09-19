import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { pedidosApi } from '../services/pedidosApi';
import { usuariosApi } from '../../usuarios/services/usuariosApi';
import type { Pedido, Usuario } from '../../../types';
import { Card, BadgeEstado, Campo, Select, Input, Boton, Aviso } from '../../../components/ui';
import { EstadoCarga, EstadoError } from '../../../components/Estados';
import { mensajeDeError } from '../../../utils/errores';
import MapaTiempoReal from '../../tracking/components/MapaTiempoReal';

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
        <div className="barra-acciones" style={{ justifyContent: 'center' }}>
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

  return (
    <div className="pila">
      <header className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--esp-3)' }}>
            <h1>{pedido.codigo_seguimiento}</h1>
            <BadgeEstado codigo={pedido.estado.codigo} nombre={pedido.estado.nombre} />
          </div>
          <p className="page-header__subtitulo">
            Creado el {new Date(pedido.fecha_creacion).toLocaleDateString('es-PE')} · de{' '}
            {pedido.direccion_origen.calle} a {pedido.direccion_destino.calle}
          </p>
        </div>
        <div className="page-header__acciones">
          <Link to="/pedidos">
            <Boton type="button" variante="neutro">
              Volver a pedidos
            </Boton>
          </Link>
        </div>
      </header>

      {error && <Aviso tono="error">{error}</Aviso>}

      <div className="rejilla">
        <Card>
          <h2 style={{ marginBottom: 'var(--esp-2)' }}>Cliente</h2>
          <p>{pedido.cliente.nombre_completo}</p>
          <p style={{ color: 'var(--color-texto-suave)', fontSize: 'var(--texto-sm)' }}>
            {pedido.cliente.email}
          </p>
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
      </div>

      <Card>
        <h2 style={{ marginBottom: 'var(--esp-3)' }}>Avanzar el pedido</h2>
        {pedido.transiciones_permitidas.length === 0 ? (
          <p style={{ color: 'var(--color-texto-suave)' }}>
            «{pedido.estado.nombre}» es un estado final: no admite más cambios.
          </p>
        ) : (
          <form onSubmit={cambiarEstado} className="pila">
            <div className="rejilla">
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
            </div>
            <div className="barra-acciones">
              <Boton type="submit" disabled={!nuevoEstado || ocupado}>
                {ocupado ? 'Aplicando…' : 'Aplicar cambio'}
              </Boton>
            </div>
          </form>
        )}
      </Card>

      <Card>
        <h2 style={{ marginBottom: 'var(--esp-3)' }}>Seguimiento en tiempo real</h2>
        <MapaTiempoReal pedidoId={pedido.id} />
      </Card>

      <Card>
        <h2 style={{ marginBottom: 'var(--esp-3)' }}>Línea de tiempo</h2>
        <ol
          style={{
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--esp-3)',
          }}
        >
          {pedido.historial.map((h) => (
            <li
              key={h.id}
              style={{
                display: 'flex',
                gap: 'var(--esp-3)',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <BadgeEstado codigo={h.estado.codigo} nombre={h.estado.nombre} />
              <span style={{ color: 'var(--color-texto-suave)', fontSize: 'var(--texto-sm)' }}>
                {new Date(h.fecha).toLocaleString('es-PE')} {h.comentario && `· ${h.comentario}`}
              </span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
