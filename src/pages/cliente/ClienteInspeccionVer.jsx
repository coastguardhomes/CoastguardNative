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
  const [fotoModal, setFotoModal] = useState(null); // Estado para abrir la foto a pantalla completa

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

      // 2. Cargar la vivienda/dirección asociada
      if (insp.vivienda_id) {
        const { data: viv } = await supabase
          .from("viviendas")
          .select("direccion, ciudad")
          .eq("id", insp.vivienda_id)
          .maybeSingle();

        setVivienda(viv);
      }

      // 3. Cargar las fotos de la inspección
      try {
        const fotosCargadas = await cargarFotosInspeccion(id);
        if (fotosCargadas && fotosCargadas.length > 0) {
          setFotos(fotosCargadas);
        } else {
          const { data: fotosData } = await supabase
            .from("fotos")
            .select("*")
            .eq("inspeccion_id", String(id));
          setFotos(fotosData || []);
        }
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

  // Función para normalizar cualquier formato de URL de fotos
  function obtenerUrlPublica(foto) {
    if (!foto) return "";
    const rawUrl = typeof foto === "string" ? foto : (foto.url_foto || foto.url || foto.path || foto.foto_url || "");
    if (!rawUrl) return "";
    
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }
    
    const { data } = supabase.storage.from("fotos").getPublicUrl(rawUrl);
    return data?.publicUrl || rawUrl;
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

            {/* Ubicación / Vivienda */}
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

            {/* Galería de Fotografías */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "20px" }}>
              <h4 style={{ color: "#4db8ff", fontSize: "13px", textTransform: "uppercase", marginBottom: "12px" }}>Fotografías Adjuntas</h4>
              {fotos.length === 0 ? (
                <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>No hay fotografías adjuntas a esta inspección.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
                  {fotos.map((foto, idx) => {
                    const imgUrl = obtenerUrlPublica(foto);
                    return (
                      <div
                        key={idx}
                        onClick={() => imgUrl && setFotoModal(imgUrl)}
                        style={{ cursor: "pointer", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.2)" }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Foto ${idx + 1}`}
                          style={{ width: "100%", height: "90px", objectFit: "cover", display: "block" }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Botón Descargar Informe PDF */}
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

        {/* Modal / Visor de la foto ampliada */}
        {fotoModal && (
          <div
            onClick={() => setFotoModal(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.9)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
            }}
          >
            <div style={{ position: "relative", maxWidth: "100%", maxHeight: "90vh", textAlign: "center" }}>
              <button
                onClick={() => setFotoModal(null)}
                style={{
                  position: "absolute",
                  top: "-45px",
                  right: "0px",
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                ✕ Cerrar
              </button>
              <img
                src={fotoModal}
                alt="Foto ampliada"
                style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "10px", objectFit: "contain", boxShadow: "0 0 20px rgba(0,0,0,0.8)" }}
              />
            </div>
          </div>
        )}
      </div>
    </Menu>
  );
}
