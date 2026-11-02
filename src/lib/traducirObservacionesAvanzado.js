
/*
 * ============================================================
 * COASTGUARD HOMES SERVICES
 * TRADUCTOR AVANZADO DE OBSERVACIONES
 * ============================================================
 *
 * Archivo: traducirObservacionesAvanzado.js
 *
 * Objetivos:
 * - Mejorar la traducción de frases español-inglés mezcladas.
 * - Reconstruir estructuras gramaticales completas.
 * - Reconocer expresiones técnicas de inspecciones.
 * - Corregir artículos, preposiciones y orden de palabras.
 * - Evitar traducciones literales que cambien el significado.
 * - No inventar averías, causas ni reparaciones.
 * - Conservar puntuación, saltos de línea y datos protegidos.
 *
 * Este archivo es independiente del traductor principal.
 * No importa funciones del archivo principal.
 * ============================================================
 */

// ============================================================
// 1. UTILIDADES INTERNAS
// ============================================================

function convertirPatronUnicodeCG(patron) {
  if (!(patron instanceof RegExp)) return patron;

  let indice = 0;

  const source = patron.source.replace(/\\b/g, () => {
    const limite = indice % 2 === 0;
    indice++;

    return limite
      ? "(?<![\\p{L}\\p{N}_])"
      : "(?![\\p{L}\\p{N}_])";
  });

  const flags = patron.flags.includes("u")
    ? patron.flags
    : patron.flags + "u";

  return new RegExp(source, flags);
}

function conservarMayusculasAvanzadoCG(original, traduccion) {
  const texto = String(original ?? "");
  const destino = String(traduccion ?? "");

  if (!texto || !destino) return destino;

  if (texto === texto.toUpperCase()) {
    return destino.toUpperCase();
  }

  if (texto[0] === texto[0].toUpperCase()) {
    return destino.charAt(0).toUpperCase() + destino.slice(1);
  }

  return destino;
}

function aplicarReglasAvanzadasCG(texto, reglas) {
  let resultado = String(texto ?? "");

  for (const regla of reglas) {
    const patron = convertirPatronUnicodeCG(regla.patron);

    resultado = resultado.replace(
      patron,
      coincidencia => conservarMayusculasAvanzadoCG(
        coincidencia,
        regla.traduccion
      )
    );
  }

  return resultado;
}

function tieneMarcadorProtegidoCG(texto) {
  return /ZXQDATACG[A-Z]+QXZ/.test(String(texto ?? ""));
}

// ============================================================
// 2. RECONSTRUCCIÓN DE FRASES COMPLETAS
// ============================================================

const REGLAS_FRASES_AVANZADAS_CG = [
  // Cocina y mobiliario
  {
    patron: /\bla\s+kitchen\s+esta\s+dirty\b/gi,
    traduccion: "The kitchen is dirty"
  },
  {
    patron: /\bkitchen\s+esta\s+dirty\b/gi,
    traduccion: "The kitchen is dirty"
  },
  {
    patron: /\bla\s+cocina\s+is\s+dirty\b/gi,
    traduccion: "The kitchen is dirty"
  },
  {
    patron: /\bla\s+table\s+de\s+el\s+dining\s+room\s+esta\s+broken\b/gi,
    traduccion: "The dining room table is broken"
  },
  {
    patron: /\btable\s+de\s+el\s+dining\s+room\s+esta\s+broken\b/gi,
    traduccion: "The dining room table is broken"
  },
  {
    patron: /\bla\s+mesa\s+del?\s+dining\s+room\s+esta\s+broken\b/gi,
    traduccion: "The dining room table is broken"
  },

  // Humedad
  {
    patron: /\bthere\s+is\s+dampness\s+en\s+el\s+bathroom\b/gi,
    traduccion: "There is dampness in the bathroom"
  },
  {
    patron: /\bthere\s+is\s+dampness\s+en\s+la\s+kitchen\b/gi,
    traduccion: "There is dampness in the kitchen"
  },
  {
    patron: /\bthere\s+is\s+humedad\s+en\s+el\s+bathroom\b/gi,
    traduccion: "There is dampness in the bathroom"
  },
  {
    patron: /\bhumedad\s+en\s+el\s+ceiling\b/gi,
    traduccion: "Dampness on the ceiling"
  },
  {
    patron: /\bhumedad\s+en\s+la\s+wall\b/gi,
    traduccion: "Dampness on the wall"
  },

  // Puertas, ventanas y cerraduras
  {
    patron: /\bla\s+window\s+de\s+la\s+room\s+no\s+cierra\b/gi,
    traduccion: "The room window does not close"
  },
  {
    patron: /\bwindow\s+de\s+la\s+room\s+no\s+cierra\b/gi,
    traduccion: "The room window does not close"
  },
  {
    patron: /\bla\s+window\s+del?\s+bedroom\s+no\s+cierra\b/gi,
    traduccion: "The bedroom window does not close"
  },
  {
    patron: /\bla\s+lock\s+de\s+la\s+main\s+door\s+tiene\s+signos\s+de\s+forzada\b/gi,
    traduccion: "The main door lock shows signs of forced entry"
  },
  {
    patron: /\block\s+de\s+la\s+main\s+door\s+tiene\s+signos\s+de\s+forzada\b/gi,
    traduccion: "The main door lock shows signs of forced entry"
  },
  {
    patron: /\bla\s+cerradura\s+de\s+la\s+puerta\s+principal\s+tiene\s+signos\s+de\s+forzada\b/gi,
    traduccion: "The main door lock shows signs of forced entry"
  },
  {
    patron: /\b(?:la\s+)?door\s+no\s+cierra\b/gi,
    traduccion: "The door does not close"
  },
  {
    patron: /\b(?:la\s+)?window\s+no\s+cierra\b/gi,
    traduccion: "The window does not close"
  },
  {
    patron: /\b(?:la\s+)?door\s+no\s+abre\b/gi,
    traduccion: "The door does not open"
  },
  {
    patron: /\b(?:la\s+)?window\s+no\s+abre\b/gi,
    traduccion: "The window does not open"
  },

  // Fontanería
  {
    patron: /\bel\s+tap\s+de\s+la\s+kitchen\s+is\s+dripping\b/gi,
    traduccion: "The kitchen tap is dripping"
  },
  {
    patron: /\btap\s+de\s+la\s+kitchen\s+is\s+dripping\b/gi,
    traduccion: "The kitchen tap is dripping"
  },
  {
    patron: /\bel\s+grifo\s+de\s+la\s+cocina\s+is\s+dripping\b/gi,
    traduccion: "The kitchen tap is dripping"
  },
  {
    patron: /\bla\s+cistern\s+does\s+not\s+work\b/gi,
    traduccion: "The cistern does not work"
  },
  {
    patron: /\bcistern\s+no\s+funciona\b/gi,
    traduccion: "The cistern does not work"
  },
  {
    patron: /\bla\s+cisterna\s+does\s+not\s+work\b/gi,
    traduccion: "The cistern does not work"
  },

  // Piscina y mantenimiento
  {
    patron: /\bla\s+pool\s+requires\s+cleaning\b/gi,
    traduccion: "The pool requires cleaning"
  },
  {
    patron: /\bpool\s+needs\s+limpieza\b/gi,
    traduccion: "The pool needs cleaning"
  },
  {
    patron: /\bla\s+pool\s+necesita\s+limpieza\b/gi,
    traduccion: "The pool needs cleaning"
  },
  {
    patron: /\bgarden\s+necesita\s+mantenimiento\b/gi,
    traduccion: "The garden requires maintenance"
  },

  // Electricidad e iluminación
  {
    patron: /\bla\s+light\s+bulb\s+de\s+el\s+bathroom\s+esta\s+fundida\b/gi,
    traduccion: "The bathroom light bulb is burnt out"
  },
  {
    patron: /\blight\s+bulb\s+de\s+el\s+bathroom\s+esta\s+fundida\b/gi,
    traduccion: "The bathroom light bulb is burnt out"
  },
  {
    patron: /\bla\s+bombilla\s+de\s+el\s+bathroom\s+esta\s+fundida\b/gi,
    traduccion: "The bathroom light bulb is burnt out"
  },
  {
    patron: /\bla\s+light\s+bulb\s+esta\s+fundida\b/gi,
    traduccion: "The light bulb is burnt out"
  },
  {
    patron: /\bbombilla\s+fundida\b/gi,
    traduccion: "Burnt-out light bulb"
  },
  {
    patron: /\blight\s+bulb\s+fundida\b/gi,
    traduccion: "Burnt-out light bulb"
  },
  {
    patron: /\bla\s+light\s+no\s+funciona\b/gi,
    traduccion: "The light does not work"
  },
  {
    patron: /\bel\s+switch\s+no\s+funciona\b/gi,
    traduccion: "The switch does not work"
  },

  // Plagas
  {
    patron: /\bthere\s+is\s+una\s+plaga\s+de\s+hormigas\s+en\s+la\s+kitchen\b/gi,
    traduccion: "There is an ant infestation in the kitchen"
  },
  {
    patron: /\buna\s+plaga\s+de\s+hormigas\s+en\s+la\s+kitchen\b/gi,
    traduccion: "An ant infestation in the kitchen"
  },
  {
    patron: /\bplaga\s+de\s+hormigas\b/gi,
    traduccion: "Ant infestation"
  },
  {
    patron: /\bplaga\s+de\s+termitas\b/gi,
    traduccion: "Termite infestation"
  },
  {
    patron: /\bplaga\s+de\s+cucarachas\b/gi,
    traduccion: "Cockroach infestation"
  },
  {
    patron: /\bplaga\s+de\s+roedores\b/gi,
    traduccion: "Rodent infestation"
  },

  // Pintura y estado de la vivienda
  {
    patron: /\bla\s+property\s+needs\s+pintarse\b/gi,
    traduccion: "The property needs painting"
  },
  {
    patron: /\bproperty\s+needs\s+pintarse\b/gi,
    traduccion: "The property needs painting"
  },
  {
    patron: /\bla\s+vivienda\s+needs\s+pintarse\b/gi,
    traduccion: "The property needs painting"
  },
  {
    patron: /\bneeds\s+ser\s+pintada\b/gi,
    traduccion: "needs painting"
  },
  {
    patron: /\bnecesita\s+ser\s+pintada\b/gi,
    traduccion: "needs painting"
  },
  {
    patron: /\bnecesita\s+pintarse\b/gi,
    traduccion: "needs painting"
  }
];

// ============================================================
// 3. CORRECCIONES DE ARTÍCULOS Y PREPOSICIONES MIXTAS
// ============================================================

const REGLAS_ARTICULOS_AVANZADAS_CG = [
  {
    patron: /\bde\s+el\b/gi,
    traduccion: "of the"
  },
  {
    patron: /\bde\s+la\b/gi,
    traduccion: "of the"
  },
  {
    patron: /\bde\s+los\b/gi,
    traduccion: "of the"
  },
  {
    patron: /\bde\s+las\b/gi,
    traduccion: "of the"
  },
  {
    patron: /\ben\s+el\b/gi,
    traduccion: "in the"
  },
  {
    patron: /\ben\s+la\b/gi,
    traduccion: "in the"
  },
  {
    patron: /\ben\s+los\b/gi,
    traduccion: "in the"
  },
  {
    patron: /\ben\s+las\b/gi,
    traduccion: "in the"
  },
  {
    patron: /\bcon\s+el\b/gi,
    traduccion: "with the"
  },
  {
    patron: /\bcon\s+la\b/gi,
    traduccion: "with the"
  }
];

// ============================================================
// 4. CORRECCIONES DE VERBOS Y CONSTRUCCIONES MIXTAS
// ============================================================

const REGLAS_VERBOS_AVANZADAS_CG = [
  {
    patron: /\bis\s+dirty\b/gi,
    traduccion: "is dirty"
  },
  {
    patron: /\bis\s+broken\b/gi,
    traduccion: "is broken"
  },
  {
    patron: /\bis\s+damaged\b/gi,
    traduccion: "is damaged"
  },
  {
    patron: /\bis\s+fundida\b/gi,
    traduccion: "is burnt out"
  },
  {
    patron: /\besta\s+dirty\b/gi,
    traduccion: "is dirty"
  },
  {
    patron: /\bestá\s+dirty\b/gi,
    traduccion: "is dirty"
  },
  {
    patron: /\besta\s+broken\b/gi,
    traduccion: "is broken"
  },
  {
    patron: /\bestá\s+broken\b/gi,
    traduccion: "is broken"
  },
  {
    patron: /\besta\s+damaged\b/gi,
    traduccion: "is damaged"
  },
  {
    patron: /\bestá\s+damaged\b/gi,
    traduccion: "is damaged"
  },
  {
    patron: /\bneeds\s+pintarse\b/gi,
    traduccion: "needs painting"
  },
  {
    patron: /\bneeds\s+limpieza\b/gi,
    traduccion: "needs cleaning"
  },
  {
    patron: /\brequires\s+limpieza\b/gi,
    traduccion: "requires cleaning"
  },
  {
    patron: /\bno\s+funciona\b/gi,
    traduccion: "does not work"
  },
  {
    patron: /\bno\s+cierra\b/gi,
    traduccion: "does not close"
  },
  {
    patron: /\bno\s+abre\b/gi,
    traduccion: "does not open"
  }
];

// ============================================================
// 5. NORMALIZACIÓN DE ESPACIOS
// ============================================================

function limpiarEspaciosAvanzadoCG(texto) {
  return String(texto ?? "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([,.;:!?])/g, "$1")
    .replace(/([,;:])(?=\S)/g, "$1 ");
}

// ============================================================
// 6. PRIMERA FASE: ANTES DEL TRADUCTOR PRINCIPAL
// ============================================================

function prepararObservacionMixtaCG(texto) {
  if (typeof texto !== "string" || !texto.trim()) {
    return texto ?? "";
  }

  let resultado = texto;

  resultado = aplicarReglasAvanzadasCG(
    resultado,
    REGLAS_FRASES_AVANZADAS_CG
  );

  return limpiarEspaciosAvanzadoCG(resultado);
}

// ============================================================
// 7. SEGUNDA FASE: DESPUÉS DEL TRADUCTOR PRINCIPAL
// ============================================================

function mejorarTraduccionObservacionCG(texto) {
  if (typeof texto !== "string" || !texto.trim()) {
    return texto ?? "";
  }

  let resultado = texto;

  resultado = aplicarReglasAvanzadasCG(
    resultado,
    REGLAS_FRASES_AVANZADAS_CG
  );

  resultado = aplicarReglasAvanzadasCG(
    resultado,
    REGLAS_ARTICULOS_AVANZADAS_CG
  );

  resultado = aplicarReglasAvanzadasCG(
    resultado,
    REGLAS_VERBOS_AVANZADAS_CG
  );

  resultado = limpiarEspaciosAvanzadoCG(resultado);

  return resultado;
}

// ============================================================
// 8. FUNCIÓN PÚBLICA DEL MÓDULO
// ============================================================

function traducirObservacionAvanzadaCG(texto) {
  const preparado = prepararObservacionMixtaCG(texto);

  return mejorarTraduccionObservacionCG(preparado);
}

// ============================================================
// 9. EXPORTACIONES
// ============================================================

export {
  prepararObservacionMixtaCG,
  mejorarTraduccionObservacionCG,
  traducirObservacionAvanzadaCG
};

export default traducirObservacionAvanzadaCG;

// ============================================================
// FIN DEL ARCHIVO
// COASTGUARD HOMES SERVICES
// ============================================================
