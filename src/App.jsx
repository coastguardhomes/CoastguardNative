import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./guards/PrivateRoute.jsx";

// LOGIN / REGISTER
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";

// MENÚ ADMIN
import Menu from "./layouts/Menu.jsx";

// DASHBOARD CLIENTE
import ClienteDashboard from "./pages/cliente/ClienteDashboard.jsx";

// DASHBOARD TÉCNICO
import TecnicoDashboard from "./pages/tecnicos/TecnicoDashboard.jsx";

// DASHBOARD ADMIN (NUEVO)
import Dashboardadmin from "./pages/Dashboardadmin.jsx";

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

export default function App() {
  return (
    <Routes>

      {/* LOGIN / REGISTER */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ADMIN MENÚ */}
      <Route path="/menu" element={<PrivateRoute />}>
        <Route index element={<Menu />} />
      </Route>

      {/* ADMIN DASHBOARD (NUEVO) */}
      <Route path="/admin/dashboard" element={<PrivateRoute />}>
        <Route index element={<Dashboardadmin />} />
      </Route>

      {/* CLIENTE */}
      <Route path="/cliente" element={<PrivateRoute />}>
        <Route index element={<ClienteDashboard />} />
      </Route>

      {/* TÉCNICO */}
      <Route path="/tecnico" element={<PrivateRoute />}>
        <Route index element={<TecnicoDashboard />} />
      </Route>

      {/* CLIENTES */}
      <Route path="/clientes" element={<PrivateRoute />}>
        <Route index element={<Clientes />} />
      </Route>

      <Route path="/clientes/nuevo" element={<PrivateRoute />}>
        <Route index element={<NuevoCliente />} />
      </Route>

      <Route path="/clientes/editar/:id" element={<PrivateRoute />}>
        <Route index element={<EditarCliente />} />
      </Route>

      <Route path="/clientes/ver/:id" element={<PrivateRoute />}>
        <Route index element={<VerCliente />} />
      </Route>

      {/* VIVIENDAS */}
      <Route path="/viviendas" element={<PrivateRoute />}>
        <Route index element={<Viviendas />} />
      </Route>

      <Route path="/viviendas/crear" element={<PrivateRoute />}>
        <Route index element={<CrearVivienda />} />
      </Route>

      <Route path="/viviendas/editar/:id" element={<PrivateRoute />}>
        <Route index element={<EditarVivienda />} />
      </Route>

      <Route path="/viviendas/ver/:id" element={<PrivateRoute />}>
        <Route index element={<VerVivienda />} />
      </Route>

      {/* TÉCNICOS */}
      <Route path="/tecnicos" element={<PrivateRoute />}>
        <Route index element={<Tecnicos />} />
      </Route>

      <Route path="/tecnicos/nuevo" element={<PrivateRoute />}>
        <Route index element={<NuevoTecnico />} />
      </Route>

      <Route path="/tecnicos/editar/:id" element={<PrivateRoute />}>
        <Route index element={<EditarTecnico />} />
      </Route>

      <Route path="/tecnicos/ver/:id" element={<PrivateRoute />}>
        <Route index element={<VerTecnico />} />
      </Route>

      {/* CONTRATOS */}
      <Route path="/contratos" element={<PrivateRoute />}>
        <Route index element={<Contratos />} />
      </Route>

      <Route path="/contratos/crear" element={<PrivateRoute />}>
        <Route index element={<CrearContrato />} />
      </Route>

      <Route path="/contratos/editar/:id" element={<PrivateRoute />}>
        <Route index element={<EditarContrato />} />
      </Route>

      <Route path="/contratos/ver/:id" element={<PrivateRoute />}>
        <Route index element={<VerContrato />} />
      </Route>

      {/* INSPECCIONES */}
      <Route path="/inspecciones" element={<PrivateRoute />}>
        <Route index element={<Inspecciones />} />
      </Route>

      <Route path="/inspecciones/nueva" element={<PrivateRoute />}>
        <Route index element={<NuevaInspeccion />} />
      </Route>

      <Route path="/inspecciones/editar/:id" element={<PrivateRoute />}>
        <Route index element={<EditarInspeccion />} />
      </Route>

      <Route path="/inspecciones/ver/:id" element={<PrivateRoute />}>
        <Route index element={<VerInspeccion />} />
      </Route>

      <Route path="/inspecciones/galeria/:id" element={<PrivateRoute />}>
        <Route index element={<GaleriaInspeccion />} />
      </Route>

      {/* FACTURAS */}
      <Route path="/facturas" element={<PrivateRoute />}>
        <Route index element={<Facturas />} />
      </Route>

      <Route path="/facturas/lista" element={<PrivateRoute />}>
        <Route index element={<FacturasLista />} />
      </Route>

      <Route path="/facturas/crear" element={<PrivateRoute />}>
        <Route index element={<CrearFactura />} />
      </Route>

      <Route path="/facturas/editar/:id" element={<PrivateRoute />}>
        <Route index element={<EditarFactura />} />
      </Route>

      <Route path="/facturas/ver/:id" element={<PrivateRoute />}>
        <Route index element={<VerFactura />} />
      </Route>

      <Route path="/facturas/filtros" element={<PrivateRoute />}>
        <Route index element={<FiltrosFacturas />} />
      </Route>

      <Route path="/facturas/estadisticas" element={<PrivateRoute />}>
        <Route index element={<EstadisticasFacturas />} />
      </Route>

      {/* DEFAULT */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}
