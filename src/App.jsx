import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// LOGIN
import Login from "./pages/Login/Login.jsx";

// CLIENTE (carpeta correcta)
import ClienteLista from "./pages/cliente/ClienteLista.jsx";
import ClienteCrear from "./pages/cliente/ClienteCrear.jsx";
import ClienteEditar from "./pages/cliente/ClienteEditar.jsx";
import ClienteContratoVer from "./pages/cliente/ClienteContratoVer.jsx";
import ClienteContratosLista from "./pages/cliente/ClienteContratosLista.jsx";
import ClienteDashboard from "./pages/cliente/ClienteDashboard.jsx";
import ClienteFirmaDibujar from "./pages/cliente/ClienteFirmaDibujar.jsx";
import GenerarPDFContrato from "./pages/cliente/GenerarPDFContrato.jsx";
import VerPDFContrato from "./pages/cliente/VerPDFContrato.jsx";

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

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* CLIENTE */}
        <Route path="/clientes" element={<ProtectedRoute><ClienteLista /></ProtectedRoute>} />
        <Route path="/clientes/crear" element={<ProtectedRoute><ClienteCrear /></ProtectedRoute>} />
        <Route path="/clientes/editar/:id" element={<ProtectedRoute><ClienteEditar /></ProtectedRoute>} />
        <Route path="/clientes/ver/:id" element={<ProtectedRoute><ClienteContratoVer /></ProtectedRoute>} />

        <Route path="/clientes/contratos/:id" element={<ProtectedRoute><ClienteContratosLista /></ProtectedRoute>} />
        <Route path="/clientes/dashboard/:id" element={<ProtectedRoute><ClienteDashboard /></ProtectedRoute>} />
        <Route path="/clientes/firma/:id" element={<ProtectedRoute><ClienteFirmaDibujar /></ProtectedRoute>} />
        <Route path="/clientes/contrato/pdf/:id" element={<ProtectedRoute><GenerarPDFContrato /></ProtectedRoute>} />
        <Route path="/clientes/contrato/pdf/ver/:id" element={<ProtectedRoute><VerPDFContrato /></ProtectedRoute>} />

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
