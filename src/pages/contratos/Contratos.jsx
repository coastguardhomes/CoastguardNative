import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function Contratos() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarContratos();
  }, []);

  const cargarContratos = async () => {
    setCargando(true);
    const { data, error } = await supabase
      .from("contratos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error cargando contratos del admin:", error);
    } else {
      setContratos(data || []);
    }
    setCargando(false);
  };

  const enviarACliente = async (id) => {
    const { error } = await supabase
      .from("contratos")
      .update({ estado: "enviado_al_cliente" })
      .eq("id", id);

    if (error) {
      alert("Error actualizando el estado: " + error.message);
    } else {
      alert("Contrato enviado al cliente.");
      cargarContratos();
    }
  };

  const verDocumento = (c) => {
    const url = c.firma_url || c.pdf_url;
    if (url) {
      window.open(url, "_blank");
    } else {
      alert("No hay documento en PDF adjunto para este contrato.");
    }
  };

  return (
    <Menu>
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0f1a",
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "80px",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h1
            style={{
              textAlign: "center",
              color: "#4db8ff",
              fontSize: "26px",
              fontWeight: "bold",
              marginBottom: "15px",
            }}
          >
            📋 Panel de Contratos (Admin)
          </h1>

          {/* BOTÓN RESTAURADO PARA CREAR NUEVO CONTRATO */}
          <button
            onClick={() => navigate("/contratos/nuevo")}
            style={{
              width: "100%",
              padding: "14px",
              background: "#4db8ff",
              color: "#0a0f1a",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              marginBottom: "20px",
              boxShadow: "0 0 10px rgba(77, 184, 255, 0.4)",
            }}
          >
            ➕ Crear Nuevo Contrato
          </button>

          {cargando ? (
            <p style={{ textAlign: "center" }}>Cargando contratos...</p>
          ) : contratos.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.8 }}>No hay contratos en la base de datos.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {contratos.map((c) => {
                const esFirmado = c.estado === "firmado" || c.estado === "enviado_al_admin" || Boolean(c.firma_url);

                return (
                  <div
                    key={c.id}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      padding: "18px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <h3 style={{ margin: 0, fontSize: "18px" }}>Contrato #{c.id}</h3>
                      
                      <span
                        style={{
                          background: esFirmado ? "rgba(76, 217, 100, 0.2)" : "rgba(255, 184, 77, 0.2)",
                          color: esFirmado ? "#4cd964" : "#ffb84d",
                          border: `1px solid ${esFirmado ? "#4cd964" : "#ffb84d"}`,
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {esFirmado ? "✅ FIRMADO" : `⏳ ${c.estado ? c.estado.toUpperCase() : "PENDIENTE"}`}
                      </span>
                    </div>

                    <p style={{ margin: "4px 0 14px 0", fontSize: "14px", color: "#9fb3c8" }}>
                      Fecha Inicio: {c.fecha_inicio || "Sin fecha"}
                    </p>

                    <div style={{ display: "flex", gap: "10px" }}>
                      {!esFirmado && (
                        <button
                          onClick={() => enviarACliente(c.id)}
                          style={{
                            flex: 1,
                            padding: "12px",
                            background: "#4db8ff",
                            color: "#0a0f1a",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          🚀 Enviar a Cliente
                        </button>
                      )}

                      <button
                        onClick={() => verDocumento(c)}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background: "rgba(255,255,255,0.1)",
                          color: "#fff",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                      >
                        📄 {esFirmado ? "Ver Firmado" : "Ver Borrador"}
                      </button>
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
