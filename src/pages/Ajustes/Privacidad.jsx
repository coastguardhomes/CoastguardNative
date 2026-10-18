
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
            Esta página ofrece información general sobre el tratamiento
            de datos personales por CoastGuard Homes Services en relación
            con la aplicación y los servicios contratados. No sustituye
            a la política de privacidad completa, que debe identificar
            al responsable, las finalidades y bases jurídicas del
            tratamiento, los destinatarios, los plazos de conservación
            y las vías para ejercer tus derechos.
          </p>

          <div style={{ marginTop: "20px" }}>
            <div style={itemStyle}>
              <p style={titleStyle}>📄 Datos personales</p>
              <p>
                Se tratarán únicamente los datos personales adecuados,
                pertinentes y necesarios para las finalidades
                correspondientes, como gestionar tu cuenta, atender
                consultas, administrar la vivienda, prestar los servicios
                solicitados, gestionar contratos, facturación, pagos y
                comunicaciones relacionadas con CoastGuard Homes Services.
              </p>
              <p>
                La base jurídica del tratamiento dependerá de la finalidad
                concreta y podrá incluir la ejecución del contrato, el
                cumplimiento de obligaciones legales, el interés legítimo
                cuando proceda o el consentimiento cuando sea necesario.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🔑 Custodia de llaves</p>
              <p>
                Cuando contrates la custodia de llaves, se utilizará la
                información necesaria para identificar la vivienda y
                gestionar la recepción, custodia, control y devolución
                de las llaves.
              </p>
              <p>
                La custodia de llaves, por sí sola, no incluye visitas
                ni inspecciones de la vivienda. Estos servicios solo
                se prestarán cuando correspondan a un servicio contratado.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🏠 Visitas e inspecciones</p>
              <p>
                Si contratas un servicio que incluya visitas, inspecciones
                o informes, podrán tratarse los datos necesarios para
                prestarlo y documentarlo, incluidas observaciones,
                fotografías e informes cuando sean pertinentes.
              </p>
              <p>
                La recogida de estos datos se limitará a la finalidad
                del servicio contratado. Las fotografías y demás
                información no deberán utilizarse para finalidades
                incompatibles con aquellas para las que se recogieron,
                salvo que exista una base jurídica válida.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🔒 Seguridad y acceso</p>
              <p>
                Se deben aplicar medidas técnicas y organizativas
                adecuadas para proteger los datos personales frente
                al acceso no autorizado, la pérdida, la alteración
                o la divulgación indebida.
              </p>
              <p>
                El acceso a la información debe limitarse a las personas
                y proveedores que lo necesiten para sus funciones
                legítimas. Estas medidas reducen los riesgos, pero
                ningún sistema puede garantizar una seguridad absoluta.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>💳 Pagos y facturación</p>
              <p>
                Los datos necesarios para gestionar contratos,
                suscripciones, pagos y facturas podrán tratarse para
                ejecutar la relación contractual y cumplir las
                obligaciones contables, fiscales y demás obligaciones
                legales aplicables.
              </p>
              <p>
                Cuando intervengan proveedores de pagos u otros
                proveedores tecnológicos, el tratamiento de datos
                deberá ajustarse a sus funciones, a las condiciones
                aplicables y a las garantías exigidas por la normativa.
                La información completa sobre dichos proveedores
                y posibles transferencias internacionales debe figurar
                en la política de privacidad correspondiente.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🗄️ Conservación de datos</p>
              <p>
                Las fotografías de las inspecciones se conservarán
                durante un máximo de 60 días naturales desde su
                almacenamiento. Está previsto que un proceso automático
                elimine periódicamente las fotografías que superen
                ese plazo, incluidas las fotografías antiguas que
                hayan quedado sin vincular a una inspección.
              </p>
              <p>
                Este plazo de 60 días se refiere a las fotografías
                de inspección y no establece el plazo de conservación
                de contratos, firmas, facturas ni documentos fiscales,
                que se conservarán durante los plazos que resulten
                necesarios o legalmente exigibles.
              </p>
              <p>
                Los informes, observaciones y demás registros de
                inspección que no sean fotografías se conservarán
                únicamente durante el tiempo necesario para prestar
                el servicio, gestionar la relación contractual
                y atender las obligaciones legales o posibles
                reclamaciones. Sus plazos deberán revisarse según
                la finalidad de cada dato.
              </p>
              <p>
                Cuando los datos dejen de ser necesarios, se
                suprimirán o, cuando proceda legalmente, se mantendrán
                bloqueados durante el plazo correspondiente.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>🗑️ Supresión y cierre de cuenta</p>
              <p>
                Puedes solicitar la supresión de tus datos personales
                y, cuando exista esa funcionalidad, solicitar el cierre
                de tu cuenta. La solicitud se evaluará conforme a la
                normativa aplicable.
              </p>
              <p>
                La supresión no implica eliminar datos que deban
                conservarse por una obligación legal o que sean
                necesarios para formular, ejercer o defender
                reclamaciones. Cuando corresponda, esos datos se
                conservarán únicamente durante el plazo aplicable
                y con las restricciones legalmente exigidas.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>⚖️ Tus derechos</p>
              <p>
                Puedes ejercer los derechos de acceso, rectificación,
                supresión, oposición, limitación del tratamiento y,
                cuando proceda, portabilidad de tus datos. También
                puedes retirar el consentimiento cuando el tratamiento
                se base en él, sin que ello afecte a la licitud del
                tratamiento realizado previamente.
              </p>
              <p>
                Para ejercer tus derechos, escribe al correo de contacto.
                Es posible que sea necesario verificar tu identidad
                para proteger tus datos. También tienes derecho a
                presentar una reclamación ante la Agencia Española
                de Protección de Datos si consideras que el tratamiento
                no se ajusta a la normativa.
              </p>
            </div>

            <div style={itemStyle}>
              <p style={titleStyle}>📧 Contacto</p>
              <p>
                Para consultas relacionadas con la privacidad o para
                ejercer tus derechos, puedes escribir a:
                {" "}
                <a
                  href={`mailto:${email}`}
                  style={{ color: "#4db8ff" }}
                >
                  {email}
                </a>
                .
              </p>
              <p>
                La información completa de privacidad debe incluir
                también la identidad y los datos de contacto del
                responsable del tratamiento, así como los restantes
                datos exigidos por la normativa de protección de datos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Menu>
  );
}
