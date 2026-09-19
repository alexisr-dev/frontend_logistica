import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pedidosApi } from '../services/pedidosApi';
import { usuariosApi, direccionesApi } from '../../usuarios/services/usuariosApi';
import type { Usuario, UbicacionSeleccionada } from '../../../types';
import { Card, Campo, Input, Select, Boton, Aviso, PageHeader } from '../../../components/ui';
import { mensajeDeError } from '../../../utils/errores';
import SelectorDireccion, { UBICACION_VACIA } from '../../usuarios/components/SelectorDireccion';

export default function PedidoForm() {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [repartidores, setRepartidores] = useState<Usuario[]>([]);

  const [clienteId, setClienteId] = useState('');
  const [repartidorId, setRepartidorId] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [pesoKg, setPesoKg] = useState('');
  const [costoEnvio, setCostoEnvio] = useState('');
  const [fechaEstimada, setFechaEstimada] = useState('');

  const [origen, setOrigen] = useState<UbicacionSeleccionada>(UBICACION_VACIA);
  const [destino, setDestino] = useState<UbicacionSeleccionada>(UBICACION_VACIA);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usuariosApi.clientes().then(setClientes).catch(() => setClientes([]));
    usuariosApi.repartidores().then(setRepartidores).catch(() => setRepartidores([]));
  }, []);

  const completa = (u: UbicacionSeleccionada) =>
    Boolean(u.calle.trim() && u.lat !== null && u.lng !== null);
  const listo = Boolean(clienteId) && completa(origen) && completa(destino);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!listo || origen.lat === null || origen.lng === null
        || destino.lat === null || destino.lng === null) return;

    setGuardando(true);
    setError(null);
    try {
      const usuario = Number(clienteId);
      const [dirOrigen, dirDestino] = await Promise.all([
        direccionesApi.crear({
          usuario, alias: 'Origen',
          calle: origen.calle.trim(), distrito: origen.distrito, ciudad: origen.ciudad,
          latitud: origen.lat, longitud: origen.lng,
        }),
        direccionesApi.crear({
          usuario, alias: 'Destino',
          calle: destino.calle.trim(), distrito: destino.distrito, ciudad: destino.ciudad,
          latitud: destino.lat, longitud: destino.lng,
        }),
      ]);

      const pedido = await pedidosApi.crear({
        cliente: usuario,
        repartidor: repartidorId ? Number(repartidorId) : null,
        direccion_origen: dirOrigen.id,
        direccion_destino: dirDestino.id,
        descripcion: descripcion || undefined,
        peso_kg: pesoKg ? Number(pesoKg) : undefined,
        costo_envio: costoEnvio ? Number(costoEnvio) : undefined,
        fecha_estimada_entrega: fechaEstimada ? new Date(fechaEstimada).toISOString() : undefined,
      });

      navigate(`/pedidos/${pedido.id}`);
    } catch (err) {
      setError(
        mensajeDeError(err, 'No se pudo crear el pedido. Revisa los datos e inténtalo de nuevo.'),
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="pila">
      <PageHeader
        titulo="Nuevo pedido"
        subtitulo="Registra un envío: de quién es, qué lleva y entre qué dos direcciones va."
      />

      {error && <Aviso tono="error">{error}</Aviso>}

      <Card>
        <h2 style={{ marginBottom: 'var(--esp-4)' }}>Datos del envío</h2>
        <div className="rejilla">
          <Campo etiqueta="Cliente">
            <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)} required>
              <option value="">Selecciona un cliente…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre_completo} · {c.email}</option>
              ))}
            </Select>
          </Campo>

          <Campo etiqueta="Repartidor" ayuda="Opcional: puedes asignarlo más tarde.">
            <Select value={repartidorId} onChange={(e) => setRepartidorId(e.target.value)}>
              <option value="">Sin asignar</option>
              {repartidores.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre_completo}</option>
              ))}
            </Select>
          </Campo>

          <Campo etiqueta="Descripción">
            <Input value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                   placeholder="Paquete de documentos" />
          </Campo>

          <Campo etiqueta="Entrega estimada">
            <Input type="datetime-local" value={fechaEstimada}
                   onChange={(e) => setFechaEstimada(e.target.value)} />
          </Campo>

          <Campo etiqueta="Peso (kg)">
            <Input type="number" step="0.01" min="0" value={pesoKg}
                   onChange={(e) => setPesoKg(e.target.value)} />
          </Campo>

          <Campo etiqueta="Costo de envío">
            <Input type="number" step="0.01" min="0" value={costoEnvio}
                   onChange={(e) => setCostoEnvio(e.target.value)} />
          </Campo>
        </div>
      </Card>

      <Card>
        <h2 style={{ marginBottom: 'var(--esp-1)' }}>De dónde sale y a dónde va</h2>
        <p style={{ fontSize: 'var(--texto-sm)', color: 'var(--color-texto-suave)', marginBottom: 'var(--esp-5)' }}>
          Cada dirección se guarda con su texto y su punto en el mapa: el texto lo lee el
          repartidor, el punto es el que traza la ruta.
        </p>
        <div className="rejilla">
          <SelectorDireccion
            etiqueta="Dirección de origen"
            titulo="Marca el origen en el mapa"
            placeholder="Av. Javier Prado 123"
            onChange={setOrigen}
          />
          <SelectorDireccion
            etiqueta="Dirección de destino"
            titulo="Marca el destino en el mapa"
            placeholder="Av. Arequipa 456"
            color="var(--color-alerta)"
            onChange={setDestino}
          />
        </div>
      </Card>

      <div className="barra-acciones">
        <Boton type="button" variante="neutro" onClick={() => navigate('/pedidos')}>
          Cancelar
        </Boton>
        <Boton type="submit" disabled={!listo || guardando}>
          {guardando ? 'Creando…' : 'Crear pedido'}
        </Boton>
      </div>
    </form>
  );
}
