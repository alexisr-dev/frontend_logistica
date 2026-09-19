import type { ReactNode } from 'react';

export function Tabla({
  columnas,
  descripcion,
  children,
}: {
  columnas: string[];
  descripcion: string;
  children: ReactNode;
}) {
  return (
    <div className="tabla-caja">
      <table className="tabla">
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
  children,
}: {
  etiqueta: string;
  acciones?: boolean;
  children: ReactNode;
}) {
  return (
    <td data-etiqueta={etiqueta} className={acciones ? 'tabla__acciones' : undefined}>
      {children}
    </td>
  );
}
