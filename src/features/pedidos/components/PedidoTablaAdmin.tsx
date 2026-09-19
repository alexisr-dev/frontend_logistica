import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { cargarPedidos } from '../pedidosSlice';
import { BadgeEstado, Boton, Card, PageHeader } from '../../../components/ui';
import { Tabla, Fila, Celda } from '../../../components/Tabla';
import { EstadoCarga, EstadoVacio, EstadoError } from '../../../components/Estados';

const COLUMNAS = ['Código', 'Cliente', 'Repartidor', 'Estado', 'Fecha'];

export default function PedidoTablaAdmin({
  variante = 'pagina',
}: {
  variante?: 'pagina' | 'panel';
}) {
  const dispatch = useAppDispatch();
  const { lista, cargando, total, error } = useAppSelector((s) => s.pedidos);

  useEffect(() => {
    dispatch(cargarPedidos(undefined));
  }, [dispatch]);

  const contenido = cargando ? (
    <EstadoCarga filas={5} etiqueta="Cargando los pedidos…" />
  ) : error ? (
    <EstadoError
      titulo="No pudimos cargar los pedidos"
      detalle={error}
      onReintentar={() => dispatch(cargarPedidos(undefined))}
    />
  ) : lista.length === 0 ? (
    <EstadoVacio
      icono="📦"
      titulo="Todavía no hay pedidos"
      detalle="Cuando registres el primero aparecerá aquí con su estado y su repartidor."
      accion={
        <Link to="/pedidos/nuevo">
          <Boton type="button">Nuevo pedido</Boton>
        </Link>
      }
    />
  ) : (
    <Tabla columnas={COLUMNAS} descripcion="Listado de pedidos con su estado y su repartidor">
      {lista.map((p) => (
        <Fila key={p.id}>
          <Celda etiqueta="Código">
            <Link to={`/pedidos/${p.id}`} className="btn--texto" style={{ padding: 0 }}>
              {p.codigo_seguimiento}
            </Link>
          </Celda>
          <Celda etiqueta="Cliente">{p.cliente?.nombre_completo}</Celda>
          <Celda etiqueta="Repartidor">{p.repartidor?.nombre_completo ?? 'Sin asignar'}</Celda>
          <Celda etiqueta="Estado">
            <BadgeEstado codigo={p.estado.codigo} nombre={p.estado.nombre} />
          </Celda>
          <Celda etiqueta="Fecha">
            {new Date(p.fecha_creacion).toLocaleDateString('es-PE')}
          </Celda>
        </Fila>
      ))}
    </Tabla>
  );

  if (variante === 'panel') {
    return (
      <Card>
        <div className="page-header" style={{ marginBottom: 'var(--esp-4)' }}>
          <h2>Últimos pedidos</h2>
          <Link to="/pedidos" className="btn btn--texto">
            Ver todos →
          </Link>
        </div>
        {contenido}
      </Card>
    );
  }

  return (
    <div className="pila">
      <PageHeader
        titulo="Pedidos"
        subtitulo={
          cargando || error ? undefined : `${total} pedidos registrados en el sistema.`
        }
        acciones={
          <Link to="/pedidos/nuevo">
            <Boton type="button">Nuevo pedido</Boton>
          </Link>
        }
      />
      <Card>{contenido}</Card>
    </div>
  );
}
