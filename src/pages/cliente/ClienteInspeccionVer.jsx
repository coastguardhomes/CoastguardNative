import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, Link } from "react-router-dom";

export default function ClienteInspeccionVer() {
  const { id } = useParams();
  const [inspeccion, setInspeccion] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) cargarDetalles();
  }, [id]);

  async function cargarDetalles() {
    setLoading(true);
    try {
      // 1. Obtener datos de la inspección
      const { data: insp } = await supabase
        .from("inspecciones")
        .select("*, viviendas(direccion, localidad)")
        .eq("id", String(id))
        .single();

      if (insp) setInspeccion(insp);

      // 2. Cargar fotos asociadas
      const { data: fotosData } = await supabase
        .from("fotos_inspecciones")
        .select("*")
        .eq("inspeccion_id", String(id));

      if (fotosData) setFotos(fotosData);
    } catch (err) {
      console.error("Error cargando detalles:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Menu>
        <div style={{ height: "100vh", background: "#0a0f1a", color: "#4db8ff", display: "flex", justifyContent: "center", alignItems: "center" }}>
          Cargando información...
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: "20px", background: "#0a0f1a", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", paddingBottom: "80px" }}>
        
        <Link to="/cliente/inspecciones" style={{ color: "#ffcc00", textDecoration: "none", fontWeight: "600", display: "inline-block", marginBottom: "20px" }}>
          ← Volver a Mis Inspecciones
        </Link>

        {inspeccion && (
          <>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,204,0,0.3)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ color: "#ffcc00", fontSize: "18px", margin: 0 }}>Inspección #{inspeccion.id.slice(0, 8)}</h2>
                <span style={{ fontSize: "13px", color: "#aaa" }}>
                  Fecha: {inspeccion.fecha ? new Date(inspeccion.fecha).toLocaleDateString() : "-"}
                </span>
              </div>
              <span style={{ padding: "4px 10px", border: "1px solid #ffcc00", color: "#ffcc00", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase" }}>
                {inspeccion.estado}
              </span>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "20px" }}>
              <h4 style={{ color: "#4db8ff", fontSize: "13px", textTransform: "uppercase", marginBottom: "8px" }}>Ubicación / Vivienda</h4>
              <p style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>
                {inspeccion.viviendas?.direccion || inspeccion.direccion || "Dirección no especificada"}
              </p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "20px" }}>
              <h4 style={{ color: "#4db8ff", fontSize: "13px", textTransform: "uppercase", marginBottom: "8px" }}>Observaciones</h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#ddd" }}>
                {inspeccion.notas_tecnico || inspeccion.observaciones || "Sin observaciones registradas."}
              </p>
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "20px" }}>
              <h4 style={{ color: "#4db8ff", fontSize: "13px", textTransform: "uppercase", marginBottom: "12px" }}>Fotografías Adjuntas</h4>
              {fotos.length === 0 ? (
                <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>No hay fotografías adjuntas a esta inspección.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
                  {fotos.map((foto, idx) => (
                    <a key={idx} href={foto.url_foto || foto.url} target="_blank" rel="noreferrer">
                      <img
                        src={foto.url_foto || foto.url}
                        alt={`Foto ${idx + 1}`}
                        style={{ width: "100%", height: "90px", objectFit: "cover", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)" }}
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {inspeccion.pdf_url && (
              <a href={inspeccion.pdf_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <button style={{ width: "100%", padding: "14px", background: "#ffcc00", color: "#000", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
                  📄 Descargar Informe PDF
                </button>
              </a>
            )}
          </>
        )}
      </div>
    </Menu>
  );
}
