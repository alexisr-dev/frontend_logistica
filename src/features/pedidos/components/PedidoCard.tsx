import { Link } from 'react-router-dom';
import type { Pedido } from '../../../types';
import { Card, BadgeEstado } from '../../../components/ui';

export default function PedidoCard({ pedido }: { pedido: Pedido }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to={`/pedidos/${pedido.id}`} style={{ fontWeight: 700, color: 'var(--color-primario)' }}>
          {pedido.codigo_seguimiento}
        </Link>
        <BadgeEstado codigo={pedido.estado.codigo} nombre={pedido.estado.nombre} />
      </div>
      <p style={{ fontSize: 14 }}>{pedido.descripcion ?? 'Sin descripción'}</p>
      <p style={{ fontSize: 13, color: 'var(--color-texto-suave)' }}>
        {pedido.cliente.nombre_completo} → {pedido.direccion_destino.distrito ?? pedido.direccion_destino.ciudad}
      </p>
    </Card>
  );
}
