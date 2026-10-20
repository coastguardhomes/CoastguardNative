
import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function VerCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [eliminando, setEliminando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [viviendas, setViviendas] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [inspecciones, setInspecciones] = useState([]);
  const [facturas, setFacturas] = useState([]);

  useEffect(() => {
    cargarCliente();
  }, [id]);

  useEffect(() => {
    if (cliente) cargarRelacionados();
  }, [cliente]);

  async function cargarCliente() {
    setCargando(true);
    setMensaje("");

    const { data, error } = await supabase
      .from("clientes")
      .select("id, nombre, telefono, email, direccion")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      setMensaje(
        error?.message ||
          "Cliente no encontrado o ha sido eliminado."
      );
      setCargando(false);
      return;
    }

    setCliente(data);
    setCargando(false);
  }

  async function cargarRelacionados() {
    const [
      { data: viv, error: errorViviendas },
      { data: cont, error: errorContratos },
      { data: insp, error: errorInspecciones },
      { data: fac, error: errorFacturas },
    ] = await Promise.all([
      supabase
        .from("viviendas")
        .select("*")
        .eq("cliente_id", id),

      supabase
        .from("contratos")
        .select("*")
        .eq("cliente_id", id),

      supabase
        .from("inspecciones")
        .select("id, fecha, estado, vivienda_id, tecnico_id")
        .eq("cliente_id", id),

      supabase
        .from("facturas")
        .select("*")
        .eq("cliente_id", id),
    ]);

    const errores = [
      errorViviendas,
      errorContratos,
      errorInspecciones,
      errorFacturas,
    ].filter(Boolean);

    if (errores.length) {
      console.error(
        "Error cargando los datos relacionados del cliente:",
        errores
      );
      setMensaje(
        "No se pudieron cargar todos los datos relacionados. " +
          "Actualiza la página antes de realizar cambios."
      );
    }

    setViviendas(viv || []);
    setContratos(cont || []);
    setInspecciones(insp || []);
    setFacturas(fac || []);
  }

  async function obtenerMensajeError(error) {
    let mensajeError =
      error?.message || "No se pudo completar el borrado.";

    try {
      const respuesta = error?.context;

      if (respuesta && typeof respuesta.json === "function") {
        const cuerpo = await respuesta.json();

        if (cuerpo?.error) {
          mensajeError = cuerpo.error;
        } else if (cuerpo?.message) {
          mensajeError = cuerpo.message;
        }
      }
    } catch {
      // Si la respuesta no contiene JSON, se conserva el mensaje original.
    }

    return mensajeError;
  }

  async function eliminarCliente() {
    if (eliminando) return;

    const confirmar = window.confirm(
      "¿Quieres solicitar el borrado de este cliente y sus datos operativos? " +
        "El sistema protegerá las facturas y los contratos firmados que deban conservarse. " +
        "Si detecta documentos protegidos, detendrá el proceso."
    );

    if (!confirmar) return;

    setEliminando(true);
    setMensaje("");

    try {
      const { data, error } = await supabase.functions.invoke(
        "eliminarClienteCompleto",
        {
          body: {
            cliente_id: id,
          },
        }
      );

      if (error) {
        throw new Error(await obtenerMensajeError(error));
      }

      if (!data || data.ok !== true) {
        throw new Error(
          data?.error ||
            "El servidor no ha confirmado que el borrado se haya completado."
        );
      }

      window.alert(
        data.mensaje ||
          "El borrado de los datos operativos se ha completado."
      );

      navigate("/clientes");
    } catch (error) {
      console.error("Error al eliminar cliente:", error);

      setMensaje(
        "No se ha confirmado el borrado. " +
          (error?.message || "Revisa el error e inténtalo de nuevo.")
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
            fontSize: "18px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Cargando cliente...
        </div>
      </Menu>
    );
  }

  if (!cliente) {
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
            Cliente no encontrado
          </h1>

          <p>{mensaje}</p>

          <button
            onClick={() => navigate("/clientes")}
            style={{
              padding: "12px 20px",
              background: "#4db8ff",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Volver a la lista de clientes
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
          color: "#fff",
          background: "#0a0f1a",
          minHeight: "100vh",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "20px",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          {cliente.nombre || "Cliente"}
        </h1>

        {mensaje && (
          <p
            role="alert"
            style={{
              marginBottom: "15px",
              color: "#f87171",
              fontWeight: "600",
              whiteSpace: "pre-wrap",
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
            marginBottom: "20px",
          }}
        >
          <p>
            <strong>Teléfono:</strong>{" "}
            {cliente.telefono || "Sin teléfono"}
          </p>
          <p>
            <strong>Email:</strong>{" "}
            {cliente.email || "Sin email"}
          </p>
          <p>
            <strong>Dirección:</strong>{" "}
            {cliente.direccion || "Sin dirección"}
          </p>
        </div>

        <Bloque titulo="Viviendas del cliente">
          {viviendas.length === 0 ? (
            <p style={{ opacity: 0.7 }}>
              No hay viviendas registradas.
            </p>
          ) : (
            viviendas.map((v) => (
              <Item
                key={v.id}
                to={`/viviendas/${v.id}`}
                titulo={v.direccion || `Vivienda ${v.id}`}
              />
            ))
          )}
        </Bloque>

        <Bloque titulo="Contratos del cliente">
          {contratos.length === 0 ? (
            <p style={{ opacity: 0.7 }}>
              No hay contratos.
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

        <Bloque titulo="Inspecciones del cliente">
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

        <Bloque titulo="Facturas del cliente">
          {facturas.length === 0 ? (
            <p style={{ opacity: 0.7 }}>
              No hay facturas.
            </p>
          ) : (
            facturas.map((f) => (
              <Item
                key={f.id}
                to={`/facturas/${f.id}`}
                titulo={`Factura ${f.numero || f.id} — ${
                  f.total ?? "Importe no disponible"
                }€`}
              />
            ))
          )}
        </Bloque>

        <Link to={`/viviendas?cliente_id=${id}`}>
          <button
            style={{
              marginTop: "10px",
              padding: "14px",
              width: "100%",
              background: "#1e90ff",
              color: "#fff",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            Ver viviendas del cliente
          </button>
        </Link>

        <Link to={`/clientes/editar/${id}`}>
          <button
            style={{
              marginTop: "15px",
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
            Editar cliente
          </button>
        </Link>

        <button
          onClick={eliminarCliente}
          disabled={eliminando}
          style={{
            marginTop: "15px",
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
          }}
        >
          {eliminando ? "Procesando borrado..." : "Eliminar cliente"}
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
