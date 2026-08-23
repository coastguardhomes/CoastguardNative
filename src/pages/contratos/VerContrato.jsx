import React, { useEffect, useState } from "react";
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
        .eq("id", id)
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
        { body: { contratoId: Number(id) } }
      );

      if (pdfError) {
        alert("Error generando PDF.");
        return;
      }

      const pdfUrl = pdfData?.pdf_url;
      if (!pdfUrl) {
        alert("La función no devolvió una URL válida.");
        return;
      }

      await supabase
        .from("contratos")
        .update({ pdf_url: pdfUrl })
        .eq("id", id);

      await cargarContrato();
      alert("PDF regenerado correctamente.");
    } catch (e) {
      console.error(e);
      alert("Error regenerando el PDF.");
    } finally {
      setGenerando(false);
    }
  };

  const enviarEmail = async () => {
    try {
      await supabase.functions.invoke("enviar-email", {
        body: { contratoId: Number(id) },
      });

      alert("Email enviado al cliente.");
    } catch (e) {
      console.error(e);
      alert("Error enviando email.");
    }
  };

  const abrirPDF = () => {
    if (!contrato?.pdf_url) {
      alert("Este contrato no tiene PDF generado.");
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
            }}
          >
            <p style={{ color: "#ff4d4d", marginBottom: "10px" }}>{errorMsg}</p>
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
              }}
            >
              <h3 style={{ color: "#4db8ff", marginBottom: "10px" }}>
                🧾 Información del contrato
              </h3>

              <p><strong>Cliente:</strong> {contrato.clientes?.nombre}</p>
              <p><strong>Email:</strong> {contrato.clientes?.email}</p>
              <p><strong>Vivienda:</strong> {contrato.viviendas?.direccion}</p>
              <p><strong>Modalidad:</strong> {contrato.modalidad}</p>
              <p><strong>Precio:</strong> {contrato.precio} €/mes</p>
              <p><strong>Frecuencia:</strong> Cada {contrato.frecuencia} días</p>
              <p><strong>Inicio:</strong> {contrato.fecha_inicio}</p>
              <p><strong>Fin:</strong> {contrato.fecha_fin}</p>
              <p><strong>Estado:</strong> {contrato.estado}</p>
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
                }}
              >
                {generando ? "⌛ Regenerando PDF..." : "📄 Regenerar PDF Premium"}
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
              <p style={{ textAlign: "center", color: "#ff4d4d" }}>
                Este contrato aún no tiene PDF generado.
              </p>
            )}
          </>
        )}
      </div>
    </Menu>
  );
}
