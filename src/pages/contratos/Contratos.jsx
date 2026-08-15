import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [copiadoId, setCopiadoId] = useState(null);

  useEffect(() => {
    obtenerContratos();
  }, []);

  const obtenerContratos = async () => {
    setCargando(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .order("id", { ascending: false });

      if (error) throw error;
      setContratos(data || []);
    } catch (err) {
      console.error("Error cargando contratos:", err);
      setError("No se pudieron cargar los contratos. " + (err.message || ""));
    } finally {
      setCargando(false);
    }
  };

  // Función para copiar el enlace que se le envía al cliente para que firme
  const copiarEnlaceCliente = (id) => {
    const enlace = `${window.location.origin}/contratos/${id}/firmar`;
    navigator.clipboard.writeText(enlace);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2500);
  };

  return (
    <Menu>
      <div style={{ background: "#0a0f1a", minHeight: "100vh", padding: "24px", color: "#fff" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          
          {/* Encabezado */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#4db8ff", margin: 0 }}>
                📑 Panel de Contratos (Admin)
              </h1>
              <p style={{ color: "#9fb3c8", margin: "4px 0 0 0", fontSize: "14px" }}>
                Estado de firmas y enlaces para enviar a clientes
              </p>
            </div>
            
            <button
              onClick={obtenerContratos}
              style={{
                background: "rgba(77, 184, 255, 0.15)",
                border: "1px solid #4db8ff",
                color: "#4db8ff",
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              🔄 Recargar
            </button>
          </div>

          {/* Mensajes de Carga / Error */}
          {cargando && (
            <div style={{ textAlign: "center", padding: "40px", color: "#9fb3c8" }}>
              Cargando contratos...
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(255, 77, 77, 0.15)", border: "1px solid #ff4d4d", color: "#ff4d4d", padding: "16px", borderRadius: "10px", marginBottom: "20px" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Lista de Contratos */}
          {!cargando && contratos.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {contratos.map((contrato) => {
                const esFirmado = contrato.estado === "firmado" || Boolean(contrato.firma_url);

                return (
                  <div
                    key={contrato.id}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                      padding: "18px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px"
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 6px 0", fontSize: "18px", color: "#ffffff" }}>
                        Contrato #{contrato.id} {contrato.cliente_nombre ? `- ${contrato.cliente_nombre}` : ""}
                      </h3>
                      <p style={{ margin: 0, fontSize: "13px", color: "#9fb3c8" }}>
                        Fecha Inicio: {contrato.fecha_inicio || contrato.fecha || "Sin fecha"}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      {/* Estado */}
                      <span
                        style={{
                          padding: "6px 12px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                          background: esFirmado ? "rgba(76, 217, 100, 0.2)" : "rgba(255, 179, 0, 0.2)",
                          color: esFirmado ? "#4cd964" : "#ffb300",
                          border: `1px solid ${esFirmado ? "#4cd964" : "#ffb300"}`
                        }}
                      >
                        {esFirmado ? "✓ Firmado por Cliente" : "⏳ Pendiente de Cliente"}
                      </span>

                      {/* Acciones según el estado */}
                      {esFirmado ? (
                        <a
                          href={contrato.firma_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: "#4cd964",
                            color: "#0a0f1a",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "bold",
                            fontSize: "13px"
                          }}
                        >
                          👁️ Ver Firma del Cliente
                        </a>
                      ) : (
                        <button
                          onClick={() => copiarEnlaceCliente(contrato.id)}
                          style={{
                            background: copiadoId === contrato.id ? "#4cd964" : "#4db8ff",
                            color: "#0a0f1a",
                            border: "none",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            fontSize: "13px",
                            cursor: "pointer"
                          }}
                        >
                          {copiadoId === contrato.id ? "✓ ¡Enlace Copiado!" : "🔗 Enlace para Cliente"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </Menu>
  );
}
