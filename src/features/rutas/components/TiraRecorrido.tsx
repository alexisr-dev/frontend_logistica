export interface PuntoRecorrido {
  lat: number;
  lng: number;
  etiqueta: string;
  estado?: 'pendiente' | 'entregado' | 'fallido';
}

interface Lugar {
  clave: string;
  etiqueta: string;
  estado: PuntoRecorrido['estado'];
  cuantas: number;
}

/** Varios pedidos al mismo punto son una sola parada: no hay camino entre ellos. */
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

/**
 * El recorrido como una línea vertical de paradas numeradas: el mismo
 * lenguaje que la lista de paradas de una ruta y la línea de tiempo de un
 * pedido (cuadrados unidos por una regla).
 */
export default function TiraRecorrido({ puntos }: { puntos: PuntoRecorrido[] }) {
  const lugares = porLugar(puntos);
  if (lugares.length === 0) return null;

  return (
    <ol className="recorrido" aria-label="Recorrido, en orden de visita">
      {lugares.map((lugar, i) => (
        <li key={lugar.clave} className="recorrido__item">
          <span
            className={`recorrido__num${
              lugar.estado === 'entregado' || lugar.estado === 'fallido'
                ? ` recorrido__num--${lugar.estado}`
                : ''
            }`}
          >
            {i + 1}
          </span>
          <span className="recorrido__texto">
            {lugar.etiqueta}
            {lugar.cuantas > 1 && <small>{lugar.cuantas} pedidos aquí</small>}
          </span>
        </li>
      ))}
    </ol>
  );
}
