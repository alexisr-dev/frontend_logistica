import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { cargarUsuario } from '../features/auth/authSlice';
import AppRoutes from './routes';

export default function App() {
  const dispatch = useAppDispatch();
  const autenticado = useAppSelector((s) => s.auth.autenticado);

  useEffect(() => {
    if (autenticado) dispatch(cargarUsuario());
  }, [autenticado, dispatch]);

  return <AppRoutes />;
}
