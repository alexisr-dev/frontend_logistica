import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { login } from '../authSlice';
import { Aviso, Boton, Campo, Input, InputClave } from '../../../components/ui';
import PanelHorario from '../../../components/PanelHorario';

/**
 * Cuenta que crea `seed_demo` en el backend (ver README). Se muestra para que
 * quien revise el proyecto entre sin buscar credenciales; con
 * `VITE_MOSTRAR_DEMO=false` el bloque desaparece del despliegue.
 */
const CUENTA_DEMO = { email: 'admin@logistica.com', password: 'admin1234' };
const MOSTRAR_DEMO = import.meta.env.VITE_MOSTRAR_DEMO !== 'false';

type CampoDemo = 'email' | 'password';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [copiado, setCopiado] = useState<CampoDemo | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { cargando, error } = useAppSelector((s) => s.auth);

  // El «Copiado» dura un instante y se apaga solo.
  useEffect(() => {
    if (!copiado) return;
    const id = window.setTimeout(() => setCopiado(null), 1600);
    return () => window.clearTimeout(id);
  }, [copiado]);

  const entrar = async (credenciales: { email: string; password: string }) => {
    const res = await dispatch(login(credenciales));
    if (login.fulfilled.match(res)) navigate('/');
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    entrar({ email, password });
  };

  const copiar = async (campo: CampoDemo) => {
    try {
      await navigator.clipboard.writeText(CUENTA_DEMO[campo]);
      setCopiado(campo);
    } catch {
      // Sin permiso de portapapeles: el valor sigue siendo seleccionable.
    }
  };

  return (
    <div className="acceso">
      <PanelHorario />

      <main className="acceso__panel">
        <div className="acceso__caja">
          <form onSubmit={onSubmit} className="acceso__formulario">
            <div>
              <h1 className="acceso__titulo">Entrar al panel</h1>
              <p className="page-header__subtitulo">Panel de administración de reparto.</p>
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

          {MOSTRAR_DEMO && (
            <aside className="demo" aria-label="Cuenta de demostración">
              <p className="demo__titulo">Cuenta de demostración</p>

              <ul className="demo__datos">
                <li className="demo__dato">
                  <span className="demo__etiqueta">Correo</span>
                  <span className="demo__valor">{CUENTA_DEMO.email}</span>
                  <button
                    type="button"
                    className="demo__copiar"
                    onClick={() => copiar('email')}
                    aria-label="Copiar el correo de demostración"
                  >
                    {copiado === 'email' ? 'Copiado' : 'Copiar'}
                  </button>
                </li>
                <li className="demo__dato">
                  <span className="demo__etiqueta">Contraseña</span>
                  <span className="demo__valor">{CUENTA_DEMO.password}</span>
                  <button
                    type="button"
                    className="demo__copiar"
                    onClick={() => copiar('password')}
                    aria-label="Copiar la contraseña de demostración"
                  >
                    {copiado === 'password' ? 'Copiado' : 'Copiar'}
                  </button>
                </li>
              </ul>

              <Boton
                type="button"
                variante="neutro"
                disabled={cargando}
                onClick={() => entrar(CUENTA_DEMO)}
              >
                Entrar con esta cuenta
              </Boton>

              <span className="solo-lectores" role="status">
                {copiado ? 'Copiado al portapapeles' : ''}
              </span>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
