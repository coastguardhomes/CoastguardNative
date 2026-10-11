import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { supabase } from "./supabaseClient";

import PrivateRoute from "./guards/PrivateRoute.jsx";
import ClienteRoute from "./pages/cliente/ClienteRoute.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";

// LOGIN / REGISTER / RECUPERAR CONTRASEÑA / CALLBACK
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import UpdatePassword from "./pages/auth/UpdatePassword.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";

// POLÍTICA DE PRIVACIDAD
import PoliticaPrivacidad from "./pages/PoliticaPrivacidad.jsx";

// DASHBOARDS POR ROL
import ClienteDashboard from "./pages/cliente/ClienteDashboard.jsx";
import TecnicoDashboard from "./pages/tecnicos/TecnicoDashboard.jsx";
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

// PANTALLAS DEL TÉCNICO
import TecnicoInspeccion from "./pages/tecnicos/TecnicoInspeccion.jsx";
import TecnicoChecklist from "./pages/tecnicos/TecnicoChecklist.jsx";
import TecnicoFotos from "./pages/tecnicos/TecnicoFotos.jsx";
import TecnicoFinalizar from "./pages/tecnicos/TecnicoFinalizar.jsx";
import TecnicoInspeccionExtra from "./pages/tecnicos/TecnicoInspeccionExtra.jsx";

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
import DetalleInspeccion from "./pages/inspecciones/DetalleInspeccion.jsx";
import GaleriaInspeccion from "./pages/inspecciones/GaleriaInspeccion.jsx";
import FotosInspeccion from "./pages/inspecciones/FotosInspeccion.jsx";
import Firma from "./pages/inspecciones/Firma.jsx";
import VerPDFInspeccion from "./pages/inspecciones/VerPDFInspeccion.jsx";
import VerPDF from "./pages/inspecciones/VerPDF.jsx";
import FinalizarInspeccion from "./pages/inspecciones/FinalizarInspeccion.jsx";

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

// SERVICIOS
import Servicios from "./pages/servicios/Servicios.jsx";

// ÁREA DEL CLIENTE
import ClienteContratosLista from "./pages/cliente/ClienteContratosLista.jsx";
import ClienteContratoVer from "./pages/cliente/ClienteContratoVer.jsx";
import ClienteContratoExito from "./pages/cliente/ClienteContratoExito.jsx";
import VerPDFContrato from "./pages/cliente/VerPDFContrato.jsx";
import ClienteFirmaDibujar from "./pages/cliente/ClienteFirmaDibujar.jsx";
import PerfilCliente from "./pages/cliente/Perfilcliente.jsx";
import ClienteInspeccionesLista from "./pages/cliente/ClienteInspeccionesLista.jsx";
import ClienteInspeccionVer from "./pages/cliente/ClienteInspeccionVer.jsx";
import ClienteFacturasLista from "./pages/cliente/ClienteFacturasLista.jsx";
import ClienteFacturaVer from "./pages/cliente/ClienteFacturaVer.jsx";
import ClienteConfiguracion from "./pages/cliente/ClienteConfiguracion.jsx";

// AJUSTES / IDIOMA
import Ajustes from "./pages/Ajustes/Ajustes.jsx";
import Idioma from "./pages/Ajustes/Idioma.jsx";

export default function App() {
const navigate = useNavigate();

// Apertura de enlaces de la aplicación nativa.
useEffect(() => {
const listener = CapacitorApp.addListener("appUrlOpen", (event) => {
try {
const rawUrl = event.url || "";
const hashIndex = rawUrl.indexOf("#");
const hash = hashIndex !== -1 ? rawUrl.substring(hashIndex) : "";

    if (
      rawUrl.includes("type=recovery") ||
      rawUrl.includes("update-password")
    ) {
      navigate(`/update-password${hash}`);
    } else if (rawUrl.includes("auth/callback")) {
      navigate(`/auth/callback${hash}`);
    } else {
      navigate("/login");
    }
  } catch (error) {
    console.error("Error al procesar enlace directo:", error);
    navigate("/login");
  }
});

return () => {
  listener.then((handle) => handle.remove());
};

}, [navigate]);

// Vinculación de una cuenta autenticada con su ficha de cliente,
// únicamente si la ficha todavía no tiene usuario asociado.
useEffect(() => {
let cancelado = false;

const vincularClienteSiEsNecesario = async (user) => {
  if (!user?.id || !user?.email) return;

  try {
    const {
      data: { session },
      error: errorSesion,
    } = await supabase.auth.getSession();

    if (errorSesion || !session || cancelado) return;
    if (session.user.id !== user.id) return;

    const { data: clientesEncontrados, error: errorBusqueda } =
      await supabase
        .from("clientes")
        .select("id, usuario_id")
        .eq("email", user.email)
        .limit(1);

    if (errorBusqueda) {
      console.error(
        "Error al buscar cliente:",
        errorBusqueda.message
      );
      return;
    }

    const clienteExistente = clientesEncontrados?.[0] || null;

    if (!clienteExistente || clienteExistente.usuario_id || cancelado) {
      return;
    }

    const { error: errorVinculacion } = await supabase
      .from("clientes")
      .update({ usuario_id: user.id })
      .eq("id", clienteExistente.id)
      .is("usuario_id", null);

    if (errorVinculacion) {
      console.error(
        "Error al vincular cliente:",
        errorVinculacion.message
      );
      return;
    }

    console.log("Proceso de vinculación de cliente completado.");
  } catch (error) {
    console.error(
      "Error al intentar vincular el cliente:",
      error
    );
  }
};

supabase.auth.getSession().then(({ data, error }) => {
  if (!error && !cancelado && data?.session?.user) {
    vincularClienteSiEsNecesario(data.session.user);
  }
});

const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((event, session) => {
  if (event === "SIGNED_IN" && session?.user && !cancelado) {
    vincularClienteSiEsNecesario(session.user);
  }
});

return () => {
  cancelado = true;
  subscription?.unsubscribe();
};

}, []);

return (
<LanguageProvider>
<Routes>
{/* RUTAS PÚBLICAS */}
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/reset-password" element={<ResetPassword />} />
<Route path="/update-password" element={<UpdatePassword />} />
<Route path="/auth/callback" element={<AuthCallback />} />

    {/* POLÍTICA DE PRIVACIDAD: ACCESIBLE SIN INICIAR SESIÓN */}
    <Route
      path="/politica-privacidad"
      element={<PoliticaPrivacidad />}
    />

    {/* REDIRECCIÓN INICIAL */}
    <Route
      path="/"
      element={<Navigate to="/login" replace />}
    />

    {/* ADMINISTRACIÓN */}
    <Route
      path="/admin/dashboard"
      element={<PrivateRoute allowedRole="admin" />}
    >
      <Route index element={<Dashboardadmin />} />
    </Route>

    {/* TÉCNICO */}
    <Route
      path="/tecnico"
      element={<PrivateRoute allowedRole="tecnico" />}
    >
      <Route index element={<TecnicoDashboard />} />
      <Route
        path="inspeccion/:id"
        element={<TecnicoInspeccion />}
      />
      <Route
        path="inspeccion/:id/checklist"
        element={<TecnicoChecklist />}
      />
      <Route
        path="inspeccion/:id/fotos"
        element={<TecnicoFotos />}
      />
      <Route
        path="inspeccion/:id/finalizar"
        element={<TecnicoFinalizar />}
      />
      <Route
        path="extra/:id"
        element={<TecnicoInspeccionExtra />}
      />
    </Route>

    {/* ÁREA DEL CLIENTE */}
    <Route
      path="/cliente"
      element={
        <ClienteRoute>
          <PrivateRoute allowedRole="cliente" />
        </ClienteRoute>
      }
    >
      <Route index element={<ClienteDashboard />} />
      <Route
        path="contratos"
        element={<ClienteContratosLista />}
      />
      <Route
        path="contrato/:id"
        element={<ClienteContratoVer />}
      />
      <Route
        path="contrato/exito"
        element={<ClienteContratoExito />}
      />
      <Route
        path="contrato/:id/pdf"
        element={<VerPDFContrato />}
      />
      <Route
        path="firma/:id"
        element={<ClienteFirmaDibujar />}
      />
      <Route path="perfil" element={<PerfilCliente />} />
      <Route
        path="inspecciones"
        element={<ClienteInspeccionesLista />}
      />
      <Route
        path="inspeccion/:id"
        element={<ClienteInspeccionVer />}
      />
      <Route
        path="facturas"
        element={<ClienteFacturasLista />}
      />
      <Route
        path="factura/:id"
        element={<ClienteFacturaVer />}
      />
      <Route
        path="configuracion"
        element={<ClienteConfiguracion />}
      />
    </Route>

    {/* CLIENTES: SOLO ADMIN */}
    <Route
      path="/clientes"
      element={<PrivateRoute allowedRole="admin" />}
    >
      <Route index element={<Clientes />} />
      <Route path="nuevo" element={<NuevoCliente />} />
      <Route path="crear" element={<NuevoCliente />} />
      <Route
        path="editar/:id"
        element={<EditarCliente />}
      />
      <Route
        path="ver/:id"
        element={<VerCliente />}
      />
    </Route>

    {/* VIVIENDAS: SOLO ADMIN */}
    <Route
      path="/viviendas"
      element={<PrivateRoute allowedRole="admin" />}
    >
      <Route index element={<Viviendas />} />
      <Route path="crear" element={<CrearVivienda />} />
      <Route path="nueva" element={<CrearVivienda />} />
      <Route
        path="editar/:id"
        element={<EditarVivienda />}
      />
      <Route
        path="ver/:id"
        element={<VerVivienda />}
      />
    </Route>

    {/* GESTIÓN DE TÉCNICOS: SOLO ADMIN */}
    <Route
      path="/tecnicos"
      element={<PrivateRoute allowedRole="admin" />}
    >
      <Route index element={<Tecnicos />} />
      <Route path="nuevo" element={<NuevoTecnico />} />
      <Route path="crear" element={<NuevoTecnico />} />
      <Route
        path="editar/:id"
        element={<EditarTecnico />}
      />
      <Route
        path="ver/:id"
        element={<VerTecnico />}
      />
    </Route>

    {/* CONTRATOS: SOLO ADMIN */}
    <Route
      path="/contratos"
      element={<PrivateRoute allowedRole="admin" />}
    >
      <Route index element={<Contratos />} />
      <Route path="nuevo" element={<CrearContrato />} />
      <Route path="crear" element={<CrearContrato />} />
      <Route
        path="editar/:id"
        element={<EditarContrato />}
      />
      <Route
        path=":id/editar"
        element={<EditarContrato />}
      />
      <Route
        path="ver/:id"
        element={<VerContrato />}
      />
    </Route>

    {/* INSPECCIONES ADMINISTRATIVAS: SOLO ADMIN */}
    <Route
      path="/inspecciones"
      element={<PrivateRoute allowedRole="admin" />}
    >
      <Route index element={<Inspecciones />} />
      <Route path="nueva" element={<NuevaInspeccion />} />
      <Route
        path="editar/:id"
        element={<EditarInspeccion />}
      />
      <Route
        path="ver/:id"
        element={<VerInspeccion />}
      />
      <Route
        path="detalle/:id"
        element={<DetalleInspeccion />}
      />
      <Route
        path="galeria/:id"
        element={<GaleriaInspeccion />}
      />
      <Route
        path="fotos/:id"
        element={<FotosInspeccion />}
      />
      <Route path="firma/:id" element={<Firma />} />
      <Route
        path="pdf/:id"
        element={<VerPDFInspeccion />}
      />
      <Route path="pdf" element={<VerPDF />} />
      <Route
        path="finalizar/:id"
        element={<FinalizarInspeccion />}
      />
    </Route>

    {/* FACTURAS: SOLO ADMIN */}
    <Route
      path="/facturas"
      element={<PrivateRoute allowedRole="admin" />}
    >
      <Route index element={<Facturas />} />
      <Route path="lista" element={<FacturasLista />} />
      <Route path="crear" element={<CrearFactura />} />
      <Route
        path="editar/:id"
        element={<EditarFactura />}
      />
      <Route
        path="ver/:id"
        element={<VerFactura />}
      />
      <Route path="filtros" element={<FiltrosFacturas />} />
      <Route
        path="estadisticas"
        element={<EstadisticasFacturas />}
      />
    </Route>

    {/* EXTRAS: SOLO ADMIN */}
    <Route
      path="/extras"
      element={<PrivateRoute allowedRole="admin" />}
    >
      <Route index element={<Extras />} />
    </Route>

    {/* SERVICIOS: SOLO ADMIN */}
    <Route
      path="/servicios"
      element={<PrivateRoute allowedRole="admin" />}
    >
      <Route index element={<Servicios />} />
    </Route>

    {/* AJUSTES: ADMIN Y CLIENTE */}
    <Route
      path="/ajustes"
      element={<PrivateRoute allowedRole="admin,cliente" />}
    >
      <Route index element={<Ajustes />} />
    </Route>

    {/* IDIOMA: USUARIO AUTENTICADO */}
    <Route
      path="/idioma"
      element={<PrivateRoute />}
    >
      <Route index element={<Idioma />} />
    </Route>

    {/* RUTA DESCONOCIDA */}
    <Route
      path="*"
      element={<Navigate to="/login" replace />}
    />
  </Routes>
</LanguageProvider>

);
}
