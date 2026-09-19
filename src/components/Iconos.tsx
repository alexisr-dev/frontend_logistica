import type { SVGProps } from 'react';

/**
 * Set mínimo de iconos de línea, dibujados a mano en vez de con emoji.
 *
 * El emoji de cada plataforma se ve distinto (Windows, iOS, Android pintan
 * "🗺️" con trazos y colores propios) y algunos glifos —como el de apagado
 * que usaba «Cerrar sesión»— ni siquiera existen en la fuente del sistema:
 * salían como un cuadro roto. Un trazo propio se ve igual en cualquier sitio
 * y hereda el color del texto (currentColor), así que sigue los estados de
 * la app sin código extra.
 */
type Props = SVGProps<SVGSVGElement>;

const base: Props = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function IconoPanel(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.5" />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.5" />
      <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.5" />
    </svg>
  );
}

export function IconoPaquete(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 4 7.5v9L12 20.5l8-4v-9z" />
      <path d="M4 7.5 12 11.5l8-4" />
      <path d="M12 11.5v9" />
    </svg>
  );
}

/** Dos paradas unidas por un tramo: el mismo lenguaje que usa TiraRecorrido. */
export function IconoRuta(props: Props) {
  return (
    <svg {...base} {...props}>
      <circle cx="5.5" cy="7" r="2.3" />
      <circle cx="18.5" cy="17" r="2.3" />
      <path d="M7.6 8.3C11 11 13 13 16.4 15.7" />
    </svg>
  );
}

export function IconoReportes(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20V10.5" />
      <path d="M12 20V4" />
      <path d="M20 20v-6.5" />
      <path d="M3 20h18" />
    </svg>
  );
}

export function IconoUsuarios(props: Props) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.6-3.3 3-5 5.5-5s4.9 1.7 5.5 5" />
      <circle cx="17" cy="7.5" r="2.3" />
      <path d="M15.8 11.3c1.9.3 3.7 1.7 4.2 4.7" />
    </svg>
  );
}

export function IconoSalir(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M10 20H5.5a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 5.5 4H10" />
      <path d="M15.5 8 20 12l-4.5 4" />
      <path d="M20 12H9" />
    </svg>
  );
}

export function IconoMenu(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

export function IconoCerrar(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export function IconoOjo(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 12S5.8 6 12 6s9.5 6 9.5 6-3.3 6-9.5 6S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

export function IconoOjoCerrado(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 12S5.8 6 12 6s9.5 6 9.5 6-3.3 6-9.5 6S2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M4 4l16 16" />
    </svg>
  );
}
