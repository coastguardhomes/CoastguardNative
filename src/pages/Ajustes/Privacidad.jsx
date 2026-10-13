import React from "react";
import Menu from "../../layouts/Menu";

export default function Privacidad() {
  const cardStyle = {
    background: "rgba(255,255,255,0.05)",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 0 12px rgba(0,153,255,0.2)",
    marginBottom: "20px",
  };

  const itemStyle = {
    marginBottom: "15px",
    lineHeight: "1.6",
    fontSize: "16px",
    opacity: 0.85,
  };

  const titleStyle = {
    fontSize: "18px",
    fontWeight: "600",
    color: "#4db8ff",
    marginBottom: "8px",
    textShadow: "0 0 6px rgba(0,153,255,0.5)",
  };

  const email = "coastguardhomes@gmail.com";

  return (
    <Menu>
      <div
        style={{
          padding: "25px",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "20px",
            color: "#4db8ff",
            textShadow: "0 0 8px rgba(0,153,255,0.6)",
          }}
        >
          🔐 Privacidad
        </h1>

        <div style={cardStyle}>
          <p style={{ fontSize: "16px", opacity: 0.8 }}>
            Información sobre cómo CoastGuard Homes Services trata y protege
            tus datos personales al utilizar la aplicación y los servicios
            contratados.
          </p>

          <div style={{ marginTop: "20px" }}>
            <div style={itemStyle}>
              <p style={titleStyle}>📄 Datos personales</p>
              <p>
                Se podrán tratar los datos necesarios para gestionar tu
                cuenta, contacto, vivienda, contratos, servicios solicitados,
                facturación, pagos y comunicaciones relacionadas con
                CoastGuard Homes Services.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🔑 Custodia de llaves</p>
              <p>
                Cuando contrates la custodia de llaves, se utilizará la
                información necesaria para identificar la vivienda y
                gestionar la recepción, custodia, control y devolución de
                las llaves. La custodia de llaves, por sí sola, no incluye
                visitas ni inspecciones de la vivienda.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🏠 Visitas e inspecciones</p>
              <p>
                Si contratas un servicio que incluya visitas, inspecciones
                o informes, podrán tratarse las observaciones, fotografías
                y demás datos necesarios para prestar y documentar ese
                servicio. Estos datos no se presuponen incluidos en la
                custodia de llaves y se limitarán a la finalidad contratada.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🔒 Seguridad</p>
              <p>
                CoastGuard Homes Services debe aplicar medidas técnicas y
                organizativas adecuadas para proteger los datos y limitar
                el acceso a la información según las funciones y permisos
                correspondientes. Ningún sistema puede garantizar un riesgo
                cero.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>💳 Pagos y facturación</p>
              <p>
                Los datos necesarios para gestionar suscripciones, pagos y
                facturas se utilizarán para administrar la relación
                contractual y cumplir las obligaciones legales aplicables.
                Los proveedores que intervengan tratarán los datos conforme
                a sus funciones y condiciones.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🗑️ Eliminación de datos</p>
              <p>
                Puedes solicitar la supresión de tus datos escribiendo al
                correo de contacto. La eliminación estará sujeta a las
                obligaciones legales de conservación y a los datos que
                deban mantenerse para gestionar responsabilidades o
                reclamaciones pendientes.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>⚖️ Tus derechos</p>
              <p>
                Puedes solicitar el acceso, rectificación, supresión,
                limitación u oposición al tratamiento y, cuando proceda,
                la portabilidad de tus datos o retirar el consentimiento
                otorgado. Para ejercer tus derechos, contacta con la
                responsable del tratamiento.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>📧 Contacto</p>
              <p>
                Para consultas sobre privacidad o para ejercer tus derechos,
                escribe a{" "}
                <a
                  href={`mailto:${email}`}
                  style={{ color: "#4db8ff" }}
                >
                  {email}
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </Menu>
  );
}
