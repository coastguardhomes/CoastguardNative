import React from "react";
import { useNavigate } from "react-router-dom";

export default function Menu() {
  const navigate = useNavigate();

  return (
    <nav
      style={{
        backgroundColor: "#0b0c10",
        borderTop: "2px solid #1f2833",
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 0",
      }}
    >
      {/* CLIENTES */}
      <div
        onClick={() => navigate("/clientes")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <ion-icon
          name="person-outline"
          style={{ color: "#4da8ff", fontSize: "1.8rem" }}
        ></ion-icon>
        <span
          style={{
            color: "#f9d71c",
            fontSize: "0.9rem",
            marginTop: "4px",
          }}
        >
          Clientes
        </span>
      </div>

      {/* INSPECCIONES */}
      <div
        onClick={() => navigate("/inspecciones")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <ion-icon
          name="search-outline"
          style={{ color: "#4da8ff", fontSize: "1.8rem" }}
        ></ion-icon>
        <span
          style={{
            color: "#f9d71c",
            fontSize: "0.9rem",
            marginTop: "4px",
          }}
        >
          Inspecciones
        </span>
      </div>

      {/* FACTURAS */}
      <div
        onClick={() => navigate("/facturas")}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <ion-icon
          name="cash-outline"
          style={{ color: "#4da8ff", fontSize: "1.8rem" }}
        ></ion-icon>
        <span
          style={{
            color: "#f9d71c",
            fontSize: "0.9rem",
            marginTop: "4px",
          }}
        >
          Facturas
        </span>
      </div>
    </nav>
  );
}
