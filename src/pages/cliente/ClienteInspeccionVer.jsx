import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const BORDE_DORADO_INTENSO = "1px solid rgba(224, 176, 52, 0.8)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.2)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 15px rgba(224, 176, 52, 0.7)" };
const DEGRADADO_AZUL_BOTON = "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)";

export default function ClienteInspeccionVer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [inspeccion, setInspeccion] = useState(null);
  const [vivienda, setVivienda] = useState(null);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [fotoModal, setFotoModal] = useState(null); 
  const [esExtra, setEsExtra] = useState(false);

  useEffect(() => {
    if (id && user) cargarDetalles();
  }, [id, user]);

  async function cargarDetalles() {
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. Obtener cliente_id del usuario logueado para seguridad
      const { data: clienteData } = await supabase
        .from("clientes")
        .select("id")
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (!clienteData) {
        setErrorMsg("Perfil de cliente no encontrado.");
        setLoading(false);
        return;
      }

      const clienteId = clienteData.id;

      // 2. Intentamos buscar primero en la tabla 'inspecciones' validando dueño
      let { data: insp } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .eq("cliente_id", clienteId)
        .maybeSingle();

      // Si no está en inspecciones, buscamos en la tabla 'extras'
      if (!insp) {
        const { data: dataExtra } = await supabase
          .from("extras")
          .select("*")
          .eq("id", id)
          .eq("cliente_id", clienteId)
          .maybeSingle();

        if (dataExtra) {
          insp = {
            id: dataExtra.id,
            fecha: dataExtra.updated_at || dataExtra.created_at,
            estado: "COMPLETADO",
            direccion: dataExtra.direccion || "Servicio Extra",
            notas_tecnico: dataExtra.descripcion || "Sin descripción",
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

      // 3. Cargar la vivienda/dirección asociada (si aplica y no es extra)
      if (!esExtra && insp.vivienda_id) {
        const { data: viv } = await supabase
          .from("viviendas")
          .select("direccion, ciudad")
          .eq("id", insp.vivienda_id)
          .maybeSingle();

        setVivienda(viv);
      }

      // 4. Si no es extra, cargamos las fotos mediante helper o tabla
      if (!esExtra) {
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
        <div style={{ height: "100vh", background: FONDO_PRINCIPAL, color: COLOR_DORADO, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <h3 style={TEXTO_DORADO_BRILLO}>Cargando información...</h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: "20px", background: FONDO_PRINCIPAL, minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", paddingBottom: "80px" }}>
        
        <Link to="/cliente/inspecciones" style={{ ...TEXTO_DORADO_BRILLO, textDecoration: "none", fontWeight: "700", display: "inline-block", marginBottom: "20px" }}>
          ← Volver a Mis Informes
        </Link>

        {errorMsg && (
          <div style={{ padding: "14px", background: "rgba(255,107,107,0.2)", border: "1px solid #ff6b6b", color: "#ff6b6b", borderRadius: "12px", textAlign: "center", marginBottom: "20px", boxShadow: "0 0 15px rgba(255,107,107,0.2)" }}>
            {errorMsg}
          </div>
        )}

        {inspeccion && (
          <>
            <div style={{ background: FONDO_TARJETA, padding: "18px", borderRadius: "16px", border: BORDE_DORADO_INTENSO, marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: SOMBRA_LUXURY }}>
              <div>
                <h2 style={{ ...TEXTO_DORADO_BRILLO, fontSize: "18px", margin: 0, fontWeight: "900" }}>
                  Informe #{String(inspeccion.id).slice(0, 8)}
                </h2>
                <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
                  Fecha: {inspeccion.fecha ? String(inspeccion.fecha).slice(0, 10) : "-"}
                </span>
              </div>
              <span style={{ padding: "6px 12px", border: BORDE_DORADO_FINO, background: "rgba(224, 176, 52, 0.1)", color: COLOR_DORADO, borderRadius: "20px", fontSize: "11px", fontWeight: "900", textTransform: "uppercase", boxShadow: "0 0 10px rgba(224,176,52,0.3)" }}>
                {inspeccion.estado}
              </span>
            </div>

            <div style={{ background: FONDO_TARJETA, padding: "18px", borderRadius: "16px", border: BORDE_DORADO_FINO, marginBottom: "20px", boxShadow: SOMBRA_LUXURY }}>
              <h4 style={{ color: COLOR_DORADO, fontSize: "12px", textTransform: "uppercase", marginBottom: "8px", fontWeight: "800", letterSpacing: "1px" }}>Ubicación / Vivienda</h4>
              <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#fff" }}>
                {vivienda?.direccion || inspeccion.direccion || "Dirección no especificada"}
              </p>
            </div>

            <div style={{ background: FONDO_TARJETA, padding: "18px", borderRadius: "16px", border: BORDE_DORADO_FINO, marginBottom: "20px", boxShadow: SOMBRA_LUXURY }}>
              <h4 style={{ color: COLOR_DORADO, fontSize: "12px", textTransform: "uppercase", marginBottom: "8px", fontWeight: "800", letterSpacing: "1px" }}>Descripción del Trabajo / Observaciones</h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#e2e8f0", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                {inspeccion.notas_tecnico || "Sin observaciones registradas."}
              </p>

              {inspeccion.materiales && (
                <p style={{ margin: "12px 0 0 0", fontSize: "13px", color: "#cbd5e1" }}>
                  <strong style={{ color: COLOR_DORADO }}>Materiales usados:</strong> {inspeccion.materiales}
                </p>
              )}
              {inspeccion.tiempo_empleado && (
                <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#cbd5e1" }}>
                  <strong style={{ color: COLOR_DORADO }}>Tiempo empleado:</strong> {inspeccion.tiempo_empleado}
                </p>
              )}
            </div>

            <div style={{ background: FONDO_TARJETA, padding: "18px", borderRadius: "16px", border: BORDE_DORADO_FINO, marginBottom: "20px", boxShadow: SOMBRA_LUXURY }}>
              <h4 style={{ color: COLOR_DORADO, fontSize: "12px", textTransform: "uppercase", marginBottom: "12px", fontWeight: "800", letterSpacing: "1px" }}>Fotografías Adjuntas</h4>
              {fotos.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>No hay fotografías adjuntas a este informe.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
                  {fotos.map((foto, idx) => {
                    const imgUrl = obtenerUrlPublica(foto);
                    return (
                      <div
                        key={idx}
                        onClick={() => imgUrl && setFotoModal(imgUrl)}
                        style={{ cursor: "pointer", borderRadius: "12px", overflow: "hidden", border: BORDE_DORADO_FINO, boxShadow: "0 4px 10px rgba(0,0,0,0.5)", transition: "transform 0.2s" }}
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

            <button 
              onClick={borrarInforme}
              style={{ width: "100%", padding: "14px", background: "rgba(255, 71, 87, 0.15)", color: "#ff4757", border: "1px solid rgba(255, 71, 87, 0.4)", borderRadius: "16px", fontWeight: "900", fontSize: "14px", cursor: "pointer", marginBottom: "12px", boxShadow: "0 4px 15px rgba(255, 71, 87, 0.2)" }}
            >
              🗑️ Borrar este informe
            </button>
          </>
        )}

        {fotoModal && (
          <div
            onClick={() => setFotoModal(null)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(3, 5, 9, 0.92)",
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
                  background: DEGRADADO_AZUL_BOTON,
                  border: BORDE_DORADO_FINO,
                  color: "#fff",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "900",
                  cursor: "pointer",
                  boxShadow: "0 0 15px rgba(56, 189, 248, 0.4)",
                }}
              >
                ✕ Cerrar
              </button>
              <img
                src={fotoModal}
                alt="Foto ampliada"
                style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "14px", objectFit: "contain", border: BORDE_DORADO_INTENSO, boxShadow: "0 0 30px rgba(224,176,52,0.3)" }}
              />
            </div>
          </div>
        )}
      </div>
    </Menu>
  );
}
