import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function ClienteFirmaDibujar({ contratoId: propContratoId, onFirmaGuardada }) {
  const { id: routeContratoId } = useParams();
  const contratoId = propContratoId || routeContratoId;
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [hayFirma, setHayFirma] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 220;
    }
  }, []);

  const obtenerCoordenadas = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const iniciarTrazo = (e) => {
    setIsDrawing(true);
    setHayFirma(true);
    const { x, y } = obtenerCoordenadas(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const dibujar = (e) => {
    if (!isDrawing) return;
    if (e.touches) e.preventDefault();

    const { x, y } = obtenerCoordenadas(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const detenerTrazo = () => setIsDrawing(false);

  const limpiarLienzo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHayFirma(false);
  };

  const guardarFirma = async () => {
    if (!hayFirma) {
      alert("Por favor, realiza tu firma antes de guardar.");
      return;
    }

    if (!contratoId) {
      alert("Error: No se encontró el ID del contrato.");
      return;
    }

    setGuardando(true);

    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas.toDataURL("image/png");
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const fileName = `firmas/firma_contrato_${contratoId}_${Date.now()}.png`;

      const { error: storageError } = await supabase.storage
        .from("contratos")
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: true,
        });

      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage
        .from("contratos")
        .getPublicUrl(fileName);

      // Actualizar solo las columnas existentes
      const { error: updateError } = await supabase
        .from("contratos")
        .update({
          firma_url: publicUrl,
          estado: "firmado",
        })
        .eq("id", contratoId);

      if (updateError) throw updateError;

      alert("¡Contrato firmado y guardado con éxito!");

      if (onFirmaGuardada) {
        onFirmaGuardada(publicUrl);
      } else {
        navigate(`/cliente/contrato/${contratoId}`);
      }
    } catch (err) {
      console.error("Error al guardar la firma:", err);
      alert("Error guardando la firma: " + (err.message || "Error desconocido"));
    } finally {
      setGuardando(false);
    }
  };

  const contenido = (
    <div
      style={{
        background: "#0a0f1a",
        minHeight: "100vh",
        padding: "20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#4db8ff",
          marginBottom: "20px",
          fontSize: "26px",
          fontWeight: "700",
        }}
      >
        Firma del Cliente
      </h2>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "18px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <p style={{ color: "#9fb3c8", fontSize: "14px", marginBottom: "12px", textAlign: "center" }}>
          Dibuje su firma con el dedo dentro del recuadro blanco:
        </p>

        <div
          style={{
            background: "#ffffff",
            borderRadius: "10px",
            overflow: "hidden",
            touchAction: "none",
            width: "100%",
          }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={iniciarTrazo}
            onMouseMove={dibujar}
            onMouseUp={detenerTrazo}
            onMouseLeave={detenerTrazo}
            onTouchStart={iniciarTrazo}
            onTouchMove={dibujar}
            onTouchEnd={detenerTrazo}
            style={{ display: "block", width: "100%", cursor: "crosshair" }}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
          <button
            onClick={limpiarLienzo}
            disabled={guardando}
            style={{
              flex: 1,
              background: "transparent",
              border: "1px solid #ff4d4d",
              color: "#ff4d4d",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            🗑️ Limpiar
          </button>

          <button
            onClick={guardarFirma}
            disabled={guardando || !hayFirma}
            style={{
              flex: 2,
              background: guardando || !hayFirma ? "rgba(77, 184, 255, 0.4)" : "#4db8ff",
              color: "#0a0f1a",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "15px",
              cursor: guardando || !hayFirma ? "not-allowed" : "pointer",
            }}
          >
            {guardando ? "Guardando..." : "💾 Guardar firma"}
          </button>
        </div>
      </div>
    </div>
  );

  return propContratoId ? contenido : <Menu>{contenido}</Menu>;
              }
              
