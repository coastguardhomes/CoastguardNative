import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SignaturePad from "react-signature-canvas";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClienteFirmaDibujar() {
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const sigCanvas = useRef(null);

  const [loading, setLoading] = useState(false);

  // Seguridad: comprobar que el contrato pertenece al cliente
  useEffect(() => {
    async function comprobarContrato() {
      if (!user) return;

      const { data, error } = await supabase
        .from("contratos")
        .select("cliente_id")
        .eq("id", id)
        .single();

      if (error || !data) {
        navigate("/cliente/dashboard");
      }
    }

    comprobarContrato();
  }, [user, id, navigate]);

  // Ajuste responsive del canvas
  const ajustarCanvas = () => {
    if (!sigCanvas.current) return;

    const canvas = sigCanvas.current.getCanvas();
    const container = canvas.parentNode;

    canvas.width = container.offsetWidth;
    canvas.height = 250;

    sigCanvas.current.clear();
  };

  useEffect(() => {
    ajustarCanvas();
    window.addEventListener("resize", ajustarCanvas);
    return () => window.removeEventListener("resize", ajustarCanvas);
  }, []);

  const guardarFirma = async () => {
    const canvas = sigCanvas.current;
    if (!canvas) return;

    setLoading(true);

    // Convertir firma a PNG
    const dataURL = canvas.getTrimmedCanvas().toDataURL("image/png");
    const blob = await (await fetch(dataURL)).blob();

    const filePath = `firmas/contrato_${id}.png`;

    // Subir firma
    const { error: uploadError } = await supabase.storage
      .from("firmas")
      .upload(filePath, blob, {
        upsert: true,
        contentType: "image/png",
      });

    if (uploadError) {
      console.error("Error subiendo firma:", uploadError);
      setLoading(false);
      return;
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
      .from("firmas")
      .getPublicUrl(filePath);

    const firmaUrl = publicUrlData.publicUrl;

    // Guardar firma en contrato
    await supabase
      .from("contratos")
      .update({
        firma: firmaUrl,
        firmado_en: new Date().toISOString().split("T")[0],
        estado: "firmado",
      })
      .eq("id", id);

    // Regenerar PDF con firma
    try {
      await fetch(
        `https://wjomazuymbayceilvfku.supabase.co/functions/v1/contrato-pdf?id=${id}&firma=${encodeURIComponent(
          firmaUrl
        )}`
      );
    } catch (e) {
      console.error("Error regenerando PDF:", e);
    }

    // Enviar email automático
    try {
      await fetch(
        `https://wjomazuymbayceilvfku.supabase.co/functions/v1/enviar-email?contrato=${id}`
      );
    } catch (e) {
      console.error("Error enviando email:", e);
    }

    navigate(`/cliente/contrato/${id}`);
  };

  const limpiar = () => {
    sigCanvas.current?.clear();
  };

  return (
    <Menu>
      <div
        style={{
          minHeight: "100vh",
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
          {t("clienteFirmaTitulo")}
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
          <div
            style={{
              width: "100%",
              background: "#fff",
              borderRadius: "10px",
              border: "2px solid #4db8ff",
              marginBottom: "20px",
            }}
          >
            <SignaturePad
              ref={sigCanvas}
              penColor="#4db8ff"
              canvasProps={{
                style: {
                  width: "100%",
                  height: "250px",
                  borderRadius: "10px",
                },
              }}
            />
          </div>

          <button
            onClick={guardarFirma}
            disabled={loading}
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
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? t("clienteFirmaGuardando") : t("clienteFirmaGuardar")}
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
            {t("clienteFirmaLimpiar")}
          </button>
        </div>
      </div>
    </Menu>
  );
}
