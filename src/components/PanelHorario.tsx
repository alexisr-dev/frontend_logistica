import { fechaLarga, hora, useAhora } from '../utils/tiempo';

/**
 * El lado amarillo de las pantallas de acceso: la marca, el lema y la hora
 * en grande, como el reloj de una estación. Es el mismo reloj que la barra
 * del panel, así que el primer gesto de la interfaz ya enseña a leerla por
 * horas.
 */
export default function PanelHorario() {
  const ahora = useAhora();

  return (
    <section className="acceso__reloj" aria-label="Logística">
      <div className="acceso__marca">
        <span className="acceso__logo" aria-hidden>
          L
        </span>
        Logística
      </div>

      <div>
        <p className="acceso__lema">Cada pedido tiene su hora.</p>
        <time className="acceso__hora" dateTime={ahora.toISOString()}>
          {hora(ahora)}
        </time>
        <p className="acceso__fecha">{fechaLarga(ahora)}</p>
      </div>
    </section>
  );
}
