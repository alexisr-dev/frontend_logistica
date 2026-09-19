import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import {
  IconoPanel, IconoPaquete, IconoRuta, IconoReportes, IconoUsuarios,
  IconoSalir, IconoMenu, IconoCerrar,
} from '../components/Iconos';

/**
 * El menú lista lugares, no acciones: «Nuevo pedido» y «Planificar ruta» son
 * acciones que ya tienen su propio botón dentro de esas pantallas.
 */
const enlaces = [
  { to: '/', label: 'Dashboard', Icono: IconoPanel },
  { to: '/pedidos', label: 'Pedidos', Icono: IconoPaquete },
  { to: '/rutas', label: 'Rutas', Icono: IconoRuta },
  { to: '/reportes', label: 'Reportes', Icono: IconoReportes },
  { to: '/usuarios', label: 'Usuarios', Icono: IconoUsuarios },
];

function iniciales(nombre: string): string {
  const partes = nombre.trim().split(/\s+/);
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase();
}

export default function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const usuario = useAppSelector((s) => s.auth.usuario);

  const [abierto, setAbierto] = useState(false);
  const botonMenu = useRef<HTMLButtonElement>(null);

  // Navegar cierra el cajón: si no, tapa la pantalla a la que acabas de ir.
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
      <header className="barra-movil">
        <button
          ref={botonMenu}
          type="button"
          className="barra-movil__boton"
          aria-label={abierto ? 'Cerrar el menú' : 'Abrir el menú'}
          aria-expanded={abierto}
          aria-controls="menu-principal"
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? <IconoCerrar width={22} height={22} /> : <IconoMenu width={22} height={22} />}
        </button>
        <span style={{ fontWeight: 'var(--peso-medio)' }}>Logística</span>
      </header>

      <aside id="menu-principal" className={`menu${abierto ? ' menu--abierto' : ''}`}>
        <div className="menu__marca">
          <span aria-hidden>🚚</span>
          <div className="menu__etiqueta">
            <span className="menu__marca-titulo">Logística</span>
            <span className="menu__marca-sub">Panel de administración</span>
          </div>
        </div>

        {/* La línea que conecta cada parada es el mismo lenguaje visual que
            TiraRecorrido usa para el orden de visita de una ruta: aquí las
            «paradas» son las secciones del panel. */}
        <nav className="menu__nav" aria-label="Secciones del panel">
          {enlaces.map((e) => (
            <NavLink
              key={e.to}
              to={e.to}
              end={e.to === '/'}
              aria-label={e.label}
              className={({ isActive }) =>
                `menu__enlace${isActive ? ' menu__enlace--activo' : ''}`
              }
            >
              <span className="menu__parada" aria-hidden>
                <e.Icono width={18} height={18} />
              </span>
              <span className="menu__etiqueta">{e.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="menu__pie">
          <div className="menu__cuenta">
            <span className="menu__avatar" aria-hidden>{iniciales(nombre)}</span>
            <div className="menu__etiqueta">
              <span className="menu__cuenta-nombre">{nombre}</span>
              <span className="menu__cuenta-rol">Administrador</span>
            </div>
          </div>
          <button
            type="button"
            onClick={cerrarSesion}
            className="menu__salir"
            aria-label="Cerrar sesión"
          >
            <IconoSalir width={17} height={17} />
            <span className="menu__etiqueta">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {abierto && (
        <div className="velo velo--visible" onClick={() => setAbierto(false)} aria-hidden />
      )}

      <main className="contenido">
        <div className="contenido__interior">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
