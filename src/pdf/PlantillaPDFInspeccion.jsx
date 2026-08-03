import React, { forwardRef } from "react";

/**
 * Plantilla HTML unificada para generar PDF en WEB y APP
 * CoastGuard 2026
 */
const PlantillaPDFInspeccion = forwardRef(({ cliente, vivienda, contrato, inspeccion, checklist, fotos }, ref) => {
  return (
    <div
      ref={ref}
      id="pdf-inspeccion"
      style={{
        width: "100%",
        padding: "30px",
        background: "#ffffff",
        fontFamily: "Arial, sans-serif",
        color: "#222",
      }}
    >
      {/* LOGO */}
      <div style={{ textAlign: "center", marginBottom: "25px" }}>
        <img
          src="/logo-coastguard.png"
          style={{ height: "70px" }}
          alt="CoastGuard"
        />
      </div>

      {/* CABECERA */}
      <h1 style={{ textAlign: "center", color: "#0a84ff", marginBottom: "10px" }}>
        Informe de Inspección
      </h1>

      <p style={{ textAlign: "center", fontSize: "14px", opacity: 0.8 }}>
        CoastGuard — Protección y supervisión de viviendas
      </p>

      <hr style={{ margin: "25px 0", border: "none", borderTop: "2px solid #0a84ff" }} />

      {/* CLIENTE */}
      <h2 style={{ color: "#0a84ff" }}>Datos del Cliente</h2>
      <p><strong>Nombre:</strong> {cliente?.nombre}</p>
      <p><strong>Email:</strong> {cliente?.email}</p>

      {/* VIVIENDA */}
      <h2 style={{ color: "#0a84ff", marginTop: "30px" }}>Vivienda</h2>
      <p><strong>Dirección:</strong> {vivienda?.direccion}</p>

      {/* SERVICIO */}
      <h2 style={{ color: "#0a84ff", marginTop: "30px" }}>Servicio</h2>
      <p><strong>Tipo de servicio:</strong> {contrato?.tipo_servicio}</p>
      <p><strong>Fecha de inspección:</strong> {inspeccion?.fecha_inspeccion}</p>

      {/* CHECKLIST */}
      <h2 style={{ color: "#0a84ff", marginTop: "30px" }}>Checklist</h2>
      <div style={{ marginTop: "10px" }}>
        {checklist?.map((item, i) => (
          <p key={i} style={{ margin: "6px 0", fontSize: "15px" }}>
            <strong>{item.item}</strong> —{" "}
            <span style={{ color: item.completado ? "green" : "red" }}>
              {item.completado ? "OK" : "KO"}
            </span>
          </p>
        ))}
      </div>

      {/* OBSERVACIONES */}
      <h2 style={{ color: "#0a84ff", marginTop: "30px" }}>Observaciones</h2>
      <p style={{ fontSize: "15px", lineHeight: 1.5 }}>
        {inspeccion?.observaciones || "Sin observaciones"}
      </p>

      {/* FOTO PRINCIPAL */}
      <h2 style={{ color: "#0a84ff", marginTop: "30px" }}>Foto Principal</h2>
      {inspeccion?.foto_principal ? (
        <img
          src={inspeccion.foto_principal}
          style={{
            width: "300px",
            borderRadius: "10px",
            marginTop: "10px",
            border: "2px solid #0a84ff",
          }}
        />
      ) : (
        <p>No hay foto principal registrada.</p>
      )}

      {/* FOTOS */}
      <h2 style={{ color: "#0a84ff", marginTop: "30px" }}>Fotos de la Inspección</h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "15px",
          marginTop: "10px",
        }}
      >
        {fotos?.map((f, i) => (
          <img
            key={i}
            src={f.url}
            style={{
              width: "260px",
              borderRadius: "10px",
              border: "1px solid #ccc",
            }}
          />
        ))}
      </div>

      {/* FIRMA */}
      <h2 style={{ color: "#0a84ff", marginTop: "30px" }}>Firma del Cliente</h2>
      {inspeccion?.firma_url ? (
        <img
          src={inspeccion.firma_url}
          style={{
            width: "300px",
            borderRadius: "10px",
            border: "2px solid #0a84ff",
            marginTop: "10px",
          }}
        />
      ) : (
        <p>No hay firma registrada.</p>
      )}

      {/* FOOTER */}
      <hr style={{ margin: "40px 0", border: "none", borderTop: "1px solid #ccc" }} />

      <p style={{ textAlign: "center", fontSize: "12px", opacity: 0.7 }}>
        CoastGuard — Supervisión profesional de viviendas en la Costa Blanca<br />
        www.coastguard.es · info@coastguard.es · +34 600 000 000
      </p>
    </div>
  );
});

export default PlantillaPDFInspeccion;
