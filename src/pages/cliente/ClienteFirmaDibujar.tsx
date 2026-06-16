import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignaturePad from "react-signature-canvas";
import { supabase } from "../../supabaseClient";

export default function ClienteFirmaDibujar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sigCanvas = useRef<any>(null);

  const guardarFirma = async () => {
    const dataURL = sigCanvas.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");

    const { error } = await supabase
      .from("clientes")
      .update({ firma: dataURL })
      .eq("id", id);

    if (error) {
      console.error("Error guardando firma:", error);
      return;
    }

    navigate(`/cliente/${id}/contrato`);
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
          className: "sigCanvas",
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
