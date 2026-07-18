import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";
import { useParams } from "react-router-dom";

export default function FotosInspeccion() {
  const { id } = useParams(); // ID de la inspección
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);

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
      alert("Error cargando fotos");
      return;
    }

    setFotos(data || []);
    setLoading(false);
  }

  async function subirFoto(e) {
    const archivo = e.target.files[0];
    if (!archivo) return;

    const nombreArchivo = `inspeccion_${id}_${Date.now()}.jpg`;

    // 1) Subir a Storage
    const { error: storageError } = await supabase.storage
      .from("fotos")
      .upload(nombreArchivo, archivo);

    if (storageError) {
      alert("Error subiendo foto");
      return;
    }

    // 2) Obtener URL pública
    const { data: urlData } = supabase.storage
      .from("fotos")
      .getPublicUrl(nombreArchivo);

    const url = urlData.publicUrl;

    // 3) Guardar en la tabla
    const { error: dbError } = await supabase
      .from("fotos_inspeccion")
      .insert([
        {
          inspeccion_id: id,
          url,
        },
      ]);

    if (dbError) {
      alert("Error guardando foto en la base de datos");
      return;
    }

    cargarFotos();
  }

  async function borrarFoto(foto) {
    // 1) Extraer nombre del archivo desde la URL pública
    const ruta = foto.url.split("/").pop();

    // 2) Borrar de Storage
    await supabase.storage.from("fotos").remove([ruta]);

    // 3) Borrar de la tabla
    await supabase
      .from("fotos_inspeccion")
      .delete()
      .eq("id", foto.id);

    cargarFotos();
  }

  return (
    <Menu>
      <div
        style={{
          padding: "20px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
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

        <input
          type="file"
          accept="image/*"
          onChange={subirFoto}
          style={{ marginBottom: "20px" }}
        />

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
                    padding: "6px",
                    borderRadius: "6px",
                    border: "none",
                    width: "100%",
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
