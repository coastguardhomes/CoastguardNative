import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth
import Login from "../pages/Login/Login";
import ResetPassword from "../pages/auth/ResetPassword";
import UpdatePassword from "../pages/auth/UpdatePassword";

// Dashboard
import Dashboard from "../pages/Dashboard/Dashboard";

// Clientes
import ClientesHome from "../pages/clientes/ClientesHome";
import NuevoCliente from "../pages/clientes/NuevoCliente";
import EditarCliente from "../pages/clientes/EditarCliente";
import VerCliente from "../pages/clientes/VerCliente";

// Contratos
import ContratosHome from "../pages/contratos/ContratosHome";
import CrearContrato from "../pages/contratos/CrearContrato";
import EditarContrato from "../pages/contratos/EditarContrato";
import VerContrato from "../pages/contratos/VerContrato";

// Técnicos
import TecnicosHome from "../pages/tecnicos/TecnicosHome";
import TecnicosList from "../pages/tecnicos/TecnicosList";
import NuevoTecnico from "../pages/tecnicos/NuevoTecnico";
import EditarTecnico from "../pages/tecnicos/EditarTecnico";
import VerTecnico from "../pages/tecnicos/VerTecnico";

// Inspecciones
import Inspecciones from "../pages/inspecciones/Inspecciones";
import NuevaInspeccion from "../pages/inspecciones/NuevaInspeccion";
import EditarInspeccion from "../pages/inspecciones/EditarInspeccion";
import DetalleInspeccion from "../pages/inspecciones/DetalleInspeccion";
import FotosInspeccion from "../pages/inspecciones/FotosInspeccion";
import Checklist from "../pages/inspecciones/Checklist";
import Firma from "../pages/inspecciones/Firma";
import VerPDFInspeccion from "../pages/inspecciones/VerPDF";

// Ajustes
import Ajustes from "../pages/Ajustes/Ajustes";

// PDF general
import VerPDF from "../pages/pdf/VerPDF";

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>

        {/* Ruta inicial */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Clientes */}
        <Route path="/clientes" element={<ClientesHome />} />
        <Route path="/clientes/nuevo" element={<NuevoCliente />} />
        <Route path="/clientes/editar/:id" element={<EditarCliente />} />
        <Route path="/clientes/ver/:id" element={<VerCliente />} />

        {/* Contratos */}
        <Route path="/contratos" element={<ContratosHome />} />
        <Route path="/contratos/nuevo" element={<CrearContrato />} />
        <Route path="/contratos/editar/:id" element={<EditarContrato />} />
        <Route path="/contratos/ver/:id" element={<VerContrato />} />

        {/* Técnicos */}
        <Route path="/tecnicos" element={<TecnicosHome />} />
        <Route path="/tecnicos/lista" element={<TecnicosList />} />
        <Route path="/tecnicos/nuevo" element={<NuevoTecnico />} />
        <Route path="/tecnicos/editar/:id" element={<EditarTecnico />} />
        <Route path="/tecnicos/ver/:id" element={<VerTecnico />} />

        {/* Inspecciones */}
        <Route path="/inspecciones" element={<Inspecciones />} />
        <Route path="/inspecciones/nueva" element={<NuevaInspeccion />} />
        <Route path="/inspecciones/editar/:id" element={<EditarInspeccion />} />
        <Route path="/inspecciones/ver/:id" element={<DetalleInspeccion />} />
        <Route path="/inspecciones/fotos/:id" element={<FotosInspeccion />} />
        <Route path="/inspecciones/checklist/:id" element={<Checklist />} />
        <Route path="/inspecciones/firma/:id" element={<Firma />} />
        <Route path="/inspecciones/pdf/:id" element={<VerPDFInspeccion />} />

        {/* Ajustes */}
        <Route path="/ajustes" element={<Ajustes />} />

        {/* PDF general */}
        <Route path="/pdf" element={<VerPDF />} />

      </Routes>
    </HashRouter>
  );
}
