import React, { forwardRef } from "react";

/**
 * Plantilla HTML unificada para generar PDF en WEB y APP
 * CoastGuard 2026 - Corregida para compatibilidad móvil
 */
const PlantillaPDFInspeccion = forwardRef(({ cliente, vivienda, contrato, inspeccion, checklist, fotos }, ref) => {
  // Aseguramos una ruta absoluta o segura para el logo tanto en Web como en Capacitor
  const logoSrc = window.location.origin.includes("localhost") || window.location.origin.includes("capacitor")
    ? "/logo-coastguard.png" 
    : `${window.location.origin}/logo-coastguard.png`;

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
          src={logoSrc}
          crossOrigin="anonymous"
          style={{ height: "70px", objectFit: "contain" }}
          alt="CoastGuard"
          onError={(e) => {
            // Fallback si la imagen local falla en la app móvil
            e.target.style.display = 'none';
          }}
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
      <p><strong>Nombre:</strong> {cliente?.nombre || "No especificado"}</p>
      <p><strong>Email:</strong> {cliente?.email || "No especificado"}</p>

      {/* VIVIENDA */}
      <h2 style={{ color: "#0a84ff", marginTop: "30px" }}>Vivienda</h2>
      <p><strong>Dirección:</strong> {vivienda?.direccion || "No especificada"}</p>

      {/* SERVICIO */}
      <h2 style={{ color: "#0a84ff", marginTop: "30px" }}>Servicio</h2>
      <p><strong>Tipo de servicio:</strong> {contrato?.tipo_servicio || "Estándar"}</p>
      <p><strong>Fecha de inspección:</strong> {inspeccion?.fecha_inspeccion || "Pendiente"}</p>

      {/* CHECKLIST */}
      <h2 style={{ color: "#0a84ff", marginTop: "30px" }}>Checklist</h2>
      <div style={{ marginTop: "10px" }}>
        {checklist && checklist.length > 0 ? (
          checklist.map((item, i) => (
            <p key={i} style={{ margin: "6px 0", fontSize: "15px" }}>
              <strong>{item.item}</strong> —{" "}
              <span style={{ color: item.completado ? "green" : "red", fontWeight: "bold" }}>
                {item.completado ? "OK" : "KO"}
              </span>
            </p>
          ))
        ) : (
          <p>No hay elementos en el checklist.</p>
        )}
      </div>

      {/* OBSERVACIONES */}
      <h2 style={{ color: "#0a84ff", marginTop: "30px" }}>Observaciones</h2>
      <p style={{ fontSize: "15px", lineHeight: 1.5 }}>
        {inspeccion?.observaciones || "Sin observaciones registradas."}
      </p>

      {/* FOTO PRINCIPAL */}
      <h2 style={{ color: "#0a84ff", marginTop: "30px" }}>Foto Principal</h2>
      {inspeccion?.foto_principal ? (
        <img
          src={inspeccion.foto_principal}
          crossOrigin="anonymous"
          style={{
            width: "300px",
            maxHeight: "200px",
            objectFit: "cover",
            borderRadius: "10px",
            marginTop: "10px",
            border: "2px solid #0a84ff",
          }}
          alt="Foto principal"
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
        {fotos && fotos.length > 0 ? (
          fotos.map((f, i) => (
            <img
              key={i}
              src={f.url}
              crossOrigin="anonymous"
              style={{
                width: "260px",
                height: "180px",
                objectFit: "cover",
                borderRadius: "10px",
                border: "1px solid #ccc",
              }}
              alt={`Inspección ${i + 1}`}
            />
          ))
        ) : (
          <p>No hay fotos adicionales.</p>
        )}
      </div>

      {/* FIRMA */}
      <h2 style={{ color: "#0a84ff", marginTop: "30px" }}>Firma del Cliente</h2>
      {inspeccion?.firma_url ? (
        <img
          src={inspeccion.firma_url}
          crossOrigin="anonymous"
          style={{
            width: "300px",
            maxHeight: "120px",
            objectFit: "contain",
            borderRadius: "10px",
            border: "2px solid #0a84ff",
            marginTop: "10px",
            background: "#f9f9f9"
          }}
          alt="Firma"
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

PlantillaPDFInspeccion.displayName = "PlantillaPDFInspeccion";

export default PlantillaPDFInspeccion;
        
