import axios from 'axios';

const NOMINATIM = 'https://nominatim.openstreetmap.org';

const PAIS = 'pe';

const IDIOMA = 'es';

export interface DireccionGeocodificada {
  calle: string;
  distrito?: string;
  ciudad?: string;
  descripcion: string;
  lat: number;
  lng: number;
}

interface CamposNominatim {
  road?: string;
  pedestrian?: string;
  footway?: string;
  neighbourhood?: string;
  house_number?: string;
  suburb?: string;
  quarter?: string;
  city_district?: string;
  village?: string;
  town?: string;
  city?: string;
  county?: string;
  state_district?: string;
  state?: string;
}

interface LugarNominatim {
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: CamposNominatim;
  error?: string;
}

function aDireccion(lugar: LugarNominatim, respaldo: boolean): DireccionGeocodificada {
  const campos = lugar.address ?? {};
  const lat = Number(lugar.lat);
  const lng = Number(lugar.lon);

  const via =
    campos.road ??
    campos.pedestrian ??
    campos.footway ??
    campos.neighbourhood ??
    (respaldo ? lugar.display_name.split(',')[0]?.trim() : undefined);

  const rotulo = lugar.name && lugar.name !== via ? lugar.name : undefined;

  const calle = [rotulo, [via, campos.house_number].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ');

  const distrito =
    campos.suburb ?? campos.city_district ?? campos.quarter ?? campos.town ?? campos.village;

  const ciudad = [campos.city, campos.town, campos.state_district, campos.county, campos.state].find(
    (nombre) => nombre && nombre !== distrito,
  );

  return {
    calle: calle.slice(0, 150),
    distrito: distrito?.slice(0, 100),
    ciudad: ciudad?.slice(0, 100),
    descripcion: lugar.display_name,
    lat,
    lng,
  };
}

export const geocoding = {
  async inverso(
    lat: number,
    lng: number,
    signal?: AbortSignal,
  ): Promise<DireccionGeocodificada | null> {
    const { data } = await axios.get<LugarNominatim>(`${NOMINATIM}/reverse`, {
      params: {
        lat,
        lon: lng,
        format: 'jsonv2',
        addressdetails: 1,
        zoom: 18,
        'accept-language': IDIOMA,
      },
      timeout: 8000,
      signal,
    });
    return data.error ? null : aDireccion(data, false);
  },

  async buscar(texto: string, signal?: AbortSignal): Promise<DireccionGeocodificada[]> {
    const { data } = await axios.get<LugarNominatim[]>(`${NOMINATIM}/search`, {
      params: {
        q: texto,
        format: 'jsonv2',
        addressdetails: 1,
        limit: 5,
        countrycodes: PAIS,
        'accept-language': IDIOMA,
      },
      timeout: 8000,
      signal,
    });
    return data.map((lugar) => aDireccion(lugar, true));
  },
};
