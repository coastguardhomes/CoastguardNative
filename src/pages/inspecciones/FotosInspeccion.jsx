import React, { useEffect, useState } from "react";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

export default function FotosInspeccion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [fotoGrande, setFotoGrande] = useState(null);

  useEffect(() => {
    if (id) {
      cargarFotos();
    }
  }, [id]);

  async function cargarFotos() {
    setLoading(true);

    const { data, error } = await supabase
      .from("fotos_inspeccion")
      .select("*")
      .eq("inspeccion_id", String(id))
      .order("id", { ascending: false });

    if (error) {
      setMensaje("Error cargando fotos: " + error.message);
      setLoading(false);
      return;
    }

    setFotos(data || []);
    setLoading(false);
  }

  async function subirFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 70,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (!image.base64String) return;

      const base64 = `data:image/jpeg;base64,${image.base64String}`;
      const blob = await (await fetch(base64)).blob();

      const nombreArchivo = `inspeccion_${id}_${Date.now()}.jpg`;

      const { error: storageError } = await supabase.storage
        .from("fotos")
        .upload(nombreArchivo, blob, {
          contentType: "image/jpeg",
        });

      if (storageError) {
        setMensaje("Error subiendo foto al almacenamiento");
        return;
      }

      const { data: urlData } = supabase.storage
        .from("fotos")
        .getPublicUrl(nombreArchivo);

      const nuevaFotoObj = {
        inspeccion_id: String(id),
        archivo: nombreArchivo,
        url: urlData.publicUrl,
        principal: false,
      };

      const { data: insertedData, error: dbError } = await supabase
        .from("fotos_inspeccion")
        .insert([nuevaFotoObj])
        .select()
        .single();

      if (dbError) {
        setMensaje("Error guardando foto en la base de datos");
        return;
      }

      await supabase
        .from("inspecciones")
        .update({
          fecha_fotos: new Date().toISOString(),
          estado: "fotos_completadas",
        })
        .eq("id", id);

      setFotos((prev) => [insertedData || nuevaFotoObj, ...prev]);
      setMensaje("¡Foto subida correctamente!");
      setTimeout(() => setMensaje(""), 3000);

      cargarFotos();
    } catch (e) {
      console.error(e);
      setMensaje("Cámara cancelada o con error.");
    }
  }

  async function borrarFoto(foto) {
    let path = foto.archivo;
    if (!path && foto.url) {
      path = foto.url.split("/").pop();
    }

    if (path) {
      await supabase.storage.from("fotos").remove([path]);
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

  async function marcarPrincipal(foto) {
    try {
      await supabase
        .from("fotos_inspeccion")
        .update({ principal: false })
        .eq("inspeccion_id", String(id));

      await supabase
        .from("fotos_inspeccion")
        .update({ principal: true })
        .eq("id", foto.id);

      await supabase
        .from("inspecciones")
        .update({
          foto_principal: foto.url,
        })
        .eq("id", id);

      setMensaje("Foto marcada como principal");
      cargarFotos();
    } catch (e) {
      setMensaje("Error marcando foto como principal");
    }
  }

  function continuarAFirma() {
    if (fotos.length === 0) {
      setMensaje("Debes subir al menos una foto antes de continuar.");
      return;
    }
    navigate(`/inspecciones/firma/${id}`);
  }

  return (
    <Menu>
      <div style={contenedor}>
        <h1 style={titulo}>Galería de Fotos</h1>

        {mensaje && <p style={mensajeEstilo}>{mensaje}</p>}

        <button onClick={subirFoto} style={botonSubir}>
          📸 Tomar foto
        </button>

        {fotoGrande && (
          <div style={contenedorGrande}>
            <img
              src={fotoGrande.url}
              alt="Foto grande"
              style={imagenGrandeEstilo}
            />
            <button
              onClick={() => setFotoGrande(null)}
              style={botonCerrarGrande}
            >
              Cerrar foto
            </button>
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: "center" }}>Cargando fotos...</p>
        ) : fotos.length === 0 ? (
          <p style={vacioEstilo}>No hay fotos registradas.</p>
        ) : (
          <div style={grid}>
            {fotos.map((foto) => (
              <div key={foto.id} style={card}>
                <img
                  src={foto.url}
                  alt="Foto inspección"
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
                    ...boton,
                    background: foto.principal ? "#4ade80" : "#4db8ff",
                  }}
                >
                  {foto.principal ? "Principal ✔" : "Marcar como principal"}
                </button>

                <button onClick={() => borrarFoto(foto)} style={botonEliminar}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}

        <button onClick={continuarAFirma} style={botonContinuar}>
          Continuar a firma
        </button>

        <button
          onClick={() => navigate(`/inspecciones/detalle/${id}`)}
          style={botonVolver}
        >
          Volver a la inspección
        </button>
      </div>
    </Menu>
  );
}

/* ---------------- ESTILOS ---------------- */
const contenedor = {
  padding: "20px",
  background: "#0a0f1a",
  minHeight: "100vh",
  color: "#fff",
  fontFamily: "Inter, sans-serif",
};

const titulo = {
  fontSize: "28px",
  fontWeight: "700",
  marginBottom: "20px",
  color: "#4db8ff",
  textAlign: "center",
  textShadow: "0 0 8px rgba(0,153,255,0.6)",
};

const mensajeEstilo = {
  marginBottom: "15px",
  color: "#4db8ff",
  fontWeight: "600",
  textAlign: "center",
};

const botonSubir = {
  width: "100%",
  padding: "14px",
  background: "#4db8ff",
  color: "#000",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  fontSize: "16px",
  cursor: "pointer",
  marginBottom: "20px",
  boxShadow: "0 0 10px rgba(0,153,255,0.4)",
};

const contenedorGrande = {
  marginBottom: "25px",
  textAlign: "center",
  background: "rgba(255,255,255,0.05)",
  padding: "20px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
};

const imagenGrandeEstilo = {
  width: "100%",
  maxHeight: "400px",
  objectFit: "contain",
  borderRadius: "10px",
  border: "3px solid #4db8ff",
  marginBottom: "15px",
};

const botonCerrarGrande = {
  padding: "12px",
  background: "#4db8ff",
  border: "none",
  borderRadius: "10px",
  color: "#000",
  cursor: "pointer",
  fontWeight: "700",
  width: "100%",
};

const vacioEstilo = {
  textAlign: "center",
  color: "#a0aec0",
  margin: "20px 0",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  gap: "20px",
};

const card = {
  background: "rgba(255,255,255,0.05)",
  padding: "12px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 0 12px rgba(0,153,255,0.2)",
  textAlign: "center",
};

const boton = {
  width: "100%",
  padding: "10px",
  color: "#000",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  cursor: "pointer",
  marginBottom: "8px",
};

const botonEliminar = {
  width: "100%",
  padding: "12px",
  background: "#ff4444",
  color: "#fff",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  cursor: "pointer",
  boxShadow: "0 0 10px rgba(255,0,0,0.4)",
};

const botonContinuar = {
  marginTop: "30px",
  padding: "14px",
  width: "100%",
  background: "#4ade80",
  color: "#000",
  borderRadius: "10px",
  border: "none",
  fontWeight: "700",
  fontSize: "17px",
  cursor: "pointer",
  boxShadow: "0 0 10px rgba(74,222,128,0.4)",
};

const botonVolver = {
  marginTop: "12px",
  padding: "14px",
  width: "100%",
  background: "transparent",
  color: "#4db8ff",
  borderRadius: "10px",
  border: "1px solid #4db8ff",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer",
};
