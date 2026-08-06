import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../../layouts/Menu";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ClienteFacturasLista() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      if (!user) return;

      // RLS (facturas_select) ya limita esto a las facturas del cliente
      // logueado vía mi_cliente_id().
      const { data, error } = await supabase
        .from("facturas")
        .select("*")
        .order("fecha", { ascending: false });

      if (!error) setFacturas(data || []);
      setLoading(false);
    }

    cargar();
  }, [user]);

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
          Mis Facturas
        </h1>

        {loading ? (
          <p style={{ textAlign: "center", opacity: 0.8 }}>Cargando...</p>
        ) : facturas.length === 0 ? (
          <p style={{ textAlign: "center", opacity: 0.8 }}>
            No hay facturas registradas.
          </p>
        ) : (
          facturas.map((f) => (
            <div
              key={f.id}
              onClick={() => navigate(`/cliente/factura/${f.id}`)}
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "18px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 0 12px rgba(0,153,255,0.2)",
                marginBottom: "15px",
                cursor: "pointer",
              }}
            >
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: "#4db8ff" }}>Nº Factura:</strong>{" "}
                {f.numero}
              </p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: "#4db8ff" }}>Fecha:</strong> {f.fecha}
              </p>
              <p style={{ marginBottom: 6 }}>
                <strong style={{ color: "#4db8ff" }}>Total:</strong>{" "}
                {f.total != null ? `${f.total} €` : "—"}
              </p>
              <p>
                <strong style={{ color: "#4db8ff" }}>Estado:</strong>{" "}
                {f.estado}
              </p>
            </div>
          ))
        )}
      </div>
    </Menu>
  );
}
