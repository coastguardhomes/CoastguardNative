import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerContratos();
  }, []);

  const obtenerContratos = async () => {
    setCargando(true);
    const { data } = await supabase.from("contratos").select("*").order("id", { ascending: false });
    setContratos(data || []);
    setCargando(false);
  };

  // Acción para enviar el contrato (cambia estado a 'enviado')
  const enviarContrato = async (id) => {
    const { error } = await supabase.from("contratos").update({ estado: "enviado" }).eq("id", id);
    if (!error) obtenerContratos();
    else alert("Error al enviar");
  };

  return (
    <Menu>
      <div style={{ background: "#0a0f1a", minHeight: "100vh", padding: "24px", color: "#fff" }}>
        <h1 style={{ color: "#4db8ff", textAlign: "center", marginBottom: "20px" }}>Panel de Contratos (Admin)</h1>
        
        {cargando ? <p style={{textAlign: 'center'}}>Cargando...</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {contratos.map((c) => {
              const esFirmado = c.estado === "firmado";
              
              return (
                <div key={c.id} style={{ background: "rgba(255,255,255,0.05)", padding: "20px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                    <h3 style={{ margin: 0 }}>Contrato #{c.id}</h3>
                    <span style={{ color: esFirmado ? "#4cd964" : "#ffb84d" }}>
                      {esFirmado ? "✅ Firmado" : `⏳ ${c.estado || 'Pendiente'}`}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    {/* Botón 1: Enviar (Solo si no está firmado) */}
                    {!esFirmado && (
                      <button 
                        onClick={() => enviarContrato(c.id)}
                        style={{ flex: 1, padding: "10px", background: "#4db8ff", border: "none", borderRadius: "8px", fontWeight: "bold" }}
                      >
                        🚀 Enviar Contrato
                      </button>
                    )}

                    {/* Botón 2: Ver Contrato (PDF) */}
                    <button 
                      onClick={() => window.open(c.pdf_url, "_blank")}
                      style={{ flex: 1, padding: "10px", background: "rgba(255,255,255,0.1)", border: "1px solid #fff", borderRadius: "8px", color: "#fff", fontWeight: "bold" }}
                    >
                      👁️ Ver Contrato
                    </button>
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
