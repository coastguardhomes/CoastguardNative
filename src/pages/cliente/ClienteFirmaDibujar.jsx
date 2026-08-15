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

  // --- Ajustar el tamaño del canvas al contenedor ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 220;
    }
  }, []);

  // --- Captura de coordenadas para táctil y ratón ---
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
    if (e.touches) e.preventDefault(); // Evita scroll de la pantalla al firmar con el dedo

    const { x, y } = obtenerCoordenadas(e);
    const ctx = canvasRef.current.getContext("2d");
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const detenerTrazo = () => {
    setIsDrawing(false);
  };

  const limpiarLienzo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHayFirma(false);
  };

  // --- Guardar Firma y Notificar al Admin ---
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
      
      // 1. Convertir el canvas a Blob (PNG)
      const dataUrl = canvas.toDataURL("image/png");
      const res = await fetch(dataUrl);
      const blob = await res.blob();

      const fileName = `firmas/firma_contrato_${contratoId}_${Date.now()}.png`;

      // 2. Subir imagen al Bucket 'contratos' en Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from("contratos")
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: true,
        });

      if (storageError) throw storageError;

      // 3. Obtener la URL pública de la firma
      const { data: { publicUrl } } = supabase.storage
        .from("contratos")
        .getPublicUrl(fileName);

      // 4. Actualizar el contrato en la base de datos
      const { error: updateError } = await supabase
        .from("contratos")
        .update({
          firma_url: publicUrl,
          estado: "firmado",
          fecha_firma: new Date().toISOString(),
        })
        .eq("id", contratoId);

      if (updateError) throw updateError;

      // 5. Crear notificación / alerta para el rol Administrador
      await supabase.from("alertas").insert([
        {
          titulo: "✍️ Nuevo contrato firmado",
          mensaje: `El contrato #${contratoId} ha sido firmado por el cliente.`,
          leida: false,
          usuario_id: null, // Visibilidad global para administradores
        },
      ]);

      alert("¡Contrato firmado y guardado con éxito!");

      if (onFirmaGuardada) {
        onFirmaGuardada(publicUrl);
      } else {
        navigate(`/cliente/contrato/${contratoId}`);
      }

    } catch (err) {
      console.error("Error al guardar la firma:", err);
      alert("Error guardando la firma: " + (err.message || err.error_description || "Error desconocido"));
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
          textShadow: "0 0 8px rgba(0,153,255,0.6)",
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
          boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <p style={{ color: "#9fb3c8", fontSize: "14px", marginBottom: "12px", textAlign: "center" }}>
          Dibuje su firma con el dedo dentro del recuadro blanco:
        </p>

        {/* Cuadro de Dibujo (Canvas) */}
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

        {/* Botones de Acción */}
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
              boxShadow: "0 0 10px rgba(0,153,255,0.4)",
            }}
          >
            {guardando ? "Guardando..." : "💾 Guardar firma"}
          </button>
        </div>
      </div>
    </div>
  );

  // Si se usa como componente incrustado no envuelve en Menu, si se accede por ruta sí.
  return propContratoId ? contenido : <Menu>{contenido}</Menu>;
              }
