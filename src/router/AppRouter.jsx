import { BrowserRouter, Routes, Route } from "react-router-dom";
import PrivateRoute from "../guards/PrivateRoute";
import LayoutWithMenu from "../layouts/LayoutWithMenu";

// Páginas
import Dashboard from "../pages/Dashboard/Dashboard.jsx";
import Clientes from "../pages/Clientes";
import Tecnicos from "../pages/Tecnicos";
import Inspecciones from "../pages/Inspecciones";
import Login from "../pages/Login";

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
