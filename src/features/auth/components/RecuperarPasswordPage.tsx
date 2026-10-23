import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/authApi';
import { mensajeDeError } from '../../../utils/errores';
import { Aviso, Boton, Campo, Input, InputClave } from '../../../components/ui';
import PanelHorario from '../../../components/PanelHorario';

type Paso = 'email' | 'codigo';

export default function RecuperarPasswordPage() {
  const navigate = useNavigate();

  const [paso, setPaso] = useState<Paso>('email');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [minutos, setMinutos] = useState(15);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const pedirCodigo = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      const res = await authApi.solicitarCodigo(email);
      setMinutos(res.expira_en_minutos);
      setAviso(res.detail);
      setPaso('codigo');
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo enviar el código. Inténtalo de nuevo.'));
    } finally {
      setCargando(false);
    }
  };

  const cambiarPassword = async (e: FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
      await authApi.confirmarCodigo({ email, codigo, password_nueva: password });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo cambiar la contraseña.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="acceso">
      <PanelHorario />

      <main className="acceso__panel">
        <div className="acceso__caja">
          <form
            onSubmit={paso === 'email' ? pedirCodigo : cambiarPassword}
            className="acceso__formulario"
          >
            <div>
              <h1 className="acceso__titulo">
                {paso === 'email' ? 'Recuperar contraseña' : 'Escribe el código'}
              </h1>
              <p className="page-header__subtitulo">
                {paso === 'email'
                  ? 'Te enviaremos un código de 6 dígitos a tu correo.'
                  : `Escribe el código que recibiste y tu nueva contraseña. Caduca en ${minutos} minutos.`}
              </p>
            </div>

            {paso === 'email' ? (
              <Campo etiqueta="Correo">
                <Input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  required
                  autoFocus
                />
              </Campo>
            ) : (
              <>
                <Campo etiqueta="Código de 6 dígitos">
                  <Input
                    name="codigo"
                    className="codigo"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    required
                    autoFocus
                  />
                </Campo>

                <Campo
                  etiqueta="Nueva contraseña"
                  ayuda="Mínimo 8 caracteres. No puede ser solo números ni una contraseña común."
                >
                  <InputClave
                    name="password_nueva"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </Campo>
              </>
            )}

            {aviso && paso === 'codigo' && !error && <Aviso tono="exito">{aviso}</Aviso>}
            {error && <Aviso tono="error">{error}</Aviso>}

            <Boton
              type="submit"
              disabled={cargando || (paso === 'codigo' && codigo.length !== 6)}
            >
              {cargando ? 'Enviando…' : paso === 'email' ? 'Enviar código' : 'Cambiar contraseña'}
            </Boton>

            {paso === 'codigo' && (
              <Boton
                type="button"
                variante="texto"
                onClick={() => {
                  setPaso('email');
                  setCodigo('');
                  setError(null);
                  setAviso(null);
                }}
              >
                Usar otro correo
              </Boton>
            )}

            <Link to="/login" className="acceso__enlace">
              Volver a iniciar sesión
            </Link>
          </form>
        </div>
      </main>
    </div>
  );
}
