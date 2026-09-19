import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './hooks';
import type { ReactNode } from 'react';

import AdminLayout from '../layouts/AdminLayout';
import LoginPage from '../features/auth/components/LoginPage';
import RecuperarPasswordPage from '../features/auth/components/RecuperarPasswordPage';
import AdminDashboard from '../features/dashboard/AdminDashboard';
import PedidoTablaAdmin from '../features/pedidos/components/PedidoTablaAdmin';
import PedidoDetalle from '../features/pedidos/components/PedidoDetalle';
import PedidoForm from '../features/pedidos/components/PedidoForm';
import RutasPage from '../features/rutas/components/RutasPage';
import PlanificarRutaForm from '../features/rutas/components/PlanificarRutaForm';
import GraficoEficiencia from '../features/reportes/components/GraficoEficiencia';
import UsuariosPage from '../features/usuarios/components/UsuariosPage';
import UsuarioForm from '../features/usuarios/components/UsuarioForm';

function RutaPrivada({ children }: { children: ReactNode }) {
  const autenticado = useAppSelector((s) => s.auth.autenticado);
  return autenticado ? <>{children}</> : <Navigate to="/login" replace />;
}

function RutaAdmin({ children }: { children: ReactNode }) {
  const usuario = useAppSelector((s) => s.auth.usuario);
  if (!usuario) return <p style={{ padding: '2rem' }}>Comprobando permisos…</p>;
  return usuario.rol === 'administrador' ? <>{children}</> : <Navigate to="/" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar" element={<RecuperarPasswordPage />} />
      <Route
        path="/"
        element={
          <RutaPrivada>
            <AdminLayout />
          </RutaPrivada>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="pedidos" element={<PedidoTablaAdmin />} />
        {/* Antes que ":id" para que "nuevo" no se interprete como identificador. */}
        <Route path="pedidos/nuevo" element={<PedidoForm />} />
        <Route path="pedidos/:id" element={<PedidoDetalle />} />
        <Route path="rutas" element={<RutasPage />} />
        <Route path="rutas/nueva" element={<PlanificarRutaForm />} />
        <Route path="reportes" element={<GraficoEficiencia variante="pagina" />} />
        <Route
          path="usuarios"
          element={
            <RutaAdmin>
              <UsuariosPage />
            </RutaAdmin>
          }
        />
        {/* Igual que en pedidos: "nuevo" antes que ":id". */}
        <Route
          path="usuarios/nuevo"
          element={
            <RutaAdmin>
              <UsuarioForm />
            </RutaAdmin>
          }
        />
        <Route
          path="usuarios/:id"
          element={
            <RutaAdmin>
              <UsuarioForm />
            </RutaAdmin>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
