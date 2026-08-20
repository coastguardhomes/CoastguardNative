import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function TecnicoInspeccion() {
  const { id } = useParams();
  const { user } = useAuth();

  const [inspeccion, setInspeccion] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user?.email) {
      cargarInspeccion();
    }
  }, [id, user]);

  async function cargarInspeccion() {
    setLoading(true);
    setMensaje("");

    try {
      // 1️⃣ Obtener técnico por email
      const { data: tecnico, error: tecError } = await supabase
        .from("tecnicos")
        .select("id")
        .eq("email", user?.email)
        .single();

      if (tecError || !tecnico) {
        setMensaje("No se pudo validar la cuenta del técnico.");
        setLoading(false);
        return;
      }

      // 2️⃣ Cargar datos de la inspección
      const { data: insp, error: inspError } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", String(id))
        .single();

      if (inspError || !insp) {
        setMensaje("Inspección no encontrada.");
        setLoading(false);
        return;
      }

      // 3️⃣ Validar permisos comparando como String
      if (String(insp.tecnico_id) !== String(tecnico.id)) {
        setMensaje("No tienes permisos para acceder a esta inspección.");
        setLoading(false);
        return;
      }

      setInspeccion(insp);

      // 4️⃣ Cargar datos de la vivienda
      if (insp.vivienda_id) {
        const { data: viv } = await supabase
          .from("viviendas")
          .select("*, clientes(nombre, telefono)")
          .eq("id", insp.vivienda_id)
          .single();

        if (viv) {
          setVivienda(viv);
          if (viv.clientes) {
            setCliente(viv.clientes);
          }
        }
      }

      // 5️⃣ Si hay contrato y no se obtuvo cliente previamente, buscarlo por contrato
      if (!cliente && insp.contrato_id) {
        const { data: contrato } = await supabase
          .from("contratos")
          .select("cliente_id")
          .eq("id", insp.contrato_id)
          .single();

        if (contrato?.cliente_id) {
          const { data: cli } = await supabase
            .from("clientes")
            .select("nombre, telefono")
            .eq("id", contrato.cliente_id)
            .single();

          if (cli) setCliente(cli);
        }
      }
    } catch (err) {
      console.error("Error al cargar la inspección:", err);
      setMensaje("Error inesperado al cargar la inspección.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Menu>
        <div
          style={{
            minHeight: "100vh",
            background: FONDO_PRINCIPAL,
            color: COLOR_DORADO,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <h3 style={TEXTO_DORADO_BRILLO}>Cargando inspección...</h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: FONDO_PRINCIPAL,
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "100px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            ...TEXTO_DORADO_BRILLO,
            marginBottom: "20px",
            fontSize: "20px",
            fontWeight: "900",
            textAlign: "center",
            textTransform: "uppercase",
          }}
        >
          Inspección #{id}
        </h1>

        {mensaje ? (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#ef4444",
              padding: "12px 16px",
              borderRadius: "12px",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "13px",
              marginBottom: "20px",
            }}
          >
            {mensaje}
          </div>
        ) : (
          inspeccion && (
            <>
              <div
                style={{
                  background: FONDO_TARJETA,
                  padding: "16px",
                  borderRadius: "16px",
                  border: BORDE_DORADO_FINO,
                  boxShadow: SOMBRA_LUXURY,
                  marginBottom: "20px",
                  fontSize: "13px",
                  lineHeight: "1.6",
                }}
              >
                <p style={{ marginBottom: "8px" }}>
                  <strong style={{ color: COLOR_DORADO }}>Fecha:</strong>{" "}
                  {inspeccion.fecha || "No especificada"}
                </p>

                <p style={{ marginBottom: "8px" }}>
                  <strong style={{ color: COLOR_DORADO }}>Estado:</strong>{" "}
                  <span
                    style={{
                      textTransform: "capitalize",
                      fontWeight: "700",
                      padding: "3px 8px",
                      background: "rgba(11, 19, 32, 0.9)",
                      border: BORDE_DORADO_FINO,
                      borderRadius: "6px",
                      color:
                        inspeccion.estado === "completada"
                          ? "#10b981"
                          : COLOR_DORADO,
                    }}
                  >
                    {inspeccion.estado || "Pendiente"}
                  </span>
                </p>

                <p style={{ marginBottom: "8px" }}>
                  <strong style={{ color: COLOR_DORADO }}>Vivienda:</strong>{" "}
                  {vivienda
                    ? `${vivienda.nombre || vivienda.direccion || "Vivienda"} ${
                        vivienda.ciudad ? `(${vivienda.ciudad})` : ""
                      }`
                    : inspeccion.vivienda_id}
                </p>

                <p style={{ marginBottom: "8px" }}>
                  <strong style={{ color: COLOR_DORADO }}>Cliente:</strong>{" "}
                  {cliente
                    ? `${cliente.nombre} ${
                        cliente.telefono ? `(${cliente.telefono})` : ""
                      }`
                    : "Sin cliente asignado"}
                </p>

                <p style={{ margin: 0, marginTop: "10px" }}>
                  <strong style={{ color: COLOR_DORADO }}>Notas / Observaciones:</strong>{" "}
                  <br />
                  <span style={{ opacity: 0.9, fontSize: "12px" }}>
                    {inspeccion.observaciones ||
                      inspeccion.notas_tecnico ||
                      "Sin notas registradas."}
                  </span>
                </p>
              </div>

              {/* Botones de acción del Técnico */}
              <Link
                to={`/tecnico/inspeccion/${id}/checklist`}
                style={{ textDecoration: "none" }}
              >
                <button
                  style={{
                    marginBottom: "12px",
                    padding: "14px",
                    width: "100%",
                    background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
                    color: "#fff",
                    borderRadius: "16px",
                    border: BORDE_DORADO_FINO,
                    fontWeight: "900",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  📝 Checklist ({inspeccion.checklist_completado ? "Completado" : "Pendiente"})
                </button>
              </Link>

              <Link
                to={`/tecnico/inspeccion/${id}/fotos`}
                style={{ textDecoration: "none" }}
              >
                <button
                  style={{
                    marginBottom: "12px",
                    padding: "14px",
                    width: "100%",
                    background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
                    color: "#fff",
                    borderRadius: "16px",
                    border: BORDE_DORADO_FINO,
                    fontWeight: "900",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  📸 Galería de Fotos
                </button>
              </Link>

              <Link
                to={`/tecnico/inspeccion/${id}/finalizar`}
                style={{ textDecoration: "none" }}
              >
                <button
                  style={{
                    marginBottom: "12px",
                    padding: "14px",
                    width: "100%",
                    background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
                    color: "#fff",
                    borderRadius: "16px",
                    border: "1px solid rgba(16, 185, 129, 0.6)",
                    fontWeight: "900",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  ✅ Finalizar Inspección
                </button>
              </Link>
            </>
          )
        )}
      </div>
    </Menu>
  );
}
