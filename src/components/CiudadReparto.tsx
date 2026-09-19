/**
 * La ciudad que se reparte: ilustración isométrica del recorrido
 * almacén → repartidor → cliente, en el lado izquierdo de las pantallas de
 * acceso.
 *
 * Es SVG generado, no dibujado polígono a polígono: se define la escena en
 * coordenadas del mundo (x, y en el suelo; z en altura) y `proyecta()` la
 * lleva a pantalla. Cada volumen sale de ahí con sus tres caras y su
 * sombreado, así que mover un edificio es cambiar dos números, no redibujar.
 *
 * SVG y no CSS 3D a propósito: las transformadas CSS solo saben hacer cajas
 * y planos —nada de tejados a dos aguas, copas de árbol ni furgonetas—, y era
 * justo eso lo que hacía que la versión anterior pareciera un montón de
 * bloques en vez de un barrio.
 */

/* ── Proyección ───────────────────────────────────────────────────────
   Isométrica clásica: +x baja hacia la derecha, +y baja hacia la izquierda
   y z sube. Con cos(30°) el ancho de las caras queda en la proporción que
   hace que un cubo se lea como un cubo. */
const COS30 = 0.866;

type P3 = [number, number, number];

function proyecta(x: number, y: number, z: number) {
  return { x: (x - y) * COS30, y: (x + y) * 0.5 - z };
}

/** Convierte una lista de puntos del mundo en el atributo `points` de un polígono. */
function pol(...puntos: P3[]): string {
  return puntos
    .map(([x, y, z]) => {
      const p = proyecta(x, y, z);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(' ');
}

/** Camino proyectado a partir de una polilínea en el suelo, a una altura dada. */
function camino(puntos: [number, number][], z: number): string {
  return puntos
    .map(([x, y], i) => {
      const p = proyecta(x, y, z);
      return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
    })
    .join(' ');
}

/* ── Paleta ───────────────────────────────────────────────────────────
   Tres tonos por volumen —techo, cara derecha, cara frontal— es lo que crea
   la sensación de luz sin necesidad de sombreado real. */
const C = {
  islaTecho: '#3c4a66',
  islaDcha: '#1e2740',
  islaFrente: '#273350',
  cesped: '#33507a',
  asfalto: '#4b587a',
  linea: 'rgba(196, 214, 245, 0.5)',
  muroTecho: '#8494b5',
  muroDcha: '#4e5b7b',
  muroFrente: '#65739a',
  naveTecho: '#c9d4e6',
  naveDcha: '#1f4fa8',
  naveFrente: '#2f6ad0',
  tejaTecho: '#46506e',
  tejaDcha: '#2b3350',
  tejaFrente: '#38415f',
  ventana: '#ffd08a',
  ventanaApagada: 'rgba(180, 205, 240, 0.35)',
  copaClara: '#4aa06a',
  copaMedia: '#3d8b5c',
  copaOscura: '#31734c',
  tronco: '#4a3a2c',
  sombra: 'rgba(6, 11, 24, 0.45)',
};

/* ── Escena ───────────────────────────────────────────────────────────
   Las tres plataformas y lo que hay sobre cada una. El orden del array es
   el orden de dibujado: de la más lejana a la más cercana, que es como se
   resuelve la oclusión en isométrico (no hay z-buffer en SVG). */
const GROSOR = 16;

const ISLAS = [
  { x: 0, y: 0, w: 190, d: 140 },
  { x: 60, y: 140, w: 190, d: 140 },
  { x: 130, y: 280, w: 200, d: 150 },
];

type Edificio = {
  x: number; y: number; w: number; d: number; h: number;
  tipo: 'nave' | 'bloque' | 'casa';
};

const EDIFICIOS: Edificio[] = [
  // Isla del almacén.
  { x: 18, y: 22, w: 72, d: 56, h: 32, tipo: 'nave' },
  { x: 132, y: 26, w: 40, d: 34, h: 26, tipo: 'bloque' },
  { x: 130, y: 92, w: 36, d: 30, h: 16, tipo: 'casa' },
  // Isla de tránsito.
  { x: 128, y: 152, w: 36, d: 30, h: 30, tipo: 'bloque' },
  { x: 200, y: 156, w: 40, d: 34, h: 44, tipo: 'bloque' },
  { x: 88, y: 232, w: 40, d: 32, h: 17, tipo: 'casa' },
  { x: 205, y: 232, w: 34, d: 28, h: 24, tipo: 'bloque' },
  // Isla del cliente.
  { x: 208, y: 292, w: 48, d: 38, h: 20, tipo: 'casa' },
  { x: 286, y: 300, w: 36, d: 30, h: 34, tipo: 'bloque' },
  { x: 140, y: 378, w: 34, d: 28, h: 15, tipo: 'casa' },
  { x: 284, y: 380, w: 38, d: 30, h: 26, tipo: 'bloque' },
];

const ARBOLES: [number, number][] = [
  [8, 96], [30, 108], [56, 100], [172, 78], [178, 112], [104, 12], [150, 122],
  [72, 156], [116, 196], [152, 244], [232, 200], [86, 268], [244, 262], [196, 268],
  [148, 300], [166, 336], [300, 348], [270, 296], [318, 404], [212, 396], [242, 418],
];

/** El recorrido en coordenadas del mundo: baja del almacén al cliente. */
const RECORRIDO: [number, number][] = [
  [100, 30], [100, 200], [180, 200], [180, 350], [260, 350], [260, 408],
];

/** Altura a la que van las calles: la cara superior de las plataformas. */
const SUELO = 0;

const RUTA_D = camino(RECORRIDO, SUELO);

/* ── Piezas ───────────────────────────────────────────────────────── */

function Plataforma({ x, y, w, d }: { x: number; y: number; w: number; d: number }) {
  return (
    <g>
      <polygon points={pol([x, y, 0], [x + w, y, 0], [x + w, y + d, 0], [x, y + d, 0])} fill={C.islaTecho} />
      <polygon
        points={pol([x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, -GROSOR], [x + w, y, -GROSOR])}
        fill={C.islaDcha}
      />
      <polygon
        points={pol([x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, -GROSOR], [x, y + d, -GROSOR])}
        fill={C.islaFrente}
      />
    </g>
  );
}

/** Rejilla de ventanas sobre una cara. `eje` dice si la cara mira a +x o a +y. */
function Ventanas({ e, eje }: { e: Edificio; eje: 'x' | 'y' }) {
  const largo = eje === 'y' ? e.w : e.d;
  const cols = Math.max(1, Math.floor(largo / 13));
  const filas = Math.max(1, Math.floor(e.h / 12));
  const casillas = [];

  for (let c = 0; c < cols; c++) {
    for (let f = 0; f < filas; f++) {
      const u = 5 + c * 13;
      const v = 6 + f * 12;
      if (u + 7 > largo || v + 7 > e.h) continue;
      // Un patrón fijo decide qué ventanas están encendidas: si fuese
      // aleatorio, cambiaría en cada render y el barrio parpadearía solo.
      const encendida = (c * 3 + f * 5 + e.x) % 4 !== 0;
      const fill = encendida ? C.ventana : C.ventanaApagada;
      const p: P3[] =
        eje === 'y'
          ? [
              [e.x + u, e.y + e.d, v],
              [e.x + u + 7, e.y + e.d, v],
              [e.x + u + 7, e.y + e.d, v + 7],
              [e.x + u, e.y + e.d, v + 7],
            ]
          : [
              [e.x + e.w, e.y + u, v],
              [e.x + e.w, e.y + u + 7, v],
              [e.x + e.w, e.y + u + 7, v + 7],
              [e.x + e.w, e.y + u, v + 7],
            ];
      casillas.push(<polygon key={`${eje}${c}${f}`} points={pol(...p)} fill={fill} opacity="0.95" />);
    }
  }
  return <>{casillas}</>;
}

function Volumen({ e }: { e: Edificio }) {
  const { x, y, w, d, h, tipo } = e;
  const nave = tipo === 'nave';
  const techo = nave ? C.naveTecho : C.muroTecho;
  const dcha = nave ? C.naveDcha : C.muroDcha;
  const frente = nave ? C.naveFrente : C.muroFrente;

  return (
    <g>
      {/* Sombra proyectada: sin ella los edificios parecen recortes pegados. */}
      <polygon
        points={pol([x + 4, y + 6, 0], [x + w + 8, y + 6, 0], [x + w + 8, y + d + 8, 0], [x + 4, y + d + 8, 0])}
        fill={C.sombra}
      />

      <polygon points={pol([x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h])} fill={dcha} />
      <polygon points={pol([x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h])} fill={frente} />

      {tipo === 'casa' ? (
        <>
          {/* Tejado a dos aguas: la cumbrera corre a lo largo de la casa y es
              lo que hace que se lea como vivienda y no como caja. */}
          <polygon
            points={pol([x, y, h], [x + w, y, h], [x + w, y + d / 2, h + 11], [x, y + d / 2, h + 11])}
            fill={C.tejaDcha}
          />
          <polygon
            points={pol([x, y + d / 2, h + 11], [x + w, y + d / 2, h + 11], [x + w, y + d, h], [x, y + d, h])}
            fill={C.tejaFrente}
          />
          <polygon
            points={pol([x + w, y, h], [x + w, y + d / 2, h + 11], [x + w, y + d, h])}
            fill={C.tejaTecho}
          />
        </>
      ) : (
        <polygon points={pol([x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h])} fill={techo} />
      )}

      {tipo !== 'casa' && <Ventanas e={e} eje="y" />}
      {tipo !== 'casa' && <Ventanas e={e} eje="x" />}

      {tipo === 'casa' && (
        <>
          <polygon
            points={pol(
              [x + w / 2 - 5, y + d, 4],
              [x + w / 2 + 5, y + d, 4],
              [x + w / 2 + 5, y + d, 13],
              [x + w / 2 - 5, y + d, 13],
            )}
            fill={C.ventana}
          />
          <polygon
            points={pol([x + w, y + 8, 4], [x + w, y + 17, 4], [x + w, y + 17, 12], [x + w, y + 8, 12])}
            fill={C.ventana}
            opacity="0.8"
          />
        </>
      )}

      {/* La nave lleva su banda corporativa y los portones del muelle. */}
      {nave && (
        <>
          <polygon
            points={pol([x, y + d, h - 12], [x + w, y + d, h - 12], [x + w, y + d, h - 3], [x, y + d, h - 3])}
            fill="#123a86"
          />
          {[0, 1, 2].map((i) => (
            <polygon
              key={i}
              points={pol(
                [x + 8 + i * 22, y + d, 0],
                [x + 24 + i * 22, y + d, 0],
                [x + 24 + i * 22, y + d, 15],
                [x + 8 + i * 22, y + d, 15],
              )}
              fill="#0e2f6e"
            />
          ))}
        </>
      )}
    </g>
  );
}

function Arbol({ x, y }: { x: number; y: number }) {
  const p = proyecta(x, y, 0);
  return (
    <g>
      <ellipse cx={p.x} cy={p.y} rx="7" ry="3.4" fill={C.sombra} />
      <rect x={p.x - 1.3} y={p.y - 9} width="2.6" height="9" fill={C.tronco} rx="1" />
      <circle cx={p.x - 3.6} cy={p.y - 12} r="5.2" fill={C.copaOscura} />
      <circle cx={p.x + 3.6} cy={p.y - 13} r="5.4" fill={C.copaMedia} />
      <circle cx={p.x} cy={p.y - 17.5} r="6" fill={C.copaClara} />
    </g>
  );
}

export default function CiudadReparto() {
  return (
    <div className="ciudad" aria-hidden="true">
      <svg className="ciudad__lienzo" viewBox="-385 -18 680 432" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="brillo-ruta" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {ISLAS.map((isla) => (
          <Plataforma key={`${isla.x}-${isla.y}`} {...isla} />
        ))}

        {/* El asfalto va sobre las plataformas y por debajo de todo lo demás. */}
        <path className="ciudad__asfalto" d={RUTA_D} />
        <path className="ciudad__linea" d={RUTA_D} />

        {/* Edificios y árboles ordenados de fondo a frente: en isométrico eso
            es lo que decide qué tapa a qué. */}
        {[
          ...EDIFICIOS.map((e) => ({ prof: e.x + e.y, nodo: <Volumen key={`e${e.x}-${e.y}`} e={e} /> })),
          ...ARBOLES.map(([x, y]) => ({ prof: x + y, nodo: <Arbol key={`a${x}-${y}`} x={x} y={y} /> })),
        ]
          .sort((a, b) => a.prof - b.prof)
          .map((o) => o.nodo)}

        {/* La ruta se dibuja al final, por encima de la ciudad: es la capa de
            navegación, igual que en un mapa con indicaciones. */}
        <g filter="url(#brillo-ruta)">
          <path className="ciudad__trazado" d={RUTA_D} />
        </g>
        <path className="ciudad__flujo" d={RUTA_D} />

        {/* El repartidor recorre exactamente el mismo trazado gracias a
            `offset-path`. Va dentro del SVG a propósito: fuera no comparte
            el sistema de coordenadas del viewBox y se despega de la ruta. */}
        <g className="ciudad__repartidor" style={{ offsetPath: `path("${RUTA_D}")` }}>
          <circle className="ciudad__pulso" r="11" />
          <circle className="ciudad__punto" r="11" />
        </g>
      </svg>

      {/* Capa de interfaz: las etiquetas de los tres actores, planas sobre el
          mapa para que se lean rectas. Son texto real, no parte del dibujo. */}
      <ul className="hitos">
        <li className="hitos__item hitos__item--almacen">
          <span className="hitos__icono hitos__icono--ok">▣</span>
          <span>
            <strong>Almacén</strong>
            <small>Pedido preparado</small>
          </span>
          <span className="hitos__check">✓</span>
        </li>
        <li className="hitos__item hitos__item--repartidor">
          <span className="hitos__icono hitos__icono--activo">◎</span>
          <span>
            <strong>Repartidor</strong>
            <small>En camino</small>
          </span>
        </li>
        <li className="hitos__item hitos__item--cliente">
          <span className="hitos__icono hitos__icono--ok">⌂</span>
          <span>
            <strong>Cliente</strong>
            <small>Recibe el paquete</small>
          </span>
          <span className="hitos__check">✓</span>
        </li>
      </ul>

      <div className="progreso">
        <p className="progreso__titulo">Cada pedido, de punta a punta</p>
        <ol className="progreso__pasos">
          <li><span className="progreso__punto" />Almacén</li>
          <li><span className="progreso__punto" />En ruta</li>
          <li><span className="progreso__punto" />Entrega</li>
        </ol>
      </div>
    </div>
  );
}
