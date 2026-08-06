import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";

export default function ClienteFacturaVer() {
  const { id } = useParams();
  const [factura, setFactura] = useState(null);
  const [lineas, setLineas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data, error } = await supabase
        .from("facturas")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        setMensaje("No se encontró la factura");
        setLoading(false);
        return;
      }

      setFactura(data);

      const { data: lineasData } = await supabase
        .from("facturas_lineas")
        .select("*")
        .eq("factura_id", id);

      setLineas(lineasData || []);
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

  if (!factura) {
    return (
      <Menu>
        <div style={{ padding: 20, color: "#fff", textAlign: "center" }}>
          <h1 style={{ color: "#4db8ff" }}>{mensaje}</h1>
          <Link to="/cliente/facturas" style={{ color: "#4db8ff" }}>
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
          Factura {factura.numero}
        </h1>

        <p style={{ marginBottom: 6 }}>
          <strong style={{ color: "#4db8ff" }}>Fecha:</strong> {factura.fecha}
        </p>
        <p style={{ marginBottom: 6 }}>
          <strong style={{ color: "#4db8ff" }}>Descripción:</strong>{" "}
          {factura.descripcion || "—"}
        </p>
        <p style={{ marginBottom: 6 }}>
          <strong style={{ color: "#4db8ff" }}>Estado:</strong>{" "}
          {factura.estado}
        </p>

        {lineas.length > 0 && (
          <div style={{ margin: "20px 0" }}>
            <h2 style={{ color: "#4db8ff", fontSize: 18, marginBottom: 10 }}>
              Detalle
            </h2>
            {lineas.map((l) => (
              <div
                key={l.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  background: "rgba(255,255,255,0.05)",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "6px",
                }}
              >
                <span>{l.descripcion}</span>
                <span>{l.total != null ? `${l.total} €` : ""}</span>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "16px",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <p style={{ marginBottom: 4 }}>Base: {factura.base} €</p>
          <p style={{ marginBottom: 4 }}>IVA: {factura.iva} €</p>
          <p style={{ fontWeight: 700, color: "#4db8ff" }}>
            Total: {factura.total} €
          </p>
        </div>

        {factura.pdf_url ? (
          <a
            href={factura.pdf_url}
            target="_blank"
            rel="noreferrer"
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
            Ver PDF
          </a>
        ) : (
          <p style={{ opacity: 0.8, textAlign: "center" }}>
            Aún no hay PDF generado para esta factura.
          </p>
        )}
      </div>
    </Menu>
  );
}
