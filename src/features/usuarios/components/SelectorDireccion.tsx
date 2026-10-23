import { useEffect, useRef, useState } from 'react';
import { Campo, Input, Boton } from '../../../components/ui';
import SelectorUbicacion from './SelectorUbicacion';
import { geocoding } from '../../../services/geocoding';
import type { DireccionGeocodificada } from '../../../services/geocoding';
import type { UbicacionSeleccionada } from '../../../types';

export const UBICACION_VACIA: UbicacionSeleccionada = { calle: '', lat: null, lng: null };

function rescatarNumero(tecleada: string, encontrada: string): string {
  const numero = tecleada.trim().match(/(\d{1,6})\s*$/)?.[1];
  return numero && !/\d/.test(encontrada) ? `${encontrada} ${numero}` : encontrada;
}

export default function SelectorDireccion({
  etiqueta,
  titulo,
  onChange,
  placeholder,
  color = 'var(--color-primario)',
  letra,
  destino,
}: {
  etiqueta: string;
  titulo: string;
  onChange: (ubicacion: UbicacionSeleccionada) => void;
  placeholder?: string;
  color?: string;
  letra?: string;
  destino?: boolean;
}) {
  const [ubicacion, setUbicacion] = useState<UbicacionSeleccionada>(UBICACION_VACIA);
  const [vista, setVista] = useState<{ lat: number; lng: number } | null>(null);
  const [sugerencias, setSugerencias] = useState<DireccionGeocodificada[]>([]);
  const [ocupado, setOcupado] = useState<'buscando' | 'resolviendo' | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const peticion = useRef(0);

  useEffect(() => {
    onChange(ubicacion);
  }, [ubicacion, onChange]);

  function usarResultado(dir: DireccionGeocodificada) {
    peticion.current += 1;
    setUbicacion((prev) => ({
      calle: rescatarNumero(prev.calle, dir.calle),
      distrito: dir.distrito,
      ciudad: dir.ciudad,
      lat: dir.lat,
      lng: dir.lng,
    }));
    setVista({ lat: dir.lat, lng: dir.lng });
    setSugerencias([]);
    setAviso(null);
    setOcupado(null);
  }

  async function buscar() {
    const texto = ubicacion.calle.trim();
    if (texto.length < 4) {
      setAviso('Escribe un poco más de la dirección para poder buscarla.');
      return;
    }

    const id = (peticion.current += 1);
    setOcupado('buscando');
    setAviso(null);
    setSugerencias([]);
    try {
      const resultados = await geocoding.buscar(texto);
      if (id !== peticion.current) return;

      if (resultados.length === 0) {
        setAviso('No encontramos esa dirección. Márcala en el mapa y la rellenamos nosotros.');
      } else if (resultados.length === 1) {
        usarResultado(resultados[0]);
      } else {
        setSugerencias(resultados);
      }
    } catch {
      if (id === peticion.current) {
        setAviso('El buscador de direcciones no responde. Marca el punto en el mapa.');
      }
    } finally {
      if (id === peticion.current) setOcupado(null);
    }
  }

  async function marcarEnMapa(lat: number, lng: number) {
    const id = (peticion.current += 1);
    setUbicacion((prev) => ({ ...prev, lat, lng }));
    setSugerencias([]);
    setAviso(null);
    setOcupado('resolviendo');
    try {
      const dir = await geocoding.inverso(lat, lng);
      if (id !== peticion.current) return;

      setUbicacion((prev) => ({
        ...prev,
        calle: dir?.calle || prev.calle,
        distrito: dir?.distrito,
        ciudad: dir?.ciudad,
      }));
      if (!dir?.calle) {
        setAviso('OpenStreetMap no tiene ninguna calle en ese punto: escríbela a mano.');
      }
    } catch {
      if (id === peticion.current) {
        setAviso('No se pudo obtener la dirección. El punto quedó marcado; escribe la calle a mano.');
      }
    } finally {
      if (id === peticion.current) setOcupado(null);
    }
  }

  const punto =
    ubicacion.lat !== null && ubicacion.lng !== null
      ? { lat: ubicacion.lat, lng: ubicacion.lng }
      : null;

  const resumen = [
    ...new Set([ubicacion.calle.trim(), ubicacion.distrito, ubicacion.ciudad].filter(Boolean)),
  ].join(' · ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Campo etiqueta={etiqueta} ayuda="Escríbela y pulsa «Buscar», o marca el punto en el mapa.">
        <div style={{ display: 'flex', gap: 8 }}>
          <Input
            value={ubicacion.calle}
            placeholder={placeholder}
            required
            maxLength={150}
            onChange={(e) => setUbicacion((prev) => ({ ...prev, calle: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                buscar();
              }
            }}
          />
          <Boton
            type="button"
            variante="neutro"
            onClick={buscar}
            disabled={ocupado !== null}
            style={{ flex: '0 0 auto' }}
          >
            {ocupado === 'buscando' ? 'Buscando…' : 'Buscar'}
          </Boton>
        </div>
      </Campo>

      {sugerencias.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            boxShadow: 'inset 0 0 0 1px var(--color-borde-fuerte)',
            overflow: 'hidden',
          }}
        >
          {sugerencias.map((s, i) => (
            <li key={`${s.lat}-${s.lng}-${i}`} style={{ borderTop: i ? '1px solid var(--color-borde)' : undefined }}>
              <button
                type="button"
                onClick={() => usarResultado(s)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: '#fff',
                  border: 'none',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{s.calle}</span>
                <br />
                <span style={{ fontSize: 13, color: 'var(--color-texto-suave)' }}>{s.descripcion}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {aviso && (
        <span role="status" style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-aviso)' }}>
          {aviso}
        </span>
      )}

      <SelectorUbicacion
        titulo={titulo}
        punto={punto}
        vista={vista}
        color={color}
        letra={letra}
        destino={destino}
        onElegir={marcarEnMapa}
      />

      <span style={{ fontSize: 13, color: 'var(--color-texto-suave)' }}>
        {ocupado === 'resolviendo'
          ? 'Obteniendo la dirección de ese punto…'
          : resumen && `Se guardará: ${resumen}`}
      </span>
    </div>
  );
}
