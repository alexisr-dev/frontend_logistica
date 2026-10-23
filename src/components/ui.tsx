import { cloneElement, forwardRef, isValidElement, useId, useState } from 'react';
import type { ReactNode, CSSProperties, ReactElement } from 'react';
import { IconoAlerta, IconoCheck, IconoInfo, IconoOjo, IconoOjoCerrado } from './Iconos';

function clases(...partes: (string | false | undefined)[]): string {
  return partes.filter(Boolean).join(' ');
}

export function Card({
  children,
  style,
  className,
  plano = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  plano?: boolean;
}) {
  return (
    <div className={clases('card', plano && 'card--plano', className)} style={style}>
      {children}
    </div>
  );
}

export function PageHeader({
  titulo,
  subtitulo,
  acciones,
}: {
  titulo: string;
  subtitulo?: string;
  acciones?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p className="page-header__subtitulo">{subtitulo}</p>}
      </div>
      {acciones && <div className="page-header__acciones">{acciones}</div>}
    </header>
  );
}

export function Badge({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span className="badge" style={{ '--badge-color': color } as CSSProperties}>
      {children}
    </span>
  );
}

/**
 * Cuántos de los cinco cuadrados van llenos en cada estado de un pedido.
 * El estado se lee por la forma y por la palabra, no por el matiz.
 */
const NIVEL_PEDIDO: Record<string, number> = {
  pendiente: 1,
  confirmado: 2,
  en_preparacion: 3,
  en_camino: 4,
  entregado: 5,
  devuelto: 4,
};

/** Marcador de los estados que no son de pedido: ruta, parada, rol, cuenta. */
const TOKEN_ESTADO: Record<string, string> = {
  planificada: '--color-estado-planificada',
  en_curso: '--color-estado-camino',
  finalizada: '--color-exito',
  cancelada: '--color-alerta',
  fallido: '--color-alerta',
  cliente: '--color-rol-cliente',
  repartidor: '--color-rol-repartidor',
  administrador: '--color-rol-admin',
  activo: '--color-exito',
  inactivo: '--color-alerta',
};

export function BadgeEstado({
  codigo,
  nombre,
  grande = false,
}: {
  codigo: string;
  nombre: string;
  grande?: boolean;
}) {
  const nivel = NIVEL_PEDIDO[codigo];
  const tamano = grande ? ' estado-pedido--grande' : '';

  if (codigo === 'cancelado') {
    return (
      <span className={`estado-pedido estado-pedido--cancelado${tamano}`}>
        <span className="estado-pedido__x" aria-hidden>
          ×
        </span>
        {nombre}
      </span>
    );
  }

  if (nivel !== undefined) {
    const entregado = codigo === 'entregado';
    return (
      <span className={`estado-pedido${tamano}`}>
        <span className={`cuadros${entregado ? ' cuadros--ok' : ''}`} aria-hidden>
          {[1, 2, 3, 4, 5].map((n) => (
            <i key={n} className={n <= nivel ? 'on' : undefined} />
          ))}
        </span>
        {nombre}
      </span>
    );
  }

  const token = TOKEN_ESTADO[codigo] ?? '--color-estado-neutro';
  return <Badge color={`var(${token})`}>{nombre}</Badge>;
}

export function Campo({
  etiqueta,
  children,
  ayuda,
}: {
  etiqueta: string;
  children: ReactNode;
  ayuda?: string;
}) {
  const idEtiqueta = useId();
  const idAyuda = useId();
  const idControl = useId();

  const control = isValidElement(children)
    ? cloneElement(
        children as ReactElement<{
          id?: string;
          'aria-labelledby'?: string;
          'aria-describedby'?: string;
        }>,
        {
          id: (children.props as { id?: string }).id ?? idControl,
          'aria-labelledby': idEtiqueta,
          ...(ayuda ? { 'aria-describedby': idAyuda } : {}),
        },
      )
    : children;

  return (
    <label className="campo">
      <span className="campo__etiqueta" id={idEtiqueta}>
        {etiqueta}
      </span>
      {control}
      {ayuda && (
        <span className="campo__ayuda" id={idAyuda}>
          {ayuda}
        </span>
      )}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clases('control', props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clases('control', props.className)} />;
}

/**
 * Campo de contraseña con botón para revelarla. Sin él no hay forma de
 * comprobar que se escribió bien antes de enviar el formulario: los puntos
 * ocultan tanto un error de tecleo como una contraseña correcta.
 *
 * No recibe `type`: siempre empieza oculto y el propio componente alterna
 * entre `password` y `text`.
 */
export function InputClave(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const [visible, setVisible] = useState(false);
  const { className, ...resto } = props;

  return (
    <div className="campo-clave">
      <input
        {...resto}
        type={visible ? 'text' : 'password'}
        className={clases('control', className)}
      />
      <button
        type="button"
        className="campo-clave__alternar"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
      >
        {visible ? <IconoOjoCerrado width={18} height={18} /> : <IconoOjo width={18} height={18} />}
      </button>
    </div>
  );
}

export const Boton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variante?: 'primario' | 'neutro' | 'peligro' | 'texto' | 'texto-peligro';
  }
>(function Boton({ variante = 'primario', ...props }, ref) {
  return (
    <button {...props} ref={ref} className={clases('btn', `btn--${variante}`, props.className)} />
  );
});

export function Aviso({
  tono,
  children,
}: {
  tono: 'error' | 'exito' | 'atencion';
  children: ReactNode;
}) {
  const Icono = tono === 'exito' ? IconoCheck : tono === 'error' ? IconoAlerta : IconoInfo;
  return (
    <p className={`aviso aviso--${tono}`} role={tono === 'error' ? 'alert' : undefined}>
      <Icono aria-hidden />
      <span>{children}</span>
    </p>
  );
}
