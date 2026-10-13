
import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "../../lib/supabase";
import { useLanguage } from "../../context/LanguageContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function GenerarPDFContrato({
  contrato,
  cliente,
  onGenerado,
}) {
  const { t, changeLanguage } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function comprobarContrato() {
      if (!user || !contrato?.id) return;

      const { data, error } = await supabase
        .from("contratos")
        .select("cliente_id")
        .eq("id", contrato.id)
        .single();

      if (error || !data) {
        alert(t("clienteAccesoDenegado"));
      }
    }

    comprobarContrato();
  }, [user, contrato?.id, t]);

  const generarPDF = async () => {
    if (!contrato?.id) {
      alert("No se puede generar el PDF: falta el identificador del contrato.");
      return;
    }

    setLoading(true);

    try {
      if (cliente?.idioma) {
        changeLanguage(cliente.idioma);
      }

      const idioma = String(cliente?.idioma || "es")
        .toLowerCase()
        .startsWith("en")
        ? "en"
        : "es";

      const textos = {
        es: {
          condiciones: [
            {
              titulo: "1. Objeto del contrato",
              texto:
                "El servicio contratado consiste en la custodia de llaves de la vivienda identificada en las condiciones particulares. Esta modalidad no incluye visitas, inspecciones ni revisiones periódicas de la vivienda. Cualquier otra prestación deberá describirse y aceptarse expresamente por separado.",
            },
            {
              titulo: "2. Suscripción mensual y precio",
              texto:
                "El servicio se presta mediante una suscripción de facturación mensual. La cuota mensual acordada es la que figura en los detalles del servicio. El precio se mantendrá mientras continúen las condiciones particulares aceptadas. Cualquier modificación de la cuota, modalidad o alcance requerirá comunicación previa y aceptación expresa del cliente.",
            },
            {
              titulo: "3. Duración y renovación",
              texto:
                "El contrato tiene una duración inicial de doce (12) meses y se renueva por períodos anuales. La facturación y el pago de la suscripción son mensuales. La duración anual no implica una permanencia mínima anual: el cliente puede solicitar la cancelación en cualquier momento, con un mes de preaviso y conforme a las condiciones del contrato, sin penalización por permanencia anual.",
            },
            {
              titulo: "4. Cancelación y preaviso",
              texto:
                "El cliente puede solicitar la cancelación en cualquier momento, comunicándolo por un medio que permita acreditar la solicitud con un mes de preaviso. El servicio se mantendrá durante el preaviso y finalizará en la fecha efectiva de baja comunicada por el prestador. No se aplicarán penalizaciones por permanencia anual ni se cobrarán cuotas correspondientes a períodos posteriores a la fecha efectiva de finalización. Se abonarán las cantidades válidamente devengadas hasta esa fecha.",
            },
            {
              titulo: "5. Custodia de llaves y acceso a la vivienda",
              texto:
                "El cliente autoriza la custodia de las llaves entregadas para la finalidad contratada. Las llaves se conservarán con medidas razonables de seguridad y confidencialidad, y no se utilizarán para acceder a la vivienda ni se entregarán a terceros salvo autorización del cliente o causa legal que lo permita. La custodia de llaves no implica visitas, inspecciones, vigilancia continua ni garantía de ausencia de incidentes.",
            },
            {
              titulo: "6. Límites del servicio",
              texto:
                "La cuota incluye únicamente la custodia de llaves en los términos acordados. No incluye inspecciones, revisiones del inmueble, vigilancia permanente, reparaciones, mantenimiento, desplazamientos, gestión de emergencias ni actuaciones de terceros, salvo que se contraten y acepten expresamente por separado.",
            },
            {
              titulo: "7. Servicios extraordinarios y extras",
              texto:
                "Cualquier servicio no incluido expresamente en la custodia de llaves requerirá un presupuesto previo que indique el alcance, el precio y los impuestos aplicables. El cliente deberá aceptarlo expresamente antes de que se realice el trabajo. No se ejecutarán ni cobrarán servicios adicionales sin dicha aceptación, salvo que exista una autorización previa, expresa y válida para una actuación concreta.",
            },
            {
              titulo: "8. Incidencias y comunicaciones",
              texto:
                "Las comunicaciones relacionadas con la custodia de llaves se realizarán mediante los canales acordados. La existencia de un canal de comunicación no supone vigilancia permanente, atención de emergencias ni respuesta inmediata. Si el cliente necesita una visita, inspección o actuación adicional, deberá solicitarla y aceptar las condiciones y el precio correspondientes antes de su ejecución.",
            },
            {
              titulo: "9. Contratación a distancia y desistimiento",
              texto:
                "Cuando el cliente tenga la condición legal de consumidor y el contrato se celebre a distancia o fuera del establecimiento mercantil, se respetará el derecho de desistimiento y los requisitos que resulten aplicables. El plazo general para contratos de servicios es de catorce días naturales desde la celebración, salvo regla legal distinta. Si el cliente solicita que el servicio comience durante ese plazo, se recabará la solicitud expresa y la información legalmente exigibles. El inicio parcial del servicio no elimina automáticamente el derecho de desistimiento.",
            },
            {
              titulo: "10. Protección de datos y confidencialidad",
              texto:
                "Los datos personales se tratarán para gestionar la cuenta, la relación contractual, la custodia de llaves, las comunicaciones y las obligaciones legales aplicables. El prestador mantendrá la confidencialidad de la información conocida durante el servicio y limitará el acceso a las personas que lo necesiten para la finalidad contratada. La información adicional sobre el tratamiento de datos está disponible en la Política de Privacidad.",
            },
            {
              titulo: "11. Aceptación y derechos del cliente",
              texto:
                "La aceptación del contrato deberá quedar registrada mediante el procedimiento habilitado. El cliente recibirá o podrá consultar las condiciones particulares que identifican la vivienda, el servicio, la cuota mensual, los impuestos y la fecha de inicio. Ninguna condición de este documento pretende excluir derechos legalmente irrenunciables del consumidor.",
            },
          ],
          firma: "Firma del cliente",
          fecha: "Fecha de generación",
          sinDato: "No indicado",
          pagina: "Página",
          de: "de",
        },
        en: {
          condiciones: [
            {
              titulo: "1. Purpose of the agreement",
              texto:
                "The subscribed service consists of keeping the keys to the property identified in the specific terms. This service does not include property visits, inspections or periodic reviews. Any additional service must be described and expressly accepted separately.",
            },
            {
              titulo: "2. Monthly subscription and price",
              texto:
                "The service is provided through a subscription billed monthly. The agreed monthly fee is shown in the service details. The price will remain in effect while the accepted specific terms remain unchanged. Any change to the fee, service type or scope requires prior notice and the client's express acceptance.",
            },
            {
              titulo: "3. Term and renewal",
              texto:
                "The agreement has an initial term of twelve (12) months and renews for successive annual periods. Subscription fees are billed and paid monthly. The annual term does not create a minimum annual commitment: the client may request cancellation at any time by giving one month's notice under the agreement, without an annual commitment penalty.",
            },
            {
              titulo: "4. Cancellation and notice",
              texto:
                "The client may request cancellation at any time by giving one month's notice through a channel that allows the request to be evidenced. The service will remain active during the notice period and will end on the effective cancellation date communicated by the provider. No annual commitment penalty will apply, and fees will not be charged for periods after the effective end date. Amounts validly accrued up to that date remain payable.",
            },
            {
              titulo: "5. Key custody and access to the property",
              texto:
                "The client authorises the provider to keep the keys for the agreed purpose. The keys will be stored with reasonable security and confidentiality measures and will not be used to enter the property or handed to third parties except with the client's authorisation or where legally permitted. Key custody does not include visits, inspections, continuous surveillance or a guarantee that incidents will not occur.",
            },
            {
              titulo: "6. Service limitations",
              texto:
                "The fee includes only key custody as agreed. It does not include inspections, property reviews, permanent surveillance, repairs, maintenance, travel, emergency management or third-party work unless separately contracted and expressly accepted.",
            },
            {
              titulo: "7. Additional services",
              texto:
                "Any service not expressly included in key custody requires a prior quotation stating the scope, price and applicable taxes. The client must expressly accept the quotation before the work is performed. Additional services will not be carried out or charged without that acceptance, unless there is a prior, express and valid authorisation for a specific action.",
            },
            {
              titulo: "8. Issues and communication",
              texto:
                "Communications relating to key custody will take place through the agreed channels. The existence of a communication channel does not imply continuous surveillance, emergency response or an immediate response. If the client requires a visit, inspection or additional action, it must be requested and the applicable terms and price accepted before it is carried out.",
            },
            {
              titulo: "9. Distance contracts and withdrawal",
              texto:
                "Where the client legally qualifies as a consumer and the agreement is concluded at a distance or away from business premises, any applicable right of withdrawal and its legal requirements will be respected. The general withdrawal period for service contracts is fourteen calendar days from conclusion, unless a different legal rule applies. If the client requests that the service begin during that period, the express request and information required by law will be obtained. Partial performance does not automatically remove the right of withdrawal.",
            },
            {
              titulo: "10. Data protection and confidentiality",
              texto:
                "Personal data will be processed to manage the account, contractual relationship, key custody, communications and applicable legal obligations. The provider will keep information learned during service delivery confidential and restrict access to people who need it for the agreed purpose. Further information about data processing is available in the Privacy Policy.",
            },
            {
              titulo: "11. Acceptance and client rights",
              texto:
                "Acceptance of the agreement must be recorded through the designated procedure. The client will receive or be able to consult the specific terms identifying the property, service, monthly fee, taxes and start date. No provision of this document is intended to exclude non-waivable consumer rights.",
            },
          ],
          firma: "Client signature",
          fecha: "Generation date",
          sinDato: "Not specified",
          pagina: "Page",
          de: "of",
        },
      };

      const contenido = textos[idioma];
      const doc = new jsPDF();
      const margenIzquierdo = 20;
      const margenDerecho = 20;
      const anchoUtil =
        doc.internal.pageSize.getWidth() -
        margenIzquierdo -
        margenDerecho;
      const altoPagina = doc.internal.pageSize.getHeight();
      const margenInferior = 20;
      let y = 20;

      const asegurarEspacio = (altoNecesario) => {
        if (y + altoNecesario > altoPagina - margenInferior) {
          doc.addPage();
          y = 20;
        }
      };

      const agregarTextoEnvuelto = (
        texto,
        x,
        ancho,
        tamano = 10,
        interlineado = 5
      ) => {
        doc.setFontSize(tamano);

        const lineas = doc.splitTextToSize(
          String(texto ?? ""),
          ancho
        );

        const altoTexto = lineas.length * interlineado;
        asegurarEspacio(altoTexto);

        doc.text(lineas, x, y);
        y += altoTexto;

        return altoTexto;
      };

      const agregarSeccion = (titulo, texto) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);

        const lineasTitulo = doc.splitTextToSize(
          titulo,
          anchoUtil
        );

        asegurarEspacio(lineasTitulo.length * 5 + 3);

        doc.text(lineasTitulo, margenIzquierdo, y);
        y += lineasTitulo.length * 5 + 2;

        doc.setFont("helvetica", "normal");
        agregarTextoEnvuelto(
          texto,
          margenIzquierdo,
          anchoUtil,
          9,
          4.5
        );

        y += 4;
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);

      const tituloPDF = doc.splitTextToSize(
        t("pdfTitulo"),
        anchoUtil
      );

      doc.text(tituloPDF, margenIzquierdo, y);
      y += tituloPDF.length * 8 + 7;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      agregarTextoEnvuelto(
        `${t("pdfNombreCliente")}: ${cliente?.nombre || contenido.sinDato}`,
        margenIzquierdo,
        anchoUtil
      );

      agregarTextoEnvuelto(
        `${t("pdfDireccion")}: ${cliente?.direccion || contenido.sinDato}`,
        margenIzquierdo,
        anchoUtil
      );

      agregarTextoEnvuelto(
        `${t("pdfTelefono")}: ${cliente?.telefono || contenido.sinDato}`,
        margenIzquierdo,
        anchoUtil
      );

      y += 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);

      asegurarEspacio(9);
      doc.text(t("pdfDetallesServicio"), margenIzquierdo, y);
      y += 8;

      doc.setFont("helvetica", "normal");

      agregarTextoEnvuelto(
        `${t("pdfTipoServicio")}: ${
          contrato?.frecuencia != null
            ? `${t("contratoCadaDias")} ${contrato.frecuencia}`
            : contenido.sinDato
        }`,
        margenIzquierdo,
        anchoUtil
      );

      agregarTextoEnvuelto(
        `${t("pdfFechaInicio")}: ${
          contrato?.fecha_inicio || contenido.sinDato
        }`,
        margenIzquierdo,
        anchoUtil
      );

      agregarTextoEnvuelto(
        `${t("pdfPrecioMensual")}: ${
          contrato?.precio != null
            ? `${contrato.precio} €`
            : contenido.sinDato
        }`,
        margenIzquierdo,
        anchoUtil
      );

      y += 5;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);

      asegurarEspacio(10);
      doc.text(t("pdfCondiciones"), margenIzquierdo, y);
      y += 8;

      doc.setFont("helvetica", "normal");

      contenido.condiciones.forEach((seccion) => {
        agregarSeccion(seccion.titulo, seccion.texto);
      });

      y += 2;
      asegurarEspacio(45);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(contenido.firma, margenIzquierdo, y);
      y += 7;

      let firmaAgregada = false;

      if (contrato?.firma) {
        try {
          const { data, error } = await supabase.storage
            .from("firmas")
            .download(contrato.firma);

          if (!error && data) {
            const reader = new FileReader();

            const base64 = await new Promise(
              (resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = () =>
                  reject(new Error("No se pudo leer el archivo de firma."));
                reader.readAsDataURL(data);
              }
            );

            asegurarEspacio(35);

            doc.addImage(
              base64,
              "PNG",
              margenIzquierdo,
              y,
              60,
              25
            );

            y += 29;
            firmaAgregada = true;
          }
        } catch (error) {
          console.error("No se pudo cargar la firma:", error);
        }
      }

      if (!firmaAgregada) {
        asegurarEspacio(15);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        doc.text(
          "________________________________________",
          margenIzquierdo,
          y
        );

        y += 7;
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      agregarTextoEnvuelto(
        `${contenido.fecha}: ${new Date().toLocaleDateString(
          idioma === "en" ? "en-GB" : "es-ES"
        )}`,
        margenIzquierdo,
        anchoUtil,
        9,
        4
      );

      const totalPaginas = doc.internal.getNumberOfPages();

      for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
        doc.setPage(pagina);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.text(
          `${contenido.pagina} ${pagina} ${contenido.de} ${totalPaginas}`,
          doc.internal.pageSize.getWidth() - margenDerecho,
          altoPagina - 8,
          { align: "right" }
        );
      }

      const pdfBlob = doc.output("blob");
      const fileName = `contrato_${contrato.id}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from("contratos")
        .upload(fileName, pdfBlob, {
          upsert: true,
          contentType: "application/pdf",
        });

      if (uploadError) {
        console.error("Error subiendo PDF:", uploadError);

        alert(
          t("errorSubirPdfStorage") +
            uploadError.message
        );

        return;
      }

      const { error: updateError } = await supabase
        .from("contratos")
        .update({
          pdf_url: fileName,
          fecha_pdf: new Date().toISOString(),
          estado_pdf: "generado",
        })
        .eq("id", contrato.id);

      if (updateError) {
        throw new Error(
          "No se pudo actualizar el contrato con la ruta del PDF: " +
            updateError.message
        );
      }

      const { data: signedData, error: signedError } =
        await supabase.storage
          .from("contratos")
          .createSignedUrl(fileName, 3600);

      if (signedError || !signedData?.signedUrl) {
        throw new Error(
          signedError?.message ||
            "No se pudo generar la URL segura del contrato"
        );
      }

      alert(t("pdfGenerado"));

      if (onGenerado) {
        onGenerado(signedData.signedUrl);
      }
    } catch (err) {
      console.error("Error generando PDF:", err);

      alert(
        t("errorGenerarPdf") +
          (err?.message || "Error desconocido")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generarPDF}
      disabled={loading}
      style={{
        width: "100%",
        padding: "12px",
        backgroundColor: "#4db8ff",
        color: "#000",
        border: "none",
        borderRadius: "8px",
        cursor: loading ? "wait" : "pointer",
        marginTop: "20px",
        fontWeight: "700",
        fontSize: "16px",
        boxShadow: "0 0 10px rgba(0,153,255,0.4)",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading
        ? t("pdfGenerando")
        : t("pdfGenerar")}
    </button>
  );
}
