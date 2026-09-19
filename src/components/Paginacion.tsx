import { Boton } from './ui';

export default function Paginacion({
  pagina,
  haySiguiente,
  ocupado = false,
  onCambiar,
}: {
  pagina: number;
  haySiguiente: boolean;
  ocupado?: boolean;
  onCambiar: (pagina: number) => void;
}) {
  if (pagina === 1 && !haySiguiente) return null;

  return (
    <nav className="paginacion" aria-label="Paginación">
      <Boton
        type="button"
        variante="neutro"
        disabled={pagina === 1 || ocupado}
        onClick={() => onCambiar(pagina - 1)}
      >
        ← Anterior
      </Boton>
      <span className="paginacion__posicion" aria-live="polite">
        Página {pagina}
      </span>
      <Boton
        type="button"
        variante="neutro"
        disabled={!haySiguiente || ocupado}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente →
      </Boton>
    </nav>
  );
}
