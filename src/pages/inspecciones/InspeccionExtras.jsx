import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient"; // Ajusta tu ruta al cliente de Supabase

export default function InspeccionExtra() {
  const { id } = useParams(); // ID del extra/trabajo
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Campos del formulario
  const [descripcion, setDescripcion] = useState("");
  const [materiales, setMateriales] = useState("");
  const [tiempoEmpleado, setTiempoEmpleado] = useState("");
  const [fotos, setFotos] = useState([]); // Array de URLs de fotos

  // 1. Cargar los datos del extra al abrir la pantalla
  useEffect(() => {
    async function cargarExtra() {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from("extras")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (err) throw err;

        if (data) {
          setDescripcion(data.descripcion || "");
          setMateriales(data.materiales || "");
          setTiempoEmpleado(data.tiempo_empleado || "");
          setFotos(data.fotos || []);
        } else {
          setError("No se encontró el trabajo extra.");
        }
      } catch (err) {
        console.error("Error cargando extra:", err);
        setError("Error al cargar los datos del trabajo extra.");
      } finally {
        setLoading(false);
      }
    }

    if (id) cargarExtra();
  }, [id]);

  // 2. Función para subir fotos (Cámara o Galería)
  const manejarSubidaFotos = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setGuardando(true);
      const nuevasUrls = [...fotos];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const filePath = `extras/${fileName}`;

        // Sube al bucket de Supabase (asegúrate de tener un bucket llamado 'extras' o 'fotos')
        const { error: uploadError } = await supabase.storage
          .from("extras") 
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Obtener la URL pública de la foto
        const { data: publicUrlData } = supabase.storage
          .from("extras")
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          nuevasUrls.push(publicUrlData.publicUrl);
        }
      }

      setFotos(nuevasUrls);
      setMensaje("¡Fotos subidas con éxito!");
    } catch (err) {
      console.error("Error al subir fotos:", err);
      setError("No se pudieron subir las fotos.");
    } finally {
      setGuardando(false);
    }
  };

  // 3. Guardar y enviar al Administrador (cambia el estado a 'finalizado')
  const guardarYEnviarAlAdmin = async () => {
    try {
      setGuardando(true);
      setError("");
      setMensaje("");

      const { error: updateError } = await supabase
        .from("extras")
        .update({
          descripcion,
          materiales,
          tiempo_empleado: tiempoEmpleado,
          fotos,
          estado: "finalizado", // 👈 Esto hace que pase al Admin como completado
        })
        .eq("id", id);

      if (updateError) throw updateError;

      setMensaje("¡Inspección guardada y enviada al administrador correctamente!");
      setTimeout(() => {
        navigate("/tecnico"); // Vuelve al panel del técnico
      }, 1500);
    } catch (err) {
      console.error("Error al guardar:", err);
      setError("Error al guardar la inspección.");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return <div style={estilos.centrado}>Cargando datos del trabajo...</div>;
  }

  return (
    <div style={estilos.pagina}>
      <button onClick={() => navigate(-1)} style={estilos.botonVolver}>
        ← Volver
      </button>

      <h2 style={estilos.titulo}>Inspección de Extra</h2>

      {mensaje && <p style={estilos.ok}>{mensaje}</p>}
      {error && <p style={estilos.error}>{error}</p>}

      {/* Botones de Cámara y Galería */}
      <div style={estilos.contenedorBotonesFoto}>
        <label style={estilos.botonFoto}>
          📸 Hacer Foto
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={manejarSubidaFotos}
            style={{ display: "none" }}
          />
        </label>

        <label style={estilos.botonGaleria}>
          🖼️ Galería
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={manejarSubidaFotos}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* Vista previa de las fotos subidas */}
      {fotos.length > 0 && (
        <div style={estilos.gridFotos}>
          {fotos.map((url, index) => (
            <img key={index} src={url} alt={`Evidencia ${index}`} style={estilos.miniatura} />
          ))}
        </div>
      )}

      {/* Formulario */}
      <div style={estilos.tarjeta}>
        <label style={estilos.label}>Descripción del trabajo realizado:</label>
        <textarea
          rows="3"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalla qué se ha reparado o revisado..."
          style={estilos.textarea}
        />

        <label style={estilos.label}>Materiales usados:</label>
        <input
          type="text"
          value={materiales}
          onChange={(e) => setMateriales(e.target.value)}
          placeholder="Ej: Tubo de PVC, silicona, tornillos..."
          style={estilos.input}
        />

        <label style={estilos.label}>Tiempo empleado:</label>
        <input
          type="text"
          value={tiempoEmpleado}
          onChange={(e) => setTiempoEmpleado(e.target.value)}
          placeholder="Ej: 2 horas"
          style={estilos.input}
        />
      </div>

      <button
        onClick={guardarYEnviarAlAdmin}
        disabled={guardando}
        style={estilos.botonEnviar}
      >
        {guardando ? "Enviando..." : "✅ Guardar y Enviar Inspección al Admin"}
      </button>
    </div>
  );
}

const estilos = {
  pagina: { padding: 20, background: "#0a0f1a", minHeight: "100vh", color: "#fff", fontFamily: "Inter, sans-serif" },
  centrado: { minHeight: "100vh", background: "#0a0f1a", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center" },
  titulo: { color: "#ffcc00", marginBottom: 20, fontSize: 22, fontWeight: 700 },
  botonVolver: { background: "transparent", border: "1px solid #ffcc00", color: "#ffcc00", padding: "8px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 15 },
  tarjeta: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 16, marginBottom: 20 },
  label: { display: "block", color: "#9fb3c8", fontSize: 13, marginBottom: 6, fontWeight: 600, marginTop: 12 },
  input: { width: "100%", padding: 12, background: "#111827", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 14, marginBottom: 10 },
  textarea: { width: "100%", padding: 12, background: "#111827", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "#fff", fontSize: 14, marginBottom: 10 },
  contenedorBotonesFoto: { display: "flex", gap: 10, marginBottom: 15 },
  botonFoto: { flex: 1, textAlign: "center", background: "#f59e0b", color: "#000", padding: 12, borderRadius: 10, fontWeight: 700, cursor: "pointer" },
  botonGaleria: { flex: 1, textAlign: "center", background: "#10b981", color: "#fff", padding: 12, borderRadius: 10, fontWeight: 700, cursor: "pointer" },
  gridFotos: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 15 },
  miniatura: { width: 70, height: 70, objectFit: "cover", borderRadius: 8, border: "1px solid #fff" },
  botonEnviar: { width: "100%", padding: 14, background: "#22c55e", color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: "pointer" },
  ok: { color: "#4ade80", background: "rgba(74,222,128,0.1)", padding: 10, borderRadius: 8, marginBottom: 10, fontWeight: 600 },
  error: { color: "#f87171", background: "rgba(248,113,113,0.1)", padding: 10, borderRadius: 8, marginBottom: 10, fontWeight: 600 }
};
