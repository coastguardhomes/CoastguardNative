import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

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
          Galería de Fotos
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
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 0 12px rgba(0,153,255,0.2)",
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
                    borderRadius: "10px",
                    border: "2px solid #4db8ff",
                    marginBottom: "10px",
                  }}
                />

                <button
                  onClick={() => borrarFoto(foto)}
                  style={{
                    padding: "12px",
                    background: "#ff4444",
                    border: "none",
                    borderRadius: "10px",
                    color: "#fff",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "700",
                    boxShadow: "0 0 10px rgba(255,0,0,0.4)",
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
