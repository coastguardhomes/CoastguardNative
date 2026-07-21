import React, { useEffect, useState } from "react";
import { obtenerFacturas } from "../../services/facturasLista";

export default function EstadisticasFacturas() {
  const [stats, setStats] = useState({
    total: 0,
    pagadas: 0,
    pendientes: 0,
    suma: 0,
  });

  useEffect(() => {
    obtenerFacturas().then((facturas) => {
      const total = facturas.length;
      const pagadas = facturas.filter((f) => f.estado === "pagada").length;
      const pendientes = facturas.filter((f) => f.estado === "pendiente").length;
      const suma = facturas.reduce((acc, f) => acc + f.total, 0);

      setStats({ total, pagadas, pendientes, suma });
    });
  }, []);

  return (
    <div
      style={{
        padding: "20px",
        background: "#0a0f1a",
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          color: "#4db8ff",
          marginBottom: "25px",
          fontSize: "28px",
          fontWeight: "700",
          textShadow: "0 0 8px rgba(0,153,255,0.6)",
        }}
      >
        Estadísticas de Facturación
      </h2>

      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          padding: "20px",
          borderRadius: "14px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 12px rgba(0,153,255,0.2)",
        }}
      >
        <p style={{ marginBottom: "12px", fontSize: "18px" }}>
          <strong style={{ color: "#4db8ff" }}>Total facturas:</strong>{" "}
          {stats.total}
        </p>

        <p style={{ marginBottom: "12px", fontSize: "18px" }}>
          <strong style={{ color: "#4db8ff" }}>Pagadas:</strong>{" "}
          {stats.pagadas}
        </p>

        <p style={{ marginBottom: "12px", fontSize: "18px" }}>
          <strong style={{ color: "#4db8ff" }}>Pendientes:</strong>{" "}
          {stats.pendientes}
        </p>

        <p style={{ marginBottom: "12px", fontSize: "18px" }}>
          <strong style={{ color: "#4db8ff" }}>Total facturado:</strong> €
          {stats.suma}
        </p>
      </div>
    </div>
  );
}
