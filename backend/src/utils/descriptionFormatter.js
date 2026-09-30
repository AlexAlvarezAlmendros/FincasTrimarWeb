/**
 * Formateo de las descripciones de inmuebles que llegan como texto plano
 * (import JSON del scraper de la agencia) a HTML legible y editable.
 *
 * El HTML de salida solo usa lo que admite el editor del panel (Quill: p,
 * strong, em, ul/li), para que la vivienda se pueda seguir editando sin perder
 * el formato, y que SafeHtmlRenderer pinta tal cual en la ficha.
 *
 * El scraper mandaba el texto sin saltos de línea y con las frases pegadas
 * ("…EN CAPELLADES!¿Buscas…", "vivienda3 habitaciones2 baños"). Cuando el texto
 * no trae ningún salto de línea, se reconstruyen por heurística.
 */

const MAY = 'A-ZÁÉÍÓÚÜÑÀÈÌÒÙÇÏ';
const MIN = 'a-záéíóúüñàèìòùçï';

// Texto de los botones del portal que el scraper capturaba con la descripción
const BOTONES_PORTAL = [
  'Leer comentario completo',
  'Ver comentario completo',
  'Leer descripción completa',
  'Ver descripción completa',
  'Ver descripción en el idioma original',
  'Ver traducción',
  'Leer más',
  'Ver más'
];

// Palabras que, seguidas de punto, no cierran frase
const ABREVIATURAS = new Set([
  'sr', 'sra', 'srta', 'dr', 'dra', 'av', 'avda', 'ctra', 'pl', 'pza', 'urb',
  'núm', 'num', 'nº', 'aprox', 'tel', 'telf', 'pág', 'ed', 'esc', 'pta'
]);

// Unidades que van pegadas a un número sin ser texto pegado ("10cm2", "5kw3")
const UNIDADES = new Set(['cm', 'mm', 'km', 'dm', 'hm', 'kw', 'kwh', 'mt', 'mts', 'ml', 'cv']);

// Viñetas tipográficas al principio de línea
const RE_VINETA = /^(?:[-•·▪►▸‣◦➤➢→*+–—✓])\s+(.+)$/u;
const RE_NUMERADA = /^\d{1,2}[.)]\s+/u;
const RE_SEPARADOR = /(?:_{3,}|={3,}|~{3,}|[-–—]{3,}|\*{3,}|[•·]{3,})/gu;
const RE_EMOJI_INICIAL = /^\p{Extended_Pictographic}/u;

const LARGO_PARRAFO = 450;   // a partir de aquí se parte el párrafo por frases
const OBJETIVO_PARRAFO = 300;
const MAX_TITULO = 120;
const MAX_SUBTITULO = 60;
const MAX_ELEMENTO_LISTA = 80;
const MAX_PUENTE = 160;

// Línea que se corta en una preposición o artículo: introduce lo que sigue
const RE_CONECTOR_FINAL = /(?:^|\s)(?:de|del|con|y|e|o|u|a|al|en|para|por|la|el|los|las|un|una|que|como|entre)$/iu;

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const RE_BOTON_FINAL = new RegExp(`(?:${BOTONES_PORTAL.map(escapeRegExp).join('|')})\\s*$`, 'iu');
const RE_BOTON_LINEA = new RegExp(`^(?:${BOTONES_PORTAL.map(escapeRegExp).join('|')})$`, 'iu');

function escapeHtml(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Normaliza espacios y saltos de línea: una línea por párrafo, sin espacios
 * repetidos, como mucho una línea en blanco seguida.
 */
function normalizeWhitespace(texto) {
  return texto
    .replace(/\r\n?|[\u2028\u2029]/g, '\n')
    .replace(/[\u00A0\u2007\u202F\t\f\v]/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .split('\n')
    .map(linea => linea.replace(/ {2,}/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function removePortalButtons(texto) {
  let actual = texto;
  let anterior;
  do {
    anterior = actual;
    actual = actual.replace(RE_BOTON_FINAL, '').trimEnd();
  } while (actual !== anterior);
  return actual
    .split('\n')
    .filter(linea => !RE_BOTON_LINEA.test(linea.trim()))
    .join('\n');
}

/**
 * ¿La "palabra" que precede a un punto/dos puntos cierra una frase? Evita partir
 * abreviaturas ("Avda.Barcelona", "S.A.") y sí parte "localidad.Una" o "2008.Para".
 */
function endsSentence(palabra) {
  if (!palabra) return false;
  if (/[\d)»"”’%€²³*]$/u.test(palabra)) return true;
  const letras = palabra.replace(/[^\p{L}]/gu, '');
  return letras.length >= 2 && !ABREVIATURAS.has(letras.toLowerCase());
}

/**
 * ¿Los asteriscos que siguen a `offset` cierran un énfasis abierto antes? Así
 * el salto de línea se pone detrás de "**" de cierre y delante del de apertura.
 */
function isClosingMarker(str, offset, asteriscos) {
  if (!asteriscos) return true;
  const previos = str.slice(0, offset);
  const abiertos = asteriscos.length === 2
    ? (previos.match(/\*\*/g) || []).length
    : (previos.replace(/\*\*/g, '').match(/\*/g) || []).length;
  return abiertos % 2 === 1;
}

function breakAfter(previo, asteriscos, offset, str) {
  return isClosingMarker(str, offset + previo.length, asteriscos)
    ? `${previo}${asteriscos}\n`
    : `${previo}\n${asteriscos}`;
}

/**
 * Reconstruye los saltos de línea de un texto al que se le quitaron: inserta
 * un salto donde dos frases o dos líneas quedaron pegadas sin espacio.
 * Solo se aplica a textos sin ningún salto de línea.
 */
function repairGluedText(texto) {
  let t = texto;

  // Separadores tipo "________" entre secciones
  t = t.replace(RE_SEPARADOR, '\n\n');

  // "localidad.Una", "CAPELLADES!¿Buscas", "Descripción:Descubre",
  // "hogar!2. Versión", "dispone de:3 habitaciones", "independiente.1 baño"
  t = t.replace(
    new RegExp(`([.!?…:;])(\\*{0,2})(?=([¿¡«"“]?[${MAY}])|\\d)`, 'gu'),
    (m, signo, asteriscos, mayuscula, offset, str) => {
      if (signo === '.' || signo === ':' || signo === ';') {
        const antes = str.slice(Math.max(0, offset - 20), offset);
        const palabra = (antes.match(/[\p{L}\d²³)»"”’%€*]+$/u) || [''])[0];
        if (!endsSentence(palabra)) return m;
        // Ante un número, solo tras una palabra: no "10.000" ni "10:30"
        if (!mayuscula && !/\p{L}\**$/u.test(palabra)) return m;
      }
      return breakAfter(signo, asteriscos, offset, str);
    }
  );

  // "Vilanova del Camí¿Buscas", "Claramunt¡Disfruta"
  t = t.replace(/([^\s¿¡(«"“'‘\-–—/*])([¿¡])/gu, '$1\n$2');

  // "privadaBalcón", "dispone deGaraje", "Girona*En"
  t = t.replace(
    new RegExp(`([${MIN}]{2})(\\*{0,2})(?=[¿¡]?[${MAY}])`, 'gu'),
    (m, letras, asteriscos, offset, str) => breakAfter(letras, asteriscos, offset, str)
  );

  // "vivienda3 habitaciones", "Balcón3ª planta" (no "90m2" ni "10cm2")
  t = t.replace(new RegExp(`([${MAY}${MIN}]+)(?=\\d)`, 'gu'), (palabra) => {
    if (!new RegExp(`[${MIN}]{2}$`, 'u').test(palabra)) return palabra;
    if (UNIDADES.has(palabra.toLowerCase())) return palabra;
    return `${palabra}\n`;
  });

  // "para 3Terraza privada", "de 2008Para entrar" (no "3ºA", "2B", "4K")
  t = t.replace(new RegExp(`(\\d)(?=[${MAY}][${MIN}]{2})`, 'gu'), '$1\n');

  // "45.000 €Alquiler", "m²Terraza", "(ÒDENA)Se vende", "reformada)3 habitaciones"
  t = t.replace(
    new RegExp(`([€%²³)\\]»”])(\\*{0,2})(?=[¿¡]?[${MAY}]|\\d)`, 'gu'),
    (m, signo, asteriscos, offset, str) => breakAfter(signo, asteriscos, offset, str)
  );

  // Énfasis que se cierra pegado a la línea siguiente: "**Calidades: **Calefacción"
  t = t.replace(/(\*{1,2})(?=[¿¡«"“]?[\p{L}\d])/gu,
    (m, asteriscos, offset, str) => (isClosingMarker(str, offset, asteriscos) ? `${m}\n` : m));

  // "DISFRUTARUno", "INCLUIDOEl" (no plurales de siglas: "DNIs")
  t = t.replace(
    new RegExp(`([${MAY}]{2,})([${MAY}])([${MIN}]+)`, 'gu'),
    (m, siglas, inicial, resto) => (resto === 's' ? m : `${siglas}\n${inicial}${resto}`)
  );

  return t;
}

/**
 * Deja el texto listo para maquetar: normaliza espacios, quita los botones del
 * portal, corrige la puntuación y repara el texto pegado.
 */
function prepareText(raw) {
  if (raw === null || raw === undefined) return '';
  let texto = normalizeWhitespace(String(raw));
  if (!texto) return '';

  texto = removePortalButtons(texto)
    // "Igualada , ubicado" → "Igualada, ubicado"; "calidad .Dispone" → "calidad.Dispone"
    .replace(new RegExp(` +([,.;:!?…])(?=\\s|$|[¿¡«"“]?[${MAY}])`, 'gu'), '$1')
    // "vivienda,Su amplitud" → "vivienda, Su amplitud" (no "2,5")
    .replace(/,(?=[¿¡]?\p{L})/gu, ', ')
    // "amueblada ( Opcional)y con" → "amueblada (Opcional) y con"
    .replace(/\( +/g, '(')
    .replace(/ +\)/g, ')')
    .replace(/\)(?=\p{Ll})/gu, ') ');

  texto = texto.includes('\n')
    ? texto.replace(RE_SEPARADOR, '\n\n')
    : repairGluedText(texto);

  // Puntos sobrantes al final de frase: "visitarlo. .", "¡Te encantará!.", "visites. **."
  texto = texto
    .replace(/([.!?…]) *(\*{1,2}) *\.(?=\s|$)/gu, '$1$2')
    .replace(/([.!?…]) +\.(?=\s|$)/gu, '$1')
    .replace(/([!?])\.(?=\s|$)/gu, '$1')
    .replace(/(\p{L})\.\.(?=\s|$)/gu, '$1.');

  return normalizeWhitespace(texto);
}

/** Negritas y cursivas en Markdown ligero → HTML, sobre texto ya escapado */
function formatInline(texto) {
  return escapeHtml(texto)
    .replace(/\*\*(.+?)\*\*/g, (m, contenido) => (contenido.trim() ? `<strong>${contenido.trim()}</strong>` : ''))
    .replace(/__(.+?)__/g, (m, contenido) => (contenido.trim() ? `<strong>${contenido.trim()}</strong>` : ''))
    .replace(/(^|[^*\p{L}\d])\*(?!\s)([^*\n]+?)(?<!\s)\*(?!\*)/gu, '$1<em>$2</em>')
    .replace(/\*+/g, '')
    .replace(/ {2,}/g, ' ')
    .trim();
}

function stripMarkdown(texto) {
  return texto
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+•]\s+/gm, '')
    .replace(/[*_`]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function sinEnfasis(texto) {
  return texto.replace(/\*+|__/g, '').replace(/ {2,}/g, ' ').trim();
}

function isAllCaps(texto) {
  const letras = texto.replace(/[^\p{L}]/gu, '');
  if (letras.length < 6) return false;
  const mayusculas = letras.replace(new RegExp(`[^${MAY}]`, 'gu'), '').length;
  return mayusculas / letras.length >= 0.8;
}

/** Parte un párrafo largo en varios por frases completas */
function splitLongParagraph(texto) {
  if (texto.length <= LARGO_PARRAFO) return [texto];

  const frases = [];
  const re = new RegExp(`([.!?…])\\s+(?=[¿¡«"“]?[${MAY}])`, 'gu');
  let inicio = 0;
  let m;
  while ((m = re.exec(texto)) !== null) {
    const fin = m.index + 1;
    const palabra = (texto.slice(Math.max(0, m.index - 20), m.index).match(/[\p{L}\d²³)»"”’%€*]+$/u) || [''])[0];
    if (m[1] !== '.' || endsSentence(palabra)) {
      frases.push(texto.slice(inicio, fin).trim());
      inicio = re.lastIndex;
    }
  }
  frases.push(texto.slice(inicio).trim());

  const parrafos = [];
  let actual = '';
  for (const frase of frases.filter(Boolean)) {
    actual = actual ? `${actual} ${frase}` : frase;
    if (actual.length >= OBJETIVO_PARRAFO) {
      parrafos.push(actual);
      actual = '';
    }
  }
  if (actual) {
    // Un resto muy corto se queda con el párrafo anterior
    if (parrafos.length > 0 && actual.length < 80) {
      parrafos[parrafos.length - 1] += ` ${actual}`;
    } else {
      parrafos.push(actual);
    }
  }
  return parrafos;
}

/**
 * Clasifica las líneas del texto y las agrupa en bloques:
 *   - título: la primera línea si es corta y no acaba en punto (en negrita)
 *   - subtítulo: línea corta que acaba en ":", en MAYÚSCULAS, o suelta y seguida
 *     de un párrafo o una lista (en negrita)
 *   - lista: líneas con viñeta, o 3+ líneas cortas seguidas (2+ tras una
 *     introducción: "…:", "¿…?", "dispone de")
 *   - párrafo: el resto (los muy largos se parten por frases)
 */
function buildBlocks(texto) {
  const tokens = texto.split('\n').map((bruta) => {
    const linea = bruta.trim();
    if (!linea) return { tipo: 'vacia' };
    const vineta = linea.match(RE_VINETA);
    if (vineta) return { tipo: 'vineta', texto: vineta[1].trim() };
    // `plano` (sin marcadores de énfasis) es lo que se mira para clasificar
    return { tipo: 'texto', texto: linea, plano: sinEnfasis(linea) };
  });

  const esTexto = (tk) => Boolean(tk) && tk.tipo === 'texto';
  const acabaEnConector = (tk) => esTexto(tk) && RE_CONECTOR_FINAL.test(tk.plano);
  const esIntro = (tk) => Boolean(tk) && (tk.tipo === 'subtitulo'
    || (esTexto(tk) && (/[:?]$/u.test(tk.plano) || acabaEnConector(tk))));
  const esCorta = (tk) => esTexto(tk)
    && tk.plano.length <= MAX_ELEMENTO_LISTA
    && !/[,;:!?…]$/u.test(tk.plano)
    && !(tk.plano.endsWith('.') && tk.plano.length > MAX_SUBTITULO)
    && !/^[¿¡]/u.test(tk.plano)
    && !RE_NUMERADA.test(tk.plano)
    && !isAllCaps(tk.plano)
    && !acabaEnConector(tk);

  // Primera línea con contenido: título si es corta y no es una frase con punto
  const primero = tokens.findIndex(tk => tk.tipo !== 'vacia');
  if (primero >= 0 && esTexto(tokens[primero])
      && tokens[primero].plano.length <= MAX_TITULO
      && !tokens[primero].plano.endsWith('.')) {
    tokens[primero].tipo = 'titulo';
  }

  // Líneas candidatas a elemento de lista. Una frase algo más larga también lo
  // es si está entre elementos acabados en punto de una lista clara, o si abre
  // una lista justo después de su introducción ("…pensada para: / Frase. / …")
  const corta = tokens.map((tk, i) => i !== primero && esCorta(tk));
  const tramo = (i, paso) => {
    let n = 0;
    for (let k = i; k >= 0 && k < tokens.length && corta[k]; k += paso) n++;
    return n;
  };
  const conPuntoCorta = (k) => corta[k] && tokens[k].plano.endsWith('.');
  tokens.forEach((tk, i) => {
    if (corta[i] || !esTexto(tk) || !tk.plano.endsWith('.') || tk.plano.length > MAX_PUENTE) return;
    const entreElementos = conPuntoCorta(i - 1) && conPuntoCorta(i + 1)
      && (tramo(i - 1, -1) >= 3 || tramo(i + 1, 1) >= 3);
    const abreLista = esIntro(tokens[i - 1]) && conPuntoCorta(i + 1) && tramo(i + 1, 1) >= 2;
    if (entreElementos || abreLista) corta[i] = true;
  });

  const marcarLista = (desde, hasta) => {
    const largo = hasta - desde;
    if (largo >= 3 || (largo >= 2 && esIntro(tokens[desde - 1]))) {
      for (let k = desde; k < hasta; k++) tokens[k].tipo = 'elemento';
    }
  };

  for (let i = 0; i < tokens.length;) {
    if (!corta[i]) { i++; continue; }
    let j = i;
    while (j < tokens.length && corta[j]) j++;

    // Si casi todos los elementos acaban en punto, los que no son subtítulos
    // intercalados ("Distribución", "Equipamiento") y parten la lista
    const conPunto = tokens.slice(i, j).filter(tk => tk.plano.endsWith('.')).length;
    if (conPunto >= 2 && conPunto / (j - i) >= 0.6) {
      let desde = i;
      for (let k = i; k < j; k++) {
        if (!tokens[k].plano.endsWith('.') && tokens[k].plano.length <= MAX_SUBTITULO) {
          marcarLista(desde, k);
          tokens[k].tipo = 'subtitulo';
          desde = k + 1;
        }
      }
      marcarLista(desde, j);
    } else {
      marcarLista(i, j);
    }
    i = j;
  }

  // Subtítulos sueltos
  const siguienteConContenido = (i) => tokens.slice(i + 1).find(tk => tk.tipo !== 'vacia') || null;
  tokens.forEach((tk, i) => {
    if (!esTexto(tk) || tk.plano.length > MAX_SUBTITULO || acabaEnConector(tk)) return;
    const siguiente = siguienteConContenido(i);
    if (!siguiente) return;
    const abreLista = siguiente.tipo === 'elemento' || siguiente.tipo === 'vineta';
    const siguienteEsParrafo = esTexto(siguiente) && !esCorta(siguiente);
    // Suelta: no es la continuación de una serie de líneas cortas sin punto
    const previa = tokens[i - 1];
    const suelta = !/[.,;!?…]$/u.test(tk.plano) && !(esCorta(previa) && !previa.plano.endsWith('.'));

    if (tk.plano.endsWith(':')
        || isAllCaps(tk.plano)
        || (tk.plano.endsWith('?') && abreLista)
        || (suelta && (abreLista || siguienteEsParrafo))) {
      tk.tipo = 'subtitulo';
    }
  });

  // Agrupar en bloques HTML
  const bloques = [];
  let lista = null;
  const cerrarLista = () => {
    if (!lista) return;
    // Si todos los elementos empiezan por un emoji, el emoji ya hace de viñeta
    if (lista.every(el => RE_EMOJI_INICIAL.test(el))) {
      lista.forEach(el => bloques.push(`<p>${formatInline(el)}</p>`));
    } else {
      bloques.push(`<ul>${lista.map(el => `<li>${formatInline(el)}</li>`).join('')}</ul>`);
    }
    lista = null;
  };

  for (const tk of tokens) {
    if (tk.tipo === 'vineta' || tk.tipo === 'elemento') {
      (lista ||= []).push(tk.texto);
      continue;
    }
    cerrarLista();
    if (tk.tipo === 'vacia') continue;

    if (tk.tipo === 'titulo' || tk.tipo === 'subtitulo') {
      // Ya va en negrita entero: fuera los marcadores para no anidar <strong>
      const html = formatInline(tk.texto.replace(/\*\*|__/g, ''));
      if (html) bloques.push(`<p><strong>${html}</strong></p>`);
    } else {
      splitLongParagraph(tk.texto).forEach(parte => {
        const html = formatInline(parte);
        if (html) bloques.push(`<p>${html}</p>`);
      });
    }
  }
  cerrarLista();

  return bloques.join('');
}

/**
 * Formatea una descripción en texto plano (o Markdown ligero).
 * Devuelve el texto ya preparado (sirve para la descripción corta) y el HTML.
 */
export function formatDescription(raw) {
  const text = prepareText(raw);
  return { text, html: text ? buildBlocks(text) : '' };
}

/**
 * Descripción corta (máx. `maxLength`, nunca más) a partir del texto preparado:
 * la primera frase de la primera línea (unida a la segunda si la primera es un
 * título muy breve, "Chalet en Mediona. 5 hab · 2 baños · 127 m²").
 */
export function extractShortDescription(text, maxLength = 300) {
  if (!text) return '';
  const lineas = text
    .split('\n')
    .map(linea => stripMarkdown(linea))
    .filter(Boolean);
  if (lineas.length === 0) return '';

  let entrada = lineas[0];
  if (entrada.length < 40 && lineas[1]) {
    entrada = `${entrada}${/[.!?…:]$/u.test(entrada) ? '' : '.'} ${lineas[1]}`;
  }

  const primeraFrase = entrada.match(/^.{19,}?[.!?…](?=\s|$)/u);
  if (primeraFrase && primeraFrase[0].length <= maxLength) return primeraFrase[0].trim();
  if (entrada.length <= maxLength) return entrada;

  const ellipsis = '...';
  const truncated = entrada.substring(0, maxLength - ellipsis.length);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated).trimEnd() + ellipsis;
}

/**
 * Convierte el HTML guardado en la BD a texto plano con Markdown ligero
 * (negritas y cursivas), un párrafo por línea. Pensado para el HTML que
 * generan el import y el editor, no para HTML arbitrario.
 */
export function htmlToText(html) {
  if (!html) return '';
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|ul|ol|blockquote)>/gi, '\n')
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/?(strong|b)(\s[^>]*)?>/gi, '**')
    .replace(/<\/?(em|i)(\s[^>]*)?>/gi, '*')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * ¿La descripción guardada es un único bloque sin estructura? Son las que dejó
 * el import con el texto pegado; las que tienen listas o varios párrafos ya
 * tienen formato (del import o hecho a mano en el panel) y no se tocan.
 */
export function isFlatDescription(html) {
  if (!html || !String(html).trim()) return false;
  const h = String(html);
  if (/<(ul|ol|li|br|h[1-6]|blockquote)\b/i.test(h)) return false;
  return (h.match(/<p\b/gi) || []).length <= 1;
}
