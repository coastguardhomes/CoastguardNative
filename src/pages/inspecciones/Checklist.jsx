import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function AdminDetalleInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inspeccion, setInspeccion] = useState(null);
  const [tecnico, setTecnico] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    cargarDatosInspeccion();
  }, [id]);

  async function cargarDatosInspeccion() {
    setLoading(true);

    // 1️⃣ Cargar inspección
    const { data: insp, error } = await supabase
      .from("inspecciones")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !insp) {
      setMensaje("No se pudo cargar la inspección.");
      setLoading(false);
      return;
    }
    setInspeccion(insp);

    // 2️⃣ Cargar técnico asignado
    if (insp.tecnico_id) {
      const { data: tec } = await supabase
        .from("tecnicos")
        .select("nombre, telefono, email")
        .eq("id", insp.tecnico_id)
        .single();
      setTecnico(tec || null);
    }

    // 3️⃣ Cargar vivienda
    if (insp.vivienda_id) {
      const { data: viv } = await supabase
        .from("viviendas")
        .select("direccion, ciudad")
        .eq("id", insp.vivienda_id)
        .single();
      setVivienda(viv || null);
    }

    // 4️⃣ Cargar cliente (vía contrato o directo)
    if (insp.contrato_id) {
      const { data: contrato } = await supabase
        .from("contratos")
        .select("cliente_id")
        .eq("id", insp.contrato_id)
        .single();

      if (contrato?.cliente_id) {
        const { data: cli } = await supabase
          .from("clientes")
          .select("nombre, telefono, email")
          .eq("id", contrato.cliente_id)
          .single();
        setCliente(cli || null);
      }
    } else if (insp.cliente_id) {
      const { data: cli } = await supabase
        .from("clientes")
        .select("nombre, telefono, email")
        .eq("id", insp.cliente_id)
        .single();
      setCliente(cli || null);
    }

    // 5️⃣ Cargar checklist del técnico
    const { data: chk } = await supabase
      .from("checklist_inspeccion")
      .select("*")
      .eq("inspeccion_id", id);
    setChecklist(chk || []);

    // 6️⃣ Cargar fotos de la inspección
    const { data: fts } = await supabase
      .from("fotos_inspeccion")
      .select("*")
      .eq("inspeccion_id", id);
    setFotos(fts || []);

    setLoading(false);
  }

  // ⭐ ACCIÓN DEL ADMIN: Aprobar trabajo del técnico
  async function aprobarInspeccionAdmin() {
    setProcesando(true);
    setMensaje("");

    const { error } = await supabase
      .from("inspecciones")
      .update({
        estado: "completada_admin",
        fecha_aprobacion_admin: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      setMensaje("Error al aprobar la inspección: " + error.message);
      setProcesando(false);
      return;
    }

    setMensaje("¡Inspección aprobada con éxito! Lista para el cliente.");
    setProcesando(false);
    cargarDatosInspeccion();
  }

  if (loading) {
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
          Cargando revisión del administrador...
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
            marginBottom: "20px",
            fontSize: "26px",
            fontWeight: "700",
            textAlign: "center",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Revisión Admin — Inspección #{inspeccion.id}
        </h1>

        {mensaje && (
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              background: mensaje.includes("éxito")
                ? "rgba(74, 222, 128, 0.15)"
                : "rgba(255, 107, 107, 0.15)",
              border: `1px solid ${mensaje.includes("éxito") ? "#4ade80" : "#ff6b6b"}`,
              borderRadius: "10px",
              color: mensaje.includes("éxito") ? "#4ade80" : "#ff6b6b",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {mensaje}
          </div>
        )}

        {/* ESTADO ACTUAL Y BOTÓN DE APROBACIÓN */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            marginBottom: "25px",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          }}
        >
          <p style={{ fontSize: "16px", marginBottom: "10px" }}>
            <strong style={{ color: "#4db8ff" }}>Estado del Proceso:</strong>{" "}
            <span
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                background:
                  inspeccion.estado === "completada_admin"
                    ? "#4ade80"
                    : "#ffcc00",
                color: "#000",
                fontWeight: "700",
                fontSize: "14px",
              }}
            >
              {inspeccion.estado}
            </span>
          </p>

          <p>
            <strong style={{ color: "#4db8ff" }}>Técnico a cargo:</strong>{" "}
            {tecnico ? `${tecnico.nombre} (${tecnico.telefono || tecno.email})` : "Sin asignar"}
          </p>
          <p>
            <strong style={{ color: "#4db8ff" }}>Vivienda:</strong>{" "}
            {vivienda ? `${vivienda.direccion}, ${vivienda.ciudad}` : "No especificada"}
          </p>
          <p>
            <strong style={{ color: "#4db8ff" }}>Cliente:</strong>{" "}
            {cliente ? `${cliente.nombre} (${cliente.telefono || cliente.email})` : "Sin cliente asociado"}
          </p>

          <div style={{ marginTop: "15px" }}>
            <strong style={{ color: "#4db8ff" }}>Notas del técnico:</strong>
            <p
              style={{
                marginTop: "5px",
                padding: "10px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: "8px",
                fontStyle: "italic",
              }}
            >
              {inspeccion.notas_tecnico || "El técnico no dejó notas adicionales."}
            </p>
          </div>

          {/* BOTÓN DE VALIDACIÓN DE ADMIN */}
          {inspeccion.estado !== "completada_admin" ? (
            <button
              onClick={aprobarInspeccionAdmin}
              disabled={procesando}
              style={{
                marginTop: "20px",
                padding: "14px",
                width: "100%",
                background: "#4ade80",
                color: "#000",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                fontSize: "17px",
                cursor: procesando ? "not-allowed" : "pointer",
                boxShadow: "0 0 10px rgba(74,222,128,0.4)",
              }}
            >
              {procesando ? "Aprobando..." : "✅ Aprobar trabajo y habilitar para cliente"}
            </button>
          ) : (
            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                background: "rgba(74, 222, 128, 0.2)",
                border: "1px solid #4ade80",
                borderRadius: "10px",
                textAlign: "center",
                color: "#4ade80",
                fontWeight: "700",
              }}
            >
              ✔ Inspección aprobada por el administrador.
            </div>
          )}
        </div>

        {/* CHECKLIST REALIZADO POR EL TÉCNICO */}
        <div style={{ marginBottom: "25px" }}>
          <h2 style={{ color: "#4db8ff", fontSize: "20px", marginBottom: "12px" }}>
            Checklist Realizado ({checklist.length} puntos)
          </h2>
          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              padding: "15px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.08)",
              maxHeight: "300px",
              overflowY: "auto",
            }}
          >
            {checklist.length === 0 ? (
              <p style={{ opacity: 0.7 }}>No hay elementos en el checklist.</p>
            ) : (
              checklist.map((item, index) => (
                <div
                  key={item.id || index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span style={{ fontSize: "14px" }}>
                    {index + 1}. {item.item || item.pregunta}
                  </span>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "700",
                      background:
                        item.estado === "ok" || item.completado === true
                          ? "#2ecc71"
                          : "#e74c3c",
                      color: "#fff",
                    }}
                  >
                    {item.estado ? item.estado.toUpperCase() : item.completado ? "OK" : "KO"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* FOTOS SUBIDAS POR EL TÉCNICO */}
        <div style={{ marginBottom: "25px" }}>
          <h2 style={{ color: "#4db8ff", fontSize: "20px", marginBottom: "12px" }}>
            Evidencias Fotográficas ({fotos.length})
          </h2>
          {fotos.length === 0 ? (
            <p style={{ opacity: 0.7 }}>No hay fotos registradas.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "10px",
              }}
            >
              {fotos.map((foto) => (
                <div
                  key={foto.id}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    padding: "8px",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <img
                    src={foto.url}
                    alt="Evidencia"
                    style={{
                      width: "100%",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACCIONES DE CIERRE / PDF / CLIENTE */}
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button
            onClick={() => navigate(`/inspecciones/pdf/${id}`)}
            style={{
              flex: 1,
              padding: "14px",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            📄 Generar / Ver PDF
          </button>

          <button
            onClick={() => navigate("/inspecciones")}
            style={{
              flex: 1,
              padding: "14px",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              borderRadius: "10px",
              border: "1px solid rgba(255,255,255,0.2)",
              fontWeight: "700",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Volver al listado
          </button>
        </div>
      </div>
    </Menu>
  );
}
