
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PoliticaPrivacidad from "./PoliticaPrivacidad.jsx";
import "./DocumentosLegales.css";

const estilos = {
  pagina: {
    minHeight: "100vh",
    padding: "20px",
    boxSizing: "border-box",
    background: "#f3f6fa",
    color: "#172033",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  contenido: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  volver: {
    display: "inline-block",
    marginBottom: "18px",
    padding: "10px 16px",
    background: "#0056b3",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
  },
  tarjeta: {
    background: "#fff",
    padding: "24px",
    marginBottom: "24px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(20, 40, 70, 0.08)",
    lineHeight: "1.7",
    overflowWrap: "anywhere",
  },
  titulo: {
    color: "#00356b",
    marginTop: 0,
    lineHeight: "1.3",
  },
  subtitulo: {
    color: "#00356b",
    marginTop: "24px",
  },
};

export default function DocumentosLegales() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const id = location.hash.replace(/^#/, "");

    if (!id) {
      window.scrollTo({ top: 0, behavior: "auto" });
      return;
    }

    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "auto",
        block: "start",
      });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [location.hash]);

  return (
    <main style={estilos.pagina}>
      <div style={estilos.contenido}>
        <button
          type="button"
          onClick={() => navigate("/register")}
          style={estilos.volver}
        >
          ← Volver al registro
        </button>

        {/* AVISO LEGAL */}
        <section id="aviso-legal" style={estilos.tarjeta}>
          <h1 style={estilos.titulo}>AVISO LEGAL</h1>

          <h2 style={estilos.subtitulo}>1. Titular de la aplicación</h2>

          <ul>
            <li>
              <strong>Titular:</strong> Roxana Collazo Alonso.
            </li>
            <li>
              <strong>Nombre comercial:</strong> CoastGuard Homes Services.
            </li>
            <li>
              <strong>NIF/NIE indicado:</strong> Z1968154A.
            </li>
            <li>
              <strong>Domicilio profesional:</strong>{" "}
              Calle Casicas de Arriba, 33, 1.º F, Pilar de la Horadada,
              Alicante, España.
            </li>
            <li>
              <strong>Correo electrónico:</strong>{" "}
              <a href="mailto:coastguardhomes@gmail.com">
                coastguardhomes@gmail.com
              </a>
            </li>
          </ul>

          <h2 style={estilos.subtitulo}>2. Finalidad de la aplicación</h2>

          <p>
            CoastGuard Homes es una aplicación destinada a gestionar y
            consultar información relacionada con los clientes, sus viviendas,
            los contratos y los servicios prestados por CoastGuard Homes
            Services.
          </p>

          <p>
            Según los permisos de cada cuenta, la aplicación puede permitir
            consultar datos de viviendas, contratos, documentación, facturas,
            comunicaciones, incidencias y otros datos relacionados con la
            relación contractual.
          </p>

          <p>
            CoastGuard Homes Services ofrece distintos servicios relacionados
            con la gestión y atención de viviendas. El alcance de cada servicio
            será el que se describa en las condiciones particulares aceptadas
            por el cliente. La custodia de llaves, por sí sola, no incluye
            visitas, inspecciones ni vigilancia de la vivienda. Estos trabajos
            solo se realizarán cuando se contraten expresamente.
          </p>

          <h2 style={estilos.subtitulo}>3. Condiciones de uso</h2>

          <p>
            El usuario debe utilizar la aplicación de forma lícita, facilitar
            información veraz y acceder únicamente a la información y las
            funciones autorizadas para su cuenta. No está permitido acceder
            sin autorización a datos de otras personas o viviendas, alterar
            información ni eludir los controles de acceso.
          </p>

          <h2 style={estilos.subtitulo}>4. Propiedad intelectual</h2>

          <p>
            Los contenidos, textos, diseños, logotipos y demás elementos de
            la aplicación están protegidos, cuando corresponda, por la
            normativa de propiedad intelectual e industrial. Su utilización
            no autorizada queda prohibida, salvo en los casos permitidos por
            la ley.
          </p>

          <h2 style={estilos.subtitulo}>5. Protección de datos</h2>

          <p>
            El tratamiento de los datos personales se explica en la{" "}
            <a href="#privacidad">Política de Privacidad</a> disponible en
            esta misma página.
          </p>

          <h2 style={estilos.subtitulo}>6. Responsabilidad y legislación</h2>

          <p>
            Se realizarán esfuerzos razonables para mantener la aplicación
            disponible y para proteger la información. Pueden producirse
            interrupciones por mantenimiento, incidencias técnicas o
            circunstancias ajenas al control razonable de la responsable.
          </p>

          <p>
            Lo anterior no excluye las responsabilidades que legalmente no
            puedan excluirse ni limita los derechos irrenunciables de los
            consumidores y usuarios.
          </p>

          <p>
            Este aviso se rige por la legislación española y de la Unión
            Europea que resulte aplicable.
          </p>
        </section>

        {/* CONTRATO MARCO */}
        <section id="contrato" style={estilos.tarjeta}>
          <h1 style={estilos.titulo}>CONTRATO MARCO DE SERVICIOS</h1>

          <p>
            Este contrato establece las condiciones generales aplicables a
            los servicios de CoastGuard Homes Services. Los servicios
            concretos que contrate cada cliente, su alcance, su precio y
            sus condiciones particulares se identificarán en la documentación
            contractual correspondiente.
          </p>

          <p>
            Cuando el servicio contratado sea la custodia de llaves, esta
            comprenderá las actuaciones expresamente acordadas relacionadas
            con la recepción, custodia y devolución de las llaves. La custodia
            de llaves, por sí sola, no incluye visitas ni inspecciones del
            inmueble.
          </p>

          <p>
            Las condiciones particulares concretarán la vivienda, el servicio,
            la cuota, los impuestos, las condiciones de pago y la fecha de
            inicio. En caso de discrepancia, prevalecerán las condiciones
            particulares aceptadas en aquello que regulen específicamente,
            sin perjuicio de los derechos legales del cliente.
          </p>

          <h2 style={estilos.subtitulo}>1. Objeto y alcance del servicio</h2>

          <p>
            CoastGuard Homes Services prestará los servicios que el cliente
            haya contratado y aceptado expresamente, de acuerdo con el alcance
            descrito en las condiciones particulares.
          </p>

          <p>
            La custodia de llaves comprende únicamente las actuaciones
            acordadas relacionadas con la recepción, conservación y devolución
            de las llaves. No incluye por sí misma visitas a la vivienda,
            inspecciones, revisiones periódicas, vigilancia permanente,
            atención de emergencias, reparaciones, limpieza, mantenimiento
            ni otras actuaciones sobre el inmueble.
          </p>

          <p>
            Si el cliente contrata expresamente un servicio de visitas,
            inspecciones, informes, fotografías u otras actuaciones, su alcance,
            frecuencia, precio y condiciones se determinarán en las condiciones
            particulares o en el presupuesto aceptado.
          </p>

          <p>
            La disponibilidad de una función en la aplicación no implica que
            la actividad correspondiente esté incluida en el servicio
            contratado. Solo se prestarán las actuaciones expresamente
            acordadas.
          </p>

          <h2 style={estilos.subtitulo}>2. Custodia y gestión de llaves</h2>

          <p>
            Cuando se contrate la custodia de llaves, el cliente deberá
            facilitar las llaves y la información estrictamente necesaria
            para identificarlas y gestionar correctamente el servicio.
            La recepción y devolución se coordinarán por los medios acordados
            entre las partes.
          </p>

          <p>
            Las llaves se custodiarán aplicando medidas razonables de seguridad
            y limitando su acceso a las personas autorizadas. El cliente deberá
            comunicar cualquier circunstancia relevante para la identificación,
            gestión o devolución de las llaves.
          </p>

          <p>
            La custodia no autoriza por sí sola a entrar en la vivienda,
            realizar visitas, inspeccionar el inmueble ni entregar las llaves
            a terceros. Cualquier actuación que requiera acceso a la vivienda
            o entrega a otra persona deberá contar con autorización expresa
            y con las condiciones que correspondan.
          </p>

          <p>
            El alcance concreto de la custodia, los procedimientos de entrega
            y devolución y las responsabilidades de cada parte se interpretarán
            conforme a las condiciones aceptadas y a la normativa aplicable.
            Ninguna cláusula excluye responsabilidades que legalmente no
            puedan excluirse.
          </p>

          <h2 style={estilos.subtitulo}>3. Precio y facturación</h2>

          <p>
            El contrato tiene una duración inicial de doce (12) meses y se
            renueva por períodos anuales. La suscripción se factura y se abona
            mensualmente. La duración anual del contrato no implica una
            permanencia mínima anual ni obliga al cliente a mantener la
            suscripción durante todo el año. El cliente podrá solicitar la
            cancelación en cualquier momento, con un (1) mes de preaviso,
            conforme a las condiciones de este contrato y sin penalización
            por permanencia anual.
          </p>

          <p>
            Antes de confirmar la contratación, el cliente recibirá información
            sobre el importe de la cuota, los impuestos aplicables, el importe
            total que corresponda y las prestaciones incluidas.
          </p>

          <p>
            La facturación y los cobros se gestionarán mediante los proveedores
            y los procedimientos habilitados para la contratación. Los datos
            de pago serán tratados conforme a las condiciones aplicables a
            dichos proveedores.
          </p>

          <p>
            El precio acordado no se modificará unilateralmente. Cualquier
            propuesta de cambio deberá comunicarse previamente, indicando
            el nuevo importe y la fecha propuesta de aplicación. Cuando el
            cambio afecte a las condiciones contractuales aceptadas, se
            requerirá la aceptación expresa del cliente cuando así lo exija
            la normativa aplicable o el propio contrato.
          </p>

          <h2 style={estilos.subtitulo}>
            4. Duración, renovación y cancelación
          </h2>

          <p>
            El contrato tiene una duración inicial de doce (12) meses y se
            renueva por períodos anuales. La cuota de la suscripción se paga
            mensualmente y no existe una permanencia mínima anual. El cliente
            puede solicitar la cancelación en cualquier momento, sin tener
            que esperar al vencimiento del período anual, respetando el
            preaviso de un (1) mes y las condiciones establecidas en este
            contrato.
          </p>

          <p>
            El cliente podrá solicitar la cancelación en cualquier momento,
            sin necesidad de esperar al vencimiento de un período anual.
            Para ello deberá comunicarlo con un (1) mes de preaviso a
            CoastGuard Homes Services.
          </p>

          <p>
            La solicitud podrá enviarse al correo electrónico{" "}
            <a href="mailto:coastguardhomes@gmail.com">
              coastguardhomes@gmail.com
            </a>
            . También podrán utilizarse otros canales de contacto habilitados
            por CoastGuard Homes Services que permitan dejar constancia de
            la solicitud.
          </p>

          <p>
            La comunicación deberá permitir identificar al cliente y la
            suscripción que desea cancelar. Se recomienda conservar el
            mensaje enviado y la confirmación de recepción. CoastGuard Homes
            Services gestionará la solicitud y comunicará la fecha efectiva
            de baja por un medio duradero.
          </p>

          <p>
            El preaviso ordinario será de un (1) mes desde la recepción de
            la comunicación, salvo que se acuerde por escrito una fecha
            anterior o que la normativa aplicable otorgue al cliente un
            derecho más favorable.
          </p>

          <p>
            Durante el período de preaviso, el servicio continuará activo
            en los términos contratados y se abonarán las cantidades que
            correspondan hasta la fecha efectiva de finalización. Una vez
            efectiva la baja, no se cobrarán nuevas cuotas por períodos
            posteriores a dicha fecha, sin perjuicio de cantidades válidamente
            devengadas, facturas pendientes u otras obligaciones que deban
            mantenerse legalmente.
          </p>

          <p>
            La gestión administrativa de la baja podrá realizarse manualmente
            por CoastGuard Homes Services después de recibir y verificar la
            comunicación del cliente. La cancelación de un método de pago
            o una acción en la plataforma de pagos no sustituye por sí sola
            la comunicación de baja ni elimina cantidades legítimamente
            pendientes.
          </p>

          <p>
            No se exigirán cuotas correspondientes a una permanencia anual
            inexistente ni penalizaciones por el mero hecho de cancelar la
            suscripción conforme a estas condiciones. Lo anterior se entiende
            sin perjuicio de las cantidades devengadas hasta la fecha efectiva
            de baja y de cualquier derecho legal del cliente.
          </p>

          <p>
            Estas condiciones se entienden sin perjuicio del derecho de
            desistimiento y de cualquier otro derecho de terminación que
            resulte aplicable legalmente al cliente.
          </p>

          <h2 style={estilos.subtitulo}>
            5. Servicios adicionales y presupuestos
          </h2>

          <p>
            Cualquier servicio que no esté incluido expresamente en las
            condiciones particulares se considerará adicional y se cobrará
            por separado cuando corresponda.
          </p>

          <p>
            Antes de realizar un servicio adicional, CoastGuard Homes Services
            facilitará un presupuesto que describa el trabajo previsto,
            su alcance, el precio, los impuestos aplicables y las condiciones
            de pago.
          </p>

          <p>
            El servicio adicional solo quedará autorizado cuando el cliente
            haya aceptado expresamente el presupuesto. No se realizarán
            trabajos adicionales ni se cobrará su importe sin esa aceptación,
            salvo que exista otra autorización previa, expresa y válida que
            contemple específicamente la actuación correspondiente.
          </p>

          <p>
            Si durante un trabajo autorizado se detecta la necesidad de
            realizar actuaciones que modifiquen el precio o el alcance,
            se facilitará el presupuesto correspondiente y se obtendrá una
            nueva aceptación antes de ejecutarlas.
          </p>

          <h2 style={estilos.subtitulo}>6. Obligaciones del cliente</h2>

          <p>
            El cliente deberá facilitar información veraz y suficiente para
            identificar la vivienda y gestionar los servicios contratados,
            abonar las cantidades debidas y comunicar los cambios que puedan
            afectar a la prestación del servicio.
          </p>

          <p>
            Cuando proceda, el cliente deberá informar de las personas
            autorizadas para recibir las llaves y mantener actualizados
            los datos de contacto necesarios para las comunicaciones
            relativas al servicio.
          </p>

          <h2 style={estilos.subtitulo}>7. Obligaciones de la prestadora</h2>

          <p>
            CoastGuard Homes Services prestará los servicios dentro del
            alcance contratado, aplicará medidas razonables de seguridad
            para la custodia de llaves cuando corresponda, atenderá las
            comunicaciones relacionadas con el servicio y facilitará la
            información contractual y de facturación que proceda.
          </p>

          <p>
            La prestadora no garantiza la ausencia absoluta de riesgos ni
            asumirá obligaciones de vigilancia, inspección o acceso a la
            vivienda que no estén expresamente incluidas en las condiciones
            aceptadas.
          </p>

          <h2 style={estilos.subtitulo}>8. Incidencias y comunicaciones</h2>

          <p>
            Las comunicaciones relativas a los servicios, las llaves, los
            pagos, la documentación o la cancelación podrán realizarse
            mediante los canales habilitados para la relación contractual.
          </p>

          <p>
            La disponibilidad de un canal para comunicar incidencias no
            implica vigilancia permanente, atención de emergencias ni
            respuesta inmediata, salvo que se haya contratado expresamente
            un servicio con esas características. Ante un peligro inmediato
            para personas o bienes, deberán utilizarse los servicios públicos
            de emergencia correspondientes.
          </p>

          <h2 style={estilos.subtitulo}>9. Uso de la plataforma</h2>

          <p>
            El usuario deberá proteger sus credenciales y utilizar la
            aplicación de forma lícita. No podrá acceder a información
            ajena a sus permisos ni alterar, ocultar o manipular datos
            sin autorización.
          </p>

          <p>
            Se realizarán esfuerzos razonables para mantener la aplicación
            disponible y segura. Pueden producirse interrupciones por
            mantenimiento, incidencias técnicas o circunstancias ajenas
            al control razonable de la prestadora. Estas limitaciones no
            excluyen responsabilidades legalmente exigibles.
          </p>

          <h2 style={estilos.subtitulo}>
            10. Protección de datos personales
          </h2>

          <p>
            El tratamiento de los datos personales se describe en la Política
            de Privacidad disponible en esta misma página. Los datos se
            tratarán conforme a la normativa aplicable y a la información
            facilitada al usuario.
          </p>

          <p>
            La aceptación de este contrato no sustituye los consentimientos
            específicos que puedan ser necesarios para tratamientos concretos.
          </p>

          <h2 style={estilos.subtitulo}>
            11. Contratación a distancia y derecho de desistimiento
          </h2>

          <p>
            Cuando el cliente tenga la condición legal de consumidor y el
            contrato se celebre a distancia, dispondrá, como regla general
            y cuando resulte aplicable, de catorce (14) días naturales para
            ejercer el derecho de desistimiento desde la celebración del
            contrato de servicios, sin necesidad de justificar la decisión
            ni soportar penalización por ello.
          </p>

          <p>
            Para ejercer el derecho, el cliente deberá enviar dentro del
            plazo una declaración inequívoca de desistimiento a{" "}
            <a href="mailto:coastguardhomes@gmail.com">
              coastguardhomes@gmail.com
            </a>
            . Podrá utilizar el modelo orientativo incluido a continuación,
            aunque no es obligatorio emplearlo.
          </p>

          <p>
            Si el cliente solicita expresamente que el servicio comience
            durante el plazo de desistimiento, podrá tener que abonar,
            cuando legalmente proceda y se cumplan los requisitos de
            información y solicitud expresa, la parte proporcional del
            servicio efectivamente prestado hasta el momento en que
            comunique el desistimiento.
          </p>

          <p>
            La pérdida del derecho de desistimiento por ejecución completa
            del servicio solo podrá aplicarse cuando se cumplan todos los
            requisitos legales, incluidos el consentimiento previo expreso
            y el reconocimiento informado exigible. El mero inicio parcial
            del servicio no implica por sí solo la pérdida automática del
            derecho.
          </p>

          <p>
            <strong>
              Modelo orientativo de comunicación de desistimiento:
            </strong>
          </p>

          <p>
            A la atención de Roxana Collazo Alonso, CoastGuard Homes Services
            (
            <a href="mailto:coastguardhomes@gmail.com">
              coastguardhomes@gmail.com
            </a>
            ): Por la presente comunico que desisto del contrato del siguiente
            servicio: [indicar servicio]. Nombre del consumidor: [nombre y
            apellidos]. Correo electrónico asociado a la cuenta: [correo].
            Fecha de contratación: [fecha]. Fecha de comunicación: [fecha].
          </p>

          <h2 style={estilos.subtitulo}>12. Aceptación y documentación</h2>

          <p>
            Este contrato marco establece las condiciones generales de la
            relación entre las partes. Su aceptación durante el registro
            no implica por sí sola la contratación de una suscripción de
            pago ni de un servicio adicional cuyo precio y condiciones no
            hayan sido comunicados y aceptados.
          </p>

          <p>
            La suscripción quedará concretada mediante las condiciones
            particulares aceptadas, en las que constarán, como mínimo,
            el servicio contratado, la vivienda identificada cuando
            corresponda, la cuota, los impuestos, la periodicidad de pago,
            las condiciones de cancelación y la fecha de inicio.
          </p>

          <p>
            Se conservará constancia de la aceptación y de la versión del
            documento aceptado conforme a las posibilidades del sistema
            y a la normativa aplicable.
          </p>

          <h2 style={estilos.subtitulo}>
            13. Legislación aplicable y derechos del cliente
          </h2>

          <p>
            El contrato se interpretará conforme a la legislación española
            y de la Unión Europea que resulte aplicable. Ninguna cláusula
            pretende eliminar derechos irrenunciables del cliente ni limitar
            responsabilidades que legalmente no puedan excluirse.
          </p>

          <p>
            Si una disposición fuera declarada inválida o inaplicable,
            las restantes conservarán su eficacia en la medida permitida
            por la ley.
          </p>
        </section>

        {/* POLÍTICA DE PRIVACIDAD */}
        <section id="privacidad" style={estilos.tarjeta}>
          <PoliticaPrivacidad />
        </section>

        <button
          type="button"
          onClick={() => navigate("/register")}
          style={estilos.volver}
        >
          ← Volver al registro
        </button>
      </div>
    </main>
  );
}
