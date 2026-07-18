import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login/Login";
import Inicio from "./pages/inicio/Inicio";

import Contratos from "./pages/contratos/Contratos";
import CrearContrato from "./pages/contratos/CrearContrato";
import EditarContrato from "./pages/contratos/EditarContrato";
import VerContrato from "./pages/contratos/VerContrato";

import Clientes from "./pages/clientes/Clientes";
import CrearCliente from "./pages/clientes/CrearCliente";
import EditarCliente from "./pages/clientes/EditarCliente";
import VerCliente from "./pages/clientes/VerCliente";

import Viviendas from "./pages/viviendas/Viviendas";
import CrearVivienda from "./pages/viviendas/CrearVivienda";
import EditarVivienda from "./pages/viviendas/EditarVivienda";
import VerVivienda from "./pages/viviendas/VerVivienda";

import Tecnicos from "./pages/tecnicos/Tecnicos";
import CrearTecnico from "./pages/tecnicos/CrearTecnico";
import EditarTecnico from "./pages/tecnicos/EditarTecnico";
import VerTecnico from "./pages/tecnicos/VerTecnico";

import RequireAuth from "./components/auth/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN ES LA PANTALLA INICIAL */}
        <Route path="/" element={<Login />} />

        {/* RUTAS PRIVADAS */}
        <Route
          path="/inicio"
          element={
            <RequireAuth>
              <Inicio />
            </RequireAuth>
          }
        />

        {/* CONTRATOS */}
        <Route
          path="/contratos"
          element={
            <RequireAuth>
              <Contratos />
            </RequireAuth>
          }
        />
        <Route
          path="/contratos/crear"
          element={
            <RequireAuth>
              <CrearContrato />
            </RequireAuth>
          }
        />
        <Route
          path="/contratos/editar/:id"
          element={
            <RequireAuth>
              <EditarContrato />
            </RequireAuth>
          }
        />
        <Route
          path="/contratos/ver/:id"
          element={
            <RequireAuth>
              <VerContrato />
            </RequireAuth>
          }
        />

        {/* CLIENTES */}
        <Route
          path="/clientes"
          element={
            <RequireAuth>
              <Clientes />
            </RequireAuth>
          }
        />
        <Route
          path="/clientes/crear"
          element={
            <RequireAuth>
              <CrearCliente />
            </RequireAuth>
          }
        />
        <Route
          path="/clientes/editar/:id"
          element={
            <RequireAuth>
              <EditarCliente />
            </RequireAuth>
          }
        />
        <Route
          path="/clientes/ver/:id"
          element={
            <RequireAuth>
              <VerCliente />
            </RequireAuth>
          }
        />

        {/* VIVIENDAS */}
        <Route
          path="/viviendas"
          element={
            <RequireAuth>
              <Viviendas />
            </RequireAuth>
          }
        />
        <Route
          path="/viviendas/crear"
          element={
            <RequireAuth>
              <CrearVivienda />
            </RequireAuth>
          }
        />
        <Route
          path="/viviendas/editar/:id"
          element={
            <RequireAuth>
              <EditarVivienda />
            </RequireAuth>
          }
        />
        <Route
          path="/viviendas/ver/:id"
          element={
            <RequireAuth>
              <VerVivienda />
            </RequireAuth>
          }
        />

        {/* TECNICOS */}
        <Route
          path="/tecnicos"
          element={
            <RequireAuth>
              <Tecnicos />
            </RequireAuth>
          }
        />
        <Route
          path="/tecnicos/crear"
          element={
            <RequireAuth>
              <CrearTecnico />
            </RequireAuth>
          }
        />
        <Route
          path="/tecnicos/editar/:id"
          element={
            <RequireAuth>
              <EditarTecnico />
            </RequireAuth>
          }
        />
        <Route
          path="/tecnicos/ver/:id"
          element={
            <RequireAuth>
              <VerTecnico />
            </RequireAuth>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
