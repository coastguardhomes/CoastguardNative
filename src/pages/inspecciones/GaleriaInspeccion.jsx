import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../supabaseClient";

export default function GaleriaInspeccion() {
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarFotos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("fotos_inspeccion")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setFotos(data);
    setLoading(false);
  };

  const borrarFoto = async (foto) => {
    const url = foto.url;
    const path = url.split("/").pop();

    await supabase.storage.from("fotos").remove([path]);
    await supabase.from("fotos_inspeccion").delete().eq("id", foto.id);

    cargarFotos();
  };

  useEffect(() => {
    cargarFotos();
  }, []);

  return (
    <Menu>
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
                  padding: "8px 12px",
                  background: "#ff4444",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </Menu>
  );
}
