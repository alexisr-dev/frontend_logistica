import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { login } from '../authSlice';
import { Aviso, Boton, Campo, Input, InputClave } from '../../../components/ui';
import CiudadReparto from '../../../components/CiudadReparto';
import { IconoRuta } from '../../../components/Iconos';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { cargando, error } = useAppSelector((s) => s.auth);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await dispatch(login({ email, password }));
    if (login.fulfilled.match(res)) navigate('/');
  };

  return (
    <div className="acceso">
      <div className="acceso__escena">
        <CiudadReparto />
      </div>

      <div className="acceso__panel">
        <form onSubmit={onSubmit} className="acceso__caja">
        {/* Logomark propio en vez del emoji: junto al panel de cristal y la
            ruta de fondo, un camión de colores desentonaba con el resto de
            la escena. Reutiliza el mismo glifo que «Rutas» en el menú. */}
        <div className="acceso__encabezado">
          <span className="acceso__logo" aria-hidden>
            <IconoRuta width={20} height={20} />
          </span>
          <div>
            <h1 className="acceso__marca">Logística</h1>
            <p className="page-header__subtitulo">Panel de administración</p>
          </div>
        </div>

        <Campo etiqueta="Correo">
          <Input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@logistica.com"
            autoComplete="email"
            required
          />
        </Campo>

        <Campo etiqueta="Contraseña">
          <InputClave
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Campo>

        {error && <Aviso tono="error">{error}</Aviso>}

        <Boton type="submit" disabled={cargando}>
          {cargando ? 'Entrando…' : 'Entrar'}
        </Boton>

        <Link to="/recuperar" className="acceso__enlace">
          ¿Olvidaste tu contraseña?
        </Link>
        </form>
      </div>
    </div>
  );
}
