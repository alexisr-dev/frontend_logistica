import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { cargarPedidos } from '../pedidosSlice';
import { BadgeEstado, Boton, Card, PageHeader } from '../../../components/ui';
import { Tabla, Fila, Celda } from '../../../components/Tabla';
import { EstadoCarga, EstadoVacio, EstadoError } from '../../../components/Estados';
import {
  diaSiNoEsHoy,
  horaDe,
  minutosDeRetraso,
  textoRetraso,
  useAhora,
} from '../../../utils/tiempo';
import type { Pedido } from '../../../types';

/**
 * Los pedidos se leen como un cuadro de salidas: lo que todavía sale va en el
 * bloque amarillo, ordenado por hora estimada; lo que ya llegó (entregado,
 * cancelado o devuelto) va en el blanco. Mismo dato, otra lectura.
 */
const CERRADOS = ['entregado', 'cancelado', 'devuelto'];
const LIMITE_PANEL = { salidas: 8, llegadas: 5 };

const COLUMNAS_PAGINA = ['Hora est.', 'Pedido', 'Cliente', 'Destino', 'Repartidor', 'Estado', 'Creado'];
const COLUMNAS_PANEL = ['Hora est.', 'Pedido', 'Destino', 'Repartidor', 'Estado'];

function estimada(p: Pedido): number {
  return p.fecha_estimada_entrega
    ? new Date(p.fecha_estimada_entrega).getTime()
    : Number.POSITIVE_INFINITY;
}

function llegada(p: Pedido): number {
  return new Date(p.fecha_entrega_real ?? p.fecha_estimada_entrega ?? p.fecha_creacion).getTime();
}

function FilaPedido({
  pedido,
  ahora,
  completa,
  cerrado,
}: {
  pedido: Pedido;
  ahora: Date;
  completa: boolean;
  cerrado: boolean;
}) {
  const iso = cerrado ? pedido.fecha_entrega_real : pedido.fecha_estimada_entrega;
  const retraso = cerrado ? null : minutosDeRetraso(pedido.fecha_estimada_entrega, ahora);
  const dia = diaSiNoEsHoy(iso, ahora);
  const { calle, distrito } = pedido.direccion_destino;

  return (
    <Fila>
      <Celda etiqueta={cerrado ? 'Llegó' : 'Hora est.'} area="hora">
        <span className="hora">
          {horaDe(iso)}
          {retraso !== null && <span className="hora__retraso">{textoRetraso(retraso)}</span>}
          {dia && <span className="hora__dia">{dia}</span>}
        </span>
      </Celda>
      <Celda etiqueta="Pedido" area="codigo">
        <Link to={`/pedidos/${pedido.id}`} className="enlace-fila">
          {pedido.codigo_seguimiento}
        </Link>
      </Celda>
      {completa && (
        <Celda etiqueta="Cliente" area="cliente">
          {pedido.cliente?.nombre_completo}
        </Celda>
      )}
      <Celda etiqueta="Destino" area="destino">
        <span className="destino">
          {calle}
          {distrito && <small>{distrito}</small>}
        </span>
      </Celda>
      <Celda etiqueta="Repartidor" area="repartidor">
        {pedido.repartidor ? (
          pedido.repartidor.nombre_completo
        ) : (
          <span className="etiqueta">Sin asignar</span>
        )}
      </Celda>
      <Celda etiqueta="Estado" area="estado">
        <BadgeEstado codigo={pedido.estado.codigo} nombre={pedido.estado.nombre} />
      </Celda>
      {completa && (
        <Celda etiqueta="Creado" area="creado">
          {new Date(pedido.fecha_creacion).toLocaleDateString('es-PE')}
        </Celda>
      )}
    </Fila>
  );
}

export default function PedidoTablaAdmin({
  variante = 'pagina',
}: {
  variante?: 'pagina' | 'panel';
}) {
  const dispatch = useAppDispatch();
  const { lista, cargando, total, error } = useAppSelector((s) => s.pedidos);
  const ahora = useAhora(60_000);
  const panel = variante === 'panel';

  useEffect(() => {
    dispatch(cargarPedidos(undefined));
  }, [dispatch]);

  const salidas = lista
    .filter((p) => !CERRADOS.includes(p.estado.codigo))
    .sort((a, b) => estimada(a) - estimada(b));
  const llegadas = lista
    .filter((p) => CERRADOS.includes(p.estado.codigo))
    .sort((a, b) => llegada(b) - llegada(a));

  const salidasVisibles = panel ? salidas.slice(0, LIMITE_PANEL.salidas) : salidas;
  const llegadasVisibles = panel ? llegadas.slice(0, LIMITE_PANEL.llegadas) : llegadas;
  const columnas = panel ? COLUMNAS_PANEL : COLUMNAS_PAGINA;

  const nuevoPedido = (
    <Link to="/pedidos/nuevo">
      <Boton type="button">Nuevo pedido</Boton>
    </Link>
  );

  const verTodos = (cuantos: number, etiqueta: string) =>
    panel && cuantos > 0 ? (
      <div className="tabla__pie">
        <span className="tenue">
          Mostrando {Math.min(cuantos, etiqueta === 'salidas' ? LIMITE_PANEL.salidas : LIMITE_PANEL.llegadas)} de {cuantos}
        </span>
        <Link to="/pedidos">Ver todos los pedidos →</Link>
      </div>
    ) : null;

  let tableros;
  if (cargando) {
    tableros = (
      <Card>
        <h2>Pedidos</h2>
        <EstadoCarga filas={5} etiqueta="Cargando los pedidos…" />
      </Card>
    );
  } else if (error) {
    tableros = (
      <Card>
        <EstadoError
          titulo="No pudimos cargar los pedidos"
          detalle={error}
          onReintentar={() => dispatch(cargarPedidos(undefined))}
        />
      </Card>
    );
  } else if (lista.length === 0) {
    tableros = (
      <>
        <Card className="card--salidas">
          <div className="card__cabecera">
            <h2>Salidas</h2>
            <span className="card__nota">0 por salir</span>
          </div>
          <EstadoVacio
            titulo="Todavía no hay pedidos"
            detalle="Cuando registres el primero aparecerá aquí con su hora estimada, su estado y su repartidor."
            accion={nuevoPedido}
          />
        </Card>
        <Card>
          <div className="card__cabecera">
            <h2>Llegadas</h2>
            <span className="card__nota">0 cerrados</span>
          </div>
          <p className="tenue">Aquí verás los pedidos ya entregados, cancelados y devueltos.</p>
        </Card>
      </>
    );
  } else {
    tableros = (
      <>
        <Card className="card--salidas">
          <div className="card__cabecera">
            <h2>Salidas</h2>
            <span className="card__nota">
              {salidas.length} por salir · ordenados por hora estimada
            </span>
          </div>
          {salidas.length === 0 ? (
            <EstadoVacio
              titulo="No hay pedidos por salir"
              detalle="Los pedidos nuevos aparecerán aquí por su hora estimada."
              accion={nuevoPedido}
            />
          ) : (
            <>
              <Tabla
                columnas={columnas}
                variante="pedidos"
                descripcion="Pedidos por salir, ordenados por hora estimada de entrega"
              >
                {salidasVisibles.map((p) => (
                  <FilaPedido key={p.id} pedido={p} ahora={ahora} completa={!panel} cerrado={false} />
                ))}
              </Tabla>
              {verTodos(salidas.length, 'salidas')}
            </>
          )}
        </Card>

        <Card>
          <div className="card__cabecera">
            <h2>Llegadas</h2>
            <span className="card__nota">
              {llegadas.length} cerrados · entregados, cancelados y devueltos
            </span>
          </div>
          {llegadas.length === 0 ? (
            <p className="tenue">Todavía no hay pedidos cerrados.</p>
          ) : (
            <>
              <Tabla
                columnas={['Llegó', ...columnas.slice(1)]}
                variante="pedidos"
                descripcion="Pedidos cerrados: entregados, cancelados y devueltos"
              >
                {llegadasVisibles.map((p) => (
                  <FilaPedido key={p.id} pedido={p} ahora={ahora} completa={!panel} cerrado />
                ))}
              </Tabla>
              {verTodos(llegadas.length, 'llegadas')}
            </>
          )}
        </Card>
      </>
    );
  }

  if (panel) return <div className="pila">{tableros}</div>;

  return (
    <div className="pila">
      <PageHeader
        titulo="Pedidos"
        subtitulo={
          cargando || error
            ? undefined
            : `${total} pedidos registrados en el sistema${
                lista.length < total ? ` · mostrando los primeros ${lista.length}` : ''
              }.`
        }
        acciones={nuevoPedido}
      />
      {tableros}
    </div>
  );
}
