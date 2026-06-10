import { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LayoutWithMenu from "../../layouts/LayoutWithMenu.jsx";
import { supabase } from "../../lib/supabase";

export default function Firma() {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "white";
    ctx.lineWidth = 3;

    let dibujando = false;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: x - rect.left, y: y - rect.top };
    };

    const comenzar = (e) => {
      dibujando = true;
      const { x, y } = getPos(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const dibujar = (e) => {
      if (!dibujando) return;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const terminar = () => {
      dibujando = false;
    };

    canvas.addEventListener("mousedown", comenzar);
    canvas.addEventListener("mousemove", dibujar);
    canvas.addEventListener("mouseup", terminar);

    canvas.addEventListener("touchstart", comenzar);
    canvas.addEventListener("touchmove", dibujar);
    canvas.addEventListener("touchend", terminar);

    return () => {
      canvas.removeEventListener("mousedown", comenzar);
      canvas.removeEventListener("mousemove", dibujar);
      canvas.removeEventListener("mouseup", terminar);

      canvas.removeEventListener("touchstart", comenzar);
      canvas.removeEventListener("touchmove", dibujar);
      canvas.removeEventListener("touchend", terminar);
    };
  }, []);

  const guardarFirma = async () => {
    if (!canvasRef.current) return;

    setGuardando(true);

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    const blob = await (await fetch(dataUrl)).blob();

    const fileName = `firma_${id}_${Date.now()}.png`;

    const { data, error } = await supabase.storage
      .from("firmas_inspecciones")
      .upload(fileName, blob);

    if (!error) {
      await supabase
        .from("inspecciones")
        .update({ firma_url: data.path })
        .eq("id", id);

      navigate(`/inspecciones/${id}`);
    }

    setGuardando(false);
  };

  return (
    <LayoutWithMenu>
      <div style={{ padding: 16 }}>
        <h1>Firmar inspección</h1>

        <canvas
          ref={canvasRef}
          width={350}
          height={200}
          style={{
            background: "#1e293b",
            borderRadius: 8,
            width: "100%",
            touchAction: "none",
          }}
        />

        <button
          onClick={guardarFirma}
          disabled={guardando}
          style={{
            marginTop: 20,
            padding: "12px 20px",
            background: "#2563eb",
            color: "white",
            borderRadius: 8,
            width: "100%",
          }}
        >
          {guardando ? "Guardando..." : "Guardar firma"}
        </button>
      </div>
    </LayoutWithMenu>
  );
}
