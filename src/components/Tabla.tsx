import type { ReactNode } from 'react';

export type AreaCelda = 'hora' | 'codigo' | 'cliente' | 'destino' | 'repartidor' | 'estado' | 'creado';

export function Tabla({
  columnas,
  descripcion,
  variante,
  children,
}: {
  columnas: string[];
  descripcion: string;
  /** `pedidos`: en móvil cada fila se compone como un billete, con la hora a la izquierda. */
  variante?: 'pedidos';
  children: ReactNode;
}) {
  return (
    <div className="tabla-caja">
      <table className={`tabla${variante ? ` tabla--${variante}` : ''}`}>
        <caption className="solo-lectores">{descripcion}</caption>
        <thead>
          <tr>
            {columnas.map((columna) => (
              <th key={columna} scope="col">
                {columna || <span className="solo-lectores">Acciones</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Fila({ atenuada = false, children }: { atenuada?: boolean; children: ReactNode }) {
  return <tr className={atenuada ? 'tabla__fila--atenuada' : undefined}>{children}</tr>;
}

export function Celda({
  etiqueta,
  acciones = false,
  area,
  children,
}: {
  etiqueta: string;
  acciones?: boolean;
  /** Sitio de la celda en el billete móvil de la variante `pedidos`. */
  area?: AreaCelda;
  children: ReactNode;
}) {
  return (
    <td data-etiqueta={etiqueta} data-area={area} className={acciones ? 'tabla__acciones' : undefined}>
      {children}
    </td>
  );
}
