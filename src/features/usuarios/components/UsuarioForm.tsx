import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Aviso, Boton, Campo, Card, Input, InputClave, PageHeader, Select } from '../../../components/ui';
import { EstadoCarga } from '../../../components/Estados';
import { mensajeDeError } from '../../../utils/errores';
import { usuariosApi } from '../services/usuariosApi';
import type { Rol, UsuarioActualizar, UsuarioNuevo } from '../../../types';

const ROLES: { valor: Rol; etiqueta: string }[] = [
  { valor: 'cliente', etiqueta: 'Cliente' },
  { valor: 'repartidor', etiqueta: 'Repartidor' },
  { valor: 'administrador', etiqueta: 'Administrador' },
];

export default function UsuarioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editando = Boolean(id);

  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState<Rol>('cliente');
  const [activo, setActivo] = useState(true);
  const [password, setPassword] = useState('');

  const [cargando, setCargando] = useState(editando);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setCargando(true);
    usuariosApi
      .obtener(Number(id))
      .then((u) => {
        setEmail(u.email);
        setNombre(u.nombre);
        setApellido(u.apellido);
        setTelefono(u.telefono ?? '');
        setRol(u.rol);
        setActivo(u.activo);
      })
      .catch((err) => setError(mensajeDeError(err, 'No se pudo cargar el usuario.')))
      .finally(() => setCargando(false));
  }, [id]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      if (editando) {
        const cambios: UsuarioActualizar = { email, nombre, apellido, telefono, rol, activo };
        if (password) cambios.password = password;
        await usuariosApi.actualizar(Number(id), cambios);
      } else {
        const nuevo: UsuarioNuevo = { email, password, nombre, apellido, telefono, rol, activo };
        await usuariosApi.crear(nuevo);
      }
      navigate('/usuarios');
    } catch (err) {
      setError(
        mensajeDeError(
          err,
          editando ? 'No se pudo guardar el usuario.' : 'No se pudo crear el usuario.',
        ),
      );
    } finally {
      setGuardando(false);
    }
  };

  const listo = email && nombre && apellido && (editando || password);

  const titulo = editando ? 'Editar usuario' : 'Nuevo usuario';

  if (cargando) {
    return (
      <div className="pila">
        <PageHeader titulo={titulo} />
        <Card>
          <EstadoCarga filas={6} etiqueta="Cargando el usuario…" />
        </Card>
      </div>
    );
  }

  return (
    <div className="pila">
      <div>
        <Link to="/usuarios" className="volver">
          ← Volver a usuarios
        </Link>
        <PageHeader
          titulo={titulo}
          subtitulo={
            editando
              ? 'Cambia los datos de la cuenta o su nivel de acceso.'
              : 'Crea una cuenta de cliente, repartidor o administrador.'
          }
        />
      </div>

      {error && <Aviso tono="error">{error}</Aviso>}

      <form onSubmit={onSubmit} className="pila">
        <div className="columnas columnas--formulario">
          <Card>
            <h2 style={{ marginBottom: 'var(--esp-4)' }}>Datos de la persona</h2>
            <div className="rejilla rejilla--2">
              <Campo etiqueta="Nombre">
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  autoComplete="given-name"
                  required
                />
              </Campo>
              <Campo etiqueta="Apellido">
                <Input
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  autoComplete="family-name"
                  required
                />
              </Campo>

              <Campo etiqueta="Correo">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </Campo>
              <Campo etiqueta="Teléfono">
                <Input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  autoComplete="tel"
                />
              </Campo>
            </div>
          </Card>

          <Card className="card--salidas">
            <h2 style={{ marginBottom: 'var(--esp-4)' }}>Acceso</h2>
            <div className="pila" style={{ gap: 'var(--esp-5)' }}>
              <Campo etiqueta="Rol" ayuda="Al elegir repartidor se le crea su perfil automáticamente.">
                <Select value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
                  {ROLES.map((o) => (
                    <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
                  ))}
                </Select>
              </Campo>

              <Campo
                etiqueta="Contraseña"
                ayuda={
                  editando
                    ? 'Déjala en blanco para no cambiarla.'
                    : 'Mínimo 8 caracteres. No puede ser solo números ni una clave común.'
                }
              >
                <InputClave
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required={!editando}
                />
              </Campo>

              <label className="interruptor">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                />
                <span className="interruptor__pista" aria-hidden />
                <span className="interruptor__texto">
                  <span className="campo__etiqueta">Cuenta activa</span>
                  <span className="campo__ayuda">Si se desactiva, no podrá iniciar sesión.</span>
                </span>
              </label>
            </div>
          </Card>
        </div>

        <div className="barra-acciones barra-acciones--fin">
          <Boton type="button" variante="neutro" onClick={() => navigate('/usuarios')}>
            Cancelar
          </Boton>
          <Boton type="submit" disabled={!listo || guardando}>
            {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear usuario'}
          </Boton>
        </div>
      </form>
    </div>
  );
}
