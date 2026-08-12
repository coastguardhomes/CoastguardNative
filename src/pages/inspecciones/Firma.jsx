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

  function obtenerPosicion(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const punto = e.touches?.[0] || e.changedTouches?.[0] || e.nativeEvent;
    const escalaX = canvas.width / rect.width;
    const escalaY = canvas.height / rect.height;

    return {
      x: (punto.clientX - rect.left) * escalaX,
      y: (punto.clientY - rect.top) * escalaY,
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = obtenerPosicion(e);

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#4db8ff";

    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = obtenerPosicion(e);

    ctx.lineTo(x, y);
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

    // Validar que hay firma dibujada (comprobando si hay píxeles distintos del fondo blanco/transparente)
    const ctx = canvas.getContext("2d");
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    // Verificamos si algún píxel no es totalmente blanco (alfa o color)
    let hayFirma = false;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] > 0) { // si el canal alpha tiene opacidad
        // Revisar si no es blanco puro (255, 255, 255)
        const r = pixels[i - 3];
        const g = pixels[i - 2];
        const b = pixels[i - 1];
        if (r < 250 || g < 250 || b < 250) {
          hayFirma = true;
          break;
        }
      }
    }

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
      setMensaje("Error guardando firma: " + errorSubida.message);
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

    // Guardar URL de firma en inspecciones
    await supabase
      .from("inspecciones")
      .update({
        firma_url: urlData.publicUrl,
        fecha_firma: new Date().toISOString(),
      })
      .eq("id", id);

    setMensaje("Firma guardada correctamente ✔");

    // Redirigir de vuelta al detalle de inspección para mantener el flujo intacto
    setTimeout(() => {
      navigate(`/inspecciones/${id}`);
    }, 1000);
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
          <div
            style={{
              marginBottom: "20px",
              padding: "12px",
              background: mensaje.includes("correctamente")
                ? "rgba(74, 222, 128, 0.15)"
                : "rgba(255, 107, 107, 0.15)",
              border: `1px solid ${mensaje.includes("correctamente") ? "#4ade80" : "#ff6b6b"}`,
              borderRadius: "10px",
              color: mensaje.includes("correctamente") ? "#4ade80" : "#ff6b6b",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {mensaje}
          </div>
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
              maxWidth: "100%",
              touchAction: "none",
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
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

        <button
          onClick={() => navigate(`/inspecciones/${id}`)}
          style={{
            padding: "12px",
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.18)",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Volver al detalle de la inspección
        </button>
      </div>
    </Menu>
  );
}
