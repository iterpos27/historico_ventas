import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout.jsx';
import { LoadingState } from '../components/LoadingState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { DashboardAdmin } from '../pages/DashboardAdmin.jsx';
import { DashboardAlmacen } from '../pages/DashboardAlmacen.jsx';
import { DashboardJefeComercial } from '../pages/DashboardJefeComercial.jsx';
import { Login } from '../pages/Login.jsx';

const DashboardByRole = ({ activeSection }) => {
  const { user } = useAuth();
  if (user.rol === 'admin') return <DashboardAdmin activeSection={activeSection} />;
  if (user.rol === 'jefe_comercial') return <DashboardJefeComercial activeSection={activeSection} />;
  return <DashboardAlmacen activeSection={activeSection} />;
};

const PrivateRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState label="Validando sesión" />;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <AppLayout>
      <DashboardByRole />
    </AppLayout>
  );
};

export const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<PrivateRoute />} />
    <Route path="/:section" element={<PrivateRoute />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);
