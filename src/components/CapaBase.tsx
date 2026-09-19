import { TileLayer } from 'react-leaflet';

const ATRIBUCION = "Esri, HERE, Garmin, &copy; OpenStreetMap contributors";

export default function CapaBase() {
  return (
    <>
      <TileLayer
        attribution={ATRIBUCION}
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        maxZoom={16}
      />
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
        maxZoom={16}
      />
    </>
  );
}
