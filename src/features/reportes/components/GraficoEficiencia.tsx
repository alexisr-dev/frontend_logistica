import { useCallback, useEffect, useMemo, useState } from 'react';
import { reportesApi } from '../services/reportesApi';
import type { RendimientoRepartidor } from '../../../types';
import { Card, PageHeader } from '../../../components/ui';
import { EstadoCarga, EstadoVacio, EstadoError } from '../../../components/Estados';

type Estado = 'cargando' | 'listo' | 'error';

interface FilaRanking extends RendimientoRepartidor {
  porcentaje: number | null;
}

/**
 * La pregunta real detrás de «eficiencia» no es «cuántas entregas a tiempo y
 * cuántas tardías tuvo cada quien» —eso son solo los insumos—, es «quién va
 * bien y quién necesita ayuda». Un medidor ordenado de mejor a peor responde
 * eso de un vistazo; un par de barras agrupadas por persona obliga a restar
 * mentalmente. El color del relleno lleva la severidad, no solo la serie.
 */
function colorSeveridad(porcentaje: number): string {
  if (porcentaje >= 90) return 'var(--color-exito)';
  if (porcentaje >= 70) return 'var(--color-aviso)';
  return 'var(--color-alerta)';
}

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
}

function minutosLegibles(min: number): string {
  if (min < 60) return `${Math.round(min)} min prom.`;
  const horas = Math.floor(min / 60);
  const resto = Math.round(min % 60);
  return resto ? `${horas} h ${resto} min prom.` : `${horas} h prom.`;
}

function FilaEficiencia({ fila, posicion }: { fila: FilaRanking; posicion: number }) {
  const color = fila.porcentaje !== null ? colorSeveridad(fila.porcentaje) : 'var(--color-borde)';

  return (
    <li className="ranking__fila">
      <span className="ranking__avatar" aria-hidden>
        {iniciales(fila.repartidor)}
      </span>

      <div className="ranking__cuerpo">
        <div className="ranking__cabecera">
          <span className="ranking__nombre">
            {/* El primer puesto solo lleva trofeo si de verdad va bien: ser
                el «menos malo» del grupo no es algo que celebrar. */}
            {posicion === 1 && fila.porcentaje !== null && fila.porcentaje >= 90 && (
              <span aria-hidden title="Mejor racha de entregas a tiempo">🏆 </span>
            )}
            {fila.repartidor}
          </span>
          <span className="ranking__porcentaje">
            {/* El color va en el punto, nunca en el texto: así el número se
                lee igual de bien para quien no distingue verde de rojo. */}
            <span className="ranking__punto-severidad" style={{ background: color }} aria-hidden />
            {fila.porcentaje !== null ? `${fila.porcentaje}%` : '—'}
          </span>
        </div>

        <div
          className="ranking__pista"
          role="img"
          aria-label={`${fila.porcentaje ?? 0}% de las entregas a tiempo`}
        >
          <div
            className="ranking__relleno"
            style={{ width: `${fila.porcentaje ?? 0}%`, background: color }}
          />
        </div>

        <p className="ranking__meta">
          <span className="ranking__punto ranking__punto--exito" aria-hidden />
          {fila.entregas_a_tiempo} a tiempo
          <span className="ranking__punto ranking__punto--alerta" aria-hidden />
          {fila.entregas_tardias} {fila.entregas_tardias === 1 ? 'tardía' : 'tardías'}
          {fila.calificacion_promedio !== null && <span>★ {fila.calificacion_promedio.toFixed(1)}</span>}
          {fila.tiempo_promedio_min !== null && <span>{minutosLegibles(fila.tiempo_promedio_min)}</span>}
        </p>
      </div>
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
      // Antes este catch dejaba la lista vacía, así que un fallo de red se veía
      // idéntico a «todavía no hay entregas». Son cosas distintas.
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

  const tarjeta = (
    <Card>
      {variante === 'panel' && (
        <div style={{ marginBottom: 'var(--esp-4)' }}>
          <h2>Eficiencia de repartidores</h2>
          {estado === 'listo' && datos.length > 0 && (
            <p className="page-header__subtitulo">
              {datos.length === 1 ? '1 repartidor' : `${datos.length} repartidores`} ·{' '}
              {totalEntregas} {totalEntregas === 1 ? 'entrega' : 'entregas'} en total
            </p>
          )}
        </div>
      )}

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
          icono="📈"
          titulo="Sin entregas registradas todavía"
          detalle="Aquí verás, de mejor a peor, qué proporción de entregas hace a tiempo cada repartidor."
        />
      )}

      {estado === 'listo' && ranking.length > 0 && (
        <ol className="ranking">
          {ranking.map((fila, i) => (
            <FilaEficiencia key={fila.repartidor_id} fila={fila} posicion={i + 1} />
          ))}
        </ol>
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
