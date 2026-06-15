import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignaturePad from "react-signature-canvas";
import supabase from "../../supabaseClient";

export default function ClienteFirmaDibujar() {
  const { contratoId } = useParams();
  const navigate = useNavigate();
  const sigRef = useRef<any>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (sigRef.current) {
      sigRef.current.clear();
    }
  }, []);

  const handleClear = () => {
    sigRef.current.clear();
    setIsEmpty(true);
  };

  const handleEnd = () => {
    if (!sigRef.current.isEmpty()) {
      setIsEmpty(false);
    }
  };

  const handleSave = async () => {
    if (sigRef.current.isEmpty()) {
      alert("Debes dibujar la firma antes de continuar");
      return;
    }

    const dataURL = sigRef.current.getTrimmedCanvas().toDataURL("image/png");

    const fileName = `firma_${contratoId}_${Date.now()}.png`;
    const file = await fetch(dataURL).then(res => res.blob());

    const { data, error } = await supabase.storage
      .from("firmas")
      .upload(fileName, file, {
        contentType: "image/png",
      });

    if (error) {
      console.error(error);
      alert("Error guardando la firma");
      return;
    }

    const urlPublica = supabase.storage
      .from("firmas")
      .getPublicUrl(fileName).data.publicUrl;

    await supabase
      .from("contratos")
      .update({
        firma_cliente: urlPublica,
        estado: "firmado",
      })
      .eq("id", contratoId);

    navigate(`/cliente/contrato/${contratoId}`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Firmar Contrato</h2>

      <div
        style={{
          border: "2px solid #ccc",
          borderRadius: 10,
          marginTop: 20,
          marginBottom: 20,
        }}
      >
        <SignaturePad
          ref={sigRef}
          canvasProps={{
            width: window.innerWidth - 60,
            height: 300,
            className: "signatureCanvas",
          }}
          onEnd={handleEnd}
        />
      </div>

      <button
        onClick={handleClear}
        style={{
          background: "#999",
          color: "white",
          padding: "10px 20px",
          borderRadius: 8,
          marginRight: 10,
        }}
      >
        Borrar
      </button>

      <button
        onClick={handleSave}
        style={{
          background: "#007bff",
          color: "white",
          padding: "10px 20px",
          borderRadius: 8,
        }}
      >
        Guardar Firma
      </button>
    </div>
  );
}
