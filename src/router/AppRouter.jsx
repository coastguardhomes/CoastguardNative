import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "../guards/PrivateRoute";
import LayoutWithMenu from "../layouts/LayoutWithMenu";

// Páginas (todas con carpeta y archivo en mayúscula)
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Clientes from "../pages/Clientes/Clientes.jsx";
import Tecnicos from "../pages/Tecnicos/Tecnicos.jsx";
import Inspecciones from "../pages/Inspecciones/Inspecciones.jsx";
import Login from "../pages/Login/Login.jsx";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN (pública) */}
        <Route path="/login" element={<Login />} />

        {/* RUTAS PRIVADAS */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <LayoutWithMenu />
            </PrivateRoute>
          }
        >
          {/* Rutas internas del layout */}
          <Route index element={<Dashboard />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="tecnicos" element={<Tecnicos />} />
          <Route path="inspecciones" element={<Inspecciones />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
