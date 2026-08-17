import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function Contratos() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalHtml, setModalHtml] = useState(null);
  const [generandoId, setGenerandoId] = useState(null);

  useEffect(() => {
    cargarContratos();
  }, []);

  const cargarContratos = async () => {
    setCargando(true);

    const { data, error } = await supabase
      .from("contratos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Error cargando contratos del admin:", error);
    } else {
      setContratos(data || []);
    }

    setCargando(false);
  };

  const generarPDF = async (id) => {
    try {
      setGenerandoId(id);

      const { data, error } = await supabase.functions.invoke("contrato-pdf", {
        body: { contratoId: id },
      });

      if (error) throw error;

      let parsedData = data;

      // Si la respuesta viene como String JSON, la parseamos
      if (typeof data === "string") {
        try {
          parsedData = JSON.parse(data);
        } catch {
          parsedData = data;
        }
      } else if (data instanceof Blob) {
        const text = await data.text();
        try {
          parsedData = JSON.parse(text);
        } catch {
          parsedData = text;
        }
      }

      // Extraer el contenido HTML real del objeto
      const htmlContent = typeof parsedData === "object" ? parsedData?.html : parsedData;

      if (htmlContent) {
        setModalHtml(htmlContent);
      } else {
        alert("No se pudo extraer la vista HTML del documento.");
      }
    } catch (err) {
      console.error("Error al generar PDF:", err);
      alert("Error al generar el contrato: " + (err.message || err));
    } finally {
      setGenerandoId(null);
    }
  };

  const enviarACliente = async (id) => {
    const { error } = await supabase
      .from("contratos")
      .update({ estado: "enviado_al_cliente" })
      .eq("id", id);

    if (error) {
      alert("Error actualizando el estado: " + error.message);
    } else {
      alert("Contrato enviado al cliente.");
      cargarContratos();
    }
  };

  const eliminarContrato = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este contrato?")) return;

    const { error } = await supabase
      .from("contratos")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error al eliminar el contrato: " + error.message);
    } else {
      alert("Contrato eliminado con éxito.");
      cargarContratos();
    }
  };

  const verDocumento = (c) => {
    const rawUrl = c.pdf_url || c.firma_url;

    if (!rawUrl) {
      alert("No hay documento o archivo adjunto disponible para este contrato todavía.");
      return;
    }

    // Si ya es URL completa HTTP/HTTPS la abre directamente
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      window.open(rawUrl, "_blank");
    } else {
      // Limpia la ruta relativa y obtiene la URL pública de Storage
      const cleanPath = rawUrl.replace(/^contratos\//, "");
      const { data: publicData } = supabase.storage
        .from("contratos")
        .getPublicUrl(cleanPath);

      window.open(publicData.publicUrl, "_blank");
    }
  };

  return (
    <Menu>
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0f1a",
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          paddingBottom: "80px",
        }}
      >
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h1
            style={{
              textAlign: "center",
              color: "#4db8ff",
              fontSize: "26px",
              fontWeight: "bold",
              marginBottom: "15px",
            }}
          >
            📋 Panel de Contratos (Admin)
          </h1>

          <button
            onClick={() => navigate("/contratos/nuevo")}
            style={{
              width: "100%",
              padding: "14px",
              background: "#4db8ff",
              color: "#0a0f1a",
              border: "none",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              marginBottom: "20px",
              boxShadow: "0 0 10px rgba(77, 184, 255, 0.4)",
            }}
          >
            ➕ Crear Nuevo Contrato
          </button>

          {cargando ? (
            <p style={{ textAlign: "center" }}>Cargando contratos...</p>
          ) : contratos.length === 0 ? (
            <p style={{ textAlign: "center", opacity: 0.8 }}>
              No hay contratos en la base de datos.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {contratos.map((c) => {
                const esFirmado =
                  c.estado === "firmado" ||
                  c.estado === "activo" ||
                  c.estado === "enviado_al_admin" ||
                  !!c.firma_url;

                return (
                  <div
                    key={c.id}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      padding: "18px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: "18px" }}>
                        Contrato #{c.id}
                      </h3>

                      <span
                        style={{
                          background: esFirmado
                            ? "rgba(76, 217, 100, 0.2)"
                            : "rgba(255, 184, 77, 0.2)",
                          color: esFirmado ? "#4cd964" : "#ffb84d",
                          border: `1px solid ${
                            esFirmado ? "#4cd964" : "#ffb84d"
                          }`,
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {esFirmado
                          ? "✅ FIRMADO"
                          : `⏳ ${c.estado ? c.estado.toUpperCase() : "PENDIENTE"}`}
                      </span>
                    </div>

                    <p
                      style={{
                        margin: "4px 0 14px 0",
                        fontSize: "14px",
                        color: "#9fb3c8",
                      }}
                    >
                      Fecha Inicio: {c.fecha_inicio || "Sin fecha"}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <button
                          onClick={() => navigate(`/contratos/ver/${c.id}`)}
                          style={{
                            flex: 1,
                            padding: "12px",
                            background: "rgba(255,255,255,0.15)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.3)",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          🔍 Ver ficha
                        </button>

                        {!esFirmado && (
                          <button
                            onClick={() => enviarACliente(c.id)}
                            style={{
                              flex: 1,
                              padding: "12px",
                              background: "#4db8ff",
                              color: "#0a0f1a",
                              border: "none",
                              borderRadius: "8px",
                              fontWeight: "bold",
                              cursor: "pointer",
                            }}
                          >
                            🚀 Enviar
                          </button>
                        )}

                        <button
                          onClick={() => verDocumento(c)}
                          style={{
                            flex: 1,
                            padding: "12px",
                            background: "rgba(255,255,255,0.1)",
                            color: "#fff",
                            border: "1px solid rgba(255,255,255,0.2)",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          📄 {esFirmado ? "Ver Firmado" : "Ver Borrador"}
                        </button>

                        <button
                          onClick={() => eliminarContrato(c.id)}
                          style={{
                            padding: "12px 16px",
                            background: "rgba(255, 77, 77, 0.2)",
                            color: "#ff4d4d",
                            border: "1px solid #ff4d4d",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          🗑️ Borrar
                        </button>
                      </div>

                      <button
                        onClick={() => generarPDF(c.id)}
                        disabled={generandoId === c.id}
                        style={{
                          width: "100%",
                          padding: "12px",
                          background: "#22c55e",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "8px",
                          fontWeight: "bold",
                          fontSize: "14px",
                          cursor: "pointer",
                          opacity: generandoId === c.id ? 0.6 : 1,
                        }}
                      >
                        {generandoId === c.id ? "⌛ Generando..." : "📄 Generar PDF / Ver Contrato"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {modalHtml && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.9)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              background: "#0a0f1a",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: "bold", color: "#4db8ff" }}>
              📄 Documento de Contrato
            </span>
            <button
              onClick={() => setModalHtml(null)}
              style={{
                background: "#ff4d4d",
                color: "#fff",
                border: "none",
                padding: "6px 14px",
                borderRadius: "6px",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              ✕ Cerrar
            </button>
          </div>
          <iframe
            title="Vista Contrato"
            srcDoc={modalHtml}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "#ffffff",
            }}
          />
        </div>
      )}
    </Menu>
  );
}
