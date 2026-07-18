import { Navigate, Route, Routes } from "react-router-dom";

import Inicio from "./pages/inicio/Inicio";
import Clientes from "./pages/clientes/Clientes";
import Tecnicos from "./pages/tecnicos/Tecnicos";
import Viviendas from "./pages/viviendas/Viviendas";
import Inspecciones from "./pages/inspecciones/Inspecciones";
import Contratos from "./pages/contratos/Contratos";
import FacturasLista from "./pages/facturas/FacturasLista";
import FiltrosFacturas from "./pages/facturas/FiltrosFacturas";
import EstadisticasFacturas from "./pages/facturas/EstadisticasFacturas";
import VerFactura from "./pages/facturas/VerFactura";
import Ajustes from "./pages/Ajustes/Ajustes";
import Login from "./pages/Login/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import UpdatePassword from "./pages/auth/UpdatePassword";

import Extras from "./pages/extras/Extras";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />

      <Route path="/clientes" element={<Clientes />} />
      <Route path="/tecnicos" element={<Tecnicos />} />
      <Route path="/viviendas" element={<Viviendas />} />
      <Route path="/contratos" element={<Contratos />} />
      <Route path="/inspecciones" element={<Inspecciones />} />

      <Route path="/facturas" element={<FacturasLista />} />
      <Route path="/facturas/filtros" element={<FiltrosFacturas />} />
      <Route path="/facturas/estadisticas" element={<EstadisticasFacturas />} />
      <Route path="/facturas/ver/:id" element={<VerFactura />} />

      <Route path="/extras" element={<Extras />} />
      <Route path="/ajustes" element={<Ajustes />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
