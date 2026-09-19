import { useEffect, useId, useRef } from 'react';
import { Boton } from './ui';

export default function DialogoConfirmacion({
  titulo,
  detalle,
  textoConfirmar = 'Eliminar',
  onConfirmar,
  onCancelar,
}: {
  titulo: string;
  detalle?: string;
  textoConfirmar?: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const cancelar = useRef<HTMLButtonElement>(null);
  const idTitulo = useId();
  const idDetalle = useId();

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    cancelar.current?.focus();

    function alPulsar(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCancelar();
        return;
      }
      if (e.key !== 'Tab' || !caja.current) return;

      const focusables = caja.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const primero = focusables[0];
      const ultimo = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener('keydown', alPulsar);
    return () => {
      document.removeEventListener('keydown', alPulsar);
      anterior?.focus();
    };
  }, [onCancelar]);

  return (
    <div
      className="dialogo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancelar();
      }}
    >
      <div
        ref={caja}
        className="dialogo__caja"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        aria-describedby={detalle ? idDetalle : undefined}
      >
        <h2 id={idTitulo}>{titulo}</h2>
        {detalle && (
          <p className="dialogo__detalle" id={idDetalle}>
            {detalle}
          </p>
        )}
        <div className="dialogo__acciones">
          <Boton ref={cancelar} type="button" variante="neutro" onClick={onCancelar}>
            Cancelar
          </Boton>
          <Boton type="button" variante="peligro" onClick={onConfirmar}>
            {textoConfirmar}
          </Boton>
        </div>
      </div>
    </div>
  );
}
