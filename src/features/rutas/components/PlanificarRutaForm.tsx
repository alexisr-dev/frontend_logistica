import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rutasApi } from '../services/rutasApi';
import { pedidosApi } from '../../pedidos/services/pedidosApi';
import { usuariosApi } from '../../usuarios/services/usuariosApi';
import type { Usuario, Pedido } from '../../../types';
import { Card, Campo, Input, Select, Boton, Aviso, BadgeEstado, PageHeader } from '../../../components/ui';
import { EstadoCarga, EstadoVacio } from '../../../components/Estados';
import { mensajeDeError } from '../../../utils/errores';
import ComoFunciona from './ComoFunciona';
import TiraRecorrido from './TiraRecorrido';
import type { PuntoRecorrido } from './TiraRecorrido';

const ESTADOS_FINALES = ['entregado', 'cancelado', 'devuelto'];

const SOLO_COORDENADAS = /^-?\d+[.,]\d+\s*,\s*-?\d+[.,]\d+$/;

function fechaHoyLocal(): string {
  const ahora = new Date();
  const desfase = ahora.getTimezoneOffset() * 60000;
  return new Date(ahora.getTime() - desfase).toISOString().slice(0, 10);
}

function fechaLegible(iso: string): string {
  if (!iso) return '';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function lugar(pedido: Pedido): string {
  return `${pedido.direccion_destino.latitud},${pedido.direccion_destino.longitud}`;
}

function direccionDe(pedido: Pedido): string {
  const { calle, distrito } = pedido.direccion_destino;
  return [calle, distrito].filter(Boolean).join(' · ') || 'Sin dirección';
}

export default function PlanificarRutaForm() {
  const navigate = useNavigate();

  const [repartidores, setRepartidores] = useState<Usuario[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [rutaPorPedido, setRutaPorPedido] = useState<Record<number, number>>({});
  const [cargando, setCargando] = useState(true);

  const [repartidorId, setRepartidorId] = useState('');
  const [fecha, setFecha] = useState(fechaHoyLocal);
  const [seleccion, setSeleccion] = useState<number[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usuariosApi.repartidores().then(setRepartidores).catch(() => setRepartidores([]));
    pedidosApi
      .listarTodos()
      .then((p) => setPedidos(p.filter((x) => !ESTADOS_FINALES.includes(x.estado.codigo))))
      .catch(() => setPedidos([]))
      .finally(() => setCargando(false));

    rutasApi
      .listar()
      .then((rutas) => {
        const mapa: Record<number, number> = {};
        rutas
          .filter((r) => r.estado === 'planificada' || r.estado === 'en_curso')
          .forEach((r) => r.paradas.forEach((p) => { mapa[p.pedido] = r.id; }));
        setRutaPorPedido(mapa);
      })
      .catch(() => setRutaPorPedido({}));
  }, []);

  function alternar(id: number) {
    setSeleccion((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const ruta = await rutasApi.planificar({
        repartidor: Number(repartidorId),
        fecha,
        pedidos: seleccion,
      });
      navigate(`/rutas?ruta=${ruta.id}`);
    } catch (err) {
      setError(
        mensajeDeError(
          err,
          'No se pudo trazar el recorrido: el servicio de mapas no respondió. Inténtalo otra vez en un momento.',
        ),
      );
    } finally {
      setGuardando(false);
    }
  }

  const elegidos = seleccion
    .map((id) => pedidos.find((p) => p.id === id))
    .filter((p): p is Pedido => Boolean(p));

  const paradasDistintas = new Set(elegidos.map(lugar)).size;
  const mismoSitio = seleccion.length >= 2 && paradasDistintas < 2;

  const recorrido: PuntoRecorrido[] = elegidos.map((p) => ({
    lat: p.direccion_destino.latitud,
    lng: p.direccion_destino.longitud,
    etiqueta: direccionDe(p),
  }));

  const nombreElegido = repartidores.find((r) => String(r.id) === repartidorId)?.nombre_completo;

  const requisitos = [
    {
      ok: Boolean(repartidorId),
      texto: nombreElegido ? `Reparte ${nombreElegido}` : 'Falta elegir quién reparte',
    },
    {
      ok: Boolean(fecha),
      texto: fecha ? `El ${fechaLegible(fecha)}` : 'Falta elegir el día',
    },
    {
      ok: seleccion.length >= 2,
      texto:
        seleccion.length >= 2
          ? `${seleccion.length} pedidos marcados`
          : `Marca al menos 2 pedidos (llevas ${seleccion.length})`,
    },
    ...(seleccion.length >= 2
      ? [
          {
            ok: paradasDistintas >= 2,
            texto:
              paradasDistintas >= 2
                ? `${paradasDistintas} paradas en direcciones distintas`
                : 'Todos los pedidos marcados van a la misma dirección',
          },
        ]
      : []),
  ];

  const listo = requisitos.every((r) => r.ok);

  return (
    <form onSubmit={enviar} className="pila">
      <PageHeader
        titulo="Planificar ruta"
        subtitulo="Junta varios pedidos en un solo recorrido y asígnaselo a un repartidor."
      />

      <ComoFunciona />

      {error && <Aviso tono="error">{error}</Aviso>}

      <Card>
        <h2 style={{ marginBottom: 'var(--esp-4)' }}>Quién reparte y qué día</h2>
        <div className="rejilla">
          <Campo etiqueta="Repartidor">
            <Select value={repartidorId} onChange={(e) => setRepartidorId(e.target.value)} required>
              <option value="">Selecciona un repartidor…</option>
              {repartidores.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre_completo}</option>
              ))}
            </Select>
          </Campo>
          <Campo etiqueta="Día del reparto">
            <Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </Campo>
        </div>
      </Card>

      <Card>
        <h2 style={{ marginBottom: 'var(--esp-1)' }}>Qué pedidos lleva, y en qué orden</h2>
        <p style={{ fontSize: 'var(--texto-sm)', color: 'var(--color-texto-suave)', marginBottom: 'var(--esp-4)' }}>
          Márcalos en el orden en que quieres que los visite. El número que aparece al lado es su
          turno en el recorrido.
        </p>

        {recorrido.length > 0 && (
          <Card plano style={{ marginBottom: 'var(--esp-4)' }}>
            <p style={{ fontSize: 'var(--texto-xs)', fontWeight: 'var(--peso-medio)', marginBottom: 'var(--esp-3)' }}>
              Así queda el recorrido
            </p>
            <TiraRecorrido puntos={recorrido} />
            {mismoSitio && (
              <p style={{ fontSize: 'var(--texto-sm)', color: 'var(--color-aviso)', marginTop: 'var(--esp-3)' }}>
                Los {seleccion.length} pedidos marcados están registrados en la misma dirección, así
                que son una sola parada: no hay ningún camino que recorrer entre ellos. Marca algún
                pedido que vaya a otro sitio, o corrige antes su dirección de entrega.
              </p>
            )}
          </Card>
        )}

        {cargando ? (
          <EstadoCarga filas={5} etiqueta="Cargando los pedidos…" />
        ) : pedidos.length === 0 ? (
          <EstadoVacio
            icono="📦"
            titulo="No hay pedidos pendientes de repartir"
            detalle="Crea uno desde «Nuevo pedido» y vuelve aquí para agruparlo en una ruta."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--esp-2)' }}>
            {pedidos.map((p) => {
              const orden = seleccion.indexOf(p.id);
              const elegido = orden >= 0;
              const enRuta = rutaPorPedido[p.id];
              const direccion = p.direccion_destino.calle ?? '';
              const sinDireccion = SOLO_COORDENADAS.test(direccion.trim());
              return (
                <label
                  key={p.id}
                  className={`opcion${elegido ? ' opcion--elegida' : ''}${enRuta ? ' opcion--bloqueada' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={elegido}
                    disabled={Boolean(enRuta)}
                    onChange={() => alternar(p.id)}
                  />
                  {elegido && <span className="paradas__orden">{orden + 1}</span>}
                  <strong>{p.codigo_seguimiento}</strong>
                  <BadgeEstado codigo={p.estado.codigo} nombre={p.estado.nombre} />
                  <span style={{ fontSize: 'var(--texto-sm)', color: 'var(--color-texto-suave)' }}>
                    {direccionDe(p)}
                  </span>
                  {sinDireccion && (
                    <span style={{ fontSize: 'var(--texto-xs)', color: 'var(--color-aviso)' }}>
                      ⚠ sin dirección escrita: el repartidor solo vería coordenadas
                    </span>
                  )}
                  {enRuta && (
                    <span className="opcion__nota">Ya va en la ruta #{enRuta}</span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="resumen-envio">
        <ul className="requisitos">
          {requisitos.map((r) => (
            <li key={r.texto} className={r.ok ? 'requisitos__ok' : undefined}>
              <span aria-hidden>{r.ok ? '✓' : '○'}</span>
              {r.texto}
            </li>
          ))}
        </ul>

        <div className="barra-acciones">
          <Boton type="button" variante="neutro" onClick={() => navigate('/rutas')}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={!listo || guardando}>
            {guardando ? 'Trazando el recorrido…' : 'Trazar y guardar la ruta'}
          </Boton>
        </div>
      </Card>
    </form>
  );
}
