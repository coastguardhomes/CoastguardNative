import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarContratosAdmin = async () => {
    setLoading(true);
    try {
      // 1. Cargar contratos directamente
      const { data: contratosData, error: contratosError } = await supabase
        .from("contratos")
        .select("*")
        .order("created_at", { ascending: false });

      if (contratosError) throw contratosError;

      // 2. Cargar clientes para emparejarlos manualmente de forma segura
      const { data: clientesData } = await supabase
        .from("clientes")
        .select("id, nombre, email, telefono");

      const clientesMap = {};
      (clientesData || []).forEach((c) => {
        clientesMap[c.id] = c;
      });

      const contratosConCliente = (contratosData || []).map((c) => ({
        ...c,
        clientes: clientesMap[c.cliente_id] || null,
      }));

      setContratos(contratosConCliente);
    } catch (err) {
      console.error("Error al cargar contratos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarContratosAdmin();
  }, []);

  return (
    <Menu>
      <div
        style={{
          background: "#0a0f1a",
          minHeight: "100vh",
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#4db8ff",
            marginBottom: "24px",
            fontSize: "26px",
            fontWeight: "700",
          }}
        >
          Gestión de Contratos
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", marginTop: "40px", color: "#9fb3c8" }}>
            <h3>Cargando lista de contratos...</h3>
          </div>
        ) : contratos.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: "40px", color: "#9fb3c8" }}>
            <p>No hay contratos registrados en el sistema.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px", margin: "0 auto" }}>
            {contratos.map((c) => {
              const estaFirmado = c.estado === "firmado" || Boolean(c.firma_url);

              return (
                <div
                  key={c.id}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${estaFirmado ? "rgba(77, 255, 136, 0.4)" : "rgba(255, 255, 255, 0.1)"}`,
                    borderRadius: "14px",
                    padding: "18px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h3 style={{ margin: 0, color: "#4db8ff", fontSize: "18px" }}>
                      Contrato #{c.id}
                    </h3>
                    <span
                      style={{
                        background: estaFirmado ? "rgba(77, 255, 136, 0.15)" : "rgba(255, 184, 77, 0.15)",
                        color: estaFirmado ? "#4dff88" : "#ffb84d",
                        border: `1px solid ${estaFirmado ? "#4dff88" : "#ffb84d"}`,
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {estaFirmado ? "✅ Firmado" : "⏳ Pendiente"}
                    </span>
                  </div>

                  <p style={{ margin: "6px 0", color: "#ffffff", fontSize: "15px" }}>
                    <strong>Cliente:</strong> {c.clientes?.nombre || "Sin cliente asignado"}
                  </p>
                  <p style={{ margin: "4px 0", color: "#9fb3c8", fontSize: "14px" }}>
                    <strong>Teléfono:</strong> {c.clientes?.telefono || "—"}
                  </p>
                  <p style={{ margin: "4px 0", color: "#9fb3c8", fontSize: "14px" }}>
                    <strong>Fecha Inicio:</strong> {c.fecha_inicio || "—"} | <strong>Precio:</strong> {c.precio ? `${c.precio} €` : "—"}
                  </p>

                  <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                    {c.firma_url ? (
                      <button
                        onClick={() => window.open(c.firma_url, "_blank")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          color: "#fff",
                          borderRadius: "8px",
                          fontWeight: "600",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        🖋️ Ver Firma
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "rgba(255, 255, 255, 0.03)",
                          color: "#666",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                      >
                        Sin Firma
                      </button>
                    )}

                    {c.pdf_url ? (
                      <button
                        onClick={() => window.open(c.pdf_url, "_blank")}
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "#4db8ff",
                          border: "none",
                          color: "#0a0f1a",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          fontSize: "13px",
                          cursor: "pointer",
                        }}
                      >
                        📄 Ver PDF
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          flex: 1,
                          padding: "10px",
                          background: "rgba(255, 255, 255, 0.03)",
                          color: "#666",
                          border: "1px solid rgba(255, 255, 255, 0.05)",
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                      >
                        Sin PDF
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Menu>
  );
                                         }
