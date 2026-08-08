import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useParams, Link } from "react-router-dom";
import Menu from "../../layouts/Menu";

export default function TecnicoFotos() {
  const { id } = useParams(); // ID de la inspección
  const [fotos, setFotos] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    cargarFotos();
  }, [id]);

  async function cargarFotos() {
    const { data, error } = await supabase
      .from("fotos_inspeccion")
      .select("id, url")
      .eq("inspeccion_id", id)
      .order("id", { ascending: false });

    if (error) {
      setMensaje("Error cargando fotos");
      return;
    }

    setFotos(data || []);
  }

  async function subirFoto(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setSubiendo(true);

    const nombreArchivo = `inspeccion_${id}_${Date.now()}`;

    // Subir a Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("fotos")
      .upload(nombreArchivo, archivo);

    if (storageError) {
      setMensaje("Error subiendo foto");
      setSubiendo(false);
      return;
    }

    // Obtener URL pública
    const urlPublica = supabase.storage
      .from("fotos")
      .getPublicUrl(nombreArchivo).data.publicUrl;

    // Guardar en la tabla
    const { error: dbError } = await supabase
      .from("fotos_inspeccion")
      .insert([
        {
          inspeccion_id: id,
          url: urlPublica,
        },
      ]);

    if (dbError) {
      setMensaje("Error guardando foto en la inspección");
      setSubiendo(false);
      return;
    }

    setSubiendo(false);
    cargarFotos();
  }

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
        <h1
          style={{
            color: "#4db8ff",
            marginBottom: "25px",
            fontSize: "26px",
            fontWeight: "700",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Fotos de la inspección
        </h1>

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

        {/* Botón para subir foto */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              padding: "14px",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              fontWeight: "700",
              textAlign: "center",
              cursor: "pointer",
            }}
          >
            {subiendo ? "Subiendo..." : "Subir foto"}
            <input
              type="file"
              accept="image/*"
              onChange={subirFoto}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {/* Lista de fotos */}
        {fotos.length === 0 ? (
          <p style={{ opacity: 0.7 }}>No hay fotos subidas.</p>
        ) : (
          fotos.map((f) => (
            <div
              key={f.id}
              style={{
                marginBottom: "15px",
                background: "rgba(255,255,255,0.05)",
                padding: "12px",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <img
                src={f.url}
                alt="Foto inspección"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  marginBottom: "10px",
                }}
              />
            </div>
          ))
        )}

        {/* Botones de navegación */}
        <Link to={`/tecnico/inspeccion/${id}/checklist`}>
          <button
            style={{
              marginTop: "20px",
              padding: "14px",
              width: "100%",
              background: "#4db8ff",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Checklist
          </button>
        </Link>

        <Link to={`/tecnico/inspeccion/${id}/finalizar`}>
          <button
            style={{
              marginTop: "15px",
              padding: "14px",
              width: "100%",
              background: "#4ade80",
              color: "#000",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Finalizar inspección
          </button>
        </Link>

        <Link to={`/tecnico/inspeccion/${id}`}>
          <button
            style={{
              marginTop: "15px",
              padding: "14px",
              width: "100%",
              background: "#1e90ff",
              color: "#fff",
              borderRadius: "10px",
              border: "none",
              fontWeight: "700",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            Volver a inspección
          </button>
        </Link>
      </div>
    </Menu>
  );
}
