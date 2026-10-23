import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { IconoSalir, IconoMenu, IconoCerrar } from '../components/Iconos';
import { hora, useAhora } from '../utils/tiempo';

/**
 * El menú lista lugares, no acciones: «Nuevo pedido» y «Planificar ruta» son
 * acciones que ya tienen su propio botón dentro de esas pantallas.
 */
const enlaces = [
  { to: '/', label: 'Panel' },
  { to: '/pedidos', label: 'Pedidos' },
  { to: '/rutas', label: 'Rutas' },
  { to: '/reportes', label: 'Reportes' },
  { to: '/usuarios', label: 'Usuarios' },
];

export default function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const usuario = useAppSelector((s) => s.auth.usuario);
  const ahora = useAhora();

  const [abierto, setAbierto] = useState(false);
  const botonMenu = useRef<HTMLButtonElement>(null);

  // Navegar cierra el menú: si no, tapa la pantalla a la que acabas de ir.
  useEffect(() => setAbierto(false), [pathname]);

  useEffect(() => {
    if (!abierto) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false);
        botonMenu.current?.focus();
      }
    };
    document.addEventListener('keydown', alPulsar);
    return () => document.removeEventListener('keydown', alPulsar);
  }, [abierto]);

  const cerrarSesion = () => {
    dispatch(logout());
    navigate('/login');
  };

  const nombre = usuario?.nombre_completo ?? 'Admin';

  return (
    <div className="layout">
      <header className="barra">
        <button
          ref={botonMenu}
          type="button"
          className="barra__menu"
          aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
          aria-expanded={abierto}
          aria-controls="menu-principal"
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? <IconoCerrar width={24} height={24} /> : <IconoMenu width={24} height={24} />}
        </button>

        <NavLink to="/" className="barra__marca" aria-label="Logística, ir al panel">
          <span className="barra__logo" aria-hidden>
            L
          </span>
          Logística
        </NavLink>

        <nav
          id="menu-principal"
          className={`barra__nav${abierto ? ' barra__nav--abierto' : ''}`}
          aria-label="Secciones del panel"
        >
          {enlaces.map((e) => (
            <NavLink
              key={e.to}
              to={e.to}
              end={e.to === '/'}
              className={({ isActive }) =>
                `barra__enlace${isActive ? ' barra__enlace--activo' : ''}`
              }
            >
              {e.label}
            </NavLink>
          ))}

          <div className="barra__cuenta">
            <span className="barra__usuario">{nombre} · Administrador</span>
            <button type="button" onClick={cerrarSesion} className="barra__salir">
              <IconoSalir width={17} height={17} aria-hidden />
              Cerrar sesión
            </button>
          </div>
        </nav>

        <time className="barra__hora" dateTime={ahora.toISOString()}>
          {hora(ahora)}
        </time>
      </header>

      <main className="contenido">
        <div className="contenido__interior">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
