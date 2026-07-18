import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Inicio from "./pages/inicio/Inicio";

// CONTRATOS
import Contratos from "./pages/contratos/Contratos";
import CrearContrato from "./pages/contratos/CrearContrato";
import EditarContrato from "./pages/contratos/EditarContrato";
import VerContrato from "./pages/contratos/VerContrato";

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

// TECNICOS
import Tecnicos from "./pages/tecnicos/Tecnicos";
import CrearTecnico from "./pages/tecnicos/CrearTecnico";
import EditarTecnico from "./pages/tecnicos/EditarTecnico";
import VerTecnico from "./pages/tecnicos/VerTecnico";

// INSPECCIONES
import Inspecciones from "./pages/inspecciones/Inspecciones";
import CrearInspeccion from "./pages/inspecciones/CrearInspeccion";
import EditarInspeccion from "./pages/inspecciones/EditarInspeccion";
import VerInspeccion from "./pages/inspecciones/VerInspeccion";

// FACTURAS
import Facturas from "./pages/facturas/Facturas";
import CrearFactura from "./pages/facturas/CrearFactura";
import EditarFactura from "./pages/facturas/EditarFactura";
import VerFactura from "./pages/facturas/VerFactura";

// PROTECCIÓN DE RUTAS
import RequireAuth from "./components/src/components/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN ES LA PANTALLA INICIAL */}
        <Route path="/" element={<Login />} />

        {/* INICIO */}
        <Route
          path="/inicio"
          element={
            <RequireAuth>
              <Inicio />
            </RequireAuth>
          }
        />

        {/* CONTRATOS */}
        <Route path="/contratos" element={<RequireAuth><Contratos /></RequireAuth>} />
        <Route path="/contratos/crear" element={<RequireAuth><CrearContrato /></RequireAuth>} />
        <Route path="/contratos/editar/:id" element={<RequireAuth><EditarContrato /></RequireAuth>} />
        <Route path="/contratos/ver/:id" element={<RequireAuth><VerContrato /></RequireAuth>} />

        {/* CLIENTES */}
        <Route path="/clientes" element={<RequireAuth><Clientes /></RequireAuth>} />
        <Route path="/clientes/crear" element={<RequireAuth><CrearCliente /></RequireAuth>} />
        <Route path="/clientes/editar/:id" element={<RequireAuth><EditarCliente /></RequireAuth>} />
        <Route path="/clientes/ver/:id" element={<RequireAuth><VerCliente /></RequireAuth>} />

        {/* VIVIENDAS */}
        <Route path="/viviendas" element={<RequireAuth><Viviendas /></RequireAuth>} />
        <Route path="/viviendas/crear" element={<RequireAuth><CrearVivienda /></RequireAuth>} />
        <Route path="/viviendas/editar/:id" element={<RequireAuth><EditarVivienda /></RequireAuth>} />
        <Route path="/viviendas/ver/:id" element={<RequireAuth><VerVivienda /></RequireAuth>} />

        {/* TECNICOS */}
        <Route path="/tecnicos" element={<RequireAuth><Tecnicos /></RequireAuth>} />
        <Route path="/tecnicos/crear" element={<RequireAuth><CrearTecnico /></RequireAuth>} />
        <Route path="/tecnicos/editar/:id" element={<RequireAuth><EditarTecnico /></RequireAuth>} />
        <Route path="/tecnicos/ver/:id" element={<RequireAuth><VerTecnico /></RequireAuth>} />

        {/* INSPECCIONES */}
        <Route path="/inspecciones" element={<RequireAuth><Inspecciones /></RequireAuth>} />
        <Route path="/inspecciones/crear" element={<RequireAuth><CrearInspeccion /></RequireAuth>} />
        <Route path="/inspecciones/editar/:id" element={<RequireAuth><EditarInspeccion /></RequireAuth>} />
        <Route path="/inspecciones/ver/:id" element={<RequireAuth><VerInspeccion /></RequireAuth>} />

        {/* FACTURAS */}
        <Route path="/facturas" element={<RequireAuth><Facturas /></RequireAuth>} />
        <Route path="/facturas/crear" element={<RequireAuth><CrearFactura /></RequireAuth>} />
        <Route path="/facturas/editar/:id" element={<RequireAuth><EditarFactura /></RequireAuth>} />
        <Route path="/facturas/ver/:id" element={<RequireAuth><VerFactura /></RequireAuth>} />

      </Routes>
    </BrowserRouter>
  );
}
