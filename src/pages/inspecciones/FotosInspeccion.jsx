import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../../supabaseClient";

export default function FotosInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fotos, setFotos] = useState([]);
  const [subiendo, setSubiendo] = useState(false);
  const [cargando, setCargando] = useState(true);

  // ============================
  // CARGAR FOTOS
  // ============================
  const cargarFotos = async () => {
    const { data, error } = await supabase
      .from("fotos_inspeccion")
      .select("*")
      .eq("inspeccion_id", id)
      .order("id", { ascending: false });

    if (!error) setFotos(data || []);
    setCargando(false);
  };

  useEffect(() => {
    cargarFotos();
  }, [id]);

  // ============================
  // SUBIR FOTO
  // ============================
  const subirFoto = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      alert("Solo se permiten imágenes.");
      return;
    }

    setSubiendo(true);

    const nombreArchivo = `${id}/${Date.now()}-${archivo.name}`;

    const { error: uploadError } = await supabase.storage
      .from("inspection_photos")
      .upload(nombreArchivo, archivo);

    if (uploadError) {
      alert("Error subiendo foto");
      setSubiendo(false);
      return;
    }

    const urlPublica = supabase.storage
      .from("inspection_photos")
      .getPublicUrl(nombreArchivo).data.publicUrl;

    const { error: insertError } = await supabase
      .from("fotos_inspeccion")
      .insert([
        {
          inspeccion_id: id,
          url: urlPublica,
        },
      ]);

    setSubiendo(false);

    if (insertError) {
      alert("Error guardando foto");
      return;
    }

    cargarFotos();
  };

  // ============================
  // BORRAR FOTO
  // ============================
  const borrarFoto = async (foto) => {
    const confirmacion = confirm("¿Eliminar esta foto?");
    if (!confirmacion) return;

    const ruta = foto.url.split("/inspection_photos/")[1];

    await supabase.storage.from("inspection_photos").remove([ruta]);
    await supabase.from("fotos_inspeccion").delete().eq("id", foto.id);

    cargarFotos();
  };

  if (cargando) {
    return (
      <div style={{ padding: 16 }}>
        <h1>Fotos</h1>
        <p>Cargando fotos...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Fotos de Inspección</h1>

      {/* Subir foto */}
      <label
        style={{
          display: "block",
          padding: "12px 20px",
          background: "#2563eb",
          color: "white",
          borderRadius: 8,
          textAlign: "center",
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        {subiendo ? "Subiendo..." : "Subir Foto"}
        <input
          type="file"
          accept="image/*"
          onChange={subirFoto}
          style={{ display: "none" }}
        />
      </label>

      {/* Galería */}
      {fotos.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>No hay fotos subidas.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {fotos.map((foto) => (
            <div
              key={foto.id}
              style={{
                background: "#1e293b",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #334155",
                position: "relative",
              }}
            >
              <img
                src={foto.url}
                alt="Foto inspección"
                style={{
                  width: "100%",
                  height: 140,
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
              <button
                onClick={() => borrarFoto(foto)}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "#ef4444",
                  border: "none",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Borrar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Volver */}
      <button
        onClick={() => navigate(`/inspecciones/${id}`)}
        style={{
          width: "100%",
          padding: "12px 20px",
          background: "#475569",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          marginTop: 20,
        }}
      >
        Volver
      </button>
    </div>
  );
}
