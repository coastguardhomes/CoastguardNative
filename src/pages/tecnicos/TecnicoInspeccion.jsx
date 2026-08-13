import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

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
            height: "100vh",
            background: "#0a0f1a",
            color: "#4db8ff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Cargando inspección...
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
          paddingBottom: "100px",
        }}
      >
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "24px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Inspección #{id}
        </h1>

        {mensaje ? (
          <div
            style={{
              background: "rgba(255,107,107,0.1)",
              border: "1px solid #ff6b6b",
              color: "#ff6b6b",
              padding: "15px",
              borderRadius: "10px",
              textAlign: "center",
              fontWeight: "600",
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
                  background: "rgba(255,255,255,0.05)",
                  padding: "20px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                  marginBottom: "25px",
                  fontSize: "15px",
                  lineHeight: "1.6",
                }}
              >
                <p>
                  <strong style={{ color: "#4db8ff" }}>Fecha:</strong>{" "}
                  {inspeccion.fecha || "No especificada"}
                </p>

                <p>
                  <strong style={{ color: "#4db8ff" }}>Estado:</strong>{" "}
                  <span
                    style={{
                      textTransform: "capitalize",
                      fontWeight: "bold",
                      color:
                        inspeccion.estado === "completada"
                          ? "#4ade80"
                          : "#ffd700",
                    }}
                  >
                    {inspeccion.estado || "Pendiente"}
                  </span>
                </p>

                <p>
                  <strong style={{ color: "#4db8ff" }}>Vivienda:</strong>{" "}
                  {vivienda
                    ? `${vivienda.nombre || vivienda.direccion || "Vivienda"} ${
                        vivienda.ciudad ? `(${vivienda.ciudad})` : ""
                      }`
                    : inspeccion.vivienda_id}
                </p>

                <p>
                  <strong style={{ color: "#4db8ff" }}>Cliente:</strong>{" "}
                  {cliente
                    ? `${cliente.nombre} ${
                        cliente.telefono ? `(${cliente.telefono})` : ""
                      }`
                    : "Sin cliente asignado"}
                </p>

                <p style={{ marginTop: "10px" }}>
                  <strong style={{ color: "#4db8ff" }}>Notas / Observaciones:</strong>{" "}
                  <br />
                  <span style={{ opacity: 0.9 }}>
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
                    marginBottom: "15px",
                    padding: "14px",
                    width: "100%",
                    background: "#4db8ff",
                    color: "#000",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "16px",
                    cursor: "pointer",
                    boxShadow: "0 0 10px rgba(0,153,255,0.3)",
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
                    marginBottom: "15px",
                    padding: "14px",
                    width: "100%",
                    background: "#1e90ff",
                    color: "#fff",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "16px",
                    cursor: "pointer",
                    boxShadow: "0 0 10px rgba(30,144,255,0.3)",
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
                    marginBottom: "15px",
                    padding: "14px",
                    width: "100%",
                    background: "#4ade80",
                    color: "#000",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "16px",
                    cursor: "pointer",
                    boxShadow: "0 0 10px rgba(74,222,128,0.3)",
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
