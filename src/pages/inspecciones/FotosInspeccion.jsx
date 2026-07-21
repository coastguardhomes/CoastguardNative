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
      <div style={{ padding: "20px", color: "#fff", fontFamily: "Inter, sans-serif" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Fotos de la Inspección
        </h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        <label
          style={{
            display: "block",
            marginBottom: "10px",
            background: "#4db8ff",
            color: "#000",
            padding: "12px",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "700",
            cursor: "pointer",
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

        {loading ? (
          <p>Cargando fotos...</p>
        ) : fotos.length === 0 ? (
          <p>No hay fotos registradas.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: "15px",
            }}
          >
            {fotos.map((foto) => (
              <div key={foto.id}>
                <img
                  src={foto.url}
                  alt="Foto inspección"
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    border: "2px solid #4db8ff",
                  }}
                />

                <button
                  onClick={() => borrarFoto(foto)}
                  style={{
                    marginTop: "8px",
                    background: "red",
                    color: "#fff",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    width: "100%",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Borrar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Menu>
  );
}
