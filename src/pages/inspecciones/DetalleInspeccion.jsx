import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { cargarFotosInspeccion } from "../../lib/cargarFotosInspeccion";
import { generarPDFInspeccion } from "../../pdf/generarPDFInspeccion";

export default function DetalleInspeccion() {
  const { id } = useParams();
  const pdfRef = useRef(null);

  const [inspeccion, setInspeccion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .from("inspecciones")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) {
        const fotos = await cargarFotosInspeccion(id);
        data.fotos = fotos;
        setInspeccion(data);
      }

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
    }
  };

  return (
    <Menu>
      <div style={{ padding: 20, color: "#fff" }}>
        <h2>Inspección #{inspeccion.id}</h2>

        <button
          onClick={generarPDF}
          style={{
            padding: 10,
            marginTop: 20,
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: 5,
          }}
        >
          Generar PDF
        </button>

        <div ref={pdfRef} style={{ marginTop: 20 }}>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(inspeccion, null, 2)}
          </pre>
        </div>
      </div>
    </Menu>
  );
}
