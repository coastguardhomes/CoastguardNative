import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";
import { generarPDFInspeccion } from "../../pdf/generarPDFInspeccion";

export default function DetalleInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const pdfRef = useRef(null);

  const [inspeccion, setInspeccion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setMensaje("Error cargando inspección");
        setCargando(false);
        return;
      }

      const fotos = await cargarFotosInspeccion(id);
      data.fotos = fotos;

      setInspeccion(data);
      setCargando(false);
    }

    cargar();
  }, [id]);

  if (cargando) {
    return (
      <Menu>
        <div
          style={{
            height: "100vh",
            background: "#0a0f1a",
            color: "#fff",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontFamily: "Inter, sans-serif",
            fontSize: "18px",
          }}
        >
          Cargando inspección...
        </div>
      </Menu>
    );
  }

  const generarPDF = () => {
    if (inspeccion && pdfRef.current) {
      generarPDFInspeccion(inspeccion.id, pdfRef.current);
      setMensaje("PDF generado correctamente");
    }
  };

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
        <h2
          style={{
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "28px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Inspección #{inspeccion.id}
        </h2>

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

        <button
          onClick={generarPDF}
          style={{
            padding: "14px",
            width: "100%",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
            marginBottom: "20px",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Generar PDF
        </button>

        <div
          ref={pdfRef}
          style={{
            marginTop: "10px",
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 12px rgba(0,153,255,0.2)",
            whiteSpace: "pre-wrap",
            fontSize: "14px",
          }}
        >
          {JSON.stringify(inspeccion, null, 2)}
        </div>
      </div>
    </Menu>
  );
}
