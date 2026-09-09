import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function VerContrato() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    cargarContrato();
  }, [id]);

  const cargarContrato = async () => {
    try {
      setCargando(true);
      setErrorMsg(null);

      const { data, error } = await supabase
        .from("contratos")
        .select("*, clientes(nombre, email), viviendas(direccion)")
        .eq("id", Number(id))
        .single();

      if (error || !data) {
        setErrorMsg("No se encontró el contrato.");
        setContrato(null);
      } else {
        setContrato(data);
      }
    } catch (err) {
      console.error("Error cargando contrato:", err);
      setErrorMsg("Error cargando el contrato.");
      setContrato(null);
    } finally {
      setCargando(false);
    }
  };

  const regenerarPDF = async () => {
    try {
      setGenerando(true);

      const { data: pdfData, error: pdfError } = await supabase.functions.invoke(
        "contrato-pdf",
        { body: { contratoId: Number(id), id: Number(id) } }
      );

      if (pdfError) {
        console.warn("Aviso al invocar contrato-pdf:", pdfError);
      }

      const pdfUrl = pdfData?.pdf_url || pdfData?.pdfUrl;
      
      if (pdfUrl) {
        await supabase
          .from("contratos")
          .update({ pdf_url: pdfUrl })
          .eq("id", Number(id));

        await cargarContrato();
        alert("PDF procesado y actualizado correctamente.");
      } else {
        await cargarContrato();
        alert("Proceso de contrato completado.");
      }
    } catch (e) {
      console.error(e);
      alert("Error procesando la solicitud del PDF.");
    } finally {
      setGenerando(false);
    }
  };

  const enviarEmail = async () => {
    try {
      const { error: errEmail } = await supabase.functions.invoke("enviar-email", {
        body: { contratoId: Number(id), id: Number(id), tipo: "contrato" },
      });

      if (errEmail) {
        console.warn("Aviso al enviar email:", errEmail);
        alert("El correo devolvió una advertencia, verifica el buzón.");
      } else {
        alert("¡Email enviado al cliente con éxito!");
      }
    } catch (e) {
      console.error(e);
      alert("Error enviando email.");
    }
  };

  const abrirPDF = () => {
    if (!contrato?.pdf_url) {
      alert("Este contrato aún no tiene PDF generado.");
      return;
    }

    window.open(contrato.pdf_url, "_blank");
  };

  return (
    <Menu>
      <div
        style={{
          minHeight: "100vh",
          background: "#0a0f1a",
          padding: "20px",
          color: "#fff",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "10px 16px",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "8px",
            cursor: "pointer",
            marginBottom: "15px",
            fontWeight: "600",
          }}
        >
          ⬅️ Volver
        </button>

        <h2
          style={{
            textAlign: "center",
            color: "#4db8ff",
            marginBottom: "15px",
            fontSize: "26px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          📄 Contrato Legal Premium #{id}
        </h2>

        {cargando ? (
          <p style={{ textAlign: "center", color: "#94a3b8" }}>
            Cargando contrato...
          </p>
        ) : errorMsg ? (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              background: "#1a2332",
              borderRadius: "12px",
              border: "1px solid rgba(255,77,77,0.3)",
            }}
          >
            <p style={{ color: "#ff4d4d", marginBottom: "10px", fontWeight: "600" }}>{errorMsg}</p>
          </div>
        ) : (
          <>
            {/* DATOS DEL CONTRATO */}
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "20px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.1)",
                marginBottom: "20px",
                boxShadow: "0 0 12px rgba(0,153,255,0.2)",
              }}
            >
              <h3 style={{ color: "#4db8ff", marginBottom: "12px", fontSize: "18px" }}>
                🧾 Información del contrato
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "15px" }}>
                <p><strong>Cliente:</strong> {contrato.clientes?.nombre || "Sin cliente"}</p>
                <p><strong>Email:</strong> {contrato.clientes?.email || "Sin email"}</p>
                <p><strong>Vivienda:</strong> {contrato.viviendas?.direccion || "Sin dirección"}</p>
                <p><strong>Modalidad:</strong> {contrato.modalidad || "N/D"}</p>
                <p><strong>Precio:</strong> {contrato.precio} €/mes</p>
                <p><strong>Frecuencia:</strong> Cada {contrato.frecuencia} días</p>
                <p><strong>Inicio:</strong> {String(contrato.fecha_inicio || "").slice(0, 10)}</p>
                <p><strong>Fin:</strong> {String(contrato.fecha_fin || "").slice(0, 10)}</p>
                <p><strong>Estado:</strong> {contrato.estado}</p>
              </div>
            </div>

            {/* BOTONES PREMIUM */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={regenerarPDF}
                disabled={generando}
                style={{
                  padding: "12px",
                  background: "#22c55e",
                  color: "#fff",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                  opacity: generando ? 0.6 : 1,
                  boxShadow: "0 0 10px rgba(34,197,94,0.3)",
                }}
              >
                {generando ? "⌛ Procesando PDF..." : "📄 Actualizar PDF Premium"}
              </button>

              <button
                onClick={enviarEmail}
                style={{
                  padding: "12px",
                  background: "#4db8ff",
                  color: "#000",
                  borderRadius: "10px",
                  border: "none",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 0 10px rgba(0,153,255,0.4)",
                }}
              >
                📧 Enviar contrato al cliente
              </button>

              <button
                onClick={abrirPDF}
                style={{
                  padding: "12px",
                  background: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.3)",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                🔎 Abrir PDF en nueva pestaña
              </button>
            </div>

            {/* VISOR PDF PREMIUM */}
            {contrato.pdf_url ? (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <iframe
                  src={contrato.pdf_url}
                  title={`Contrato ${id}`}
                  style={{
                    width: "100%",
                    maxWidth: "800px",
                    height: "80vh",
                    border: "none",
                    borderRadius: 12,
                    background: "#ffffff",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                  }}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#ff4d4d", fontWeight: "600" }}>
                Este contrato aún no tiene PDF generado. Usa el botón verde para generarlo.
              </p>
            )}
          </>
        )}
      </div>
    </Menu>
  );
}
