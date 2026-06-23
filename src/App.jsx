import { BrowserRouter, Routes, Route } from "react-router-dom";
import Menu from "./layouts/Menu";

// LOGIN
import Login from "./pages/Login/Login";

// INICIO
import Inicio from "./pages/inicio/Inicio";

// CONTRATOS
import Contratos from "./pages/contratos/Contratos";
import CrearContrato from "./pages/contratos/CrearContrato";
import EditarContrato from "./pages/contratos/EditarContrato";
import VerContrato from "./pages/contratos/VerContrato";

// TÉCNICOS
import Tecnicos from "./pages/tecnicos/Tecnicos";
import NuevoTecnico from "./pages/tecnicos/NuevoTecnico";
import EditarTecnico from "./pages/tecnicos/EditarTecnico";
import VerTecnico from "./pages/tecnicos/VerTecnico";

// CLIENTES
import Clientes from "./pages/clientes/Clientes";
import NuevoCliente from "./pages/clientes/NuevoCliente";
import EditarCliente from "./pages/clientes/EditarCliente";
import VerCliente from "./pages/clientes/VerCliente";

// VIVIENDAS
import Viviendas from "./pages/viviendas/Viviendas";

// INSPECCIONES
import Inspecciones from "./pages/inspecciones/Inspecciones";
import NuevaInspeccion from "./pages/inspecciones/NuevaInspeccion";
import EditarInspeccion from "./pages/inspecciones/EditarInspeccion";
import DetalleInspeccion from "./pages/inspecciones/DetalleInspeccion";
import VerPDFInspeccion from "./pages/inspecciones/VerPDFInspeccion";

// GALERÍA
import GaleriaInspeccion from "./pages/inspecciones/GaleriaInspeccion";

// AJUSTES
import Ajustes from "./pages/Ajustes/Ajustes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* INICIO */}
        <Route path="/" element={<Menu><Inicio /></Menu>} />

        {/* CONTRATOS */}
        <Route path="/contratos" element={<Menu><Contratos /></Menu>} />
        <Route path="/contratos/nuevo" element={<Menu><CrearContrato /></Menu>} />
        <Route path="/contratos/editar/:id" element={<Menu><EditarContrato /></Menu>} />
        <Route path="/contratos/ver/:id" element={<Menu><VerContrato /></Menu>} />

        {/* TÉCNICOS */}
        <Route path="/tecnicos" element={<Menu><Tecnicos /></Menu>} />
        <Route path="/tecnicos/nuevo" element={<Menu><NuevoTecnico /></Menu>} />
        <Route path="/tecnicos/editar/:id" element={<Menu><EditarTecnico /></Menu>} />
        <Route path="/tecnicos/ver/:id" element={<Menu><VerTecnico /></Menu>} />

        {/* CLIENTES */}
        <Route path="/clientes" element={<Menu><Clientes /></Menu>} />
        <Route path="/clientes/nuevo" element={<Menu><NuevoCliente /></Menu>} />
        <Route path="/clientes/editar/:id" element={<Menu><EditarCliente /></Menu>} />
        <Route path="/clientes/ver/:id" element={<Menu><VerCliente /></Menu>} />

        {/* VIVIENDAS */}
        <Route path="/viviendas" element={<Menu><Viviendas /></Menu>} />

        {/* INSPECCIONES */}
        <Route path="/inspecciones" element={<Menu><Inspecciones /></Menu>} />
        <Route path="/inspecciones/nueva" element={<Menu><NuevaInspeccion /></Menu>} />
        <Route path="/inspecciones/editar/:id" element={<Menu><EditarInspeccion /></Menu>} />
        <Route path="/inspecciones/ver/:id" element={<Menu><DetalleInspeccion /></Menu>} />
        <Route path="/inspecciones/pdf/:id" element={<Menu><VerPDFInspeccion /></Menu>} />

        {/* GALERÍA */}
        <Route path="/galeria" element={<Menu><GaleriaInspeccion /></Menu>} />

        {/* AJUSTES */}
        <Route path="/ajustes" element={<Menu><Ajustes /></Menu>} />

      </Routes>
    </BrowserRouter>
  );
}
