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

        {/* RUTAS PRIVADAS */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
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
          path="/clientes/editar/:id"
          element={
            <PrivateRoute>
              <EditarCliente />
            </PrivateRoute>
          }
        />
        <Route
          path="/clientes/ver/:id"
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
          path="/contratos/editar/:id"
          element={
            <PrivateRoute>
              <EditarContrato />
            </PrivateRoute>
          }
        />
        <Route
          path="/contratos/ver/:id"
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
          path="/inspecciones/checklist/:id"
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
          path="/inspecciones/editar/:id"
          element={
            <PrivateRoute>
              <EditarInspeccion />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspecciones/detalle/:id"
          element={
            <PrivateRoute>
              <DetalleInspeccion />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspecciones/firma/:id"
          element={
            <PrivateRoute>
              <Firma />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspecciones/fotos/:id"
          element={
            <PrivateRoute>
              <FotosInspeccion />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspecciones/pdf/:id"
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
          path="/tecnicos/editar/:id"
          element={
            <PrivateRoute>
              <EditarTecnico />
            </PrivateRoute>
          }
        />
        <Route
          path="/tecnicos/ver/:id"
          element={
            <PrivateRoute>
              <VerTecnico />
            </PrivateRoute>
          }
        />

        {/* REDIRECCIÓN */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
