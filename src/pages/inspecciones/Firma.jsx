import React, { useRef, useState, useEffect } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function Firma() {
  const { id } = useParams();
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [firmaGuardada, setFirmaGuardada] = useState(null);

  useEffect(() => {
    async function cargarFirma() {
      const { data } = await supabase
        .from("firmas_inspeccion")
        .select("*")
        .eq("inspeccion_id", id)
        .order("id", { ascending: false })
        .limit(1);

      if (data?.length > 0) {
        const archivo = data[0].archivo;

        const { data: urlData } = supabase.storage
          .from("firmas")
          .getPublicUrl(archivo);

        setFirmaGuardada(urlData.publicUrl);
      }
    }

    cargarFirma();
  }, [id]);

  function startDrawing(e) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#4db8ff";

    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);

    setIsDrawing(true);
  }

  function draw(e) {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function limpiar() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  async function guardarFirma() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 🔥 Validar que hay firma dibujada
    const ctx = canvas.getContext("2d");
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const hayFirma = pixels.some((p) => p !== 255);

    if (!hayFirma) {
      setMensaje("Debes dibujar la firma antes de guardar.");
      return;
    }

    setMensaje("Guardando firma...");

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );

    if (!blob) {
      setMensaje("No se pudo procesar la firma");
      return;
    }

    const nombreArchivo = `firma_${id}_${Date.now()}.png`;

    const { error: errorSubida } = await supabase.storage
      .from("firmas")
      .upload(nombreArchivo, blob, { upsert: true });

    if (errorSubida) {
      setMensaje("Error guardando firma");
      return;
    }

    await supabase
      .from("firmas_inspeccion")
      .delete()
      .eq("inspeccion_id", id);

    await supabase
      .from("firmas_inspeccion")
      .insert([{ inspeccion_id: id, archivo: nombreArchivo }]);

    const { data: urlData } = supabase.storage
      .from("firmas")
      .getPublicUrl(nombreArchivo);

    setFirmaGuardada(urlData.publicUrl);

    // 🔥 Guardar firma en inspecciones (para PDF)
    await supabase
      .from("inspecciones")
      .update({
        firma_url: urlData.publicUrl,
        fecha_firma: new Date().toISOString(),
        estado: "firma_completada",
      })
      .eq("id", id);

    setMensaje("Firma guardada correctamente");

    // 🔥 Avanzar automáticamente al PDF
    setTimeout(() => {
      navigate(`/inspecciones/pdf/${id}`);
    }, 800);
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          background: "#0a0f1a",
          minHeight: "100vh",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "25px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Firma del Cliente
        </h1>

        {mensaje && (
          <p
            style={{
              marginBottom: "15px",
              color: "#4db8ff",
              fontWeight: "600",
            }}
          >
            {mensaje}
          </p>
        )}

        {firmaGuardada && (
          <div
            style={{
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            <p style={{ marginBottom: "10px", opacity: 0.8 }}>
              Firma ya registrada:
            </p>
            <img
              src={firmaGuardada}
              alt="Firma guardada"
              style={{
                width: "300px",
                borderRadius: "10px",
                border: "2px solid #4db8ff",
              }}
            />
          </div>
        )}

        <p style={{ opacity: 0.8, marginBottom: "20px", textAlign: "center" }}>
          El cliente debe firmar la inspección realizada.
        </p>

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            marginBottom: "25px",
          }}
        >
          <canvas
            ref={canvasRef}
            width={350}
            height={250}
            style={{
              background: "#fff",
              borderRadius: "10px",
              border: "2px solid #4db8ff",
              display: "block",
              margin: "0 auto 20px auto",
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={limpiar}
              style={{
                flex: 1,
                padding: "14px",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              Limpiar firma
            </button>

            <button
              onClick={guardarFirma}
              style={{
                flex: 1,
                padding: "14px",
                background: "#4db8ff",
                color: "#000",
                borderRadius: "10px",
                border: "none",
                fontWeight: "700",
                cursor: "pointer",
                boxShadow: "0 0 10px rgba(0,153,255,0.4)",
              }}
            >
              Guardar firma
            </button>
          </div>
        </div>
      </div>
    </Menu>
  );
}
