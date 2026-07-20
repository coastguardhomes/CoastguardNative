import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// LOGIN
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";

// MENÚ ADMIN
import Menu from "./layouts/Menu.jsx";

// DASHBOARD CLIENTE
import ClienteDashboard from "./pages/cliente/ClienteDashboard.jsx";

// DASHBOARD TÉCNICO
import TecnicoDashboard from "./pages/tecnicos/TecnicoDashboard.jsx";

// CLIENTES
import Clientes from "./pages/clientes/Clientes.jsx";
import NuevoCliente from "./pages/clientes/NuevoCliente.jsx";
import EditarCliente from "./pages/clientes/EditarCliente.jsx";
import VerCliente from "./pages/clientes/VerCliente.jsx";

// VIVIENDAS
import Viviendas from "./pages/viviendas/Viviendas.jsx";
import CrearVivienda from "./pages/viviendas/CrearVivienda.jsx";
import EditarVivienda from "./pages/viviendas/EditarVivienda.jsx";
import VerVivienda from "./pages/viviendas/VerVivienda.jsx";

// TÉCNICOS
import Tecnicos from "./pages/tecnicos/Tecnicos.jsx";
import NuevoTecnico from "./pages/tecnicos/NuevoTecnico.jsx";
import EditarTecnico from "./pages/tecnicos/EditarTecnico.jsx";
import VerTecnico from "./pages/tecnicos/VerTecnico.jsx";

// CONTRATOS
import Contratos from "./pages/contratos/Contratos.jsx";
import CrearContrato from "./pages/contratos/CrearContrato.jsx";
import EditarContrato from "./pages/contratos/EditarContrato.jsx";
import VerContrato from "./pages/contratos/VerContrato.jsx";

// INSPECCIONES
import Inspecciones from "./pages/inspecciones/Inspecciones.jsx";
import NuevaInspeccion from "./pages/inspecciones/NuevaInspeccion.jsx";
import EditarInspeccion from "./pages/inspecciones/EditarInspeccion.jsx";
import VerInspeccion from "./pages/inspecciones/VerInspeccion.jsx";
import GaleriaInspeccion from "./pages/inspecciones/GaleriaInspeccion.jsx";

// FACTURAS
import Facturas from "./pages/facturas/Facturas.jsx";
import FacturasLista from "./pages/facturas/FacturasLista.jsx";
import CrearFactura from "./pages/facturas/CrearFactura.jsx";
import EditarFactura from "./pages/facturas/EditarFactura.jsx";
import VerFactura from "./pages/facturas/VerFactura.jsx";
import FiltrosFacturas from "./pages/facturas/FiltrosFacturas.jsx";
import EstadisticasFacturas from "./pages/facturas/EstadisticasFacturas.jsx";

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
  }, []);

  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
  }, []);

  return (
    <Router>
      <Routes>

        {/* LOGIN / REGISTER */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* RUTA PRINCIPAL ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />

        {/* RUTA PRINCIPAL CLIENTE */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ClienteDashboard />
            </ProtectedRoute>
          }
        />

        {/* RUTA PRINCIPAL TÉCNICO */}
        <Route
          path="/tecnico"
          element={
            <ProtectedRoute>
              <TecnicoDashboard />
            </ProtectedRoute>
          }
        />

        {/* CLIENTES */}
        <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
        <Route path="/clientes/nuevo" element={<ProtectedRoute><NuevoCliente /></ProtectedRoute>} />
        <Route path="/clientes/editar/:id" element={<ProtectedRoute><EditarCliente /></ProtectedRoute>} />
        <Route path="/clientes/ver/:id" element={<ProtectedRoute><VerCliente /></ProtectedRoute>} />

        {/* VIVIENDAS */}
        <Route path="/viviendas" element={<ProtectedRoute><Viviendas /></ProtectedRoute>} />
        <Route path="/viviendas/crear" element={<ProtectedRoute><CrearVivienda /></ProtectedRoute>} />
        <Route path="/viviendas/editar/:id" element={<ProtectedRoute><EditarVivienda /></ProtectedRoute>} />
        <Route path="/viviendas/ver/:id" element={<ProtectedRoute><VerVivienda /></ProtectedRoute>} />

        {/* TÉCNICOS */}
        <Route path="/tecnicos" element={<ProtectedRoute><Tecnicos /></ProtectedRoute>} />
        <Route path="/tecnicos/nuevo" element={<ProtectedRoute><NuevoTecnico /></ProtectedRoute>} />
        <Route path="/tecnicos/editar/:id" element={<ProtectedRoute><EditarTecnico /></ProtectedRoute>} />
        <Route path="/tecnicos/ver/:id" element={<ProtectedRoute><VerTecnico /></ProtectedRoute>} />

        {/* CONTRATOS */}
        <Route path="/contratos" element={<ProtectedRoute><Contratos /></ProtectedRoute>} />
        <Route path="/contratos/crear" element={<ProtectedRoute><CrearContrato /></ProtectedRoute>} />
        <Route path="/contratos/editar/:id" element={<ProtectedRoute><EditarContrato /></ProtectedRoute>} />
        <Route path="/contratos/ver/:id" element={<ProtectedRoute><VerContrato /></ProtectedRoute>} />

        {/* INSPECCIONES */}
        <Route path="/inspecciones" element={<ProtectedRoute><Inspecciones /></ProtectedRoute>} />
        <Route path="/inspecciones/nueva" element={<ProtectedRoute><NuevaInspeccion /></ProtectedRoute>} />
        <Route path="/inspecciones/editar/:id" element={<ProtectedRoute><EditarInspeccion /></ProtectedRoute>} />
        <Route path="/inspecciones/ver/:id" element={<ProtectedRoute><VerInspeccion /></ProtectedRoute>} />
        <Route path="/inspecciones/galeria/:id" element={<ProtectedRoute><GaleriaInspeccion /></ProtectedRoute>} />

        {/* FACTURAS */}
        <Route path="/facturas" element={<ProtectedRoute><Facturas /></ProtectedRoute>} />
        <Route path="/facturas/lista" element={<ProtectedRoute><FacturasLista /></ProtectedRoute>} />
        <Route path="/facturas/crear" element={<ProtectedRoute><CrearFactura /></ProtectedRoute>} />
        <Route path="/facturas/editar/:id" element={<ProtectedRoute><EditarFactura /></ProtectedRoute>} />
        <Route path="/facturas/ver/:id" element={<ProtectedRoute><VerFactura /></ProtectedRoute>} />
        <Route path="/facturas/filtros" element={<ProtectedRoute><FiltrosFacturas /></ProtectedRoute>} />
        <Route path="/facturas/estadisticas" element={<ProtectedRoute><EstadisticasFacturas /></ProtectedRoute>} />

        {/* CUALQUIER OTRA RUTA */}
        <Route
          path="*"
          element={<Navigate to={session ? "/dashboard" : "/login"} replace />}
        />

      </Routes>
    </Router>
  );
}
