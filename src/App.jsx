import { HashRouter, Routes, Route } from "react-router-dom";

// IMPORTS QUE YA TENÍAS
import Inicio from "./pages/inicio/Inicio";
import Clientes from "./pages/clientes/Clientes";
import Tecnicos from "./pages/tecnicos/Tecnicos";
import Viviendas from "./pages/viviendas/Viviendas";
import Inspecciones from "./pages/inspecciones/Inspecciones";
import Facturas from "./pages/facturas/Facturas";
import Ajustes from "./pages/ajustes/Ajustes";

// ⭐ IMPORT NUEVO (EXTRAS)
import Extras from "./pages/extras/Extras";

export default function App() {
  return (
    <HashRouter>
      <Routes>

        {/* RUTAS QUE YA TENÍAS */}
        <Route path="/" element={<Inicio />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/tecnicos" element={<Tecnicos />} />
        <Route path="/viviendas" element={<Viviendas />} />
        <Route path="/inspecciones" element={<Inspecciones />} />
        <Route path="/facturas" element={<Facturas />} />
        <Route path="/ajustes" element={<Ajustes />} />

        {/* ⭐ RUTA NUEVA EXACTA QUE ME PEDISTE */}
        <Route path="/extras" element={<Extras />} />

      </Routes>
    </HashRouter>
  );
}
