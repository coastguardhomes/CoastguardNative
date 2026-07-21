import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignaturePad from "react-signature-canvas";
import { supabase } from "../../supabaseClient";

export default function ClienteFirmaDibujar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sigCanvas = useRef(null);

  const guardarFirma = async () => {
    const canvas = sigCanvas.current;
    if (!canvas) return;

    const dataURL = canvas.getTrimmedCanvas().toDataURL("image/png");
    const blob = await (await fetch(dataURL)).blob();

    const filePath = `firmas/contrato_${id}.png`;

    const { error: uploadError } = await supabase.storage
      .from("firmas")
      .upload(filePath, blob, {
        upsert: true,
        contentType: "image/png",
      });

    if (uploadError) {
      console.error("Error subiendo firma:", uploadError);
      return;
    }

    const { error: updateError } = await supabase
      .from("contratos")
      .update({ firma: filePath })
      .eq("id", id);

    if (updateError) {
      console.error("Error guardando firma en contrato:", updateError);
      return;
    }

    navigate(`/cliente/contrato/${id}`);
  };

  const limpiar = () => {
    sigCanvas.current?.clear();
  };

  return (
    <div
      style={{
        height: "100%",
        background: "#0a0f1a",
        padding: "20px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#4db8ff",
          marginBottom: "25px",
          fontSize: "28px",
          fontWeight: "700",
          textShadow: "0 0 8px rgba(0,153,255,0.6)",
        }}
      >
        Firma del Cliente
      </h2>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "20px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 12px rgba(0,153,255,0.2)",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        <SignaturePad
          ref={sigCanvas}
          penColor="#4db8ff"
          canvasProps={{
            width: 320,
            height: 200,
            style: {
              background: "#fff",
              borderRadius: "10px",
              border: "2px solid #4db8ff",
              marginBottom: "20px",
            },
          }}
        />

        <button
          onClick={guardarFirma}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#4db8ff",
            color: "#000",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "16px",
            marginBottom: "10px",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Guardar firma
        </button>

        <button
          onClick={limpiar}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "16px",
          }}
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
