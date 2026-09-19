import { useCallback, useEffect, useState } from 'react';
import { reportesApi } from '../reportes/services/reportesApi';
import GraficoEficiencia from '../reportes/components/GraficoEficiencia';
import PedidoTablaAdmin from '../pedidos/components/PedidoTablaAdmin';
import { Card, PageHeader } from '../../components/ui';
import { EstadoError } from '../../components/Estados';
import Kpi from '../../components/Kpi';

interface Resumen {
  total_pedidos: number;
  entregados: number;
  en_camino: number;
  cancelados: number;
}

type Estado = 'cargando' | 'listo' | 'error';

export default function AdminDashboard() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [estado, setEstado] = useState<Estado>('cargando');

  const cargar = useCallback(() => {
    setEstado('cargando');
    reportesApi
      .resumen()
      .then((datos) => {
        setResumen(datos);
        setEstado('listo');
      })
      .catch(() => {
        setResumen(null);
        setEstado('error');
      });
  }, []);

  useEffect(cargar, [cargar]);

  return (
    <div className="pila">
      <PageHeader
        titulo="Dashboard"
        subtitulo="Cómo va el reparto hoy: volumen, estado de las entregas y rendimiento del equipo."
      />

      {estado === 'error' ? (
        <Card>
          <EstadoError
            titulo="No pudimos cargar el resumen"
            detalle="Los indicadores no están disponibles ahora mismo. El resto del panel sigue funcionando."
            onReintentar={cargar}
          />
        </Card>
      ) : (
        <div className="rejilla-kpi">
          <Kpi titulo="Total de pedidos" valor={resumen?.total_pedidos ?? null} />
          <Kpi titulo="Entregados" valor={resumen?.entregados ?? null} color="var(--color-exito)" />
          <Kpi titulo="En camino" valor={resumen?.en_camino ?? null} color="var(--color-estado-camino)" />
          <Kpi titulo="Cancelados" valor={resumen?.cancelados ?? null} color="var(--color-alerta)" />
        </div>
      )}

      <GraficoEficiencia />
      <PedidoTablaAdmin variante="panel" />
    </div>
  );
}
