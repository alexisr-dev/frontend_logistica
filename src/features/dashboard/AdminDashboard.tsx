import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { reportesApi } from '../reportes/services/reportesApi';
import GraficoEficiencia from '../reportes/components/GraficoEficiencia';
import PedidoTablaAdmin from '../pedidos/components/PedidoTablaAdmin';
import { Boton, Card, PageHeader } from '../../components/ui';
import { EstadoError, Skeleton } from '../../components/Estados';
import { fechaLarga, useAhora } from '../../utils/tiempo';

interface Resumen {
  total_pedidos: number;
  entregados: number;
  en_camino: number;
  cancelados: number;
}

type Estado = 'cargando' | 'listo' | 'error';

/** El día en una sola banda proporcional, con sus cifras debajo. */
function DiaEnCifras({ resumen }: { resumen: Resumen | null }) {
  if (!resumen) {
    return (
      <div className="dia" aria-busy="true">
        <Skeleton variante="dato" />
        <Skeleton variante="dato" ancho="100%" />
      </div>
    );
  }

  const { total_pedidos: total, entregados, en_camino: enCamino, cancelados } = resumen;
  // El resumen del backend solo trae cuatro cifras: lo que no es ninguna de
  // ellas es lo que aún está por salir (pendiente, confirmado, en preparación).
  const porSalir = Math.max(0, total - entregados - enCamino - cancelados);
  const parte = (n: number) => (total > 0 ? `${(n / total) * 100}%` : '0%');

  const segmentos = [
    { clave: 'entregado', nombre: 'Entregados', valor: entregados },
    { clave: 'camino', nombre: 'En camino', valor: enCamino },
    { clave: 'salir', nombre: 'Por salir', valor: porSalir },
    { clave: 'cancelado', nombre: 'Cancelados', valor: cancelados },
  ];

  return (
    <div className="dia">
      <div>
        <span className="dia__total">{total.toLocaleString('es-PE')}</span>
        <span className="dato__etiqueta">pedidos en total</span>
      </div>
      <div>
        <ul
          className="dia__tira"
          role="img"
          aria-label={segmentos.map((s) => `${s.valor} ${s.nombre.toLowerCase()}`).join(', ')}
        >
          {segmentos
            .filter((s) => s.valor > 0)
            .map((s) => (
              <li key={s.clave} className={`seg--${s.clave}`} style={{ width: parte(s.valor) }} />
            ))}
        </ul>
        <ul className="dia__leyenda">
          {segmentos.map((s) => (
            <li key={s.clave}>
              <b>{s.valor.toLocaleString('es-PE')}</b>
              <span>
                <i className={`seg--${s.clave}`} aria-hidden />
                {s.nombre}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [estado, setEstado] = useState<Estado>('cargando');
  const ahora = useAhora(60_000);

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
        titulo={`Hoy, ${fechaLarga(ahora)}`}
        subtitulo={
          resumen
            ? `${resumen.en_camino} en camino · ${resumen.entregados} entregados · ${resumen.cancelados} cancelados`
            : 'Cómo va el reparto hoy: volumen, estado de las entregas y rendimiento del equipo.'
        }
        acciones={
          <Link to="/pedidos/nuevo">
            <Boton type="button">Nuevo pedido</Boton>
          </Link>
        }
      />

      <Card>
        <div className="card__cabecera">
          <h2>El día</h2>
          {resumen && (
            <span className="card__nota">{resumen.total_pedidos.toLocaleString('es-PE')} pedidos registrados</span>
          )}
        </div>
        {estado === 'error' ? (
          <EstadoError
            titulo="No pudimos cargar el resumen"
            detalle="Los indicadores no están disponibles ahora mismo. El resto del panel sigue funcionando."
            onReintentar={cargar}
          />
        ) : (
          <DiaEnCifras resumen={resumen} />
        )}
      </Card>

      <div className="columnas">
        <div className="columnas__principal">
          <PedidoTablaAdmin variante="panel" />
        </div>
        <div className="columnas__lateral">
          <GraficoEficiencia />
        </div>
      </div>
    </div>
  );
}
