import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./guards/PrivateRoute.jsx";

// LOGIN / REGISTER / RECUPERAR CONTRASEÑA
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import UpdatePassword from "./pages/auth/UpdatePassword.jsx";

// INICIO / DASHBOARDS
import Inicio from "./pages/inicio/Inicio.jsx";
import Dashboardadmin from "./pages/Dashboardadmin.jsx";
import ClienteDashboard from "./pages/cliente/ClienteDashboard.jsx";
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

// INSPECCIONES (los 11 pasos del módulo)
import Inspecciones from "./pages/inspecciones/Inspecciones.jsx";
import NuevaInspeccion from "./pages/inspecciones/NuevaInspeccion.jsx";
import EditarInspeccion from "./pages/inspecciones/EditarInspeccion.jsx";
import VerInspeccion from "./pages/inspecciones/VerInspeccion.jsx";
import DetalleInspeccion from "./pages/inspecciones/DetalleInspeccion.jsx";
import GaleriaInspeccion from "./pages/inspecciones/GaleriaInspeccion.jsx";
import FotosInspeccion from "./pages/inspecciones/FotosInspeccion.jsx";
import Checklist from "./pages/inspecciones/Checklist.jsx";
import Firma from "./pages/inspecciones/Firma.jsx";
import VerPDFInspeccion from "./pages/inspecciones/VerPDFInspeccion.jsx";
import VerPDF from "./pages/inspecciones/VerPDF.jsx";

// FACTURAS
import Facturas from "./pages/facturas/Facturas.jsx";
import FacturasLista from "./pages/facturas/FacturasLista.jsx";
import CrearFactura from "./pages/facturas/CrearFactura.jsx";
import EditarFactura from "./pages/facturas/EditarFactura.jsx";
import VerFactura from "./pages/facturas/VerFactura.jsx";
import FiltrosFacturas from "./pages/facturas/FiltrosFacturas.jsx";
import EstadisticasFacturas from "./pages/facturas/EstadisticasFacturas.jsx";

// EXTRAS
import Extras from "./pages/extras/Extras.jsx";

// ÁREA DEL CLIENTE (contratos, firma y PDF)
import ClienteContratosLista from "./pages/cliente/ClienteContratosLista.jsx";
import ClienteContratoVer from "./pages/cliente/ClienteContratoVer.jsx";
import ClienteFirmaDibujar from "./pages/cliente/ClienteFirmaDibujar.jsx";
import VerPDFContrato from "./pages/cliente/VerPDFContrato.jsx";

// AJUSTES / IDIOMA
import Ajustes from "./pages/Ajustes/Ajustes.jsx";
import Idioma from "./pages/idioma/Idioma.jsx";

/**
 * Tabla de rutas de la aplicación.
 *
 * Todas las pantallas de /src/pages tienen aquí su ruta. Antes faltaban 17
 * (los pasos de inspección, los PDF de contrato, ajustes, idioma, extras,
 * recuperación de contraseña e incluso el propio Inicio), así que existían en
 * el repositorio pero no había forma de llegar a ellas dentro del APK.
 *
 * Se conservan además algunos alias porque hay pantallas que ya navegaban a
 * rutas que no existían: /clientes/crear, /tecnicos/crear, /contratos/:id/editar
 * y /home. Ir a esas direcciones caía en el comodín "*" y devolvía al login.
 */
export default function App() {
  return (
    <Routes>
      {/* ---------------- PÚBLICO ---------------- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />

      {/* ---------------- INICIO / DASHBOARDS ---------------- */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/inicio" element={<PrivateRoute />}>
        <Route index element={<Inicio />} />
      </Route>

      {/* /menu y /home apuntaban al layout vacío o a ninguna ruta */}
      <Route path="/menu" element={<Navigate to="/inicio" replace />} />
      <Route path="/home" element={<Navigate to="/inicio" replace />} />

      <Route path="/admin/dashboard" element={<PrivateRoute />}>
        <Route index element={<Dashboardadmin />} />
      </Route>

      <Route path="/tecnico" element={<PrivateRoute />}>
        <Route index element={<TecnicoDashboard />} />
      </Route>

      {/* ---------------- ÁREA DEL CLIENTE ---------------- */}
      <Route path="/cliente" element={<PrivateRoute />}>
        <Route index element={<ClienteDashboard />} />
        <Route path="contratos" element={<ClienteContratosLista />} />
        <Route path="contrato/:id" element={<ClienteContratoVer />} />
        <Route path="contrato/:id/pdf" element={<VerPDFContrato />} />
        <Route path="firma/:id" element={<ClienteFirmaDibujar />} />
      </Route>

      {/* ---------------- CLIENTES ---------------- */}
      <Route path="/clientes" element={<PrivateRoute />}>
        <Route index element={<Clientes />} />
        <Route path="nuevo" element={<NuevoCliente />} />
        {/* alias: Clientes.jsx enlaza a /clientes/crear */}
        <Route path="crear" element={<NuevoCliente />} />
        <Route path="editar/:id" element={<EditarCliente />} />
        <Route path="ver/:id" element={<VerCliente />} />
      </Route>

      {/* ---------------- VIVIENDAS ---------------- */}
      <Route path="/viviendas" element={<PrivateRoute />}>
        <Route index element={<Viviendas />} />
        <Route path="crear" element={<CrearVivienda />} />
        <Route path="nueva" element={<CrearVivienda />} />
        <Route path="editar/:id" element={<EditarVivienda />} />
        <Route path="ver/:id" element={<VerVivienda />} />
      </Route>

      {/* ---------------- TÉCNICOS ---------------- */}
      <Route path="/tecnicos" element={<PrivateRoute />}>
        <Route index element={<Tecnicos />} />
        <Route path="nuevo" element={<NuevoTecnico />} />
        {/* alias: Tecnicos.jsx enlaza a /tecnicos/crear */}
        <Route path="crear" element={<NuevoTecnico />} />
        <Route path="editar/:id" element={<EditarTecnico />} />
        <Route path="ver/:id" element={<VerTecnico />} />
      </Route>

      {/* ---------------- CONTRATOS ---------------- */}
      <Route path="/contratos" element={<PrivateRoute />}>
        <Route index element={<Contratos />} />
        <Route path="crear" element={<CrearContrato />} />
        <Route path="editar/:id" element={<EditarContrato />} />
        {/* alias: ClienteContratoVer.jsx navega a /contratos/:id/editar */}
        <Route path=":id/editar" element={<EditarContrato />} />
        <Route path="ver/:id" element={<VerContrato />} />
      </Route>

      {/* ---------------- INSPECCIONES ---------------- */}
      <Route path="/inspecciones" element={<PrivateRoute />}>
        <Route index element={<Inspecciones />} />
        <Route path="nueva" element={<NuevaInspeccion />} />
        <Route path="editar/:id" element={<EditarInspeccion />} />
        <Route path="ver/:id" element={<VerInspeccion />} />
        <Route path="detalle/:id" element={<DetalleInspeccion />} />
        <Route path="galeria/:id" element={<GaleriaInspeccion />} />
        <Route path="fotos/:id" element={<FotosInspeccion />} />
        <Route path="checklist/:id" element={<Checklist />} />
        <Route path="firma/:id" element={<Firma />} />
        <Route path="pdf/:id" element={<VerPDFInspeccion />} />
        {/* sin id: muestra el último PDF generado */}
        <Route path="pdf" element={<VerPDF />} />
      </Route>

      {/* ---------------- FACTURAS ---------------- */}
      <Route path="/facturas" element={<PrivateRoute />}>
        <Route index element={<Facturas />} />
        <Route path="lista" element={<FacturasLista />} />
        <Route path="crear" element={<CrearFactura />} />
        <Route path="editar/:id" element={<EditarFactura />} />
        <Route path="ver/:id" element={<VerFactura />} />
        <Route path="filtros" element={<FiltrosFacturas />} />
        <Route path="estadisticas" element={<EstadisticasFacturas />} />
      </Route>

      {/* ---------------- EXTRAS ---------------- */}
      <Route path="/extras" element={<PrivateRoute />}>
        <Route index element={<Extras />} />
      </Route>

      {/* ---------------- AJUSTES / IDIOMA ---------------- */}
      <Route path="/ajustes" element={<PrivateRoute />}>
        <Route index element={<Ajustes />} />
      </Route>

      <Route path="/idioma" element={<PrivateRoute />}>
        <Route index element={<Idioma />} />
      </Route>

      {/* ---------------- DEFAULT ---------------- */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
