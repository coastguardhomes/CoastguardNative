import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { resolverUrlPdfSegura } from "../lib/urlPdf.js";

function valorTexto(valor, alternativa = "No especificado") {
  if (
    valor === null ||
    valor === undefined ||
    String(valor).trim() === ""
  ) {
    return alternativa;
  }

  return String(valor).trim();
}

function idiomaNormalizado(idioma) {
  const valor = String(idioma || "es").toLowerCase().trim();

  return (
    valor === "en" ||
    valor.startsWith("en-") ||
    valor === "english" ||
    valor === "inglés" ||
    valor === "ingles"
  )
    ? "en"
    : "es";
}

function fechaLegible(valor, idioma) {
  if (!valor) {
    return idioma === "en" ? "Not specified" : "No especificada";
  }

  const fecha = new Date(valor);

  if (Number.isNaN(fecha.getTime())) {
    return valorTexto(valor);
  }

  return fecha.toLocaleString(
    idioma === "en" ? "en-GB" : "es-ES"
  );
}

function parsearFotos(valor) {
  if (!valor) return [];

  if (Array.isArray(valor)) {
    return valor;
  }

  if (typeof valor === "string") {
    try {
      const resultado = JSON.parse(valor);

      if (Array.isArray(resultado)) return resultado;
      if (resultado && typeof resultado === "object") {
        return [resultado];
      }

      return resultado ? [resultado] : [];
    } catch {
      return [valor.trim()];
    }
  }

  if (typeof valor === "object") {
    return [valor];
  }

  return [];
}

function obtenerReferenciaFoto(foto) {
  if (typeof foto === "string") {
    return {
      valor: foto.trim(),
      bucket: "extras"
    };
  }

  if (!foto || typeof foto !== "object") {
    return null;
  }

  const valor =
    foto.url_foto ||
    foto.url ||
    foto.path ||
    foto.foto_url ||
    foto.url_storage_o_path ||
    foto.archivo ||
    foto.ruta ||
    foto.name ||
    "";

  if (typeof valor !== "string" || !valor.trim()) {
    return null;
  }

  let referencia = valor.trim();

  let bucket =
    foto.bucket ||
    foto.bucket_id ||
    foto.bucketId ||
    "extras";

  if (/^https?:\/\//i.test(referencia)) {
    const coincidencia = referencia.match(
      /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\//i
    );

    if (coincidencia) {
      try {
        bucket = decodeURIComponent(coincidencia[1]);
      } catch {
        throw new Error(
          "Una fotografía contiene una referencia de Storage no válida."
        );
      }
    }

    return { valor: referencia, bucket };
  }

  referencia = referencia.replace(/^\/+/, "");

  for (const nombreBucket of ["extras", "facturas"]) {
    if (referencia.startsWith(`${nombreBucket}/`)) {
      bucket = nombreBucket;
      referencia = referencia.slice(nombreBucket.length + 1);
      break;
    }
  }

  if (!referencia) return null;

  return {
    valor: referencia,
    bucket
  };
}

async function convertirFotoBase64(url, numero) {
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(
      `No se pudo descargar la fotografía ${numero}. HTTP ${respuesta.status}.`
    );
  }

  const blob = await respuesta.blob();

  if (!blob.type.startsWith("image/")) {
    throw new Error(
      `El archivo de la fotografía ${numero} no es una imagen válida.`
    );
  }

  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onload = () => {
      if (
        typeof lector.result !== "string" ||
        !lector.result.startsWith("data:image/")
      ) {
        reject(
          new Error(
            `No se pudo convertir la fotografía ${numero}.`
          )
        );
        return;
      }

      resolve(lector.result);
    };

    lector.onerror = () => {
      reject(
        new Error(
          `Error leyendo la fotografía ${numero}.`
        )
      );
    };

    lector.readAsDataURL(blob);
  });
}

async function cargarTodasLasFotos(fotosRaw) {
  const fotos = parsearFotos(fotosRaw);
  const resultado = [];

  for (let index = 0; index < fotos.length; index++) {
    const numero = index + 1;
    const referencia = obtenerReferenciaFoto(fotos[index]);

    if (!referencia) {
      throw new Error(
        `La fotografía ${numero} no contiene una ruta válida. No se puede publicar un informe incompleto.`
      );
    }

    const { valor, bucket } = referencia;

    let base64;

    if (valor.startsWith("data:image/")) {
      base64 = valor;
    } else if (valor.startsWith("blob:")) {
      base64 = await convertirFotoBase64(valor, numero);
    } else {
      const urlFirmada = await resolverUrlPdfSegura(
        valor,
        bucket,
        3600
      );

      if (!urlFirmada) {
        throw new Error(
          `No se pudo acceder a la fotografía ${numero} del bucket ${bucket}. Comprueba sus permisos y su ruta.`
        );
      }

      base64 = await convertirFotoBase64(
        urlFirmada,
        numero
      );
    }

    resultado.push({
      base64,
      numero
    });
  }

  if (resultado.length !== fotos.length) {
    throw new Error(
      "No se han podido incorporar todas las fotografías del extra."
    );
  }

  return resultado;
}

function obtenerDireccion(vivienda, extra) {
  const partes = [
    vivienda?.direccion || extra?.direccion,
    vivienda?.localidad,
    vivienda?.ciudad,
    vivienda?.provincia,
    vivienda?.codigo_postal
  ]
    .filter(
      (parte) =>
        parte !== null &&
        parte !== undefined &&
        String(parte).trim() !== ""
    )
    .map((parte) => String(parte).trim());

  return partes.length
    ? [...new Set(partes)].join(", ")
    : "No especificada";
}

function añadirTextoLargo(
  doc,
  texto,
  opciones
) {
  const {
    x,
    yInicial,
    ancho,
    limiteInferior,
    pageHeight,
    margen
  } = opciones;

  let y = yInicial;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(35, 35, 35);

  const lineas = doc.splitTextToSize(
    texto,
    ancho
  );

  for (const linea of lineas) {
    if (y + 15 > limiteInferior) {
      doc.addPage();
      y = 50;
    }

    doc.text(linea, x, y);
    y += 14;
  }

  return y;
}

function añadirTituloSeccion(
  doc,
  titulo,
  estado
) {
  const {
    margen,
    pageWidth,
    pageHeight
  } = estado;

  if (estado.y + 45 > pageHeight - 55) {
    doc.addPage();
    estado.y = 50;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 91, 160);

  doc.text(titulo, margen, estado.y);

  estado.y += 12;

  doc.setDrawColor(210, 210, 210);
  doc.setLineWidth(0.6);

  doc.line(
    margen,
    estado.y,
    pageWidth - margen,
    estado.y
  );

  estado.y += 16;
}

export async function generarPDFExtra({
  extra,
  cliente,
  vivienda,
  tecnico,
  factura
}) {
  if (!extra?.id) {
    throw new Error(
      "No se ha proporcionado un servicio extra válido."
    );
  }

  if (!cliente?.id) {
    throw new Error(
      "No se ha podido identificar al cliente titular del servicio."
    );
  }

  const idioma = idiomaNormalizado(cliente.idioma);

  const ingles = idioma === "en";

  const textos = ingles
    ? {
        titulo: "Extra service report",
        identificador: "Service ID",
        factura: "Related invoice",
        fecha: "Work date",
        cliente: "Client",
        direccion: "Property address",
        tecnico: "Technician",
        descripcion: "Work description and observations",
        materiales: "Materials used",
        tiempo: "Time spent",
        fotografias: "Photographs",
        fotografia: "Photograph",
        generado: "Generated",
        pagina: "Page",
        noEspecificado: "Not specified",
        sinDescripcion: "No work description recorded",
        sinMateriales: "Not specified",
        sinTiempo: "Not specified"
      }
    : {
        titulo: "Informe de servicio extra",
        identificador: "Identificador del servicio",
        factura: "Factura relacionada",
        fecha: "Fecha del trabajo",
        cliente: "Cliente",
        direccion: "Dirección de la vivienda",
        tecnico: "Técnico responsable",
        descripcion: "Descripción del trabajo y observaciones",
        materiales: "Materiales utilizados",
        tiempo: "Tiempo empleado",
        fotografias: "Fotografías",
        fotografia: "Fotografía",
        generado: "Generado",
        pagina: "Página",
        noEspecificado: "No especificado",
        sinDescripcion: "No hay descripción del trabajo registrada",
        sinMateriales: "No especificado",
        sinTiempo: "No especificado"
      };

  const fotos = await cargarTodasLasFotos(
    extra.fotos
  );

  const fechaTrabajo =
    extra.updated_at ||
    extra.creado_en ||
    extra.created_at ||
    null;

  const direccion = obtenerDireccion(
    vivienda,
    extra
  );

  const descripcion = valorTexto(
    extra.descripcion || extra.observaciones,
    textos.sinDescripcion
  );

  const materiales = valorTexto(
    extra.materiales,
    textos.sinMateriales
  );

  const tiempo = valorTexto(
    extra.tiempo_empleado,
    textos.sinTiempo
  );

  const nombreCliente = valorTexto(
    cliente.nombre,
    textos.noEspecificado
  );

  const nombreTecnico = valorTexto(
    tecnico?.nombre,
    textos.noEspecificado
  );

  const referenciaFactura = valorTexto(
    factura?.numero || factura?.id || extra.factura_id,
    textos.noEspecificado
  );

  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
    compress: true
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margen = 40;
  const anchoContenido = pageWidth - margen * 2;

  const azul = [0, 91, 160];
  const gris = [90, 90, 90];

  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...azul);

  doc.text(
    textos.titulo,
    margen,
    y
  );

  y += 18;

  doc.setDrawColor(...azul);
  doc.setLineWidth(1.5);

  doc.line(
    margen,
    y,
    pageWidth - margen,
    y
  );

  y += 25;

  const filas = [
    [
      textos.identificador,
      String(extra.id)
    ],
    [
      textos.factura,
      referenciaFactura
    ],
    [
      textos.fecha,
      fechaLegible(fechaTrabajo, idioma)
    ],
    [
      textos.cliente,
      nombreCliente
    ],
    [
      textos.direccion,
      direccion
    ],
    [
      textos.tecnico,
      nombreTecnico
    ]
  ];

  autoTable(doc, {
    startY: y,
    head: [
      [
        ingles ? "Field" : "Campo",
        ingles ? "Information" : "Información"
      ]
    ],
    body: filas,
    theme: "grid",
    headStyles: {
      fillColor: azul,
      textColor: [255, 255, 255]
    },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      overflow: "linebreak",
      valign: "middle"
    },
    columnStyles: {
      0: {
        cellWidth: 145,
        fontStyle: "bold"
      },
      1: {
        cellWidth: anchoContenido - 145
      }
    },
    margin: {
      left: margen,
      right: margen
    }
  });

  const estado = {
    y: doc.lastAutoTable.finalY + 25,
    margen,
    pageWidth,
    pageHeight
  };

  añadirTituloSeccion(
    doc,
    textos.descripcion,
    estado
  );

  estado.y = añadirTextoLargo(
    doc,
    descripcion,
    {
      x: margen,
      yInicial: estado.y,
      ancho: anchoContenido,
      limiteInferior: pageHeight - 55,
      pageHeight,
      margen
    }
  );

  estado.y += 15;

  if (
    materiales !== textos.sinMateriales
  ) {
    añadirTituloSeccion(
      doc,
      textos.materiales,
      estado
    );

    estado.y = añadirTextoLargo(
      doc,
      materiales,
      {
        x: margen,
        yInicial: estado.y,
        ancho: anchoContenido,
        limiteInferior: pageHeight - 55,
        pageHeight,
        margen
      }
    );

    estado.y += 15;
  }

  if (
    tiempo !== textos.sinTiempo
  ) {
    añadirTituloSeccion(
      doc,
      textos.tiempo,
      estado
    );

    estado.y = añadirTextoLargo(
      doc,
      tiempo,
      {
        x: margen,
        yInicial: estado.y,
        ancho: anchoContenido,
        limiteInferior: pageHeight - 55,
        pageHeight,
        margen
      }
    );

    estado.y += 15;
  }

  if (fotos.length > 0) {
    añadirTituloSeccion(
      doc,
      textos.fotografias,
      estado
    );

    const anchoFoto = 220;
    const altoFoto = 155;
    const espacioHorizontal = 25;
    const espacioVertical = 35;

    let columna = 0;

    for (const foto of fotos) {
      if (
        estado.y + altoFoto + 30 >
        pageHeight - 55
      ) {
        doc.addPage();
        estado.y = 50;
        columna = 0;
      }

      const x =
        margen +
        columna * (
          anchoFoto + espacioHorizontal
        );

      const base64 = foto.base64;

      const formato = base64.startsWith("data:image/png")
        ? "PNG"
        : base64.startsWith("data:image/webp")
          ? "WEBP"
          : base64.startsWith("data:image")
            ? "JPEG"
            : null;

      if (!formato) {
        throw new Error(
          `La fotografía ${foto.numero} no tiene un formato compatible.`
        );
      }

      try {
        doc.addImage(
          base64,
          formato,
          x,
          estado.y,
          anchoFoto,
          altoFoto,
          undefined,
          "FAST"
        );
      } catch (error) {
        throw new Error(
          `No se pudo insertar la fotografía ${foto.numero} en el informe: ${error.message || "formato no compatible"}.`
        );
      }

      doc.setDrawColor(190, 190, 190);

      doc.rect(
        x,
        estado.y,
        anchoFoto,
        altoFoto
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...gris);

      doc.text(
        `${textos.fotografia} ${foto.numero}`,
        x,
        estado.y + altoFoto + 13
      );

      columna++;

      if (columna >= 2) {
        columna = 0;
        estado.y += altoFoto + espacioVertical;
      }
    }

    if (columna === 1) {
      estado.y += altoFoto + espacioVertical;
    }
  }

  const numeroPaginas = doc.getNumberOfPages();

  for (
    let pagina = 1;
    pagina <= numeroPaginas;
    pagina++
  ) {
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
      `${textos.generado}: ${fechaLegible(
        new Date().toISOString(),
        idioma
      )}`,
      margen,
      pageHeight - 15
    );

    doc.text(
      `${textos.pagina} ${pagina} / ${numeroPaginas}`,
      pageWidth - margen,
      pageHeight - 20,
      {
        align: "right"
      }
    );
  }

  const pdfArray = doc.output("arraybuffer");

  const blob = new Blob(
    [pdfArray],
    {
      type: "application/pdf"
    }
  );

  if (!blob.size) {
    throw new Error(
      "El informe PDF generado está vacío."
    );
  }

  return blob;
}
