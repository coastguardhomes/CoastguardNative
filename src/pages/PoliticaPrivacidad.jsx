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
type="button"
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
    Esta Política de Privacidad explica cómo CoastGuard Homes Services
    trata los datos personales de las personas que utilizan la aplicación,
    el sitio web y los servicios asociados. El tratamiento se realizará
    conforme al Reglamento General de Protección de Datos (RGPD), la Ley
    Orgánica 3/2018 de Protección de Datos Personales y garantía de los
    derechos digitales y las demás normas que resulten aplicables.
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
      Alicante, España.
    </li>
    <li>
      <strong>Correo electrónico de contacto:</strong>{" "}
      <a href="mailto:soporte@coastguardhomes.com">
        soporte@coastguardhomes.com
      </a>
    </li>
  </ul>

  <p>
    Para consultas relacionadas con la protección de datos o para ejercer
    los derechos indicados en esta política, puedes utilizar el correo
    electrónico anterior. El domicilio profesional deberá completarse con
    la dirección postal correspondiente en la información legal publicada
    por el responsable.
  </p>

  <h3>2. CATEGORÍAS DE DATOS PERSONALES</h3>

  <p>
    Según el servicio utilizado y la relación de cada persona con
    CoastGuard Homes Services, pueden tratarse las siguientes categorías
    de datos:
  </p>

  <ul>
    <li>
      <strong>Identificación y contacto:</strong> nombre, apellidos,
      correo electrónico y teléfono, cuando se faciliten.
    </li>
    <li>
      <strong>Cuenta y autenticación:</strong> identificador de usuario,
      datos necesarios para gestionar el acceso a la cuenta, idioma y
      preferencias de la aplicación.
    </li>
    <li>
      <strong>Relación contractual:</strong> información de clientes,
      técnicos, contratos, servicios solicitados y datos administrativos
      necesarios para gestionar dicha relación.
    </li>
    <li>
      <strong>Inmuebles:</strong> dirección, características relevantes
      para el servicio, incidencias, observaciones e información asociada
      a las viviendas gestionadas.
    </li>
    <li>
      <strong>Inspecciones:</strong> resultados de inspecciones,
      observaciones técnicas, fotografías e informes relacionados con el
      servicio.
    </li>
    <li>
      <strong>Facturación y pagos:</strong> datos necesarios para emitir
      facturas, gestionar cobros y cumplir las obligaciones fiscales y
      contables. Los datos completos de instrumentos de pago se tratarán
      únicamente cuando sea necesario y mediante los proveedores
      correspondientes.
    </li>
    <li>
      <strong>Seguridad y funcionamiento:</strong> registros técnicos
      necesarios para autenticar usuarios, proteger las cuentas, prevenir
      usos indebidos y diagnosticar incidencias.
    </li>
    <li>
      <strong>Comunicaciones:</strong> mensajes y datos relacionados con
      solicitudes, avisos, reclamaciones y atención al cliente.
    </li>
  </ul>

  <p>
    Se procurará recoger únicamente los datos adecuados, pertinentes y
    necesarios para cada finalidad. No se deberán introducir contraseñas,
    datos de tarjetas bancarias ni información personal innecesaria en
    campos de observaciones, fotografías o informes.
  </p>

  <h3>3. FINALIDADES DEL TRATAMIENTO</h3>

  <p>Los datos podrán utilizarse para las siguientes finalidades:</p>

  <ul>
    <li>Crear y administrar las cuentas de usuario.</li>
    <li>
      Gestionar la relación con clientes, técnicos y demás usuarios
      autorizados.
    </li>
    <li>
      Organizar y prestar los servicios contratados de supervisión,
      inspección y mantenimiento de viviendas.
    </li>
    <li>
      Registrar inspecciones, incidencias, fotografías, observaciones e
      informes técnicos.
    </li>
    <li>
      Gestionar contratos, facturas, cobros y obligaciones contables o
      fiscales.
    </li>
    <li>
      Enviar comunicaciones necesarias para gestionar los servicios,
      avisos, incidencias y solicitudes.
    </li>
    <li>
      Proteger la aplicación, controlar los accesos y prevenir usos no
      autorizados.
    </li>
    <li>
      Atender consultas, reclamaciones y solicitudes relacionadas con los
      derechos de las personas.
    </li>
    <li>
      Cumplir las obligaciones legales aplicables y formular, ejercer o
      defender reclamaciones cuando resulte necesario.
    </li>
  </ul>

  <p>
    Los datos no deberán utilizarse para finalidades incompatibles con
    aquellas para las que fueron recogidos. Cualquier nueva finalidad que
    requiera información adicional se comunicará cuando así lo exija la
    normativa.
  </p>

  <h3>4. BASE JURÍDICA</h3>

  <p>
    El tratamiento se basará en la circunstancia jurídica que corresponda
    a cada finalidad:
  </p>

  <ul>
    <li>
      <strong>Ejecución de un contrato o aplicación de medidas
      precontractuales:</strong> para gestionar cuentas, prestar servicios
      solicitados, organizar inspecciones y administrar la relación
      contractual.
    </li>
    <li>
      <strong>Obligación legal:</strong> para cumplir las obligaciones
      fiscales, contables y demás deberes legalmente exigibles.
    </li>
    <li>
      <strong>Interés legítimo:</strong> cuando exista un interés legítimo
      concreto, necesario y equilibrado, por ejemplo, para proteger la
      seguridad del servicio o defender reclamaciones, respetando los
      derechos y libertades de las personas.
    </li>
    <li>
      <strong>Consentimiento:</strong> para tratamientos que requieran una
      autorización válida. El consentimiento podrá retirarse en cualquier
      momento, sin afectar a la licitud del tratamiento realizado antes
      de su retirada.
    </li>
  </ul>

  <p>
    La base jurídica deberá determinarse atendiendo al tratamiento
    concreto. La aceptación de esta política no sustituye al consentimiento
    específico que pueda ser necesario para otras finalidades.
  </p>

  <h3>5. CARÁCTER OBLIGATORIO DE LOS DATOS</h3>

  <p>
    Los datos estrictamente necesarios para crear una cuenta, formalizar
    una relación contractual o prestar un servicio deberán facilitarse
    cuando sean imprescindibles para esas finalidades. La falta de dichos
    datos puede impedir el alta o la correcta prestación del servicio.
  </p>

  <p>
    Los datos adicionales que no sean necesarios para la prestación del
    servicio deberán ser opcionales. En cada formulario se procurará
    identificar los campos obligatorios.
  </p>

  <h3>6. CONSERVACIÓN DE LOS DATOS</h3>

  <p>
    Los datos se conservarán durante el tiempo necesario para cumplir la
    finalidad para la que fueron recogidos y, cuando proceda, durante los
    plazos legales de conservación y prescripción de responsabilidades.
  </p>

  <ul>
    <li>
      <strong>Datos de cuenta:</strong> durante la vigencia de la cuenta y
      el tiempo adicional necesario para resolver obligaciones o
      reclamaciones pendientes.
    </li>
    <li>
      <strong>Contratos, facturas y documentación contable:</strong>
      durante los plazos legalmente aplicables a cada documento.
    </li>
    <li>
      <strong>Inspecciones, fotografías e incidencias:</strong> durante el
      tiempo necesario para prestar el servicio, acreditar su ejecución y
      atender las responsabilidades que puedan derivarse, de acuerdo con
      los criterios de conservación aplicables.
    </li>
    <li>
      <strong>Solicitudes y reclamaciones:</strong> durante el tiempo
      necesario para tramitarlas y atender las posibles responsabilidades
      posteriores.
    </li>
    <li>
      <strong>Registros de seguridad:</strong> durante el período
      proporcionado y necesario para proteger el servicio, investigar
      incidencias y cumplir las obligaciones aplicables.
    </li>
  </ul>

  <p>
    No se establece un único plazo de conservación para todos los datos.
    Los períodos concretos deberán ajustarse a la normativa aplicable y a
    las necesidades reales de cada tratamiento. Cuando los datos dejen de
    ser necesarios, se suprimirán, anonimizarán o bloquearán cuando
    legalmente corresponda.
  </p>

  <h3>7. DESTINATARIOS Y PROVEEDORES</h3>

  <p>
    El acceso a los datos se limitará a las personas autorizadas que
    necesiten conocerlos para prestar el servicio y a los proveedores que
    deban intervenir legítimamente en su funcionamiento.
  </p>

  <p>
    Según las funcionalidades efectivamente utilizadas, podrán intervenir
    proveedores de alojamiento e infraestructura tecnológica,
    almacenamiento, autenticación, comunicaciones, generación de
    documentos y gestión de pagos. Estos proveedores deberán disponer de
    una base jurídica adecuada para el acceso a los datos y, cuando actúen
    como encargados del tratamiento, de las condiciones contractuales
    exigidas por la normativa.
  </p>

  <p>
    Los datos también podrán comunicarse a autoridades públicas,
    tribunales u otros destinatarios cuando exista una obligación legal
    válida o sea necesario para formular, ejercer o defender reclamaciones.
  </p>

  <p>
    No se venderán los datos personales a terceros. Los accesos de
    proveedores y las comunicaciones de datos deberán limitarse a lo
    necesario para la finalidad correspondiente.
  </p>

  <h3>8. TRANSFERENCIAS INTERNACIONALES</h3>

  <p>
    Algunos proveedores tecnológicos pueden tratar datos desde países
    situados fuera del Espacio Económico Europeo. Cuando se produzca una
    transferencia internacional, esta deberá contar con un mecanismo
    válido conforme al RGPD, como una decisión de adecuación, cláusulas
    contractuales tipo u otra garantía legalmente reconocida, según
    corresponda.
  </p>

  <p>
    Antes de utilizar un proveedor que implique transferencias
    internacionales, deberán verificarse su ubicación, las condiciones
    aplicables al servicio y las garantías correspondientes.
  </p>

  <h3>9. DERECHOS DE LAS PERSONAS</h3>

  <p>
    Cuando se cumplan los requisitos legales, puedes ejercer los
    siguientes derechos:
  </p>

  <ul>
    <li>
      <strong>Acceso:</strong> conocer si se están tratando tus datos y
      obtener acceso a ellos.
    </li>
    <li>
      <strong>Rectificación:</strong> corregir datos inexactos o
      incompletos.
    </li>
    <li>
      <strong>Supresión:</strong> solicitar la eliminación de los datos
      cuando proceda legalmente.
    </li>
    <li>
      <strong>Oposición:</strong> oponerte a determinados tratamientos
      cuando concurran los requisitos establecidos por la normativa.
    </li>
    <li>
      <strong>Limitación:</strong> solicitar la limitación del tratamiento
      en los supuestos previstos legalmente.
    </li>
    <li>
      <strong>Portabilidad:</strong> recibir determinados datos en un
      formato estructurado y transmitirlos a otro responsable cuando se
      cumplan los requisitos legales.
    </li>
    <li>
      <strong>Retirada del consentimiento:</strong> retirar el
      consentimiento en cualquier momento cuando el tratamiento se base
      en él.
    </li>
  </ul>

  <p>
    Puedes ejercer tus derechos escribiendo a{" "}
    <a href="mailto:soporte@coastguardhomes.com">
      soporte@coastguardhomes.com
    </a>{" "}
    e indicando qué derecho deseas ejercer.
  </p>

  <p>
    Podrá solicitarse información adicional únicamente cuando existan
    dudas razonables sobre la identidad de la persona solicitante y
    resulte necesario para verificarla de manera proporcionada. No se
    exigirá sistemáticamente una copia del documento de identidad.
  </p>

  <p>
    Se responderá dentro de los plazos establecidos por la normativa
    aplicable. El ejercicio de los derechos es gratuito salvo en los
    supuestos excepcionales previstos legalmente.
  </p>

  <p>
    También puedes presentar una reclamación ante la Agencia Española de
    Protección de Datos (AEPD):{" "}
    <a
      href="https://www.aepd.es/"
      target="_blank"
      rel="noopener noreferrer"
    >
      www.aepd.es
    </a>
    .
  </p>

  <h3>10. SEGURIDAD Y ACCESO A LA INFORMACIÓN</h3>

  <p>
    Deben aplicarse medidas técnicas y organizativas adecuadas al riesgo
    para proteger los datos frente a destrucción, pérdida, alteración,
    divulgación o acceso no autorizados.
  </p>

  <p>
    El acceso a la información deberá ajustarse a las funciones y permisos
    de cada usuario. Los datos de clientes, contratos, facturas,
    inspecciones, fotografías y documentos deberán protegerse mediante
    controles de acceso adecuados y revisiones periódicas de los permisos.
  </p>

  <p>
    Ninguna medida de seguridad puede garantizar un riesgo cero. Si se
    produce una violación de seguridad, se gestionará conforme a las
    obligaciones legales aplicables, incluidas las notificaciones que
    correspondan.
  </p>

  <h3>11. FOTOGRAFÍAS E INFORMACIÓN DE INMUEBLES</h3>

  <p>
    Las fotografías, direcciones, observaciones e informes se utilizarán
    únicamente para las finalidades legítimas relacionadas con los
    servicios contratados y la gestión de incidencias.
  </p>

  <p>
    Las personas que realicen inspecciones deberán evitar incluir en las
    imágenes personas identificables, documentos, datos de contacto u
    otros elementos personales que no sean necesarios para documentar el
    estado del inmueble o la incidencia.
  </p>

  <p>
    Cuando una imagen o un informe pueda contener datos personales de
    terceros, deberán respetarse los principios de necesidad,
    proporcionalidad y acceso restringido.
  </p>

  <h3>12. DATOS DE MENORES</h3>

  <p>
    Los servicios están dirigidos a personas que puedan contratar o
    utilizar legalmente los servicios correspondientes. No se pretende
    recoger deliberadamente datos de menores sin contar con la base
    jurídica y las garantías que resulten necesarias.
  </p>

  <h3>13. DECISIONES AUTOMATIZADAS</h3>

  <p>
    Los tratamientos que impliquen decisiones exclusivamente automatizadas
    con efectos jurídicos o efectos significativamente similares deberán
    identificarse y someterse a los requisitos del RGPD. Cuando proceda,
    se facilitará información sobre la lógica aplicada, la importancia y
    las consecuencias previstas, así como sobre los derechos que
    correspondan a la persona afectada.
  </p>

  <h3>14. ACTUALIZACIONES DE ESTA POLÍTICA</h3>

  <p>
    Esta política podrá actualizarse cuando cambien los servicios, los
    tratamientos de datos o la normativa aplicable. La versión vigente
    será la publicada en la aplicación o en el sitio web correspondiente,
    junto con la fecha de su última actualización.
  </p>

  <p>
    Si se introduce un cambio que requiera información adicional o una
    nueva base jurídica, se adoptarán las medidas de información y, cuando
    corresponda, de obtención del consentimiento que exija la normativa.
  </p>
</div>

);
}
