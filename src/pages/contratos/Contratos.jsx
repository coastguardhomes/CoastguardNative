import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function Contratos() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => { cargarContratos(); }, []);

  const cargarContratos = async () => {
    setCargando(true);
    const { data } = await supabase.from("contratos").select("*").order("id", { ascending: false });
    setContratos(data || []);
    setCargando(false);
  };

  // Función única y limpia para abrir el PDF
  const abrirPdf = async (path) => {
    if (!path) { alert("PDF no generado"); return; }
    const cleanPath = path.replace(/^contratos\//, "");
    const { data } = await supabase.storage.from("contratos").createSignedUrl(cleanPath, 3600);
    if (data?.signedUrl) {
      window.open(`${data.signedUrl}&t=${Date.now()}`, "_blank");
    }
  };

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff", background: "#0a0f1a", minHeight: "100vh" }}>
        <h1>Panel de Contratos</h1>
        {contratos.map((c) => (
          <div key={c.id} style={{ background: "#1a2332", padding: "15px", borderRadius: "10px", marginBottom: "10px" }}>
            <h3>Contrato #{c.id} - {c.estado}</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => navigate(`/contratos/ver/${c.id}`)}>🔍 Ver Ficha</button>
              
              {/* BOTÓN VER PDF: Ahora siempre llama a abrirPdf con pdf_url */}
              <button 
                onClick={() => abrirPdf(c.pdf_url)} 
                style={{ background: "#4db8ff", border: "none", padding: "10px", borderRadius: "5px" }}
              >
                📄 Ver PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </Menu>
  );
}
