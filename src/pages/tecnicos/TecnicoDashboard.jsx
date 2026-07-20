import React from "react";
import { Link } from "react-router-dom";
import { FaTools, FaHome, FaClipboardList, FaFileContract, FaUser } from "react-icons/fa";

export default function TecnicoDashboard() {
  return (
    <div style={{ padding: 20 }}>
      
      <h1 style={{ marginBottom: 20 }}>Panel del Técnico</h1>

      {/* TARJETAS DEL DASHBOARD */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: 20
      }}>

        {/* INSPECCIONES */}
        <Link to="/tecnico/inspecciones" style={{ textDecoration: "none" }}>
          <div style={{
            background: "#012a4a",
            color: "#fff",
            padding: 20,
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer"
          }}>
            <FaTools size={40} />
            <h3 style={{ marginTop: 10 }}>Inspecciones asignadas</h3>
          </div>
        </Link>

        {/* VIVIENDAS */}
        <Link to="/tecnico/viviendas" style={{ textDecoration: "none" }}>
          <div style={{
            background: "#014f86",
            color: "#fff",
            padding: 20,
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer"
          }}>
            <FaHome size={40} />
            <h3 style={{ marginTop: 10 }}>Viviendas asignadas</h3>
          </div>
        </Link>

        {/* TAREAS */}
        <Link to="/tecnico/tareas" style={{ textDecoration: "none" }}>
          <div style={{
            background: "#2a6f97",
            color: "#fff",
            padding: 20,
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer"
          }}>
            <FaClipboardList size={40} />
            <h3 style={{ marginTop: 10 }}>Tareas pendientes</h3>
          </div>
        </Link>

        {/* DOCUMENTOS */}
        <Link to="/tecnico/documentos" style={{ textDecoration: "none" }}>
          <div style={{
            background: "#468faf",
            color: "#fff",
            padding: 20,
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer"
          }}>
            <FaFileContract size={40} />
            <h3 style={{ marginTop: 10 }}>Documentos</h3>
          </div>
        </Link>

        {/* PERFIL */}
        <Link to="/tecnico/perfil" style={{ textDecoration: "none" }}>
          <div style={{
            background: "#61a5c2",
            color: "#fff",
            padding: 20,
            borderRadius: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            cursor: "pointer"
          }}>
            <FaUser size={40} />
            <h3 style={{ marginTop: 10 }}>Mi perfil</h3>
          </div>
        </Link>

      </div>
    </div>
  );
}
