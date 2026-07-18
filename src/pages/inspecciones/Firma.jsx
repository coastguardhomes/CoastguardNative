import React, { useRef, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams } from "react-router-dom";

export default function Firma() {
  const { id } = useParams(); // ID de la inspección
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  function startDrawing(e) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#4db8ff";

    ctx.beginPath();
    ctx.moveTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );

    setIsDrawing(true);
  }

  function draw(e) {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.lineTo(
      e.nativeEvent.offsetX,
      e.nativeEvent.offsetY
    );
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
    const firmaBase64 = canvas.toDataURL("image/png");

    const { error } = await supabase
      .from("firmas")
      .insert([
        {
          inspeccion_id: id,
          firma: firmaBase64,
        },
      ]);

    if (error) {
      alert("Error guardando firma");
      return;
    }

    alert("Firma guardada correctamente");
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Firma del Cliente
        </h1>

        <p style={{ opacity: 0.8, marginBottom: "20px" }}>
          El cliente debe firmar la inspección realizada.
        </p>

        <canvas
          ref={canvasRef}
          width={350}
          height={250}
          style={{
            background: "#fff",
            borderRadius: "10px",
            border: "2px solid #4db8ff",
            display: "block",
            marginBottom: "20px",
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />

        <button
          onClick={limpiar}
          style={{
            marginRight: "10px",
            padding: "10px 15px",
            background: "#333",
            color: "#fff",
            borderRadius: "6px",
            border: "none",
          }}
        >
          Limpiar firma
        </button>

        <button
          onClick={guardarFirma}
          style={{
            padding: "10px 15px",
            background: "#4db8ff",
            color: "#fff",
            borderRadius: "6px",
            border: "none",
          }}
        >
          Guardar firma
        </button>
      </div>
    </Menu>
  );
}
