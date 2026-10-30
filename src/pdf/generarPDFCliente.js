import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Convierte una URL o un Base64 a una imagen Base64.
 * Las URL firmadas de Storage se reciben ya resueltas.
 */
async function urlToBase64(input) {
  if (!input) return null;

  if (
    typeof input === "string" &&
    input.startsWith("data:image")
  ) {
    return input;
  }

  try {
    const response = await fetch(input);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn(
      "No se pudo convertir una fotografía para el PDF:",
      error
    );

    return null;
  }
}

function texto(valor, alternativa = "No especificado") {
  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ""
  ) {
    return alternativa;
  }

  return String(valor);
}

function fechaLegible(valor) {
  if (!valor) return "Sin fecha";

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return texto(valor);
  }

  return fecha.toLocaleString("es-ES");
}

function obtenerUrlFoto(item) {
  if (typeof item === "string") {
    return item;
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  return (
    item.url ||
    item.signedUrl ||
    item.url_foto ||
    item.archivo ||
    null
  );
}

/**
 * Genera el PDF de una inspección normal o de un servicio extra.
 *
 * Para una inspección normal recibe los campos de inspecciones.
 * Para un extra recibe los campos de extras y esExtra: true.
 *
 * Las fotografías deben llegar con URL accesible temporalmente.
 */
export async function generarPDFCliente(
  inspeccion,
  opciones = {}
) {
  if (!inspeccion || typeof inspeccion !== "object") {
    throw new Error(
      "No se han proporcionado los datos del informe."
    );
  }

  const esExtra =
    opciones.esExtra === true ||
    inspeccion.tipoDocumento === "extra";

  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margen = 40;
  const anchoContenido = pageWidth - margen * 2;

  const azul = [0, 91, 160];
  const gris = [75, 85, 99];

  let y = 45;

  // CABECERA
  if (inspeccion.logoBase64) {
    try {
      doc.addImage(
        inspeccion.logoBase64,
        "PNG",
        margen,
        y - 10,
        105,
        52
      );
    } catch (error) {
      console.warn("No se pudo añadir el logotipo:", error);
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...azul);

  const titulo = esExtra
    ? "Informe de servicio extra"
    : "Informe de inspección";

  doc.text(
    titulo,
    inspeccion.logoBase64 ? 175 : margen,
    y + 20
  );

  y = 105;

  doc.setDrawColor(...azul);
  doc.setLineWidth(1.5);
  doc.line(margen, y, pageWidth - margen, y);

  y += 22;

  // DATOS GENERALES
  const fecha =
    esExtra
      ? inspeccion.creado_en || inspeccion.created_at
      : inspeccion.fecha ||
        inspeccion.fecha_finalizacion ||
        inspeccion.created_at ||
        inspeccion.fecha_creacion;

  const direccion = texto(
    inspeccion.direccion ||
      inspeccion.vivienda?.direccion
  );

  const localidad = texto(
    inspeccion.localidad ||
      inspeccion.vivienda?.localidad ||
      inspeccion.vivienda?.ciudad,
    "No especificada"
  );

  const observaciones = esExtra
    ? texto(
        inspeccion.descripcion ||
          inspeccion.observaciones ||
          inspeccion.notas_tecnico,
        "Sin descripción registrada"
      )
    : texto(
        inspeccion.notas_tecnico ||
          inspeccion.observaciones ||
          inspeccion.notas,
        "Sin observaciones registradas"
      );

  const tecnico = texto(
    inspeccion.inspector ||
      inspeccion.tecnico_nombre ||
      inspeccion.nombre_tecnico,
    "No especificado"
  );

  const filas = [
    ["Identificador", texto(inspeccion.id)],
    ["Contrato", texto(inspeccion.contrato_id, "Sin contrato")],
    ["Fecha", fechaLegible(fecha)],
    ["Dirección", direccion],
    ["Localidad", localidad],
  ];

  if (esExtra) {
    filas.push([
      "Factura",
      texto(inspeccion.factura_id, "No especificada"),
    ]);

    filas.push([
      "Precio",
      inspeccion.precio !== null &&
      inspeccion.precio !== undefined
        ? `${Number(inspeccion.precio).toFixed(2)} €`
        : "No especificado",
    ]);
  } else {
    filas.push(["Inspector / técnico", tecnico]);
    filas.push([
      "Tipo de inspección",
      texto(
        inspeccion.tipo_inspeccion ||
          inspeccion.tipo ||
          inspeccion.origen
      ),
    ]);
  }

  autoTable(doc, {
    startY: y,
    head: [["Campo", "Información"]],
    body: filas,
    theme: "grid",
    headStyles: {
      fillColor: azul,
      textColor: [255, 255, 255],
    },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      overflow: "linebreak",
      valign: "middle",
    },
    columnStyles: {
      0: {
        cellWidth: 125,
        fontStyle: "bold",
      },
      1: {
        cellWidth: anchoContenido - 125,
      },
    },
    margin: {
      left: margen,
      right: margen,
    },
  });

  y = doc.lastAutoTable.finalY + 25;

  // OBSERVACIONES / DESCRIPCIÓN
  const añadirTitulo = (tituloSeccion) => {
    if (y + 45 > pageHeight - 55) {
      doc.addPage();
      y = 50;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...azul);
    doc.text(tituloSeccion, margen, y);

    y += 12;

    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.6);
    doc.line(
      margen,
      y,
      pageWidth - margen,
      y
    );

    y += 16;
  };

  añadirTitulo(
    esExtra
      ? "Descripción del servicio"
      : "Observaciones del técnico"
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(35, 35, 35);

  const lineasObservaciones = doc.splitTextToSize(
    observaciones,
    anchoContenido
  );

  for (const linea of lineasObservaciones) {
    if (y + 16 > pageHeight - 55) {
      doc.addPage();
      y = 50;
    }

    doc.text(linea, margen, y);
    y += 14;
  }

  y += 12;

  // MATERIALES
  const materiales = texto(
    esExtra
      ? inspeccion.materiales
      : inspeccion.materiales_usados ||
          inspeccion.materiales,
    ""
  );

  if (materiales) {
    añadirTitulo("Materiales utilizados");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(35, 35, 35);

    const lineas = doc.splitTextToSize(
      materiales,
      anchoContenido
    );

    for (const linea of lineas) {
      if (y + 16 > pageHeight - 55) {
        doc.addPage();
        y = 50;
      }

      doc.text(linea, margen, y);
      y += 14;
    }

    y += 12;
  }

  // TIEMPO EMPLEADO
  if (inspeccion.tiempo_empleado) {
    añadirTitulo("Tiempo empleado");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(35, 35, 35);

    const lineas = doc.splitTextToSize(
      String(inspeccion.tiempo_empleado),
      anchoContenido
    );

    for (const linea of lineas) {
      if (y + 16 > pageHeight - 55) {
        doc.addPage();
        y = 50;
      }

      doc.text(linea, margen, y);
      y += 14;
    }

    y += 12;
  }

  // FOTOGRAFÍAS
  const fotos = Array.isArray(inspeccion.fotos)
    ? inspeccion.fotos
    : [];

  if (fotos.length > 0) {
    añadirTitulo("Fotografías");

    const anchoFoto = 220;
    const altoFoto = 155;
    const espacioHorizontal = 25;
    const espacioVertical = 28;

    let columna = 0;

    for (let index = 0; index < fotos.length; index++) {
      const foto = fotos[index];
      const imageUrl = obtenerUrlFoto(foto);

      if (!imageUrl) {
        continue;
      }

      const base64 = await urlToBase64(imageUrl);

      if (!base64) {
        console.warn(
          `No se pudo incorporar la fotografía ${index + 1}.`
        );
        continue;
      }

      if (y + altoFoto + 35 > pageHeight - 55) {
        doc.addPage();
        y = 50;
        columna = 0;
      }

      const x =
        margen +
        columna * (anchoFoto + espacioHorizontal);

      try {
        const formato = base64.startsWith("data:image/png")
          ? "PNG"
          : base64.startsWith("data:image/webp")
            ? "WEBP"
            : "JPEG";

        doc.addImage(
          base64,
          formato,
          x,
          y,
          anchoFoto,
          altoFoto,
          undefined,
          "FAST"
        );

        doc.setDrawColor(190, 190, 190);
        doc.rect(x, y, anchoFoto, altoFoto);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...gris);

        doc.text(
          `Fotografía ${index + 1}`,
          x,
          y + altoFoto + 13
        );
      } catch (error) {
        console.warn(
          `No se pudo insertar la fotografía ${index + 1}:`,
          error
        );
      }

      columna++;

      if (columna >= 2) {
        columna = 0;
        y += altoFoto + espacioVertical;
      }
    }

    if (columna === 1) {
      y += altoFoto + espacioVertical;
    }
  }

  // PIE Y NUMERACIÓN
  const numeroPaginas = doc.getNumberOfPages();

  for (let pagina = 1; pagina <= numeroPaginas; pagina++) {
    doc.setPage(pagina);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);

    doc.text(
      "CoastGuard Homes Services",
      margen,
      pageHeight - 28
    );

    doc.text(
      `Generado: ${new Date().toLocaleString("es-ES")}`,
      margen,
      pageHeight - 15
    );

    doc.text(
      `Página ${pagina} de ${numeroPaginas}`,
      pageWidth - margen,
      pageHeight - 20,
      { align: "right" }
    );
  }

  const pdfArray = doc.output("arraybuffer");

  const blob = new Blob([pdfArray], {
    type: "application/pdf",
  });

  if (!blob.size) {
    throw new Error("El PDF generado está vacío.");
  }

  return blob;
}
