/*
 * ============================================================
 * COASTGUARD HOMES SERVICES
 * TRADUCTOR AVANZADO DE OBSERVACIONES DE INSPECCIÓN
 * ============================================================
 *
 * Archivo: traducirObservacionesAvanzado.js
 *
 * Funciones:
 * - Reconstrucción de frases español-inglés mezcladas.
 * - Traducción contextual de vocabulario de inspecciones.
 * - Corrección de estructuras gramaticales frecuentes.
 * - Reconocimiento de expresiones técnicas de viviendas.
 * - Tratamiento conservador de frases ambiguas.
 * - Protección de marcadores de datos del traductor principal.
 * - Conservación de puntuación, espacios y saltos de línea.
 *
 * IMPORTANTE:
 * Este módulo complementa el traductor principal.
 * No sustituye sus diccionarios ni modifica su API.
 * No debe inventar averías, causas ni reparaciones.
 * ============================================================
 */

// ============================================================
// 1. UTILIDADES
// ============================================================

const MARCADOR_PROTEGIDO_CG = /ZXQDATACG\d+QXZ/g;

function convertirPatronUnicodeCG(patron) {
  if (!(patron instanceof RegExp)) return patron;

  let indice = 0;

  const source = patron.source.replace(/\\b/g, () => {
    const esInicio = indice % 2 === 0;
    indice++;

    return esInicio
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

/*
 * Aplica las reglas sin modificar los marcadores protegidos.
 * Los marcadores se separan antes de ejecutar las sustituciones.
 */

function aplicarReglasAvanzadasCG(texto, reglas) {
  const partes = String(texto ?? "").split(MARCADOR_PROTEGIDO_CG);

  const marcadores = String(texto ?? "").match(MARCADOR_PROTEGIDO_CG) || [];

  const procesadas = partes.map(parte => {
    let resultado = parte;

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
  });

  let resultado = "";

  for (let i = 0; i < procesadas.length; i++) {
    resultado += procesadas[i];

    if (i < marcadores.length) {
      resultado += marcadores[i];
    }
  }

  return resultado;
}

function textoValidoCG(texto) {
  return typeof texto === "string" && texto.trim().length > 0;
}

// ============================================================
// 2. FRASES COMPLETAS: COCINA Y MOBILIARIO
// ============================================================

const REGLAS_COCINA_MOBILIARIO_CG = [
  {
    patron: /\bla\s+kitchen\s+est[áa]\s+dirty\b/gi,
    traduccion: "The kitchen is dirty"
  },
  {
    patron: /\bkitchen\s+est[áa]\s+dirty\b/gi,
    traduccion: "The kitchen is dirty"
  },
  {
    patron: /\bla\s+cocina\s+is\s+dirty\b/gi,
    traduccion: "The kitchen is dirty"
  },
  {
    patron: /\bla\s+kitchen\s+est[áa]\s+clean\b/gi,
    traduccion: "The kitchen is clean"
  },
  {
    patron: /\bla\s+kitchen\s+no\s+est[áa]\s+clean\b/gi,
    traduccion: "The kitchen is not clean"
  },
  {
    patron: /\bla\s+table\s+de\s+el\s+dining\s+room\s+est[áa]\s+broken\b/gi,
    traduccion: "The dining room table is broken"
  },
  {
    patron: /\btable\s+de\s+el\s+dining\s+room\s+est[áa]\s+broken\b/gi,
    traduccion: "The dining room table is broken"
  },
  {
    patron: /\bla\s+mesa\s+del?\s+dining\s+room\s+est[áa]\s+broken\b/gi,
    traduccion: "The dining room table is broken"
  },
  {
    patron: /\bla\s+mesa\s+del?\s+comedor\s+is\s+broken\b/gi,
    traduccion: "The dining room table is broken"
  },
  {
    patron: /\bla\s+mesa\s+de\s+la\s+cocina\s+is\s+broken\b/gi,
    traduccion: "The kitchen table is broken"
  },
  {
    patron: /\bel\s+sofa\s+est[áa]\s+dirty\b/gi,
    traduccion: "The sofa is dirty"
  },
  {
    patron: /\bla\s+sofa\s+est[áa]\s+broken\b/gi,
    traduccion: "The sofa is broken"
  },
  {
    patron: /\bla\s+chair\s+est[áa]\s+broken\b/gi,
    traduccion: "The chair is broken"
  },
  {
    patron: /\bla\s+bed\s+est[áa]\s+broken\b/gi,
    traduccion: "The bed is broken"
  },
  {
    patron: /\bel\s+armario\s+is\s+damaged\b/gi,
    traduccion: "The wardrobe is damaged"
  },
  {
    patron: /\bla\s+wardrobe\s+est[áa]\s+damaged\b/gi,
    traduccion: "The wardrobe is damaged"
  },
  {
    patron: /\bla\s+fridge\s+no\s+funciona\b/gi,
    traduccion: "The fridge does not work"
  },
  {
    patron: /\bel\s+oven\s+no\s+funciona\b/gi,
    traduccion: "The oven does not work"
  },
  {
    patron: /\bla\s+washing\s+machine\s+no\s+funciona\b/gi,
    traduccion: "The washing machine does not work"
  },
  {
    patron: /\bla\s+dishwasher\s+no\s+funciona\b/gi,
    traduccion: "The dishwasher does not work"
  }
];

// ============================================================
// 3. BAÑOS Y SANITARIOS
// ============================================================

const REGLAS_BANOS_CG = [
  {
    patron: /\bla\s+cistern\s+does\s+not\s+work\b/gi,
    traduccion: "The cistern does not work"
  },
  {
    patron: /\bla\s+cisterna\s+does\s+not\s+work\b/gi,
    traduccion: "The cistern does not work"
  },
  {
    patron: /\bcistern\s+no\s+funciona\b/gi,
    traduccion: "The cistern does not work"
  },
  {
    patron: /\bel\s+toilet\s+est[áa]\s+broken\b/gi,
    traduccion: "The toilet is broken"
  },
  {
    patron: /\bel\s+toilet\s+no\s+funciona\b/gi,
    traduccion: "The toilet does not work"
  },
  {
    patron: /\bla\s+ducha\s+is\s+blocked\b/gi,
    traduccion: "The shower is blocked"
  },
  {
    patron: /\bla\s+shower\s+est[áa]\s+atascada\b/gi,
    traduccion: "The shower is blocked"
  },
  {
    patron: /\bla\s+shower\s+no\s+funciona\b/gi,
    traduccion: "The shower does not work"
  },
  {
    patron: /\bel\s+lavabo\s+is\s+blocked\b/gi,
    traduccion: "The washbasin is blocked"
  },
  {
    patron: /\bel\s+sink\s+est[áa]\s+atascado\b/gi,
    traduccion: "The sink is blocked"
  },
  {
    patron: /\bla\s+bañera\s+is\s+damaged\b/gi,
    traduccion: "The bathtub is damaged"
  },
  {
    patron: /\bla\s+bañera\s+est[áa]\s+damaged\b/gi,
    traduccion: "The bathtub is damaged"
  },
  {
    patron: /\bel\s+grifo\s+del?\s+baño\s+is\s+dripping\b/gi,
    traduccion: "The bathroom tap is dripping"
  },
  {
    patron: /\bla\s+fuga\s+de\s+agua\s+en\s+el\s+baño\b/gi,
    traduccion: "A water leak in the bathroom"
  }
];

// ============================================================
// 4. PUERTAS, VENTANAS Y CERRADURAS
// ============================================================

const REGLAS_PUERTAS_VENTANAS_CG = [
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
    patron: /\bla\s+window\s+del?\s+living\s+room\s+no\s+cierra\b/gi,
    traduccion: "The living room window does not close"
  },
  {
    patron: /\bla\s+door\s+de\s+la\s+main\s+entrance\s+no\s+cierra\b/gi,
    traduccion: "The main entrance door does not close"
  },
  {
    patron: /\bla\s+puerta\s+principal\s+no\s+cierra\b/gi,
    traduccion: "The main door does not close"
  },
  {
    patron: /\bla\s+puerta\s+principal\s+no\s+abre\b/gi,
    traduccion: "The main door does not open"
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
    patron: /\bla\s+cerradura\s+presenta\s+signos\s+de\s+haber\s+sido\s+forzada\b/gi,
    traduccion: "The lock shows signs of having been forced"
  },
  {
    patron: /\bla\s+cerradura\s+presenta\s+signos\s+de\s+forzado\b/gi,
    traduccion: "The lock shows signs of forced entry"
  },
  {
    patron: /\bla\s+window\s+est[áa]\s+broken\b/gi,
    traduccion: "The window is broken"
  },
  {
    patron: /\bla\s+door\s+est[áa]\s+broken\b/gi,
    traduccion: "The door is broken"
  },
  {
    patron: /\bla\s+window\s+est[áa]\s+damaged\b/gi,
    traduccion: "The window is damaged"
  },
  {
    patron: /\bla\s+door\s+est[áa]\s+damaged\b/gi,
    traduccion: "The door is damaged"
  },
  {
    patron: /\bla\s+ventana\s+no\s+cierra\b/gi,
    traduccion: "The window does not close"
  },
  {
    patron: /\bla\s+ventana\s+no\s+abre\b/gi,
    traduccion: "The window does not open"
  },
  {
    patron: /\bla\s+puerta\s+no\s+cierra\b/gi,
    traduccion: "The door does not close"
  },
  {
    patron: /\bla\s+puerta\s+no\s+abre\b/gi,
    traduccion: "The door does not open"
  },
  {
    patron: /\bla\s+cerradura\s+no\s+funciona\b/gi,
    traduccion: "The lock does not work"
  },
  {
    patron: /\bla\s+llave\s+de\s+la\s+cerradura\s+no\s+gira\b/gi,
    traduccion: "The lock key does not turn"
  }
];

// ============================================================
// 5. FONTANERÍA Y AGUA
// ============================================================

const REGLAS_FONTANERIA_CG = [
  {
    patron: /\bel\s+tap\s+de\s+la\s+kitchen\s+is\s+dripping\b/gi,
    traduccion: "The kitchen tap is dripping"
  },
  {
    patron: /\btap\s+de\s+la\s+kitchen\s+is\s+dripping\b/gi,
    traduccion: "The kitchen tap is dripping"
  },
  {
    patron: /\bla\s+tap\s+de\s+la\s+kitchen\s+is\s+dripping\b/gi,
    traduccion: "The kitchen tap is dripping"
  },
  {
    patron: /\bel\s+grifo\s+de\s+la\s+cocina\s+is\s+dripping\b/gi,
    traduccion: "The kitchen tap is dripping"
  },
  {
    patron: /\bel\s+grifo\s+gotea\b/gi,
    traduccion: "The tap is dripping"
  },
  {
    patron: /\bla\s+faucet\s+est[áa]\s+goteando\b/gi,
    traduccion: "The faucet is dripping"
  },
  {
    patron: /\bla\s+tubería\s+is\s+leaking\b/gi,
    traduccion: "The pipe is leaking"
  },
  {
    patron: /\bla\s+pipe\s+tiene\s+una\s+fuga\b/gi,
    traduccion: "The pipe has a leak"
  },
  {
    patron: /\bla\s+pipe\s+est[áa]\s+broken\b/gi,
    traduccion: "The pipe is broken"
  },
  {
    patron: /\bel\s+desagüe\s+est[áa]\s+blocked\b/gi,
    traduccion: "The drain is blocked"
  },
  {
    patron: /\bla\s+drain\s+est[áa]\s+atascada\b/gi,
    traduccion: "The drain is blocked"
  },
  {
    patron: /\bla\s+tubería\s+est[áa]\s+obstruida\b/gi,
    traduccion: "The pipe is blocked"
  },
  {
    patron: /\bla\s+llave\s+de\s+paso\s+est[áa]\s+cerrada\b/gi,
    traduccion: "The shut-off valve is closed"
  },
  {
    patron: /\bla\s+llave\s+de\s+paso\s+est[áa]\s+abierta\b/gi,
    traduccion: "The shut-off valve is open"
  },
  {
    patron: /\bla\s+llave\s+de\s+paso\s+no\s+funciona\b/gi,
    traduccion: "The shut-off valve does not work"
  },
  {
    patron: /\bthere\s+is\s+una\s+fuga\s+de\s+agua\b/gi,
    traduccion: "There is a water leak"
  },
  {
    patron: /\bthere\s+is\s+agua\s+filtrándose\b/gi,
    traduccion: "There is water seeping through"
  },
  {
    patron: /\bthere\s+is\s+water\s+en\s+el\s+suelo\b/gi,
    traduccion: "There is water on the floor"
  },
  {
    patron: /\bel\s+water\s+heater\s+no\s+funciona\b/gi,
    traduccion: "The water heater does not work"
  },
  {
    patron: /\bel\s+calentador\s+de\s+agua\s+no\s+funciona\b/gi,
    traduccion: "The water heater does not work"
  }
];

// ============================================================
// 6. HUMEDAD, FILTRACIONES Y MOHO
// ============================================================

const REGLAS_HUMEDAD_CG = [
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
    patron: /\bthere\s+is\s+humedad\s+en\s+la\s+pared\b/gi,
    traduccion: "There is dampness on the wall"
  },
  {
    patron: /\bthere\s+is\s+moho\s+en\s+el\s+baño\b/gi,
    traduccion: "There is mould in the bathroom"
  },
  {
    patron: /\bthere\s+is\s+mould\s+en\s+el\s+baño\b/gi,
    traduccion: "There is mould in the bathroom"
  },
  {
    patron: /\bhumedad\s+en\s+el\s+ceiling\b/gi,
    traduccion: "Dampness on the ceiling"
  },
  {
    patron: /\bhumedad\s+en\s+la\s+wall\b/gi,
    traduccion: "Dampness on the wall"
  },
  {
    patron: /\bla\s+pared\s+tiene\s+humedad\b/gi,
    traduccion: "The wall has dampness"
  },
  {
    patron: /\bel\s+techo\s+tiene\s+humedad\b/gi,
    traduccion: "The ceiling has dampness"
  },
  {
    patron: /\bmanchas\s+de\s+humedad\b/gi,
    traduccion: "Damp patches"
  },
  {
    patron: /\bmanchas\s+de\s+moho\b/gi,
    traduccion: "Mould stains"
  },
  {
    patron: /\bfiltración\s+de\s+agua\b/gi,
    traduccion: "Water ingress"
  },
  {
    patron: /\bfiltraciones\s+de\s+agua\b/gi,
    traduccion: "Water ingress"
  },
  {
    patron: /\bentrada\s+de\s+agua\b/gi,
    traduccion: "Water ingress"
  },
  {
    patron: /\bcondensación\s+en\s+las\s+ventanas\b/gi,
    traduccion: "Condensation on the windows"
  }
];

// ============================================================
// 7. ELECTRICIDAD E ILUMINACIÓN
// ============================================================

const REGLAS_ELECTRICIDAD_CG = [
  {
    patron: /\bla\s+light\s+bulb\s+de\s+el\s+bathroom\s+est[áa]\s+fundida\b/gi,
    traduccion: "The bathroom light bulb is burnt out"
  },
  {
    patron: /\blight\s+bulb\s+de\s+el\s+bathroom\s+est[áa]\s+fundida\b/gi,
    traduccion: "The bathroom light bulb is burnt out"
  },
  {
    patron: /\bla\s+bombilla\s+de\s+el\s+bathroom\s+est[áa]\s+fundida\b/gi,
    traduccion: "The bathroom light bulb is burnt out"
  },
  {
    patron: /\bla\s+bombilla\s+del\s+baño\s+est[áa]\s+fundida\b/gi,
    traduccion: "The bathroom light bulb is burnt out"
  },
  {
    patron: /\bla\s+light\s+bulb\s+est[áa]\s+fundida\b/gi,
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
    patron: /\bla\s+luz\s+no\s+funciona\b/gi,
    traduccion: "The light does not work"
  },
  {
    patron: /\bel\s+switch\s+no\s+funciona\b/gi,
    traduccion: "The switch does not work"
  },
  {
    patron: /\bel\s+interruptor\s+no\s+funciona\b/gi,
    traduccion: "The switch does not work"
  },
  {
    patron: /\bel\s+enchufe\s+est[áa]\s+damaged\b/gi,
    traduccion: "The socket is damaged"
  },
  {
    patron: /\bel\s+socket\s+est[áa]\s+dañado\b/gi,
    traduccion: "The socket is damaged"
  },
  {
    patron: /\bla\s+toma\s+de\s+corriente\s+no\s+funciona\b/gi,
    traduccion: "The power socket does not work"
  },
  {
    patron: /\bel\s+cuadro\s+eléctrico\s+est[áa]\s+abierto\b/gi,
    traduccion: "The electrical panel is open"
  },
  {
    patron: /\bel\s+fuse\s+est[áa]\s+fundido\b/gi,
    traduccion: "The fuse is blown"
  }
];

// ============================================================
// 8. PISCINAS, JARDINES Y EXTERIORES
// ============================================================

const REGLAS_EXTERIORES_CG = [
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
    patron: /\bla\s+piscina\s+needs\s+cleaning\b/gi,
    traduccion: "The pool needs cleaning"
  },
  {
    patron: /\bla\s+piscina\s+necesita\s+limpieza\b/gi,
    traduccion: "The pool needs cleaning"
  },
  {
    patron: /\bla\s+pool\s+est[áa]\s+dirty\b/gi,
    traduccion: "The pool is dirty"
  },
  {
    patron: /\bla\s+pool\s+water\s+est[áa]\s+dirty\b/gi,
    traduccion: "The pool water is dirty"
  },
  {
    patron: /\bla\s+garden\s+necesita\s+mantenimiento\b/gi,
    traduccion: "The garden requires maintenance"
  },
  {
    patron: /\bel\s+jardín\s+needs\s+maintenance\b/gi,
    traduccion: "The garden requires maintenance"
  },
  {
    patron: /\bla\s+grass\s+needs\s+cutting\b/gi,
    traduccion: "The grass needs cutting"
  },
  {
    patron: /\bel\s+césped\s+needs\s+cutting\b/gi,
    traduccion: "The grass needs cutting"
  },
  {
    patron: /\bla\s+valla\s+est[áa]\s+damaged\b/gi,
    traduccion: "The fence is damaged"
  },
  {
    patron: /\bla\s+fence\s+est[áa]\s+dañada\b/gi,
    traduccion: "The fence is damaged"
  },
  {
    patron: /\bla\s+terraza\s+is\s+dirty\b/gi,
    traduccion: "The terrace is dirty"
  },
  {
    patron: /\bel\s+patio\s+needs\s+cleaning\b/gi,
    traduccion: "The patio needs cleaning"
  },
  {
    patron: /\bla\s+puerta\s+exterior\s+est[áa]\s+damaged\b/gi,
    traduccion: "The exterior door is damaged"
  }
];

// ============================================================
// 9. PLAGAS Y LIMPIEZA
// ============================================================

const REGLAS_PLAGAS_LIMPIEZA_CG = [
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
  {
    patron: /\bplaga\s+de\s+mosquitos\b/gi,
    traduccion: "Mosquito infestation"
  },
  {
    patron: /\bplaga\s+de\s+moscas\b/gi,
    traduccion: "Fly infestation"
  },
  {
    patron: /\bexcrementos\s+de\s+roedores\b/gi,
    traduccion: "Rodent droppings"
  },
  {
    patron: /\brestos\s+de\s+insectos\b/gi,
    traduccion: "Insect remains"
  },
  {
    patron: /\bnecesita\s+limpieza\s+profunda\b/gi,
    traduccion: "Requires deep cleaning"
  },
  {
    patron: /\bnecesita\s+una\s+limpieza\s+general\b/gi,
    traduccion: "Requires general cleaning"
  },
  {
    patron: /\bse\s+encuentra\s+sucio\b/gi,
    traduccion: "Is dirty"
  },
  {
    patron: /\bse\s+encuentra\s+sucia\b/gi,
    traduccion: "Is dirty"
  }
];

// ============================================================
// 10. PINTURA, PAREDES, SUELOS Y TECHOS
// ============================================================

const REGLAS_ACABADOS_CG = [
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
    patron: /\bla\s+pared\s+est[áa]\s+cracked\b/gi,
    traduccion: "The wall is cracked"
  },
  {
    patron: /\bla\s+wall\s+est[áa]\s+agrietada\b/gi,
    traduccion: "The wall is cracked"
  },
  {
    patron: /\bel\s+techo\s+est[áa]\s+damaged\b/gi,
    traduccion: "The ceiling is damaged"
  },
  {
    patron: /\bel\s+ceiling\s+est[áa]\s+dañado\b/gi,
    traduccion: "The ceiling is damaged"
  },
  {
    patron: /\bel\s+suelo\s+est[áa]\s+damaged\b/gi,
    traduccion: "The floor is damaged"
  },
  {
    patron: /\bel\s+floor\s+est[áa]\s+dañado\b/gi,
    traduccion: "The floor is damaged"
  },
  {
    patron: /\bazulejos\s+rotos\b/gi,
    traduccion: "Broken tiles"
  },
  {
    patron: /\btiles\s+rotos\b/gi,
    traduccion: "Broken tiles"
  },
  {
    patron: /\bdesprendimiento\s+de\s+pintura\b/gi,
    traduccion: "Peeling paint"
  },
  {
    patron: /\bpintura\s+desconchada\b/gi,
    traduccion: "Peeling paint"
  },
  {
    patron: /\bpintura\s+en\s+mal\s+estado\b/gi,
    traduccion: "Paint in poor condition"
  },
  {
    patron: /\bnecesita\s+ser\s+pintada\b/gi,
    traduccion: "Needs painting"
  },
  {
    patron: /\bnecesita\s+pintarse\b/gi,
    traduccion: "Needs painting"
  }
];

// ============================================================
// 11. REGLAS DE ESTADO Y OBSERVACIONES
// ============================================================

const REGLAS_ESTADO_CG = [
  {
    patron: /\bno\s+se\s+observan\s+daños\b/gi,
    traduccion: "No damage was observed"
  },
  {
    patron: /\bno\s+se\s+observa\s+ningún\s+daño\b/gi,
    traduccion: "No damage was observed"
  },
  {
    patron: /\bno\s+se\s+detectan\s+fugas\b/gi,
    traduccion: "No leaks were detected"
  },
  {
    patron: /\bno\s+se\s+detecta\s+ninguna\s+fuga\b/gi,
    traduccion: "No leaks were detected"
  },
  {
    patron: /\bno\s+se\s+observan\s+filtraciones\b/gi,
    traduccion: "No water ingress was observed"
  },
  {
    patron: /\bno\s+se\s+observa\s+humedad\b/gi,
    traduccion: "No dampness was observed"
  },
  {
    patron: /\bno\s+se\s+observa\s+moho\b/gi,
    traduccion: "No mould was observed"
  },
  {
    patron: /\bse\s+encuentra\s+en\s+buen\s+estado\b/gi,
    traduccion: "Is in good condition"
  },
  {
    patron: /\bse\s+encuentra\s+en\s+mal\s+estado\b/gi,
    traduccion: "Is in poor condition"
  },
  {
    patron: /\bpendiente\s+de\s+revisión\b/gi,
    traduccion: "Pending inspection"
  },
  {
    patron: /\bpendiente\s+de\s+reparación\b/gi,
    traduccion: "Pending repair"
  },
  {
    patron: /\bpendiente\s+de\s+limpieza\b/gi,
    traduccion: "Pending cleaning"
  },
  {
    patron: /\bno\s+ha\s+sido\s+posible\s+comprobar\b/gi,
    traduccion: "It was not possible to check"
  },
  {
    patron: /\bno\s+se\s+ha\s+podido\s+comprobar\b/gi,
    traduccion: "It could not be checked"
  },
  {
    patron: /\bno\s+se\s+ha\s+podido\s+acceder\b/gi,
    traduccion: "Access could not be gained"
  }
];

// ============================================================
// 12. FRASES MIXTAS ADICIONALES
// ============================================================

const REGLAS_MIXTAS_ADICIONALES_CG = [
  {
    patron: /\bla\s+property\s+est[áa]\s+vacía\b/gi,
    traduccion: "The property is empty"
  },
  {
    patron: /\bla\s+property\s+est[áa]\s+occupied\b/gi,
    traduccion: "The property is occupied"
  },
  {
    patron: /\bla\s+house\s+est[áa]\s+vacía\b/gi,
    traduccion: "The house is empty"
  },
  {
    patron: /\bel\s+hallway\s+est[áa]\s+dirty\b/gi,
    traduccion: "The hallway is dirty"
  },
  {
    patron: /\bla\s+entrada\s+est[áa]\s+dirty\b/gi,
    traduccion: "The entrance is dirty"
  },
  {
    patron: /\bla\s+escalera\s+est[áa]\s+damaged\b/gi,
    traduccion: "The staircase is damaged"
  },
  {
    patron: /\bel\s+balcón\s+est[áa]\s+dirty\b/gi,
    traduccion: "The balcony is dirty"
  },
  {
    patron: /\bla\s+chimenea\s+needs\s+cleaning\b/gi,
    traduccion: "The fireplace needs cleaning"
  },
  {
    patron: /\bel\s+air\s+conditioning\s+no\s+funciona\b/gi,
    traduccion: "The air conditioning does not work"
  },
  {
    patron: /\bla\s+calefacción\s+no\s+funciona\b/gi,
    traduccion: "The heating does not work"
  },
  {
    patron: /\bel\s+aire\s+acondicionado\s+no\s+funciona\b/gi,
    traduccion: "The air conditioning does not work"
  },
  {
    patron: /\bla\s+persiana\s+no\s+sube\b/gi,
    traduccion: "The blind does not go up"
  },
  {
    patron: /\bla\s+persiana\s+no\s+baja\b/gi,
    traduccion: "The blind does not go down"
  },
  {
    patron: /\bla\s+barandilla\s+est[áa]\s+loose\b/gi,
    traduccion: "The handrail is loose"
  },
  {
    patron: /\bel\s+handrail\s+est[áa]\s+suelto\b/gi,
    traduccion: "The handrail is loose"
  }
];

// ============================================================
// 12.1. VARIANTES CON TILDE Y FRASES MIXTAS ADICIONALES
// ============================================================

const REGLAS_VARIANTES_MIXTAS_CG = [
  { patron: /\bla\s+cocina\s+est[áa]\s+dirty\b/gi, traduccion: "The kitchen is dirty" },
  { patron: /\bla\s+cocina\s+est[áa]\s+clean\b/gi, traduccion: "The kitchen is clean" },
  { patron: /\bkitchen\s+est[áa]\s+sucia\b/gi, traduccion: "The kitchen is dirty" },
  { patron: /\bkitchen\s+est[áa]\s+limpia\b/gi, traduccion: "The kitchen is clean" },
  { patron: /\bel\s+baño\s+est[áa]\s+dirty\b/gi, traduccion: "The bathroom is dirty" },
  { patron: /\bel\s+baño\s+est[áa]\s+clean\b/gi, traduccion: "The bathroom is clean" },
  { patron: /\bbathroom\s+est[áa]\s+sucio\b/gi, traduccion: "The bathroom is dirty" },
  { patron: /\bbathroom\s+est[áa]\s+limpio\b/gi, traduccion: "The bathroom is clean" },
  { patron: /\bla\s+habitación\s+est[áa]\s+dirty\b/gi, traduccion: "The bedroom is dirty" },
  { patron: /\bla\s+habitación\s+est[áa]\s+clean\b/gi, traduccion: "The bedroom is clean" },
  { patron: /\bbedroom\s+est[áa]\s+sucia\b/gi, traduccion: "The bedroom is dirty" },
  { patron: /\bel\s+salón\s+est[áa]\s+dirty\b/gi, traduccion: "The living room is dirty" },
  { patron: /\bel\s+salón\s+est[áa]\s+clean\b/gi, traduccion: "The living room is clean" },
  { patron: /\bliving\s+room\s+est[áa]\s+sucio\b/gi, traduccion: "The living room is dirty" },
  { patron: /\bel\s+jardín\s+est[áa]\s+dirty\b/gi, traduccion: "The garden is dirty" },
  { patron: /\bgarden\s+est[áa]\s+descuidado\b/gi, traduccion: "The garden is neglected" },
  { patron: /\bla\s+piscina\s+est[áa]\s+dirty\b/gi, traduccion: "The pool is dirty" },
  { patron: /\bpool\s+est[áa]\s+sucia\b/gi, traduccion: "The pool is dirty" },
  { patron: /\bla\s+puerta\s+est[áa]\s+open\b/gi, traduccion: "The door is open" },
  { patron: /\bla\s+puerta\s+est[áa]\s+closed\b/gi, traduccion: "The door is closed" },
  { patron: /\bdoor\s+est[áa]\s+abierta\b/gi, traduccion: "The door is open" },
  { patron: /\bdoor\s+est[áa]\s+cerrada\b/gi, traduccion: "The door is closed" },
  { patron: /\bla\s+ventana\s+est[áa]\s+open\b/gi, traduccion: "The window is open" },
  { patron: /\bla\s+ventana\s+est[áa]\s+closed\b/gi, traduccion: "The window is closed" },
  { patron: /\bwindow\s+est[áa]\s+abierta\b/gi, traduccion: "The window is open" },
  { patron: /\bla\s+llave\s+de\s+paso\s+est[áa]\s+closed\b/gi, traduccion: "The shut-off valve is closed" },
  { patron: /\bla\s+llave\s+de\s+paso\s+est[áa]\s+open\b/gi, traduccion: "The shut-off valve is open" },
  { patron: /\bshut-off\s+valve\s+est[áa]\s+cerrada\b/gi, traduccion: "The shut-off valve is closed" },
  { patron: /\bel\s+grifo\s+est[áa]\s+dripping\b/gi, traduccion: "The tap is dripping" },
  { patron: /\btap\s+est[áa]\s+goteando\b/gi, traduccion: "The tap is dripping" },
  { patron: /\bla\s+tubería\s+est[áa]\s+leaking\b/gi, traduccion: "The pipe is leaking" },
  { patron: /\bpipe\s+est[áa]\s+goteando\b/gi, traduccion: "The pipe is leaking" },
  { patron: /\bel\s+desagüe\s+est[áa]\s+blocked\b/gi, traduccion: "The drain is blocked" },
  { patron: /\bdrain\s+est[áa]\s+atascado\b/gi, traduccion: "The drain is blocked" },
  { patron: /\bla\s+pared\s+est[áa]\s+damp\b/gi, traduccion: "The wall is damp" },
  { patron: /\bwall\s+est[áa]\s+con\s+humedad\b/gi, traduccion: "The wall is damp" },
  { patron: /\bel\s+techo\s+est[áa]\s+damp\b/gi, traduccion: "The ceiling is damp" },
  { patron: /\bceiling\s+est[áa]\s+con\s+humedad\b/gi, traduccion: "The ceiling is damp" },
  { patron: /\bla\s+pared\s+est[áa]\s+cracked\b/gi, traduccion: "The wall is cracked" },
  { patron: /\bel\s+suelo\s+est[áa]\s+wet\b/gi, traduccion: "The floor is wet" },
  { patron: /\bfloor\s+est[áa]\s+mojado\b/gi, traduccion: "The floor is wet" },
  { patron: /\bla\s+property\s+est[áa]\s+empty\b/gi, traduccion: "The property is empty" },
  { patron: /\bla\s+property\s+est[áa]\s+occupied\b/gi, traduccion: "The property is occupied" },
  { patron: /\bproperty\s+est[áa]\s+vacía\b/gi, traduccion: "The property is empty" },
  { patron: /\bel\s+aire\s+acondicionado\s+est[áa]\s+broken\b/gi, traduccion: "The air conditioning is broken" },
  { patron: /\bla\s+calefacción\s+est[áa]\s+off\b/gi, traduccion: "The heating is off" },
  { patron: /\bla\s+calefacción\s+est[áa]\s+on\b/gi, traduccion: "The heating is on" },
  { patron: /\bla\s+bombilla\s+est[áa]\s+fundida\b/gi, traduccion: "The light bulb is burnt out" },
  { patron: /\bel\s+enchufe\s+est[áa]\s+roto\b/gi, traduccion: "The socket is broken" },
  { patron: /\bel\s+interruptor\s+est[áa]\s+roto\b/gi, traduccion: "The switch is broken" },
  { patron: /\bno\s+hay\s+daños\s+visibles\b/gi, traduccion: "There is no visible damage" },
  { patron: /\bno\s+hay\s+fugas\s+visibles\b/gi, traduccion: "There are no visible leaks" },
  { patron: /\bno\s+se\s+aprecian\s+daños\b/gi, traduccion: "No damage is apparent" },
  { patron: /\bno\s+se\s+aprecian\s+fugas\b/gi, traduccion: "No leaks are apparent" },
  { patron: /\bse\s+observa\s+una\s+pequeña\s+grieta\b/gi, traduccion: "A small crack is visible" },
  { patron: /\bse\s+observan\s+varias\s+grietas\b/gi, traduccion: "Several cracks are visible" },
  { patron: /\bnecesita\s+ser\s+revisado\b/gi, traduccion: "Needs to be inspected" },
  { patron: /\bnecesita\s+ser\s+revisada\b/gi, traduccion: "Needs to be inspected" },
  { patron: /\brequiere\s+una\s+revisión\b/gi, traduccion: "Requires inspection" },
  { patron: /\brequiere\s+reparación\b/gi, traduccion: "Requires repair" },
  { patron: /\bse\s+encuentra\s+limpio\b/gi, traduccion: "Is clean" },
  { patron: /\bse\s+encuentra\s+limpia\b/gi, traduccion: "Is clean" },
  { patron: /\bse\s+encuentra\s+cerrado\b/gi, traduccion: "Is closed" },
  { patron: /\bse\s+encuentra\s+cerrada\b/gi, traduccion: "Is closed" },
  { patron: /\bse\s+encuentra\s+abierto\b/gi, traduccion: "Is open" },
  { patron: /\bse\s+encuentra\s+abierta\b/gi, traduccion: "Is open" }
];

// ============================================================
// 13. ORDEN DE EJECUCIÓN
// ============================================================

/*
 * Las reglas más específicas se ejecutan primero.
 * La tabla conservadora se ejecuta antes y después del traductor principal:
 * la primera pasada reconoce mezclas originales y la segunda puede resolver
 * fragmentos que hayan quedado tras la traducción general. Las reglas son
 * equivalencias explícitas; no deben inferir averías, causas ni reparaciones.
 * No se aplican sustituciones generales como:
 *
 *   "de la" -> "of the"
 *   "en la" -> "in the"
 *   "no funciona" -> "does not work"
 *
 * Esas sustituciones aisladas pueden cambiar el sentido
 * o dejar frases gramaticalmente incorrectas.
 */

const TODAS_LAS_REGLAS_AVANZADAS_CG = [
  ...REGLAS_COCINA_MOBILIARIO_CG,
  ...REGLAS_BANOS_CG,
  ...REGLAS_PUERTAS_VENTANAS_CG,
  ...REGLAS_FONTANERIA_CG,
  ...REGLAS_HUMEDAD_CG,
  ...REGLAS_ELECTRICIDAD_CG,
  ...REGLAS_EXTERIORES_CG,
  ...REGLAS_PLAGAS_LIMPIEZA_CG,
  ...REGLAS_ACABADOS_CG,
  ...REGLAS_ESTADO_CG,
  ...REGLAS_MIXTAS_ADICIONALES_CG,
  ...REGLAS_VARIANTES_MIXTAS_CG
];

// ============================================================
// 14. PRIMERA FASE: ANTES DEL TRADUCTOR PRINCIPAL
// ============================================================

function prepararObservacionMixtaCG(texto) {
  if (!textoValidoCG(texto)) {
    return texto ?? "";
  }

  return aplicarReglasAvanzadasCG(
    texto,
    TODAS_LAS_REGLAS_AVANZADAS_CG
  );
}

// ============================================================
// 15. SEGUNDA FASE: DESPUÉS DEL TRADUCTOR PRINCIPAL
// ============================================================

function mejorarTraduccionObservacionCG(texto) {
  if (!textoValidoCG(texto)) {
    return texto ?? "";
  }

  return aplicarReglasAvanzadasCG(
    texto,
    TODAS_LAS_REGLAS_AVANZADAS_CG
  );
}

// ============================================================
// 16. FUNCIÓN PÚBLICA DEL MÓDULO
// ============================================================

function traducirObservacionAvanzadaCG(texto) {
  const preparado = prepararObservacionMixtaCG(texto);

  return mejorarTraduccionObservacionCG(preparado);
}

// ============================================================
// 17. EXPORTACIONES
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
