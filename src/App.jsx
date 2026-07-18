import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// AUTH (RUTAS REALES)
import Login from "./pages/Login/Login.jsx";
import ResetPassword from "./pages/Login/ResetPassword.jsx";
import UpdatePassword from "./pages/Login/UpdatePassword.jsx";

// CLIENTES
import Clientes from "./pages/clientes/Clientes";
import CrearCliente from "./pages/clientes/CrearCliente";
import EditarCliente from "./pages/clientes/EditarCliente";
import VerCliente from "./pages/clientes/VerCliente";

// VIVIENDAS
import Viviendas from "./pages/viviendas/Viviendas";
import CrearVivienda from "./pages/viviendas/CrearVivienda";
import EditarVivienda from "./pages/viviendas/EditarVivienda";
import VerVivienda from "./pages/viviendas/VerVivienda";

// TÉCNICOS
import Tecnicos from "./pages/tecnicos/Tecnicos";
import CrearTecnico from "./pages/tecnicos/CrearTecnico";
import EditarTecnico from "./pages/tecnicos/EditarTecnico";
import VerTecnico from "./pages/tecnicos/VerTecnico";

// CONTRATOS
import Contratos from "./pages/contratos/Contratos";
import CrearContrato from "./pages/contratos/CrearContrato";
import EditarContrato from "./pages/contratos/EditarContrato";
import VerContrato from "./pages/contratos/VerContrato";

// INSPECCIONES
import Inspecciones from "./pages/inspecciones/Inspecciones";
import CrearInspeccion from "./pages/inspecciones/CrearInspeccion";
import EditarInspeccion from "./pages/inspecciones/EditarInspeccion";
import VerInspeccion from "./pages/inspecciones/VerInspeccion";
import GaleriaInspeccion from "./pages/inspecciones/GaleriaInspeccion";

// FACTURAS
import Facturas from "./pages/facturas/Facturas";
import FacturasLista from "./pages/facturas/FacturasLista";
import CrearFactura from "./pages/facturas/CrearFactura";
import EditarFactura from "./pages/facturas/EditarFactura";
import VerFactura from "./pages/facturas/VerFactura";
import FiltrosFacturas from "./pages/facturas/FiltrosFacturas";
import EstadisticasFacturas from "./pages/facturas/EstadisticasFacturas";

// PROTECCIÓN
function ProtectedRoute({ children }) {
  const session = supabase.auth.getSession();
  if (!session.data.session) return <Navigate to="/login" replace />;
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

        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* CLIENTES */}
        <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
        <Route path="/clientes/crear" element={<ProtectedRoute><CrearCliente /></ProtectedRoute>} />
        <Route path="/clientes/editar/:id" element={<ProtectedRoute><EditarCliente /></ProtectedRoute>} />
        <Route path="/clientes/ver/:id" element={<ProtectedRoute><VerCliente /></ProtectedRoute>} />

        {/* VIVIENDAS */}
        <Route path="/viviendas" element={<ProtectedRoute><Viviendas /></ProtectedRoute>} />
        <Route path="/viviendas/crear" element={<ProtectedRoute><CrearVivienda /></ProtectedRoute>} />
        <Route path="/viviendas/editar/:id" element={<ProtectedRoute><EditarVivienda /></ProtectedRoute>} />
        <Route path="/viviendas/ver/:id" element={<ProtectedRoute><VerVivienda /></ProtectedRoute>} />

        {/* TÉCNICOS */}
        <Route path="/tecnicos" element={<ProtectedRoute><Tecnicos /></ProtectedRoute>} />
        <Route path="/tecnicos/crear" element={<ProtectedRoute><CrearTecnico /></ProtectedRoute>} />
        <Route path="/tecnicos/editar/:id" element={<ProtectedRoute><EditarTecnico /></ProtectedRoute>} />
        <Route path="/tecnicos/ver/:id" element={<ProtectedRoute><VerTecnico /></ProtectedRoute>} />

        {/* CONTRATOS */}
        <Route path="/contratos" element={<ProtectedRoute><Contratos /></ProtectedRoute>} />
        <Route path="/contratos/crear" element={<ProtectedRoute><CrearContrato /></ProtectedRoute>} />
        <Route path="/contratos/editar/:id" element={<ProtectedRoute><EditarContrato /></ProtectedRoute>} />

        {/* 🔥 RUTA DUPLICADA TAL CUAL GITHUB */}
        <Route path="/contratos/ver/:id" element={<ProtectedRoute><VerContrato /></ProtectedRoute>} />
        <Route path="/contratos/ver/:id" element={<ProtectedRoute><VerContrato /></ProtectedRoute>} />

        {/* INSPECCIONES */}
        <Route path="/inspecciones" element={<ProtectedRoute><Inspecciones /></ProtectedRoute>} />
        <Route path="/inspecciones/crear" element={<ProtectedRoute><CrearInspeccion /></ProtectedRoute>} />
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

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to={session ? "/clientes" : "/login"} replace />} />

      </Routes>
    </Router>
  );
}
