import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../guards/PrivateRoute";

// LOGIN
import Login from "../pages/Login/Login";

// DASHBOARD
import Dashboard from "../pages/Dashboard/Dashboard";

// AJUSTES
import Ajustes from "../pages/Ajustes/Ajustes";

// CLIENTES
import ClientesHome from "../pages/clientes/ClientesHome";
import NuevoCliente from "../pages/clientes/NuevoCliente";
import EditarCliente from "../pages/clientes/EditarCliente";
import VerCliente from "../pages/clientes/VerCliente";

// CONTRATOS
import ContratosHome from "../pages/contratos/ContratosHome";
import CrearContrato from "../pages/contratos/CrearContrato";
import EditarContrato from "../pages/contratos/EditarContrato";
import VerContrato from "../pages/contratos/VerContrato";

// INSPECCIONES
import Inspecciones from "../pages/inspecciones/Inspecciones";
import Checklist from "../pages/inspecciones/Checklist";
import NuevaInspeccion from "../pages/inspecciones/NuevaInspeccion";
import EditarInspeccion from "../pages/inspecciones/EditarInspeccion";
import DetalleInspeccion from "../pages/inspecciones/DetalleInspeccion";
import Firma from "../pages/inspecciones/Firma";
import FotosInspeccion from "../pages/inspecciones/FotosInspeccion";
import VerPDF from "../pages/inspecciones/VerPDF";

// TÉCNICOS
import TecnicosHome from "../pages/tecnicos/TecnicosHome";
import TecnicosList from "../pages/tecnicos/TecnicosList";
import NuevoTecnico from "../pages/tecnicos/NuevoTecnico";
import EditarTecnico from "../pages/tecnicos/EditarTecnico";
import VerTecnico from "../pages/tecnicos/VerTecnico";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* REDIRECCIÓN INICIAL → LOGIN */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* AJUSTES */}
        <Route
          path="/ajustes"
          element={
            <PrivateRoute>
              <Ajustes />
            </PrivateRoute>
          }
        />

        {/* CLIENTES */}
        <Route
          path="/clientes"
          element={
            <PrivateRoute>
              <ClientesHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/clientes/nuevo"
          element={
            <PrivateRoute>
              <NuevoCliente />
            </PrivateRoute>
          }
        />
        <Route
          path="/clientes/:id/editar"
          element={
            <PrivateRoute>
              <EditarCliente />
            </PrivateRoute>
          }
        />
        <Route
          path="/clientes/:id"
          element={
            <PrivateRoute>
              <VerCliente />
            </PrivateRoute>
          }
        />

        {/* CONTRATOS */}
        <Route
          path="/contratos"
          element={
            <PrivateRoute>
              <ContratosHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/contratos/nuevo"
          element={
            <PrivateRoute>
              <CrearContrato />
            </PrivateRoute>
          }
        />
        <Route
          path="/contratos/:id/editar"
          element={
            <PrivateRoute>
              <EditarContrato />
            </PrivateRoute>
          }
        />
        <Route
          path="/contratos/:id"
          element={
            <PrivateRoute>
              <VerContrato />
            </PrivateRoute>
          }
        />

        {/* INSPECCIONES */}
        <Route
          path="/inspecciones"
          element={
            <PrivateRoute>
              <Inspecciones />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspecciones/checklist"
          element={
            <PrivateRoute>
              <Checklist />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspecciones/nueva"
          element={
            <PrivateRoute>
              <NuevaInspeccion />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspecciones/:id/editar"
          element={
            <PrivateRoute>
              <EditarInspeccion />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspecciones/:id"
          element={
            <PrivateRoute>
              <DetalleInspeccion />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspecciones/:id/firma"
          element={
            <PrivateRoute>
              <Firma />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspecciones/:id/fotos"
          element={
            <PrivateRoute>
              <FotosInspeccion />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspecciones/:id/pdf"
          element={
            <PrivateRoute>
              <VerPDF />
            </PrivateRoute>
          }
        />

        {/* TÉCNICOS */}
        <Route
          path="/tecnicos"
          element={
            <PrivateRoute>
              <TecnicosHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/tecnicos/lista"
          element={
            <PrivateRoute>
              <TecnicosList />
            </PrivateRoute>
          }
        />
        <Route
          path="/tecnicos/nuevo"
          element={
            <PrivateRoute>
              <NuevoTecnico />
            </PrivateRoute>
          }
        />
        <Route
          path="/tecnicos/:id/editar"
          element={
            <PrivateRoute>
              <EditarTecnico />
            </PrivateRoute>
          }
        />
        <Route
          path="/tecnicos/:id"
          element={
            <PrivateRoute>
              <VerTecnico />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
