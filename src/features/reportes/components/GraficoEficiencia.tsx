import { useCallback, useEffect, useMemo, useState } from 'react';
import { reportesApi } from '../services/reportesApi';
import type { RendimientoRepartidor } from '../../../types';
import { Card, PageHeader } from '../../../components/ui';
import { EstadoCarga, EstadoVacio, EstadoError } from '../../../components/Estados';

type Estado = 'cargando' | 'listo' | 'error';

interface FilaRanking extends RendimientoRepartidor {
  porcentaje: number | null;
}

/** Meta de entregas a tiempo: la marca vertical de cada pista. */
const META = 90;
const UMBRAL_AYUDA = 70;

/**
 * La pregunta real detrás de «eficiencia» no es «cuántas entregas a tiempo y
 * cuántas tardías tuvo cada quien» —eso son solo los insumos—, es «quién va
 * bien y quién necesita ayuda». Un medidor ordenado de mejor a peor responde
 * eso de un vistazo. El color lleva la severidad (verde cumple la meta, rojo
 * necesita ayuda), pero la posición y el número ya lo dicen sin color.
 */
function colorSeveridad(porcentaje: number): string {
  if (porcentaje >= META) return 'var(--color-exito)';
  if (porcentaje >= UMBRAL_AYUDA) return 'var(--color-tinta)';
  return 'var(--color-alerta)';
}

function minutosLegibles(min: number): string {
  if (min < 60) return `${Math.round(min)} min prom.`;
  const horas = Math.floor(min / 60);
  const resto = Math.round(min % 60);
  return resto ? `${horas} h ${resto} min prom.` : `${horas} h prom.`;
}

function FilaEficiencia({ fila, posicion }: { fila: FilaRanking; posicion: number }) {
  const porcentaje = fila.porcentaje;
  const color = porcentaje !== null ? colorSeveridad(porcentaje) : 'var(--color-borde)';

  return (
    <li className="ranking__fila">
      <span className="ranking__pos" aria-hidden>
        {posicion}
      </span>

      <span className="ranking__nombre">{fila.repartidor}</span>

      <span className="ranking__pct" style={{ color: porcentaje !== null ? color : undefined }}>
        {porcentaje !== null ? `${porcentaje} %` : '—'}
      </span>

      <div
        className="ranking__pista"
        role="img"
        aria-label={`${porcentaje ?? 0} % de las entregas a tiempo; la meta es ${META} %`}
      >
        <div className="ranking__relleno" style={{ width: `${porcentaje ?? 0}%`, background: color }} />
        <span className="ranking__meta90" aria-hidden />
      </div>

      <p className="ranking__meta">
        <span>{fila.entregas_a_tiempo} a tiempo</span>
        <span>
          {fila.entregas_tardias} {fila.entregas_tardias === 1 ? 'tardía' : 'tardías'}
        </span>
        {fila.calificacion_promedio !== null && <span>★ {fila.calificacion_promedio.toFixed(1)}</span>}
        {fila.tiempo_promedio_min !== null && <span>{minutosLegibles(fila.tiempo_promedio_min)}</span>}
      </p>
    </li>
  );
}

export default function GraficoEficiencia({
  variante = 'panel',
}: {
  variante?: 'pagina' | 'panel';
}) {
  const [datos, setDatos] = useState<RendimientoRepartidor[]>([]);
  const [estado, setEstado] = useState<Estado>('cargando');

  const cargar = useCallback(() => {
    setEstado('cargando');
    reportesApi
      .rendimiento()
      .then((filas) => {
        setDatos(filas);
        setEstado('listo');
      })
      // Un fallo de red no debe verse igual que «todavía no hay entregas».
      .catch(() => setEstado('error'));
  }, []);

  useEffect(cargar, [cargar]);

  const ranking = useMemo<FilaRanking[]>(
    () => datos
      .map((d) => ({
        ...d,
        porcentaje: d.total_entregas > 0
          ? Math.round((d.entregas_a_tiempo / d.total_entregas) * 100)
          : null,
      }))
      // De mejor a peor; quien no tiene entregas aún queda al final, no arriba.
      .sort((a, b) => (b.porcentaje ?? -1) - (a.porcentaje ?? -1)),
    [datos],
  );

  const totalEntregas = useMemo(
    () => datos.reduce((acc, d) => acc + d.total_entregas, 0),
    [datos],
  );

  const resumen =
    estado === 'listo' && datos.length > 0
      ? `${datos.length === 1 ? '1 repartidor' : `${datos.length} repartidores`} · ${totalEntregas} ${
          totalEntregas === 1 ? 'entrega' : 'entregas'
        } en total`
      : undefined;

  const tarjeta = (
    <Card>
      <div className="card__cabecera">
        <h2>{variante === 'panel' ? 'Eficiencia' : 'De mejor a peor'}</h2>
        {variante === 'pagina' && resumen && <span className="card__nota">{resumen}</span>}
      </div>

      {estado === 'cargando' && <EstadoCarga filas={4} etiqueta="Cargando el informe…" />}

      {estado === 'error' && (
        <EstadoError
          titulo="No pudimos cargar el informe"
          detalle="No se pudo consultar el rendimiento del equipo."
          onReintentar={cargar}
        />
      )}

      {estado === 'listo' && ranking.length === 0 && (
        <EstadoVacio
          titulo="Sin entregas registradas todavía"
          detalle="Aquí verás, de mejor a peor, qué proporción de entregas hace a tiempo cada repartidor."
        />
      )}

      {estado === 'listo' && ranking.length > 0 && (
        <>
          <ol className={`ranking${variante === 'pagina' ? ' ranking--pagina' : ''}`}>
            {ranking.map((fila, i) => (
              <FilaEficiencia key={fila.repartidor_id} fila={fila} posicion={i + 1} />
            ))}
          </ol>
          <p className="ranking__clave">
            <span>La marca vertical es la meta del {META} %.</span>
            <span>En rojo, por debajo del {UMBRAL_AYUDA} %: necesita ayuda.</span>
            {variante === 'panel' && resumen && <span>{resumen}</span>}
          </p>
        </>
      )}
    </Card>
  );

  if (variante === 'panel') return tarjeta;

  return (
    <div className="pila">
      <PageHeader
        titulo="Eficiencia de repartidores"
        subtitulo="Qué proporción de entregas hace a tiempo cada persona, de mejor a peor."
      />
      {tarjeta}
    </div>
  );
}
