import { Card } from './ui';
import { Skeleton } from './Estados';

export default function Kpi({
  titulo,
  valor,
  color = 'var(--color-texto)',
}: {
  titulo: string;
  valor: number | null;
  color?: string;
}) {
  return (
    <Card>
      <p className="kpi__titulo">{titulo}</p>
      {valor === null ? (
        <div style={{ marginTop: 'var(--esp-2)' }}>
          <Skeleton variante="dato" />
        </div>
      ) : (
        <p className="kpi__valor" style={{ color }}>
          {valor.toLocaleString('es-PE')}
        </p>
      )}
    </Card>
  );
}
