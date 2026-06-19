import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignaturePad from "react-signature-canvas";
import { supabase } from "../../supabaseClient";

export default function ClienteFirmaDibujar() {
  const { id } = useParams(); // ID del contrato
  const navigate = useNavigate();
  const sigCanvas = useRef(null);

  const guardarFirma = async () => {
    const canvas = sigCanvas.current;
    if (!canvas) return;

    const dataURL = canvas.getTrimmedCanvas().toDataURL("image/png");
    const blob = await (await fetch(dataURL)).blob();

    const filePath = `firmas/contrato_${id}.png`;

    // 1. Subir firma a Supabase Storage
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

    // 2. Guardar ruta en la tabla contratos
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
    <div style={{ padding: 20 }}>
      <h2>Firma del Cliente</h2>

      <SignaturePad
        ref={sigCanvas}
        penColor="black"
        canvasProps={{
          width: 300,
          height: 200,
          style: {
            border: "1px solid #ccc",
            borderRadius: 6,
            marginBottom: 10,
          },
        }}
      />

      <button
        onClick={guardarFirma}
        style={{
          padding: "10px 16px",
          backgroundColor: "#28a745",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginRight: 10,
        }}
      >
        Guardar firma
      </button>

      <button
        onClick={limpiar}
        style={{
          padding: "10px 16px",
          backgroundColor: "#dc3545",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Limpiar
      </button>
    </div>
  );
}
