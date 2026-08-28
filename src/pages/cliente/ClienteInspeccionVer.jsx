import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";
import { useLanguage } from "../../context/LanguageContext";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const BORDE_DORADO_INTENSO = "1px solid rgba(224, 176, 52, 0.8)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.2)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 15px rgba(224, 176, 52, 0.7)" };
const DEGRADADO_AZUL_BOTON = "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)";

export default function ClienteInspeccionVer() {
  const { t } = useLanguage();
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

  const parsearFotos = (fotosRaw) => {
    if (!fotosRaw) return [];
    if (Array.isArray(fotosRaw)) return fotosRaw;
    if (typeof fotosRaw === "string") {
      try {
        const parsed = JSON.parse(fotosRaw);
        if (Array.isArray(parsed)) return parsed;
        return [parsed];
      } catch {
        return fotosRaw.trim() ? [fotosRaw] : [];
      }
    }
    return [];
  };

  async function cargarDetalles() {
    setLoading(true);
    setErrorMsg("");
    try {
      const { data: clienteData } = await supabase
        .from("clientes")
        .select("id")
        .eq("usuario_id", user.id)
        .maybeSingle();

      if (!clienteData) {
        setErrorMsg(t("perfilClienteNoEncontrado"));
        setLoading(false);
        return;
      }

      const clienteId = clienteData.id;

      let { data: insp } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .eq("cliente_id", clienteId)
        .maybeSingle();

      let fotosEncontradas = [];

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
          fotosEncontradas = parsearFotos(dataExtra.fotos);

          // Búsqueda robusta de fotos asociadas al extra en la tabla fotos
          if (fotosEncontradas.length === 0) {
            const { data: fotosTabla } = await supabase
              .from("fotos")
              .select("*")
              .or(`extra_id.eq.${id},factura_id.eq.${id},inspeccion_id.eq.${id}`);
            if (fotosTabla && fotosTabla.length > 0) {
              fotosEncontradas = fotosTabla;
            }
          }

          // Marcar alerta como vista en ambas tablas para limpiar el contador del dashboard
          await supabase
            .from("extras")
            .update({ alerta_vista: true })
            .eq("id", id);

          await supabase
            .from("facturas")
            .update({ alerta_vista: true })
            .eq("id", id);
        }
      } else {
        if (insp.fotos) {
          fotosEncontradas = parsearFotos(insp.fotos);
        }

        if (fotosEncontradas.length === 0) {
          try {
            const fotosCargadas = await cargarFotosInspeccion(id);
            if (fotosCargadas && fotosCargadas.length > 0) {
              fotosEncontradas = fotosCargadas;
            }
          } catch {
            // Ignorar fallback de helper
          }
        }

        if (fotosEncontradas.length === 0) {
          const { data: fotosData } = await supabase
            .from("fotos")
            .select("*")
            .eq("inspeccion_id", String(id));
          if (fotosData) fotosEncontradas = fotosData;
        }

        // Marcar alerta como vista en inspecciones normales si aplica
        if (insp.alerta && !insp.alerta_vista) {
          await supabase
            .from("inspecciones")
            .update({ alerta_vista: true })
            .eq("id", id);
        }
      }

      if (!insp) {
        setErrorMsg(t("informeNoEncontradoPermisos"));
        setLoading(false);
        return;
      }

      setInspeccion(insp);
      setFotos(fotosEncontradas);

      if (!esExtra && insp.vivienda_id) {
        const { data: viv } = await supabase
          .from("viviendas")
          .select("direccion, ciudad")
          .eq("id", insp.vivienda_id)
          .maybeSingle();

        setVivienda(viv);
      }

    } catch (err) {
      console.error("Error al cargar detalles:", err);
      setErrorMsg(t("errorConexionCargarInformacion"));
    } finally {
      setLoading(false);
    }
  }

  async function borrarInforme() {
    if (!window.confirm(t("confirmarBorrarInforme"))) return;

    try {
      const tablaDestino = esExtra ? "extras" : "inspecciones";
      const { error } = await supabase
        .from(tablaDestino)
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert(t("informeEliminadoExito"));
      navigate("/cliente/inspecciones");
    } catch (err) {
      console.error("Error al borrar:", err);
      alert(t("errorEliminarInforme"));
    }
  }

  function obtenerUrlPublica(foto) {
    if (!foto) return "";
    const rawUrl = typeof foto === "string" ? foto : (foto.url_foto || foto.url || foto.path || foto.foto_url || "");
    if (!rawUrl) return "";
    
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") || rawUrl.startsWith("data:")) {
      return rawUrl;
    }
    
    const bucket = esExtra ? "extras" : "inspecciones";
    const { data } = supabase.storage.from(bucket).getPublicUrl(rawUrl);
    return data?.publicUrl || rawUrl;
  }

  if (loading) {
    return (
      <Menu>
        <div style={{ height: "100vh", background: FONDO_PRINCIPAL, color: COLOR_DORADO, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <h3 style={TEXTO_DORADO_BRILLO}>{t("cargandoInformacion")}</h3>
        </div>
      </Menu>
    );
  }

  return (
    <Menu>
      <div style={{ padding: "20px", background: FONDO_PRINCIPAL, minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif", paddingBottom: "80px" }}>
        
        <Link to="/cliente/inspecciones" style={{ ...TEXTO_DORADO_BRILLO, textDecoration: "none", fontWeight: "700", display: "inline-block", marginBottom: "20px" }}>
          {t("volverMisInformes")}
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
                  {t("informeLabel")} #{String(inspeccion.id).slice(0, 8)}
                </h2>
                <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
                  {t("fecha")}: {inspeccion.fecha ? String(inspeccion.fecha).slice(0, 10) : "-"}
                </span>
              </div>
              <span style={{ padding: "6px 12px", border: BORDE_DORADO_FINO, background: "rgba(224, 176, 52, 0.1)", color: COLOR_DORADO, borderRadius: "20px", fontSize: "11px", fontWeight: "900", textTransform: "uppercase", boxShadow: "0 0 10px rgba(224,176,52,0.3)" }}>
                {inspeccion.estado}
              </span>
            </div>

            <div style={{ background: FONDO_TARJETA, padding: "18px", borderRadius: "16px", border: BORDE_DORADO_FINO, marginBottom: "20px", boxShadow: SOMBRA_LUXURY }}>
              <h4 style={{ color: COLOR_DORADO, fontSize: "12px", textTransform: "uppercase", marginBottom: "8px", fontWeight: "800", letterSpacing: "1px" }}>{t("ubicacionVivienda")}</h4>
              <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#fff" }}>
                {vivienda?.direccion || inspeccion.direccion || t("direccionNoEspecificada")}
              </p>
            </div>

            <div style={{ background: FONDO_TARJETA, padding: "18px", borderRadius: "16px", border: BORDE_DORADO_FINO, marginBottom: "20px", boxShadow: SOMBRA_LUXURY }}>
              <h4 style={{ color: COLOR_DORADO, fontSize: "12px", textTransform: "uppercase", marginBottom: "8px", fontWeight: "800", letterSpacing: "1px" }}>{t("descripcionTrabajoObservaciones")}</h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#e2e8f0", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                {inspeccion.notas_tecnico || t("sinObservacionesRegistradas")}
              </p>

              {inspeccion.materiales && (
                <p style={{ margin: "12px 0 0 0", fontSize: "13px", color: "#cbd5e1" }}>
                  <strong style={{ color: COLOR_DORADO }}>{t("materialesUsados")}</strong> {inspeccion.materiales}
                </p>
              )}
              {inspeccion.tiempo_empleado && (
                <p style={{ margin: "6px 0 0 0", fontSize: "13px", color: "#cbd5e1" }}>
                  <strong style={{ color: COLOR_DORADO }}>{t("tiempoEmpleadoLabel")}</strong> {inspeccion.tiempo_empleado}
                </p>
              )}
            </div>

            <div style={{ background: FONDO_TARJETA, padding: "18px", borderRadius: "16px", border: BORDE_DORADO_FINO, marginBottom: "20px", boxShadow: SOMBRA_LUXURY }}>
              <h4 style={{ color: COLOR_DORADO, fontSize: "12px", textTransform: "uppercase", marginBottom: "12px", fontWeight: "800", letterSpacing: "1px" }}>{t("fotografiasAdjuntas")}</h4>
              {fotos.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>{t("noHayFotografiasInforme")}</p>
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

            {inspeccion.pdf_url && (
              <a
                href={inspeccion.pdf_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "14px",
                  background: DEGRADADO_AZUL_BOTON,
                  border: BORDE_DORADO_INTENSO,
                  color: "#ffffff",
                  borderRadius: "16px",
                  fontWeight: "900",
                  textDecoration: "none",
                  boxShadow: "0 6px 20px rgba(56, 189, 248, 0.4), 0 0 15px rgba(224, 176, 52, 0.3)",
                  marginBottom: "16px"
                }}
              >
                {t("verInformePdf")}
              </a>
            )}

            <button 
              onClick={borrarInforme}
              style={{ width: "100%", padding: "14px", background: "rgba(255, 71, 87, 0.15)", color: "#ff4757", border: "1px solid rgba(255, 71, 87, 0.4)", borderRadius: "16px", fontWeight: "900", fontSize: "14px", cursor: "pointer", marginBottom: "12px", boxShadow: "0 4px 15px rgba(255, 71, 87, 0.2)" }}
            >
              {t("borrarEsteInforme")}
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
                ✕ {t("cerrar")}
              </button>
              <img
                src={fotoModal}
                alt={t("fotoAmpliada")}
                style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "14px", objectFit: "contain", border: BORDE_DORADO_INTENSO, boxShadow: "0 0 30px rgba(224,176,52,0.3)" }}
              />
            </div>
          </div>
        )}
      </div>
    </Menu>
  );
}
