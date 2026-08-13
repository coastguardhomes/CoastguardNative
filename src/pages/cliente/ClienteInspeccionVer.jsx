import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, Link } from "react-router-dom";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";

export default function ClienteInspeccionVer() {
  const { id } = useParams();
  const [inspeccion, setInspeccion] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (id) cargarDetalles();
  }, [id]);

  async function cargarDetalles() {
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. Obtener datos de la inspección
      const { data: insp, error: inspErr } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", String(id))
        .single();

      if (inspErr || !insp) {
        setErrorMsg("No se encontró la inspección o no tienes permisos para verla.");
        setLoading(false);
        return;
      }

      setInspeccion(insp);

      // 2. Cargar dirección desde la tabla viviendas
      if (insp.vivienda_id) {
        const { data: viv } = await supabase
          .from("viviendas")
          .select("direccion, ciudad")
          .eq("id", insp.vivienda_id)
          .maybeSingle();

        setVivienda(viv);
      }

      // 3. Cargar fotos con el helper oficial o consulta directa a 'fotos'
      try {
        const fotosCargadas = await cargarFotosInspeccion(id);
        setFotos(fotosCargadas || []);
      } catch {
        const { data: fotosData } = await supabase
          .from("fotos")
          .select("*")
          .eq("inspeccion_id", String(id));
        setFotos(fotosData || []);
      }

    } catch (err) {
      console.error("Error al cargar detalles:", err);
      setErrorMsg("Error de conexión al cargar la inspección.");
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

        {errorMsg && (
          <div style={{ padding: "14px", background: "rgba(255,107,107,0.2)", border: "1px solid #ff6b6b", color: "#ff6b6b", borderRadius: "10px", textAlign: "center" }}>
            {errorMsg}
          </div>
        )}

        {inspeccion && (
          <>
            {/* Cabecera */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,204,0,0.3)", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ color: "#ffcc00", fontSize: "18px", margin: 0 }}>
                  Inspección #{String(inspeccion.id).slice(0, 8)}
                </h2>
                <span style={{ fontSize: "13px", color: "#aaa" }}>
                  Fecha: {inspeccion.fecha ? String(inspeccion.fecha).slice(0, 10) : "-"}
                </span>
              </div>
              <span style={{ padding: "4px 10px", border: "1px solid #ffcc00", color: "#ffcc00", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase" }}>
                {inspeccion.estado}
              </span>
            </div>

            {/* Ubicación */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "20px" }}>
              <h4 style={{ color: "#4db8ff", fontSize: "13px", textTransform: "uppercase", marginBottom: "8px" }}>Ubicación / Vivienda</h4>
              <p style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>
                {vivienda?.direccion || inspeccion.direccion || inspeccion.vivienda_direccion || "Dirección no especificada"}
              </p>
            </div>

            {/* Observaciones */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "20px" }}>
              <h4 style={{ color: "#4db8ff", fontSize: "13px", textTransform: "uppercase", marginBottom: "8px" }}>Observaciones</h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#ddd" }}>
                {inspeccion.notas_tecnico || inspeccion.observaciones || "Sin observaciones registradas."}
              </p>
            </div>

            {/* Galería de Fotos */}
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

            {/* Botón Descargar PDF */}
            {inspeccion.pdf_url ? (
              <a href={inspeccion.pdf_url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <button style={{ width: "100%", padding: "14px", background: "#ffcc00", color: "#000", border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>
                  📄 Descargar Informe PDF
                </button>
              </a>
            ) : (
              <div style={{ padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", color: "#aaa", textAlign: "center", fontSize: "13px" }}>
                El PDF aún no ha sido generado o está en proceso.
              </div>
            )}
          </>
        )}
      </div>
    </Menu>
  );
}
