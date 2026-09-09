import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

const COLOR_DORADO = "#e0b034";
const FONDO_PRINCIPAL = "#030509";
const FONDO_TARJETA = "linear-gradient(145deg, #0b1320 0%, #04070d 100%)";
const BORDE_DORADO_FINO = "1px solid rgba(224, 176, 52, 0.4)";
const SOMBRA_LUXURY = "0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 20px rgba(224, 176, 52, 0.12)";
const TEXTO_DORADO_BRILLO = { color: COLOR_DORADO, textShadow: "0 0 12px rgba(224, 176, 52, 0.6)" };

export default function Contratos() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    cargarContratos();
  }, []);

  const cargarContratos = async () => {
    try {
      setLoading(true);
      setError("");
      const { data, error: err } = await supabase
        .from("contratos")
        .select(`
          *,
          clientes ( id, nombre, email, direccion ),
          viviendas ( id, ciudad, direccion, localidad )
        `)
        .order("id", { ascending: false });

      if (err) throw err;
      setContratos(data || []);
    } catch (err) {
      console.error("Error cargando contratos:", err);
      setError("No se pudieron cargar los contratos.");
    } finally {
      setLoading(false);
    }
  };

  const enviarContratoEmail = async (contrato) => {
    try {
      setActionLoading(contrato.id);

      // 1. Cambiar el estado en la base de datos a enviado_cliente
      const { error: errUpdate } = await supabase
        .from("contratos")
        .update({ estado: "enviado_cliente" })
        .eq("id", contrato.id);

      if (errUpdate) throw errUpdate;

      // 2. Enviar parámetros en snake_case y camelCase para compatibilidad con la Edge Function
      const { error: errEmail } = await supabase.functions.invoke("enviar-email", {
        body: {
          contrato_id: Number(contrato.id),
          contratoId: Number(contrato.id),
          id: Number(contrato.id),
          tipo: "contrato"
        }
      });

      if (errEmail) {
        console.warn("Aviso al enviar email:", errEmail);
        alert("El estado se actualizó a 'Enviado al cliente', pero el servicio de correo devolvió una advertencia.");
      } else {
        alert("¡Contrato enviado por correo al cliente con éxito!");
      }

      await cargarContratos();
    } catch (err) {
      console.error("Error al enviar contrato:", err);
      alert("Error al procesar el envío: " + (err.message || ""));
    } finally {
      setActionLoading(null);
    }
  };

  const borrarContrato = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este contrato?")) return;
    try {
      setActionLoading(id);
      const { error: err } = await supabase.from("contratos").delete().eq("id", id);
      if (err) throw err;
      setContratos((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error borrando contrato:", err);
      alert("No se pudo eliminar el contrato.");
    } finally {
      setActionLoading(null);
    }
  };

  const obtenerBadgeEstado = (estado) => {
    const est = String(estado || "").toLowerCase();
    
    if (est === "firmado") {
      return { 
        texto: "✅ FIRMADO", 
        color: "#34d399", 
        bg: "rgba(52, 211, 153, 0.2)", 
        border: "rgba(52, 211, 153, 0.5)" 
      };
    }
    if (est === "enviado_cliente" || est === "enviado_al_cliente" || est === "enviada") {
      return { 
        texto: "📩 ENVIADO AL CLIENTE", 
        color: "#60a5fa", 
        bg: "rgba(96, 165, 250, 0.2)", 
        border: "rgba(96, 165, 250, 0.5)" 
      };
    }
    // Mapea 'enviado_al_admin', 'pendiente' o valores nulos a PENDIENTE
    return { 
      texto: "⏳ PENDIENTE", 
      color: COLOR_DORADO, 
      bg: "rgba(224, 176, 52, 0.2)", 
      border: "rgba(224, 176, 52, 0.5)" 
    };
  };

  return (
    <Menu>
      <div style={estilos.pagina}>
        <h1 style={estilos.titulo}>📋 Panel de Contratos (Admin)</h1>

        <button onClick={() => navigate("/contratos/crear")} style={estilos.botonCrear}>
          ➕ Crear Nuevo Contrato
        </button>

        {error && <p style={estilos.error}>{error}</p>}

        {loading ? (
          <p style={estilos.texto}>Cargando contratos...</p>
        ) : contratos.length === 0 ? (
          <p style={estilos.texto}>No hay contratos registrados.</p>
        ) : (
          contratos.map((c) => {
            const badge = obtenerBadgeEstado(c.estado);
            const nombreCliente = c.clientes?.nombre || "Sin cliente";
            const direccionCliente = c.clientes?.direccion || "Sin dirección";
            const direccionVivienda = c.viviendas?.direccion || "Sin vivienda";

            return (
              <div key={c.id} style={estilos.tarjeta}>
                <div style={estilos.infoBloque}>
                  <p style={estilos.lineaInfo}>
                    <span style={estilos.etiqueta}>Cliente:</span> {nombreCliente}
                  </p>
                  <p style={estilos.lineaInfo}>
                    <span style={estilos.etiqueta}>Dirección cliente:</span> {direccionCliente}
                  </p>
                  <p style={estilos.lineaInfo}>
                    <span style={estilos.etiqueta}>Vivienda:</span> {direccionVivienda}
                  </p>
                </div>

                <div style={estilos.cabeceraContrato}>
                  <span style={estilos.numeroContrato}>Contrato #{c.id}</span>
                  <span
                    style={{
                      ...estilos.badge,
                      color: badge.color,
                      backgroundColor: badge.bg,
                      borderColor: badge.border,
                    }}
                  >
                    {badge.texto}
                  </span>
                </div>

                <p style={estilos.fechaInfo}>
                  <span style={estilos.etiqueta}>Inicio:</span> {String(c.fecha_inicio || "").slice(0, 10)}
                </p>

                <div style={estilos.gridBotones}>
                  <button
                    onClick={() => navigate(`/contratos/ver/${c.id}`)}
                    style={estilos.botonGris}
                  >
                    🔍 Ver Ficha
                  </button>

                  <button
                    onClick={() => {
                      if (c.pdf_url) window.open(c.pdf_url, "_blank");
                      else alert("El PDF aún no ha sido generado.");
                    }}
                    style={estilos.botonGris}
                  >
                    📄 Ver PDF
                  </button>
                </div>

                <button
                  onClick={() => borrarContrato(c.id)}
                  disabled={actionLoading === c.id}
                  style={estilos.botonBorrar}
                >
                  🗑️
                </button>

                <button
                  onClick={() => navigate(`/contratos/ver/${c.id}`)}
                  style={estilos.botonVerde}
                >
                  📄 Generar PDF / Ver Contrato
                </button>

                <button
                  onClick={() => enviarContratoEmail(c)}
                  disabled={actionLoading === c.id}
                  style={estilos.botonAzul}
                >
                  ✉️ Enviar Contrato por Email
                </button>
              </div>
            );
          })
        )}
      </div>
    </Menu>
  );
}

const estilos = {
  pagina: {
    padding: "20px",
    background: FONDO_PRINCIPAL,
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Inter, sans-serif",
    paddingBottom: "100px",
    boxSizing: "border-box",
  },
  titulo: {
    ...TEXTO_DORADO_BRILLO,
    fontSize: "20px",
    fontWeight: "900",
    marginBottom: "20px",
    textAlign: "center",
  },
  botonCrear: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)",
    color: "#fff",
    border: BORDE_DORADO_FINO,
    borderRadius: "14px",
    fontWeight: "900",
    fontSize: "14px",
    cursor: "pointer",
    marginBottom: "20px",
    boxShadow: "0 4px 15px rgba(56, 189, 248, 0.3)",
  },
  tarjeta: {
    background: FONDO_TARJETA,
    border: BORDE_DORADO_FINO,
    borderRadius: "16px",
    padding: "16px",
    marginBottom: "16px",
    boxShadow: SOMBRA_LUXURY,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    boxSizing: "border-box",
  },
  infoBloque: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  lineaInfo: {
    margin: 0,
    fontSize: "13px",
    color: "#e2e8f0",
  },
  etiqueta: {
    color: "#94a3b8",
    fontWeight: "600",
  },
  cabeceraContrato: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
  },
  numeroContrato: {
    fontSize: "16px",
    fontWeight: "900",
    color: "#38bdf8",
  },
  badge: {
    fontSize: "11px",
    fontWeight: "800",
    border: "1px solid",
    borderRadius: "20px",
    padding: "4px 10px",
    textTransform: "uppercase",
  },
  fechaInfo: {
    margin: 0,
    fontSize: "13px",
    color: "#e2e8f0",
  },
  gridBotones: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "4px",
  },
  botonGris: {
    padding: "10px",
    background: "#2a2d3d",
    color: "#fff",
    border: "1px solid #3f4459",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer",
  },
  botonBorrar: {
    width: "100%",
    padding: "10px",
    background: "rgba(220, 38, 38, 0.2)",
    border: "1px solid rgba(220, 38, 38, 0.5)",
    color: "#ef4444",
    borderRadius: "10px",
    fontWeight: "800",
    fontSize: "14px",
    cursor: "pointer",
  },
  botonVerde: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #10b981 0%, #047857 100%)",
    color: "#fff",
    border: "1px solid rgba(16, 185, 129, 0.5)",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
  },
  botonAzul: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    color: "#fff",
    border: "1px solid rgba(59, 130, 246, 0.5)",
    borderRadius: "12px",
    fontWeight: "800",
    fontSize: "13px",
    cursor: "pointer",
  },
  texto: {
    color: "#aaa",
    fontSize: "13px",
    textAlign: "center",
  },
  error: {
    marginBottom: "16px",
    padding: "12px",
    background: "rgba(239, 68, 68, 0.15)",
    border: "1px solid rgba(239, 68, 68, 0.4)",
    color: "#ef4444",
    borderRadius: "12px",
    fontWeight: "700",
    textAlign: "center",
    fontSize: "13px",
  },
};
