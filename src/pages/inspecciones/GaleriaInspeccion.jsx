import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

export default function GaleriaInspeccion() {
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const cargarFotos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("fotos_inspeccion")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMensaje("Error cargando fotos");
      setLoading(false);
      return;
    }

    setFotos(data);
    setLoading(false);
  };

  const borrarFoto = async (foto) => {
    const url = foto.url;
    const path = url.split("/").pop();

    const { error: storageError } = await supabase.storage
      .from("fotos")
      .remove([path]);

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
  };

  useEffect(() => {
    cargarFotos();
  }, []);

  return (
    <Menu>
      <div style={{ padding: "20px", color: "#fff" }}>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Galería de Fotos
        </h1>

        {mensaje && (
          <p style={{ marginBottom: "15px", color: "#4db8ff" }}>{mensaje}</p>
        )}

        {loading ? (
          <p>Cargando fotos...</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: "20px",
            }}
          >
            {fotos.map((foto) => (
              <div
                key={foto.id}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  textAlign: "center",
                }}
              >
                <img
                  src={foto.url}
                  alt="foto"
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "10px",
                  }}
                />

                <button
                  onClick={() => borrarFoto(foto)}
                  style={{
                    padding: "12px",
                    background: "#ff4444",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "700",
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Menu>
  );
}
