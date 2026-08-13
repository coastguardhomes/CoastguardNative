import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import Menu from "../../layouts/Menu";

const COLOR_DORADO = "#e0b034";
const COLOR_BRILLO_DORADO = "rgba(224, 176, 52, 0.5)";
const FONDO_TARJETA = "linear-gradient(145deg, #0d1626 0%, #05080f 100%)";
const FONDO_PRINCIPAL = "#030509";
const BORDE_DORADO = `1px solid ${COLOR_DORADO}`;
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: `0 0 8px ${COLOR_BRILLO_DORADO}` };

export default function ClienteInspeccionesLista() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inspecciones, setInspecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    async function cargarInspecciones() {
      if (!user) return;

      try {
        setLoading(true);
        setErrorMsg(null);

        let { data: clienteData } = await supabase
          .from("clientes")
          .select("id")
          .eq("usuario_id", user.id)
          .maybeSingle();

        if (!clienteData) {
          const { data: clienteById } = await supabase
            .from("clientes")
            .select("id")
            .eq("id", user.id)
            .maybeSingle();
          clienteData = clienteById;
        }

        if (!clienteData) {
          setErrorMsg("No se encontró el perfil de cliente asociado.");
          setLoading(false);
          return;
        }

        const { data: dataInspecciones, error: errInspecciones } = await supabase
          .from("inspecciones")
          .select("*")
          .eq("cliente_id", clienteData.id)
          .order("created_at", { ascending: false });

        if (errInspecciones) throw errInspecciones;

        if (dataInspecciones && dataInspecciones.length > 0) {
          const viviendaIds = [...new Set(dataInspecciones.map(i => i.vivienda_id).filter(Boolean))];

          let viviendasMap = {};
          if (viviendaIds.length > 0) {
            const { data: dataViviendas } = await supabase
              .from("viviendas")
              .select("id, direccion, ciudad, localidad, alias")
              .in("id", viviendaIds);

            if (dataViviendas) {
              viviendasMap = dataViviendas.reduce((acc, viv) => {
                acc[viv.id] = viv;
                return acc;
              }, {});
            }
          }

          const inspeccionesCompletas = dataInspecciones.map(item => ({
            ...item,
            viviendas: item.viviendas || viviendasMap[item.vivienda_id] || null
          }));

          setInspecciones(inspeccionesCompletas);
        } else {
          setInspecciones([]);
        }
      } catch (err) {
        console.error("Error al obtener inspecciones:", err);
        setErrorMsg("Error al consultar las inspecciones en la base de datos.");
      } finally {
        setLoading(false);
      }
    }

    cargarInspecciones();
  }, [user]);

  return (
    <Menu>
      <div style={{ width: "100%", minHeight: "100vh", background: FONDO_PRINCIPAL, padding: "15px", fontFamily: "'Inter', sans-serif", color: "#fff", boxSizing: "border-box", paddingBottom: "110px" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "800", ...TEXTO_DORADO_BRILLO, margin: 0 }}>MIS INSPECCIONES</h1>
        </div>

        {loading && <div style={{ textAlign: "center", padding: "40px 0", color: COLOR_DORADO }}>Cargando...</div>}

        {!loading && !errorMsg && inspecciones.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {inspecciones.map((item, index) => {
              const direccionReal = item.viviendas?.direccion || item.viviendas?.alias || item.direccion;
              const localidadReal = item.viviendas?.ciudad || item.viviendas?.localidad || item.localidad || item.ciudad || "No especificada";
              
              const fechaObj = item.fecha ? new Date(item.fecha) : (item.created_at ? new Date(item.created_at) : null);
              const fechaFormateada = fechaObj ? fechaObj.toLocaleDateString("es-ES") : "Sin fecha";

              // LÓGICA DE NUMERACIÓN CORREGIDA: La más antigua (última del array) es la 01
              const numeroCorrelativo = String(inspecciones.length - index).padStart(2, '0');
              
              const titulo = `Inspección Nº ${numeroCorrelativo} (${fechaFormateada})`;

              return (
                <div key={item.id} onClick={() => navigate(`/cliente/inspeccion/${item.id}`)}
                  style={{ background: FONDO_TARJETA, border: BORDE_DORADO, borderRadius: "12px", padding: "14px", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
                  <div style={{ marginBottom: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "700", color: "#4db8ff", lineHeight: "1.3" }}>{titulo}</span>
                      <span style={{ fontSize: "10px", fontWeight: "800", padding: "3px 8px", borderRadius: "12px", textTransform: "uppercase", background: "rgba(224, 176, 52, 0.2)", color: COLOR_DORADO, border: BORDE_DORADO }}>
                        {item.estado || "Pendiente"}
                      </span>
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "13px", color: "#e2e8f0" }}><strong>Dirección:</strong> {direccionReal || "No especificada"}</div>
                    <div style={{ marginTop: "2px", fontSize: "12px", color: "#94a3b8" }}><strong>Localidad:</strong> {localidadReal}</div>
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b", display: "flex", justifyContent: "space-between", marginTop: "10px", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px" }}>
                    <span>Fecha: {fechaFormateada}</span>
                    <span style={{ color: COLOR_DORADO, fontWeight: "600" }}>Ver detalle →</span>
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
