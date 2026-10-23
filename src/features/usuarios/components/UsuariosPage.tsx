import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import { Aviso, Badge, Boton, Card, Input, PageHeader, Select } from '../../../components/ui';
import { Tabla, Fila, Celda } from '../../../components/Tabla';
import { EstadoCarga, EstadoVacio, EstadoError } from '../../../components/Estados';
import Paginacion from '../../../components/Paginacion';
import DialogoConfirmacion from '../../../components/DialogoConfirmacion';
import { mensajeDeError } from '../../../utils/errores';
import { usuariosApi } from '../services/usuariosApi';
import type { Usuario } from '../../../types';

const ROLES = [
  { valor: '', etiqueta: 'Todos los roles' },
  { valor: 'cliente', etiqueta: 'Clientes' },
  { valor: 'repartidor', etiqueta: 'Repartidores' },
  { valor: 'administrador', etiqueta: 'Administradores' },
];

const ESTADOS = [
  { valor: '', etiqueta: 'Activos e inactivos' },
  { valor: 'true', etiqueta: 'Solo activos' },
  { valor: 'false', etiqueta: 'Solo inactivos' },
];

const NOMBRE_ROL: Record<string, string> = {
  cliente: 'Cliente',
  repartidor: 'Repartidor',
  administrador: 'Administrador',
};

const TOKEN_ROL: Record<string, string> = {
  cliente: 'var(--color-rol-cliente)',
  repartidor: 'var(--color-rol-repartidor)',
  administrador: 'var(--color-rol-admin)',
};

const COLUMNAS = ['Nombre', 'Correo', 'Teléfono', 'Rol', 'Estado', ''];

export default function UsuariosPage() {
  const yo = useAppSelector((s) => s.auth.usuario);

  const [lista, setLista] = useState<Usuario[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [haySiguiente, setHaySiguiente] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [rol, setRol] = useState('');
  const [estado, setEstado] = useState('');

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Usuario | null>(null);

  const cargar = useCallback(
    async (filtros: { search: string; rol: string; activo: string; page: number }) => {
      setCargando(true);
      setError(null);
      try {
        const datos = await usuariosApi.listar(filtros);
        setLista(datos.results);
        setTotal(datos.count);
        setHaySiguiente(Boolean(datos.next));
      } catch (err) {
        setError(mensajeDeError(err, 'No se pudo cargar la lista de usuarios.'));
        setLista([]);
      } finally {
        setCargando(false);
      }
    },
    [],
  );

  useEffect(() => {
    const temporizador = setTimeout(() => {
      cargar({ search: busqueda, rol, activo: estado, page: pagina });
    }, 300);
    return () => clearTimeout(temporizador);
  }, [busqueda, rol, estado, pagina, cargar]);

  const cambiarFiltro = (aplicar: () => void) => {
    aplicar();
    setPagina(1);
  };

  const confirmarEliminar = async () => {
    if (!aEliminar) return;
    const usuario = aEliminar;
    setAEliminar(null);
    setError(null);
    setAviso(null);
    try {
      const respuesta = await usuariosApi.eliminar(usuario.id);
      setAviso(respuesta.detail);
      await cargar({ search: busqueda, rol, activo: estado, page: pagina });
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo eliminar el usuario.'));
    }
  };

  const hayFiltros = Boolean(busqueda || rol || estado);

  const limpiarFiltros = () =>
    cambiarFiltro(() => {
      setBusqueda('');
      setRol('');
      setEstado('');
    });

  return (
    <div className="pila">
      <PageHeader
        titulo="Usuarios"
        subtitulo={cargando || error ? undefined : `${total} cuentas registradas.`}
        acciones={
          <Link to="/usuarios/nuevo">
            <Boton type="button">Nuevo usuario</Boton>
          </Link>
        }
      />

      <Card>
        <div className="card__cabecera">
          <h2>Cuentas</h2>
          {!cargando && !error && <span className="card__nota">Página {pagina}</span>}
        </div>
        <div className="rejilla" style={{ marginBottom: 'var(--esp-4)' }}>
          <Input
            type="search"
            aria-label="Buscar usuarios"
            placeholder="Buscar por nombre, correo o teléfono…"
            value={busqueda}
            onChange={(e) => cambiarFiltro(() => setBusqueda(e.target.value))}
          />
          <Select
            aria-label="Filtrar por rol"
            value={rol}
            onChange={(e) => cambiarFiltro(() => setRol(e.target.value))}
          >
            {ROLES.map((o) => (
              <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
            ))}
          </Select>
          <Select
            aria-label="Filtrar por estado de la cuenta"
            value={estado}
            onChange={(e) => cambiarFiltro(() => setEstado(e.target.value))}
          >
            {ESTADOS.map((o) => (
              <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
            ))}
          </Select>
        </div>

        {aviso && <Aviso tono="exito">{aviso}</Aviso>}

        {cargando ? (
          <EstadoCarga filas={5} etiqueta="Cargando los usuarios…" />
        ) : error ? (
          <EstadoError
            titulo="No pudimos cargar los usuarios"
            detalle={error}
            onReintentar={() => cargar({ search: busqueda, rol, activo: estado, page: pagina })}
          />
        ) : lista.length === 0 ? (
          <EstadoVacio
            titulo={hayFiltros ? 'Ningún usuario coincide' : 'Todavía no hay usuarios'}
            detalle={
              hayFiltros
                ? 'Prueba con otro término de búsqueda o quita los filtros.'
                : 'Crea la primera cuenta para empezar a asignar pedidos y rutas.'
            }
            accion={
              hayFiltros ? (
                <Boton type="button" variante="neutro" onClick={limpiarFiltros}>
                  Quitar filtros
                </Boton>
              ) : (
                <Link to="/usuarios/nuevo">
                  <Boton type="button">Nuevo usuario</Boton>
                </Link>
              )
            }
          />
        ) : (
          <Tabla columnas={COLUMNAS} descripcion="Listado de usuarios con su rol y su estado">
            {lista.map((u) => (
              <Fila key={u.id} atenuada={!u.activo}>
                <Celda etiqueta="Nombre">
                  <Link to={`/usuarios/${u.id}`} className="enlace-fila">
                    {u.nombre_completo}
                  </Link>
                  {u.id === yo?.id && <span className="etiqueta etiqueta--tu">Tú</span>}
                </Celda>
                <Celda etiqueta="Correo">{u.email}</Celda>
                <Celda etiqueta="Teléfono">{u.telefono || '—'}</Celda>
                <Celda etiqueta="Rol">
                  <Badge color={TOKEN_ROL[u.rol] ?? 'var(--color-estado-neutro)'}>
                    {NOMBRE_ROL[u.rol] ?? u.rol}
                  </Badge>
                </Celda>
                <Celda etiqueta="Estado">
                  <Badge color={u.activo ? 'var(--color-exito)' : 'var(--color-alerta)'}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </Celda>
                <Celda etiqueta="Acciones" acciones>
                  <Link to={`/usuarios/${u.id}`} className="btn btn--texto">
                    Editar
                  </Link>
                  {/* Nadie puede borrarse a sí mismo: el backend responde 409,
                      así que el botón ni se ofrece. */}
                  {u.id !== yo?.id && (
                    <Boton
                      type="button"
                      variante="texto-peligro"
                      onClick={() => setAEliminar(u)}
                      aria-label={`Eliminar a ${u.nombre_completo}`}
                    >
                      Eliminar
                    </Boton>
                  )}
                </Celda>
              </Fila>
            ))}
          </Tabla>
        )}

        <Paginacion
          pagina={pagina}
          haySiguiente={haySiguiente}
          ocupado={cargando}
          onCambiar={setPagina}
        />
      </Card>

      {aEliminar && (
        <DialogoConfirmacion
          titulo={`¿Eliminar a ${aEliminar.nombre_completo}?`}
          detalle={`${aEliminar.email} · Si tiene pedidos o rutas asociadas no se borrará: se desactivará para conservar el historial.`}
          textoConfirmar="Eliminar usuario"
          onConfirmar={confirmarEliminar}
          onCancelar={() => setAEliminar(null)}
        />
      )}
    </div>
  );
}
