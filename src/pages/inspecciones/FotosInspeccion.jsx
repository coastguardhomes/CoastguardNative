import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams } from "react-router-dom";

export default function FotosInspeccion() {
  const { id } = useParams();
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    cargarFotos();
  }, [id]);

  async function cargarFotos() {
    const { data, error } = await supabase
      .from("fotos_inspeccion")
      .select("*")
      .eq("inspeccion_id", id)
      .order("id", { ascending: false });

    if (error) {
      setMensaje("Error cargando fotos");
      return;
    }

    setFotos(data || []);
    setLoading(false);
  }

  async function subirFoto(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const nombreArchivo = `inspeccion_${id}_${Date.now()}.jpg`;

    const { error: storageError } = await supabase.storage
      .from("fotos")
      .upload(nombreArchivo, archivo);

    if (storageError) {
      setMensaje("Error subiendo foto");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("fotos")
      .getPublicUrl(nombreArchivo);

    const url = urlData.publicUrl;

    const { error: dbError } = await supabase
      .from("fotos_inspeccion")
      .insert([{ inspeccion_id: id, url }]);

    if (dbError) {
      setMensaje("Error guardando foto en la base de datos");
      return;
    }

    setMensaje("Foto subida correctamente");
    cargarFotos();
  }

  async function borrarFoto(foto) {
    const ruta = foto.url.split("/").pop();

    const { error: storageError } = await supabase.storage
      .from("fotos")
      .remove([ruta]);

    if (storageError) {
      setMensaje("Error borrando foto del almacenamiento");
      return;
    }

    const { error: dbError } = await supabase
      .from("fotos_inspeccion")
      .delete()
      .eq("id", foto.id);

    if (dbError) {
      setMensaje("Error borrando foto de la base de datos");
      return;
    }

    setMensaje("Foto eliminada correctamente");
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
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "25px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
            textAlign: "center",
          }}
        >
          Fotos de la Inspección
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

        {/* Botón subir foto */}
        <label
          style={{
            display: "block",
            marginBottom: "20px",
            background: "#4db8ff",
            color: "#000",
            padding: "14px",
            borderRadius: "10px",
            textAlign: "center",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Subir foto
          <input
            type="file"
            accept="image/*"
            onChange={subirFoto}
            style={{ display: "none" }}
          />
        </label>

        {/* Grid de fotos */}
        {loading ? (
          <p>Cargando fotos...</p>
        ) : fotos.length === 0 ? (
          <p>No hay fotos registradas.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "18px",
            }}
          >
            {fotos.map((foto) => (
              <div
                key={foto.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "12px",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                }}
              >
                <img
                  src={foto.url}
                  alt="Foto inspección"
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    border: "2px solid #4db8ff",
                    marginBottom: "10px",
                  }}
                />

                <button
