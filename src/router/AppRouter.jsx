import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../guards/PrivateRoute";
import PrivateLayout from "../components/PrivateLayout";

// Login
import Login from "../pages/Login/Login";

// Dashboard
import Dashboard from "../pages/Dashboard/Dashboard";

// Ajustes
import Ajustes from "../pages/Ajustes/Ajustes";

// Clientes
import Clientes from "../pages/clientes/Clientes";
import ClientesHome from "../pages/clientes/ClientesHome";
import NuevoCliente from "../pages/clientes/NuevoCliente";
import EditarCliente from "../pages/clientes/EditarCliente";
import VerCliente from "../pages/clientes/VerCliente";

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
import Firma from "../pages/inspecciones/Firma";
import Checklist from "../pages/inspecciones/Checklist";
import VerPDFInspeccion from "../pages/inspecciones/VerPDF";

// Contratos
import ContratosHome from "../pages/contratos/ContratosHome";
import CrearContrato from "../pages/contratos/CrearContrato";
import EditarContrato from "../pages/contratos/EditarContrato";
import VerContrato from "../pages/contratos/VerContrato";

// PDF general
import VerPDF from "../pages/pdf/VerPDF";

// Auth
import ResetPassword from "../pages/auth/ResetPassword";
import UpdatePassword from "../pages/auth/UpdatePassword";

export default function AppRouter() {
  return (
    <Routes>

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Reset / Update password */}
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />

      {/* Rutas privadas */}
      <Route element={<PrivateRoute><PrivateLayout /></PrivateRoute>}>

        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Ajustes */}
        <Route path="/ajustes" element={<Ajustes />} />

        {/* Clientes */}
        <Route path="/clientes" element={<ClientesHome />} />
        <Route path="/clientes/lista" element={<Clientes />} />
        <Route path="/clientes/nuevo" element={<NuevoCliente />} />
        <Route path="/clientes/editar/:id" element={<EditarCliente />} />
        <Route path="/clientes/ver/:id" element={<VerCliente />} />

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
        <Route path="/inspecciones/firma/:id" element={<Firma />} />
        <Route path="/inspecciones/checklist/:id" element={<Checklist />} />
        <Route path="/inspecciones/pdf/:id" element={<VerPDFInspeccion />} />

        {/* Contratos */}
        <Route path="/contratos" element={<ContratosHome />} />
        <Route path="/contratos/nuevo" element={<CrearContrato />} />
        <Route path="/contratos/editar/:id" element={<EditarContrato />} />
        <Route path="/contratos/ver/:id" element={<VerContrato />} />

        {/* PDF general */}
        <Route path="/pdf/:id" element={<VerPDF />} />

      </Route>

      {/* Cualquier ruta desconocida */}
      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}
