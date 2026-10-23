import type { ReactNode } from 'react';
import { Boton } from './ui';

export function Skeleton({
  variante = 'texto',
  ancho,
}: {
  variante?: 'texto' | 'dato' | 'bloque';
  ancho?: string;
}) {
  return <div className={`skeleton skeleton--${variante}`} style={ancho ? { width: ancho } : undefined} />;
}

export function EstadoCarga({
  filas = 3,
  etiqueta = 'Cargando…',
}: {
  filas?: number;
  etiqueta?: string;
}) {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="solo-lectores">{etiqueta}</span>
      {Array.from({ length: filas }).map((_, i) => (
        <Skeleton key={i} ancho={i === filas - 1 ? '60%' : undefined} />
      ))}
    </div>
  );
}

/** Vacío: un título, una frase y, si hay algo que hacer, la acción. Sin ilustración. */
export function EstadoVacio({
  titulo,
  detalle,
  accion,
}: {
  titulo: string;
  detalle?: string;
  accion?: ReactNode;
}) {
  return (
    <div className="estado">
      <p className="estado__titulo">{titulo}</p>
      {detalle && <p className="estado__detalle">{detalle}</p>}
      {accion}
    </div>
  );
}

export function EstadoError({
  titulo = 'No pudimos cargar esta información',
  detalle,
  onReintentar,
}: {
  titulo?: string;
  detalle?: string;
  onReintentar?: () => void;
}) {
  return (
    <div className="estado" role="alert">
      <p className="estado__titulo">{titulo}</p>
      {detalle && <p className="estado__detalle">{detalle}</p>}
      {onReintentar && (
        <Boton type="button" variante="neutro" onClick={onReintentar}>
          Reintentar
        </Boton>
      )}
    </div>
  );
}
