import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, Link, useNavigate } from "react-router-dom";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";

export default function ClienteInspeccionVer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspeccion, setInspeccion] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [fotoModal, setFotoModal] = useState(null); 
  const [esExtra, setEsExtra] = useState(false); // Bandera para saber si es un trabajo extra

  useEffect(() => {
    if (id) cargarDetalles();
  }, [id]);

  async function cargarDetalles() {
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. Intentamos buscar primero en la tabla 'inspecciones'
      let { data: insp, error: inspErr } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", String(id))
        .maybeSingle();

      // Si no está en inspecciones, buscamos en la tabla 'extras' (los enviados por el admin)
      if (!insp) {
        const { data: dataExtra, error: extraErr } = await supabase
          .from("extras")
          .select("*")
          .eq("id", String(id))
          .maybeSingle();

        if (dataExtra) {
          insp = {
            id: dataExtra.id,
            fecha: dataExtra.updated_at || dataExtra.created_at,
            estado: dataExtra.estado,
            direccion: dataExtra.direccion || "Trabajo Extra / Factura",
            notas_tecnico: dataExtra.descripcion,
            materiales: dataExtra.materiales,
            tiempo_empleado: dataExtra.tiempo_empleado,
            pdf_url: dataExtra.pdf_url
          };
          setEsExtra(true);
          setFotos(dataExtra.fotos || []);
        }
      }

      if (!insp) {
        setErrorMsg("No se encontró el informe o no tienes permisos para verlo.");
        setLoading(false);
        return;
      }

      setInspeccion(insp);

      // 2. Cargar la vivienda/dirección asociada (si aplica)
      if (insp.vivienda_id) {
        const { data: viv } = await supabase
          .from("viviendas")
          .select("direccion, ciudad")
          .eq("id", insp.vivienda_id)
          .maybeSingle();

        setVivienda(viv);
      }

      // 3. Si no es extra, cargamos las fotos de la tabla 'fotos' o mediante helper
      if (!esExtra && !insp.fotos) {
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
      }

    } catch (err) {
      console.error("Error al cargar detalles:", err);
      setErrorMsg("Error de conexión al cargar la información.");
    } finally {
      setLoading(false);
    }
  }

  // Función para borrar el informe (especialmente útil si es un extra)
  async function borrarInforme() {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este informe de tu lista?")) return;

    try {
      const tablaDestino = esExtra ? "extras" : "inspecciones";
      const { error } = await supabase
        .from(tablaDestino)
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert("Informe eliminado correctamente.");
      navigate("/cliente/inspecciones");
    } catch (err) {
      console.error("Error al borrar:", err);
      alert("No se pudo eliminar el informe.");
    }
  }

  function obtenerUrlPublica(foto) {
    if (!foto) return "";
    const rawUrl = typeof foto === "string" ? foto : (foto.url_foto || foto.url || foto.path || foto.foto_url || "");
    if (!rawUrl) return "";
    
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }
    
    const { data } = supabase.storage.from("extras").getPublicUrl(rawUrl);
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
          ← Volver a Mis Informes
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
                  Informe #{String(inspeccion.id).slice(0, 8)}
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
                {vivienda?.direccion || inspeccion.direccion || "Dirección no especificada"}
              </p>
            </div>

            {/* Observaciones o Descripción */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "20px" }}>
              <h4 style={{ color: "#4db8ff", fontSize: "13px", textTransform: "uppercase", marginBottom: "8px" }}>Descripción del Trabajo / Observaciones</h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#ddd", whiteSpace: "pre-wrap" }}>
                {inspeccion.notas_tecnico || "Sin observaciones registradas."}
              </p>

              {inspeccion.materiales && (
                <p style={{ margin: "10px 0 0 0", fontSize: "14px", color: "#ccc" }}>
                  <strong>Materiales usados:</strong> {inspeccion.materiales}
                </p>
              )}
              {inspeccion.tiempo_empleado && (
                <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#ccc" }}>
                  <strong>Tiempo empleado:</strong> {inspeccion.tiempo_empleado}
                </p>
              )}
            </div>

            {/* Galería de Fotografías */}
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "20px" }}>
              <h4 style={{ color: "#4db8ff", fontSize: "13px", textTransform: "uppercase", marginBottom: "12px" }}>Fotografías Adjuntas</h4>
              {fotos.length === 0 ? (
                <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>No hay fotografías adjuntas a este informe.</p>
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

            {/* Botón de Borrar Informe */}
            <button 
              onClick={borrarInforme}
              style={{ width: "100%", padding: "14px", background: "rgba(255, 71, 87, 0.15)", color: "#ff4757", border: "1px solid #ff4757", borderRadius: "10px", fontWeight: "bold", fontSize: "15px", cursor: "pointer", marginBottom: "12px" }}
            >
              🗑️ Borrar este informe
            </button>
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
