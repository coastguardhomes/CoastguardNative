import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";

export default function GaleriaInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [fotoGrande, setFotoGrande] = useState(null);

  // 🔥 Cargar solo fotos de esta inspección
  const cargarFotos = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("fotos_inspeccion")
      .select("*")
      .eq("inspeccion_id", id)
      .order("id", { ascending: false });

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

  // 🔥 Marcar foto como principal (para PDF)
  async function marcarPrincipal(foto) {
    try {
      await supabase
        .from("fotos_inspeccion")
        .update({ principal: false })
        .eq("inspeccion_id", id);

      await supabase
        .from("fotos_inspeccion")
        .update({ principal: true })
        .eq("id", foto.id);

      setMensaje("Foto marcada como principal");
      cargarFotos();
    } catch (e) {
      console.error(e);
      setMensaje("Error marcando foto como principal");
    }
  }

  useEffect(() => {
    cargarFotos();
  }, [id]);

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

        {/* 🔥 Foto en grande */}
        {fotoGrande && (
          <div
            style={{
              marginBottom: "25px",
              textAlign: "center",
              background: "rgba(255,255,255,0.05)",
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <img
              src={fotoGrande.url}
              alt="Foto grande"
              style={{
                width: "100%",
                maxHeight: "400px",
                objectFit: "contain",
                borderRadius: "10px",
                border: "3px solid #4db8ff",
                marginBottom: "15px",
              }}
            />

            <button
              onClick={() => setFotoGrande(null)}
              style={{
                padding: "12px",
                background: "#4db8ff",
                border: "none",
                borderRadius: "10px",
                color: "#000",
                cursor: "pointer",
                fontWeight: "700",
                width: "100%",
              }}
            >
              Cerrar foto
            </button>
          </div>
        )}

        {loading ? (
          <p>Cargando fotos...</p>
        ) : fotos.length === 0 ? (
          <p>No hay fotos registradas.</p>
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
                    border: foto.principal
                      ? "3px solid #4ade80"
                      : "2px solid #4db8ff",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                  onClick={() => setFotoGrande(foto)}
                />

                <button
                  onClick={() => marcarPrincipal(foto)}
                  style={{
                    padding: "10px",
                    background: foto.principal ? "#4ade80" : "#4db8ff",
                    border: "none",
                    borderRadius: "10px",
                    color: "#000",
                    cursor: "pointer",
                    width: "100%",
                    fontWeight: "700",
                    marginBottom: "8px",
                  }}
                >
                  {foto.principal ? "Principal ✔" : "Marcar como principal"}
                </button>

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

        {/* 🔥 Botón volver */}
        <button
          onClick={() => navigate(`/inspecciones/${id}`)}
          style={{
            marginTop: "30px",
            padding: "14px",
            width: "100%",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "10px",
            border: "none",
            fontWeight: "700",
            fontSize: "17px",
            cursor: "pointer",
            boxShadow: "0 0 10px rgba(0,153,255,0.4)",
          }}
        >
          Volver a la inspección
        </button>
      </div>
    </Menu>
  );
}
