import { useEffect, useState } from 'react';

/**
 * Funciones de tiempo para la lectura «tipo cuadro de salidas»: cada pedido y
 * cada parada se lee por su hora, y el retraso se calcula contra el reloj.
 */

const LOCALE = 'es-PE';

/** La hora actual, refrescada cada `cadaMs`. Sirve para el reloj y para el retraso. */
export function useAhora(cadaMs = 30_000): Date {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), cadaMs);
    return () => clearInterval(id);
  }, [cadaMs]);
  return ahora;
}

export function hora(fecha: Date): string {
  return fecha.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** «09:55», o «—» si el dato no existe. */
export function horaDe(iso?: string | null): string {
  if (!iso) return '—';
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? '—' : hora(fecha);
}

/** «martes 13 de octubre» (sin la coma que algunos navegadores ponen tras el día). */
export function fechaLarga(fecha: Date): string {
  return fecha
    .toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(',', '');
}

/** «13/10», solo si la fecha no es la de hoy: así la hora manda y el día solo aparece cuando hace falta. */
export function diaSiNoEsHoy(iso: string | null | undefined, ahora: Date): string | null {
  if (!iso) return null;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return null;
  if (fecha.toDateString() === ahora.toDateString()) return null;
  return fecha.toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit' });
}

/** Minutos de retraso contra el reloj, o `null` si todavía está a tiempo. */
export function minutosDeRetraso(estimadaIso: string | null | undefined, ahora: Date): number | null {
  if (!estimadaIso) return null;
  const estimada = new Date(estimadaIso).getTime();
  if (Number.isNaN(estimada)) return null;
  const minutos = Math.floor((ahora.getTime() - estimada) / 60_000);
  return minutos > 0 ? minutos : null;
}

/** «+8 min», «+1 h 5 min». */
export function textoRetraso(minutos: number): string {
  if (minutos < 60) return `+${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `+${horas} h ${resto} min` : `+${horas} h`;
}
