import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
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
        <p style={{ color: "#fff", padding: 20 }}>Cargando inspección...</p>
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
      <div style={{ padding: 20, color: "#fff" }}>
        <h2 style={{ color: "#4db8ff" }}>Inspección #{inspeccion.id}</h2>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        <button
          onClick={generarPDF}
          style={{
            padding: "12px",
            marginTop: "20px",
            width: "100%",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "8px",
            border: "none",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Generar PDF
        </button>

        <div
          ref={pdfRef}
          style={{
            marginTop: "20px",
            background: "rgba(255,255,255,0.05)",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 0 10px rgba(0,153,255,0.2)",
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
