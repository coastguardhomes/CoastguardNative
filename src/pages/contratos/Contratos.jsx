import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    obtenerContratos();
  }, []);

  const obtenerContratos = async () => {
    setCargando(true);
    setError(null);

    try {
      // Ordenamos por 'id' en lugar de 'created_at' para evitar fallos de columna
      const { data, error } = await supabase
        .from("contratos")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        throw error;
      }

      setContratos(data || []);
    } catch (err) {
      console.error("Error cargando contratos:", err);
      setError("No se pudieron cargar los contratos. " + (err.message || ""));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Menu>
      <div style={{ background: "#0a0f1a", minHeight: "100vh", padding: "24px", color: "#fff" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          
          {/* Encabezado */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <div>
              <h1 style={{ fontSize: "24px", fontWeight: "bold", color: "#4db8ff", margin: 0 }}>
                📑 Gestión de Contratos
              </h1>
              <p style={{ color: "#9fb3c8", margin: "4px 0 0 0", fontSize: "14px" }}>
                Listado y estado de firma de los contratos
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

          {/* Mensajes de carga / error */}
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

          {/* Estado sin contratos */}
          {!cargando && !error && contratos.length === 0 && (
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "12px", padding: "40px", textAlign: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p style={{ color: "#9fb3c8", fontSize: "16px" }}>No hay contratos registrados aún en Supabase.</p>
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

                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      {/* Badge de Estado */}
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
                        {esFirmado ? "✓ Firmado" : "⏳ Pendiente"}
                      </span>

                      {/* Botones de Acción */}
                      {esFirmado && contrato.firma_url ? (
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
                          👁️ Ver Firma
                        </a>
                      ) : (
                        <Link
                          to={`/contratos/${contrato.id}/firmar`}
                          style={{
                            background: "#4db8ff",
                            color: "#0a0f1a",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            textDecoration: "none",
                            fontWeight: "bold",
                            fontSize: "13px"
                          }}
                        >
                          ✍️ Firmar ahora
                        </Link>
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
