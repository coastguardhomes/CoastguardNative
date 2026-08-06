import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function ClienteInspeccionVer() {
  const { id } = useParams();
  const [inspeccion, setInspeccion] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data: insp, error } = await supabase
        .from("inspecciones")
        .select("id, fecha, estado, notas, viviendas(direccion, ciudad)")
        .eq("id", id)
        .single();

      if (error || !insp) {
        setMensaje("No se encontró la inspección");
        setLoading(false);
        return;
      }

      setInspeccion(insp);

      const { data: items } = await supabase
        .from("checklist_inspeccion")
        .select("*")
        .eq("inspeccion_id", id)
        .order("id", { ascending: true });

      setChecklist(items || []);

      const { data: fotosData } = await supabase
        .from("fotos_inspeccion")
        .select("*")
        .eq("inspeccion_id", id)
        .order("id", { ascending: false });

      const fotosConURL = (fotosData || []).map((f) => {
        const { data: urlData } = supabase.storage
          .from("fotos")
          .getPublicUrl(f.archivo);
        return { ...f, publicUrl: f.url || urlData.publicUrl };
      });

      setFotos(fotosConURL);
      setLoading(false);
    }

    cargar();
  }, [id]);

  if (loading) {
    return (
      <Menu>
        <div style={{ padding: 20, color: "#fff", textAlign: "center" }}>
          Cargando...
        </div>
      </Menu>
    );
  }

  if (!inspeccion) {
    return (
      <Menu>
        <div style={{ padding: 20, color: "#fff", textAlign: "center" }}>
          <h1 style={{ color: "#4db8ff" }}>{mensaje}</h1>
          <Link to="/cliente/inspecciones" style={{ color: "#4db8ff" }}>
            Volver
          </Link>
        </div>
      </Menu>
    );
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
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          Inspección
        </h1>

        <p style={{ marginBottom: 6 }}>
          <strong style={{ color: "#4db8ff" }}>Dirección:</strong>{" "}
          {inspeccion.viviendas?.direccion || "Sin dirección"},{" "}
          {inspeccion.viviendas?.ciudad || ""}
        </p>
        <p style={{ marginBottom: 6 }}>
          <strong style={{ color: "#4db8ff" }}>Fecha:</strong>{" "}
          {inspeccion.fecha
            ? new Date(inspeccion.fecha).toLocaleDateString()
            : "Sin fecha"}
        </p>
        <p style={{ marginBottom: 20 }}>
          <strong style={{ color: "#4db8ff" }}>Estado:</strong>{" "}
          {inspeccion.estado}
        </p>

        {inspeccion.notas && (
          <p style={{ marginBottom: 20, opacity: 0.85 }}>
            <strong style={{ color: "#4db8ff" }}>Observaciones:</strong>{" "}
            {inspeccion.notas}
          </p>
        )}

        <h2 style={{ color: "#4db8ff", fontSize: 20, marginBottom: 12 }}>
          Checklist
        </h2>

        {checklist.length === 0 ? (
          <p style={{ opacity: 0.8, marginBottom: 20 }}>
            El checklist aún no está disponible.
          </p>
        ) : (
          <div style={{ marginBottom: 24 }}>
            {checklist.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.05)",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  marginBottom: "8px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span>{item.item}</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: item.completado ? "#4dff88" : "#ff6b6b",
                  }}
                >
                  {item.completado ? "OK" : "Pendiente"}
                </span>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ color: "#4db8ff", fontSize: 20, marginBottom: 12 }}>
          Fotos
        </h2>

        {fotos.length === 0 ? (
          <p style={{ opacity: 0.8, marginBottom: 20 }}>
            No hay fotos de esta inspección.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
              marginBottom: 24,
            }}
          >
            {fotos.map((f) => (
              <img
                key={f.id}
                src={f.publicUrl}
                alt="Foto de inspección"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            ))}
          </div>
        )}

        <Link
          to={`/inspecciones/pdf/${id}`}
          style={{
            display: "block",
            textAlign: "center",
            padding: "14px",
            background: "#4db8ff",
            color: "#000",
            borderRadius: "10px",
            fontWeight: "700",
            textDecoration: "none",
          }}
        >
          Ver informe PDF
        </Link>
      </div>
    </Menu>
  );
}
