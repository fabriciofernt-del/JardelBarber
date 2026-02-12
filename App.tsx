import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PublicBooking } from './pages/PublicBooking';
import { Settings } from './pages/Settings';
import { Professionals } from './pages/Professionals';
import { Appointments } from './pages/Appointments';
import { Services } from './pages/Services';
import { Revenue } from './pages/Revenue';
import { SocialLinks } from './pages/SocialLinks';

// Componente simples para proteger rotas administrativas
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isLoggedIn = localStorage.getItem("auth") === "true"; // mock de login
  return isLoggedIn ? <>{children}</> : <Navigate to="/" />;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        {/* Página pública (clientes) */}
        <Route path="/" element={<PublicBooking />} />

        {/* Rotas administrativas (protegidas) */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <Layout><Dashboard /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <RequireAuth>
              <Layout><Appointments /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/professionals"
          element={
            <RequireAuth>
              <Layout><Professionals /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/services"
          element={
            <RequireAuth>
              <Layout><Services /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/revenue"
          element={
            <RequireAuth>
              <Layout><Revenue /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/social"
          element={
            <RequireAuth>
              <Layout><SocialLinks /></Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RequireAuth>
              <Layout><Settings /></Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
