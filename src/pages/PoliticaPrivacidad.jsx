import React from "react";
import { useNavigate } from "react-router-dom";
import "./PoliticaPrivacidad.css";

export default function PoliticaPrivacidad() {
  const navigate = useNavigate();

  const email = "coastguardhomes@gmail.com";

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
        <strong>Última actualización:</strong> 13 de octubre de 2026.
      </p>

      <p>
        Esta Política de Privacidad informa sobre el tratamiento de datos
        personales realizado por CoastGuard Homes Services en relación con
        su aplicación, sitio web, cuenta de usuario y servicios contratados.
        El tratamiento se regirá por el Reglamento (UE) 2016/679, General de
        Protección de Datos (RGPD), la Ley Orgánica 3/2018, de Protección de
        Datos Personales y garantía de los derechos digitales (LOPDGDD), y
        las demás disposiciones aplicables.
      </p>

      <h3>1. RESPONSABLE DEL TRATAMIENTO</h3>

      <ul>
        <li>
          <strong>Responsable:</strong> Roxana Collazo Alonso, trabajadora
          autónoma.
        </li>
        <li>
          <strong>Nombre comercial:</strong> CoastGuard Homes Services.
        </li>
        <li>
          <strong>NIE/NIF:</strong> Z1968154A.
        </li>
        <li>
          <strong>Domicilio profesional:</strong> Calle Casicas de Arriba,
          33, 1.º F, Pilar de la Horadada, Alicante, España.
        </li>
        <li>
          <strong>Correo electrónico:</strong>{" "}
          <a href={`mailto:${email}`}>{email}</a>.
        </li>
      </ul>

      <p>
        Para realizar consultas sobre privacidad o ejercer los derechos
        descritos en esta política, puedes contactar con la responsable
        mediante el correo electrónico indicado.
      </p>

      <h3>2. CATEGORÍAS DE DATOS PERSONALES</h3>

      <p>
        Los datos tratados dependerán de las funciones utilizadas, de la
        relación contractual y de los servicios que el cliente haya
        solicitado. Podrán incluir:
      </p>

      <ul>
        <li>
          <strong>Identificación y contacto:</strong> nombre, apellidos,
          correo electrónico, teléfono, dirección y otros datos de contacto
          facilitados por el interesado.
        </li>
        <li>
          <strong>Cuenta y autenticación:</strong> identificador de usuario,
          información necesaria para administrar la cuenta y registros
          técnicos relacionados con el acceso y la autenticación.
        </li>
        <li>
          <strong>Relación contractual:</strong> solicitudes, presupuestos,
          contratos, servicios solicitados, comunicaciones, renovaciones,
          cancelaciones y datos necesarios para gestionar la relación con
          el cliente.
        </li>
        <li>
          <strong>Datos del inmueble:</strong> dirección de la vivienda y
          otra información necesaria para prestar los servicios
          efectivamente contratados.
        </li>
        <li>
          <strong>Custodia de llaves:</strong> información necesaria para
          identificar, recibir, controlar, custodiar y devolver las llaves,
          cuando se contrate este servicio.
        </li>
        <li>
          <strong>Visitas e inspecciones:</strong> cuando el cliente
          contrate un servicio que las incluya, podrán tratarse los datos
          necesarios para organizar la visita, registrar las observaciones
          pertinentes y documentar el servicio realizado.
        </li>
        <li>
          <strong>Fotografías e informes:</strong> cuando resulten
          necesarios para una inspección u otro servicio contratado,
          podrán generarse fotografías, observaciones o informes
          relacionados con el inmueble. Se limitarán a la finalidad del
          servicio y se evitará captar datos personales innecesarios.
        </li>
        <li>
          <strong>Facturación y pagos:</strong> información necesaria para
          emitir facturas, gestionar pagos y suscripciones y cumplir las
          obligaciones fiscales y contables. Los datos de tarjeta serán
          tratados por el proveedor de pagos que intervenga en la
          operación, conforme a sus funciones.
        </li>
        <li>
          <strong>Comunicaciones:</strong> mensajes, solicitudes, avisos,
          consultas, reclamaciones y comunicaciones relacionadas con el
          servicio.
        </li>
        <li>
          <strong>Seguridad y funcionamiento:</strong> registros técnicos
          necesarios para gestionar accesos, proteger las cuentas, prevenir
          usos indebidos y resolver incidencias.
        </li>
      </ul>

      <p>
        La custodia de llaves, por sí sola, no implica visitas a la vivienda,
        inspecciones periódicas, fotografías ni informes sobre su estado.
        Estos datos solo se tratarán cuando sean necesarios para otro
        servicio efectivamente contratado o para una finalidad legítima
        debidamente informada.
      </p>

      <p>
        Se procurará recoger únicamente datos adecuados, pertinentes y
        limitados a lo necesario. No deben introducirse contraseñas,
        datos completos de tarjetas bancarias ni información personal
        innecesaria en campos de observaciones, mensajes o documentos.
      </p>

      <h3>3. FINALIDADES DEL TRATAMIENTO</h3>

      <p>Los datos personales podrán utilizarse para:</p>

      <ul>
        <li>Crear, administrar y proteger las cuentas de usuario.</li>
        <li>
          Responder consultas y gestionar solicitudes de información y
          medidas precontractuales.
        </li>
        <li>
          Formalizar, administrar y ejecutar los contratos de los servicios
          contratados.
        </li>
        <li>
          Gestionar la custodia de llaves, incluida su recepción, control
          y devolución, cuando corresponda.
        </li>
        <li>
          Organizar y documentar visitas, inspecciones, informes u otros
          servicios cuando hayan sido contratados.
        </li>
        <li>
          Preparar presupuestos para servicios adicionales y ejecutarlos
          únicamente después de la aceptación expresa del cliente cuando
          dicha aceptación sea necesaria.
        </li>
        <li>
          Gestionar pagos, suscripciones, facturas y obligaciones fiscales
          y contables.
        </li>
        <li>
          Tramitar comunicaciones contractuales, solicitudes de
          cancelación, consultas y reclamaciones.
        </li>
        <li>
          Proteger la aplicación, gestionar permisos de acceso y prevenir
          accesos o usos no autorizados.
        </li>
        <li>
          Cumplir obligaciones legales y formular, ejercer o defender
          reclamaciones cuando resulte necesario.
        </li>
      </ul>

      <p>
        Los datos no se utilizarán para finalidades incompatibles con
        aquellas para las que fueron recogidos. Si se pretende realizar
        un tratamiento adicional que requiera información específica o una
        nueva base jurídica, se facilitará la información exigida por la
        normativa antes de llevarlo a cabo.
      </p>

      <h3>4. BASE JURÍDICA DEL TRATAMIENTO</h3>

      <p>
        Según la finalidad concreta, el tratamiento podrá basarse en:
      </p>

      <ul>
        <li>
          <strong>Ejecución de un contrato o medidas precontractuales:</strong>{" "}
          para gestionar solicitudes, elaborar presupuestos, formalizar
          contratos y prestar los servicios solicitados.
        </li>
        <li>
          <strong>Obligación legal:</strong> para cumplir las obligaciones
          fiscales, contables y otras obligaciones impuestas por la
          normativa aplicable.
        </li>
        <li>
          <strong>Interés legítimo:</strong> cuando exista un interés
          legítimo real, necesario y equilibrado, por ejemplo, para
          proteger la seguridad de la aplicación o defender reclamaciones,
          respetando los derechos y libertades de las personas afectadas.
        </li>
        <li>
          <strong>Consentimiento:</strong> para los tratamientos que
          requieran una autorización válida. El consentimiento podrá
          retirarse en cualquier momento, sin que ello afecte a la licitud
          del tratamiento efectuado antes de su retirada.
        </li>
      </ul>

      <p>
        La aceptación de esta política no sustituye al consentimiento
        específico que pueda ser necesario para determinados tratamientos.
        Cuando el tratamiento se base en otra base jurídica válida, la
        retirada del consentimiento no afectará a dicho tratamiento.
      </p>

      <h3>5. CARÁCTER OBLIGATORIO DE LOS DATOS</h3>

      <p>
        Los datos estrictamente necesarios para crear una cuenta, gestionar
        una solicitud, formalizar un contrato o prestar un servicio deberán
        facilitarse cuando sean imprescindibles para esas finalidades.
        Si no se facilitan, puede resultar imposible completar el alta,
        formalizar el contrato o prestar correctamente el servicio.
      </p>

      <p>
        Los datos adicionales que no sean necesarios deberán ser
        opcionales. Se procurará identificar los campos obligatorios en
        los formularios correspondientes.
      </p>

      <h3>6. CONSERVACIÓN DE LOS DATOS</h3>

      <p>
        Los datos se conservarán durante el tiempo necesario para cumplir
        cada finalidad y, cuando corresponda, durante los plazos legales
        de conservación y prescripción de responsabilidades.
      </p>

      <ul>
        <li>
          <strong>Datos de cuenta:</strong> durante la vigencia de la cuenta
          y el tiempo adicional necesario para gestionar obligaciones o
          reclamaciones pendientes.
        </li>
        <li>
          <strong>Contratos y documentación contractual:</strong> durante
          la relación contractual y los plazos adicionales necesarios para
          cumplir obligaciones legales o atender posibles reclamaciones.
        </li>
        <li>
          <strong>Facturas y documentación contable:</strong> durante los
          plazos de conservación exigidos por la normativa fiscal,
          mercantil y contable aplicable.
        </li>
        <li>
          <strong>Datos de custodia de llaves:</strong> durante el tiempo
          necesario para gestionar la custodia, la devolución y las
          responsabilidades relacionadas, evitando su conservación
          indefinida.
        </li>
        <li>
          <strong>Fotografías e informes:</strong> cuando se generen para
          un servicio contratado, durante el tiempo necesario para
          documentar y gestionar dicho servicio y atender las obligaciones
          o reclamaciones que puedan corresponder.
        </li>
        <li>
          <strong>Comunicaciones y reclamaciones:</strong> durante el
          tiempo necesario para atenderlas y gestionar las posibles
          responsabilidades posteriores.
        </li>
        <li>
          <strong>Registros de seguridad:</strong> durante un período
          proporcionado y necesario para proteger el servicio, investigar
          incidencias y cumplir las obligaciones aplicables.
        </li>
      </ul>

      <p>
        Los períodos concretos deberán ajustarse a las necesidades reales
        de cada tratamiento y a la normativa aplicable. Cuando los datos
        dejen de ser necesarios, se suprimirán, anonimizarán o bloquearán
        cuando legalmente corresponda. La solicitud de eliminación de una
        cuenta no obliga a borrar información que deba conservarse por
        una obligación legal o para atender responsabilidades pendientes.
      </p>

      <h3>7. DESTINATARIOS Y PROVEEDORES</h3>

      <p>
        Para gestionar la aplicación y los servicios pueden intervenir
        proveedores tecnológicos, de pagos, facturación y comunicaciones,
        dependiendo de las funciones efectivamente utilizadas.
      </p>

      <ul>
        <li>
          <strong>Supabase:</strong> plataforma utilizada para los servicios
          de infraestructura que correspondan, como base de datos,
          autenticación, almacenamiento y servicios asociados.
        </li>
        <li>
          <strong>Stripe:</strong> proveedor utilizado para gestionar los
          pagos y las operaciones de suscripción que se realicen a través
          de su plataforma.
        </li>
        <li>
          <strong>FacturaDirecta:</strong> servicio utilizado para las
          funciones de facturación y gestión administrativa o contable
          que correspondan.
        </li>
        <li>
          <strong>Resend:</strong> proveedor de infraestructura de correo
          electrónico cuando se utilice para enviar comunicaciones
          relacionadas con la aplicación o el servicio.
        </li>
        <li>
          <strong>GitHub:</strong> plataforma utilizada para alojar y
          gestionar el código fuente y los procesos de desarrollo. El
          repositorio no debe utilizarse para almacenar datos personales
          reales de clientes, credenciales ni secretos de producción.
        </li>
      </ul>

      <p>
        Cuando un proveedor trate datos personales por cuenta de la
        responsable, deberán establecerse las condiciones contractuales y
        las garantías exigidas por la normativa de protección de datos.
        Algunos proveedores también pueden actuar como responsables
        independientes para determinados tratamientos que realicen bajo
        sus propias condiciones.
      </p>

      <p>
        Los datos podrán comunicarse a autoridades públicas, tribunales
        u otros destinatarios cuando exista una obligación legal válida
        o cuando resulte necesario para formular, ejercer o defender
        reclamaciones.
      </p>

      <p>
        No se venderán datos personales a terceros. El acceso de los
        proveedores y las comunicaciones de datos se limitarán a lo
        necesario para la finalidad correspondiente.
      </p>

      <h3>8. TRANSFERENCIAS INTERNACIONALES</h3>

      <p>
        Algunos proveedores tecnológicos pueden tratar datos personales
        desde países situados fuera del Espacio Económico Europeo.
        Cuando se produzca una transferencia internacional, deberá contar
        con un mecanismo válido conforme al RGPD, como una decisión de
        adecuación, cláusulas contractuales tipo u otra garantía legalmente
        reconocida, según corresponda.
      </p>

      <p>
        La ubicación efectiva del tratamiento y las garantías aplicables
        deberán comprobarse para cada proveedor y servicio utilizado.
        El uso de un proveedor tecnológico no significa, por sí solo,
        que cualquier transferencia internacional esté autorizada.
      </p>

      <h3>9. DERECHOS DE LAS PERSONAS</h3>

      <p>
        Cuando se cumplan los requisitos legales, puedes ejercer los
        siguientes derechos:
      </p>

      <ul>
        <li>
          <strong>Acceso:</strong> conocer si se están tratando tus datos
          personales y obtener acceso a ellos.
        </li>
        <li>
          <strong>Rectificación:</strong> solicitar la corrección de datos
          inexactos o incompletos.
        </li>
        <li>
          <strong>Supresión:</strong> solicitar la eliminación de los datos
          cuando proceda legalmente.
        </li>
        <li>
          <strong>Oposición:</strong> oponerte a determinados tratamientos
          cuando concurran los requisitos previstos en la normativa.
        </li>
        <li>
          <strong>Limitación:</strong> solicitar la limitación del
          tratamiento en los supuestos legalmente establecidos.
        </li>
        <li>
          <strong>Portabilidad:</strong> recibir determinados datos en un
          formato estructurado y transmitirlos a otro responsable cuando
          se cumplan los requisitos legales.
        </li>
        <li>
          <strong>Retirada del consentimiento:</strong> retirar el
          consentimiento cuando el tratamiento se base en él, sin afectar
          a la licitud del tratamiento anterior a su retirada.
        </li>
      </ul>

      <p>
        Puedes ejercer tus derechos escribiendo a{" "}
        <a href={`mailto:${email}`}>{email}</a> e indicando claramente
        tu solicitud.
      </p>

      <p>
        Cuando existan dudas razonables sobre la identidad de la persona
        solicitante, podrá solicitarse información adicional que resulte
        necesaria y proporcionada para verificarla. No se exigirá
        sistemáticamente una copia del documento de identidad.
      </p>

      <p>
        Se responderá dentro de los plazos establecidos por la normativa
        aplicable. El ejercicio de los derechos será gratuito, salvo en
        los supuestos excepcionales previstos legalmente.
      </p>

      <p>
        También puedes presentar una reclamación ante la Agencia Española
        de Protección de Datos (AEPD):{" "}
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
        La responsable deberá aplicar medidas técnicas y organizativas
        adecuadas al riesgo para proteger los datos frente a destrucción,
        pérdida, alteración, divulgación o acceso no autorizados.
      </p>

      <p>
        El acceso a la información deberá limitarse a las funciones y
        permisos de cada usuario. Los datos de clientes, contratos,
        facturas y custodia de llaves deberán protegerse mediante controles
        de acceso adecuados y revisiones de permisos.
      </p>

      <p>
        Las credenciales, claves privadas y secretos de producción no deben
        publicarse en el repositorio ni compartirse mediante comunicaciones
        ordinarias. Los documentos y archivos que contengan datos personales
        deberán almacenarse y compartirse mediante mecanismos adecuados
        de acceso restringido.
      </p>

      <p>
        Ninguna medida de seguridad puede garantizar un riesgo cero.
        Si se produce una violación de seguridad de datos personales,
        se gestionará conforme a las obligaciones legales aplicables,
        incluidas las notificaciones que correspondan.
      </p>

      <h3>11. DATOS DEL INMUEBLE, LLAVES E INSPECCIONES</h3>

      <p>
        La dirección de la vivienda y la información vinculada a ella se
        utilizarán para gestionar los servicios contratados y cumplir las
        obligaciones relacionadas con su prestación.
      </p>

      <p>
        Cuando se contrate exclusivamente la custodia de llaves, los datos
        se limitarán a los necesarios para gestionar la recepción,
        conservación, control y devolución de las llaves. La custodia
        por sí sola no incluye visitas ni inspecciones de la vivienda.
      </p>

      <p>
        Si el cliente contrata una visita, inspección u otro servicio que
        requiera acceder al inmueble, podrán tratarse los datos necesarios
        para organizar y documentar esa actuación. Cuando resulte necesario
        para el servicio contratado, podrán elaborarse fotografías,
        observaciones o informes sobre el estado del inmueble.
      </p>

      <p>
        Las fotografías e informes deberán limitarse a la finalidad del
        servicio y evitar, en la medida de lo posible, captar personas,
        documentos, objetos u otros datos personales que no sean necesarios.
        La información obtenida no se utilizará para finalidades
        incompatibles con la prestación del servicio.
      </p>

      <p>
        Los servicios adicionales que requieran presupuesto deberán contar
        con presupuesto previo y aceptación expresa del cliente antes de
        ejecutarse o cobrarse. La aceptación y la información contractual
        aplicable determinarán el alcance del servicio solicitado.
      </p>

      <h3>12. DATOS DE MENORES</h3>

      <p>
        Los servicios están dirigidos a personas que puedan contratar o
        utilizar legalmente los servicios correspondientes. No se pretende
        recoger deliberadamente datos de menores sin la base jurídica y
        las garantías exigidas por la normativa aplicable.
      </p>

      <h3>13. DECISIONES AUTOMATIZADAS</h3>

      <p>
        Si se incorporasen tratamientos que implicasen decisiones basadas
        exclusivamente en procesos automatizados y que produjesen efectos
        jurídicos o afectasen significativamente a las personas, se
        someterían a los requisitos establecidos por el RGPD. Cuando
        proceda, se facilitará la información exigida sobre la lógica
        aplicada, la importancia y las consecuencias previstas, así como
        sobre los derechos de la persona afectada.
      </p>

      <h3>14. ACTUALIZACIONES DE ESTA POLÍTICA</h3>

      <p>
        Esta política podrá actualizarse cuando cambien los servicios,
        los tratamientos de datos o la normativa aplicable. La versión
        vigente será la publicada en la aplicación o en el sitio web
        correspondiente, junto con la fecha de su última actualización.
      </p>

      <p>
        Si se introduce un cambio que requiera información adicional,
        una nueva base jurídica o la obtención de consentimiento, se
        adoptarán las medidas exigidas por la normativa antes de realizar
        el tratamiento correspondiente.
      </p>
    </div>
  );
}
