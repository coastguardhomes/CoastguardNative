
import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function VerVivienda() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vivienda, setVivienda] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState(false);

  const [cliente, setCliente] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);

  useEffect(() => {
    cargarVivienda();
  }, [id]);

  useEffect(() => {
    if (vivienda) cargarRelacionados();
  }, [vivienda]);

  async function cargarVivienda() {
    setCargando(true);
    setMensaje("");

    const { data, error } = await supabase
      .from("viviendas")
      .select("id, nombre, direccion, ciudad, codigo_postal, cliente_id")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      setMensaje(
        error?.message || "No se encontró la vivienda."
      );
      setCargando(false);
      return;
    }

    setVivienda(data);
    setCargando(false);
  }

  async function cargarRelacionados() {
    const [
      { data: clienteData, error: errorCliente },
      { data: contratosData, error: errorContratos },
      { data: inspeccionesData, error: errorInspecciones },
    ] = await Promise.all([
      supabase
        .from("clientes")
        .select("id, nombre, telefono, email")
        .eq("id", vivienda.cliente_id)
        .maybeSingle(),

      supabase
        .from("contratos")
        .select("*")
        .eq("vivienda_id", id),

      supabase
        .from("inspecciones")
        .select("id, fecha, estado, tecnico_id")
        .eq("vivienda_id", id),
    ]);

    const errores = [
      errorCliente,
      errorContratos,
      errorInspecciones,
    ].filter(Boolean);

    if (errores.length) {
      console.error("Error cargando datos de la vivienda:", errores);
      setMensaje(
        "No se pudieron cargar todos los datos relacionados. " +
          "Actualiza la página antes de realizar cambios."
      );
    }

    setCliente(clienteData || null);
    setContratos(contratosData || []);
    setInspecciones(inspeccionesData || []);
  }

  async function comprobarRegistros(tabla, columna, valor) {
    const { data, error } = await supabase
      .from(tabla)
      .select("id")
      .eq(columna, valor)
      .limit(1);

    if (error) {
      throw new Error(
        `No se pudo comprobar ${tabla}: ${error.message}`
      );
    }

    return (data || []).length > 0;
  }

  async function eliminarVivienda() {
    if (eliminando) return;

    const confirmar = window.confirm(
      "¿Quieres eliminar esta vivienda? " +
        "Si tiene contratos, inspecciones, facturas u otros registros vinculados, " +
        "el sistema cancelará el borrado para proteger esos datos."
    );

    if (!confirmar) return;

    setEliminando(true);
    setMensaje("");

    try {
      const tieneRegistros = [
        ["contratos", "vivienda_id"],
        ["inspecciones", "vivienda_id"],
        ["facturas", "vivienda_id"],
        ["extras", "vivienda_id"],
        ["incidencias", "vivienda_id"],
      ];

      for (const [tabla, columna] of tieneRegistros) {
        const existe = await comprobarRegistros(
          tabla,
          columna,
          id
        );

        if (existe) {
          throw new Error(
            "No se ha borrado la vivienda porque existen registros " +
              `vinculados en ${tabla}. Revisa primero esos datos.`
          );
        }
      }

      const { error } = await supabase
        .from("viviendas")
        .delete()
        .eq("id", id)
        .select("id");

      if (error) {
        throw new Error(
          `No se pudo eliminar la vivienda: ${error.message}`
        );
      }

      window.alert("Vivienda eliminada correctamente.");
      navigate("/viviendas");
    } catch (error) {
      console.error("Error al eliminar vivienda:", error);
      setMensaje(
        error?.message ||
          "No se pudo completar el borrado."
      );
    } finally {
      setEliminando(false);
    }
  }

  if (cargando) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
          }}
        >
          Cargando vivienda...
        </div>
      </Menu>
    );
  }

  if (!vivienda) {
    return (
      <Menu>
        <div
          style={{
            padding: "20px",
            background: "#0a0f1a",
            color: "#fff",
            minHeight: "100vh",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <h1 style={{ color: "#ff4d4d" }}>
            Vivienda no encontrada
          </h1>
          <p>{mensaje}</p>
          <button onClick={() => navigate("/viviendas")}>
            Volver a viviendas
          </button>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          {vivienda.nombre || "Vivienda"}
        </h1>

        {mensaje && (
          <p
            role="alert"
            style={{
              marginBottom: "15px",
              color: "#f87171",
              fontWeight: "600",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {mensaje}
          </p>
        )}

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            marginBottom: "25px",
          }}
        >
          <p>
            <strong style={{ color: "#4db8ff" }}>
              Dirección:
            </strong>{" "}
            {vivienda.direccion || "Sin dirección"}
          </p>
          <p>
            <strong style={{ color: "#4db8ff" }}>
              Ciudad:
            </strong>{" "}
            {vivienda.ciudad || "Sin ciudad"}
          </p>
          <p>
            <strong style={{ color: "#4db8ff" }}>
              Código postal:
            </strong>{" "}
            {vivienda.codigo_postal || "Sin código postal"}
          </p>
        </div>

        <Bloque titulo="Cliente propietario">
          {!cliente ? (
            <p style={{ opacity: 0.7 }}>
              No se encontró el cliente.
            </p>
          ) : (
            <Item
              to={`/clientes/${cliente.id}`}
              titulo={`${cliente.nombre || "Cliente"} — ${
                cliente.email || "Sin email"
              }`}
            />
          )}
        </Bloque>

        <Bloque titulo="Contratos asociados">
          {contratos.length === 0 ? (
            <p style={{ opacity: 0.7 }}>
              No hay contratos asociados.
            </p>
          ) : (
            contratos.map((c) => (
              <Item
                key={c.id}
                to={`/contratos/${c.id}`}
                titulo={`${c.modalidad || "Contrato"} — ${
                  c.precio ?? "Precio no disponible"
                }€`}
              />
            ))
          )}
        </Bloque>

        <Bloque titulo="Inspecciones realizadas">
          {inspecciones.length === 0 ? (
            <p style={{ opacity: 0.7 }}>
              No hay inspecciones.
            </p>
          ) : (
            inspecciones.map((i) => (
              <Item
                key={i.id}
                to={`/inspecciones/${i.id}`}
                titulo={`Inspección del ${
                  i.fecha || "fecha no disponible"
                } — Estado: ${i.estado || "Pendiente"}`}
              />
            ))
          )}
        </Bloque>

        <Link to={`/viviendas/editar/${id}`}>
          <button
            style={{
              marginBottom: "15px",
              padding: "14px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Editar vivienda
          </button>
        </Link>

        <button
          onClick={eliminarVivienda}
          disabled={eliminando}
          style={{
            marginTop: "10px",
            padding: "14px",
            width: "100%",
            background: eliminando ? "#7f1d1d" : "#ef4444",
            color: "#fff",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: eliminando ? "wait" : "pointer",
            opacity: eliminando ? 0.7 : 1,
            boxShadow: "0 0 10px rgba(255,0,0,0.4)",
          }}
        >
          {eliminando
            ? "Comprobando y eliminando..."
            : "Eliminar vivienda"}
        </button>
      </div>
    </Menu>
  );
}

function Bloque({ titulo, children }) {
  return (
    <div style={{ marginBottom: "25px" }}>
      <h2
        style={{
          fontSize: "18px",
          marginBottom: "10px",
          color: "#4db8ff",
        }}
      >
        {titulo}
      </h2>

      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          padding: "12px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Item({ to, titulo }) {
  return (
    <Link to={to} style={{ textDecoration: "none" }}>
      <div
        style={{
          padding: "10px",
          marginBottom: "8px",
          background: "rgba(255,255,255,0.06)",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#fff",
          cursor: "pointer",
          overflowWrap: "anywhere",
        }}
      >
        {titulo}
      </div>
    </Link>
  );
}
