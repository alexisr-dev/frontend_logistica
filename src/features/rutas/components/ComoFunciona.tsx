import { Card } from '../../../components/ui';

const PASOS = [
  {
    icono: '📦',
    titulo: 'Agrupas los pedidos',
    detalle: 'Eliges cuáles reparte una misma persona en un mismo día, y en qué orden los visita.',
  },
  {
    icono: '🗺️',
    titulo: 'Se traza el camino',
    detalle: 'El sistema busca el recorrido por carretera entre esas paradas y calcula cuánto se tarda.',
  },
  {
    icono: '🚚',
    titulo: 'El repartidor la sigue',
    detalle: 'La ve en su móvil, va parada por parada y marca cada entrega según la hace.',
  },
];

export default function ComoFunciona() {
  return (
    <Card plano>
      <h3>Qué es una ruta</h3>
      <p
        style={{
          fontSize: 'var(--texto-sm)',
          color: 'var(--color-texto-suave)',
          marginBottom: 'var(--esp-4)',
        }}
      >
        El recorrido de un repartidor en un día: las paradas que hace, en orden, y el camino entre
        ellas.
      </p>
      <ol className="pasos">
        {PASOS.map((paso, i) => (
          <li key={paso.titulo} className="pasos__item">
            <span className="pasos__icono" aria-hidden>
              {paso.icono}
            </span>
            <div>
              <p className="pasos__titulo">
                <span style={{ color: 'var(--color-primario)' }}>{i + 1}. </span>
                {paso.titulo}
              </p>
              <p className="pasos__detalle">{paso.detalle}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
