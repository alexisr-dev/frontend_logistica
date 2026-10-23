import { Card } from '../../../components/ui';

const PASOS = [
  {
    titulo: 'Agrupas los pedidos',
    detalle: 'Eliges cuáles reparte una misma persona en un mismo día, y en qué orden los visita.',
  },
  {
    titulo: 'Se traza el camino',
    detalle: 'El sistema busca el recorrido por carretera entre esas paradas y calcula cuánto se tarda.',
  },
  {
    titulo: 'El repartidor la sigue',
    detalle: 'La ve en su móvil, va parada por parada y marca cada entrega según la hace.',
  },
];

export default function ComoFunciona() {
  return (
    <Card>
      <h2>Qué es una ruta</h2>
      <p className="card__nota" style={{ margin: 'var(--esp-2) 0 var(--esp-5)', maxWidth: '62ch' }}>
        El recorrido de un repartidor en un día: las paradas que hace, en orden, y el camino entre
        ellas.
      </p>
      <ol className="pasos">
        {PASOS.map((paso, i) => (
          <li key={paso.titulo} className="pasos__item">
            <span className="pasos__numero" aria-hidden>
              {i + 1}
            </span>
            <p className="pasos__titulo">{paso.titulo}</p>
            <p className="pasos__detalle">{paso.detalle}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
