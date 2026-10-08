import React from "react";
import { useNavigate } from "react-router-dom";
import "./PoliticaPrivacidad.css";

export default function PoliticaPrivacidad() {
  const navigate = useNavigate();

  return (
    <div
      className="privacy-container"
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        color: "#333",
        lineHeight: "1.6",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          marginBottom: "20px",
          padding: "8px 16px",
          background: "#0056b3",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        ← Volver
      </button>

      <h1
        style={{
          color: "#00356b",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        POLÍTICA DE PRIVACIDAD
      </h1>

      <p>
        Esta Política de Privacidad informa sobre el tratamiento de datos
        personales realizado a través de CoastGuard Homes Services y de sus
        aplicaciones y servicios asociados.
      </p>

      <h3>1. RESPONSABLE DEL TRATAMIENTO</h3>

      <ul>
        <li>
          <strong>Responsable:</strong> Roxana Collazo Alonso
        </li>
        <li>
          <strong>Nombre comercial:</strong> CoastGuard Homes Services
        </li>
        <li>
          <strong>NIF/NIE:</strong> Z1968154A
        </li>
        <li>
          <strong>Domicilio profesional:</strong> Pilar de la Horadada,
          Alicante
        </li>
        <li>
          <strong>Correo electrónico:</strong>{" "}
          soporte@coastguardhomes.com
        </li>
      </ul>

      <h3>2. DATOS PERSONALES TRATADOS</h3>

      <p>
        Dependiendo del servicio utilizado, pueden tratarse las siguientes
        categorías de datos:
      </p>

      <ul>
        <li>
          Datos identificativos y de contacto, como nombre, apellidos,
          correo electrónico y teléfono.
        </li>
        <li>
          Datos necesarios para la gestión de la relación contractual y
          administrativa.
        </li>
        <li>
          Datos relativos a inmuebles, incluyendo dirección, características,
          incidencias e imágenes asociadas a inspecciones.
        </li>
        <li>
          Datos necesarios para la facturación y gestión de pagos.
        </li>
        <li>
          Datos técnicos y de seguridad necesarios para prestar los servicios
          contratados.
        </li>
        <li>
          Datos relacionados con la cuenta de usuario, autenticación,
          preferencias e idioma.
        </li>
      </ul>

      <p>
        Solo se solicitarán los datos necesarios para las finalidades
        correspondientes. Los datos especialmente sensibles o de acceso a
        inmuebles se tratarán únicamente cuando resulten necesarios para la
        prestación del servicio y deberán contar con medidas de seguridad
        adecuadas.
      </p>

      <h3>3. FINALIDADES DEL TRATAMIENTO</h3>

      <ul>
        <li>
          Gestionar el alta y mantenimiento de las cuentas de usuario.
        </li>
        <li>
          Gestionar contratos y servicios de supervisión y mantenimiento de
          viviendas.
        </li>
        <li>
          Gestionar inspecciones, incidencias, fotografías e informes.
        </li>
        <li>
          Emitir y gestionar facturas y pagos.
        </li>
        <li>
          Enviar comunicaciones necesarias para la prestación del servicio.
        </li>
        <li>
          Gestionar avisos e incidencias urgentes cuando sea necesario.
        </li>
        <li>
          Atender solicitudes, reclamaciones y ejercicios de derechos.
        </li>
        <li>
          Cumplir las obligaciones legales aplicables.
        </li>
      </ul>

      <h3>4. BASE JURÍDICA</h3>

      <p>
        Las bases jurídicas aplicables dependerán de la finalidad concreta:
      </p>

      <ul>
        <li>
          <strong>Ejecución del contrato:</strong> para prestar los servicios
          contratados, gestionar la cuenta, inspecciones, contratos,
          facturación y comunicaciones necesarias.
        </li>
        <li>
          <strong>Obligación legal:</strong> para aquellos tratamientos
          necesarios para cumplir obligaciones fiscales, contables,
          mercantiles u otras obligaciones legalmente exigibles.
        </li>
        <li>
          <strong>Consentimiento:</strong> cuando sea necesario y se solicite
          expresamente, pudiendo retirarse en cualquier momento sin afectar a
          la licitud del tratamiento realizado anteriormente.
        </li>
      </ul>

      <h3>5. CONSERVACIÓN DE LOS DATOS</h3>

      <p>
        Los datos personales se conservarán durante el tiempo necesario para
        cumplir la finalidad para la que fueron recogidos y, cuando proceda,
        durante los plazos necesarios para cumplir obligaciones legales o
        atender posibles responsabilidades.
      </p>

      <p>
        La conservación no se realizará durante un plazo único e
        indiscriminado para todos los datos. Los distintos tipos de
        información podrán conservarse durante períodos diferentes en función
        de su finalidad y de las obligaciones legales aplicables.
      </p>

      <p>
        Cuando determinados datos dejen de ser necesarios, se procederá a su
        supresión, anonimización o bloqueo cuando legalmente corresponda.
      </p>

      <h3>6. DESTINATARIOS Y ENCARGADOS DEL TRATAMIENTO</h3>

      <p>
        Para prestar los servicios pueden intervenir proveedores tecnológicos
        que actúen como encargados del tratamiento o proveedores independientes
        respecto de determinados servicios, según corresponda.
      </p>

      <p>
        Entre ellos pueden encontrarse proveedores de alojamiento,
        infraestructura tecnológica, almacenamiento, autenticación,
        comunicaciones, generación de documentos y servicios de pago.
      </p>

      <p>
        Estos proveedores solo tendrán acceso a los datos necesarios para
        prestar los servicios correspondientes y deberán estar sujetos a las
        obligaciones de protección de datos que resulten aplicables.
      </p>

      <p>
        También podrán comunicarse datos cuando exista una obligación legal,
        requerimiento de una autoridad competente o resulte necesario para la
        defensa de derechos y reclamaciones.
      </p>

      <h3>7. TRANSFERENCIAS INTERNACIONALES</h3>

      <p>
        Algunos proveedores tecnológicos utilizados para prestar el servicio
        pueden encontrarse fuera del Espacio Económico Europeo o utilizar
        infraestructura internacional. Cuando exista una transferencia
        internacional de datos, se aplicarán las garantías previstas por la
        normativa de protección de datos, como decisiones de adecuación,
        cláusulas contractuales tipo u otras garantías legalmente válidas.
      </p>

      <h3>8. DERECHOS DE LAS PERSONAS</h3>

      <p>
        Las personas cuyos datos sean tratados pueden ejercer, cuando
        corresponda, los derechos de:
      </p>

      <ul>
        <li>Acceso.</li>
        <li>Rectificación.</li>
        <li>Supresión.</li>
        <li>Oposición.</li>
        <li>Limitación del tratamiento.</li>
        <li>Portabilidad.</li>
        <li>Retirada del consentimiento cuando el tratamiento se base en él.</li>
      </ul>

      <p>
        Para ejercer estos derechos puedes escribir a:
      </p>

      <p>
        <strong>soporte@coastguardhomes.com</strong>
      </p>

      <p>
        La solicitud deberá permitir comprobar razonablemente la identidad de
        la persona solicitante. No se exigirá sistemáticamente una copia del
        DNI. Si existieran dudas razonables sobre la identidad, podrá
        solicitarse información adicional adecuada y proporcional para
        verificarla.
      </p>

      <p>
        Si consideras que el tratamiento de tus datos no se ajusta a la
        normativa, puedes presentar una reclamación ante la Agencia Española
        de Protección de Datos (AEPD).
      </p>

      <h3>9. SEGURIDAD</h3>

      <p>
        Se aplican medidas técnicas y organizativas destinadas a proteger los
        datos personales frente a accesos no autorizados, pérdida,
        destrucción, alteración o divulgación indebida.
      </p>

      <p>
        El acceso a la información de clientes se limita según las funciones
        y permisos necesarios para prestar el servicio. Las medidas de
        seguridad se revisan y actualizan cuando resulta necesario.
      </p>

      <h3>10. DATOS DE MENORES</h3>

      <p>
        Los servicios de CoastGuard están dirigidos a personas con capacidad
        legal suficiente para contratar los servicios correspondientes. No se
        pretende recopilar deliberadamente datos personales de menores sin las
        garantías legalmente exigibles.
      </p>

      <h3>11. DECISIONES AUTOMATIZADAS</h3>

      <p>
        No se adoptan decisiones exclusivamente automatizadas que produzcan
        efectos jurídicos o efectos significativamente similares sobre los
        usuarios, salvo que se informe previamente y exista una base jurídica
        que lo permita.
      </p>

      <h3>12. ACTUALIZACIONES DE ESTA POLÍTICA</h3>

      <p>
        Esta Política de Privacidad podrá actualizarse cuando cambien los
        servicios, los tratamientos realizados o la normativa aplicable. La
        versión vigente será la publicada en la aplicación o en el sitio web
        correspondiente.
      </p>
    </div>
  );
}
