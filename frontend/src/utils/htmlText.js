/**
 * Utilidades para medir el texto de un fragmento HTML (descripciones de Quill).
 * No dependen del DOM: se usan igual en el navegador (contador del editor)
 * que en node (validación compartida y pruebas), así el contador y la
 * validación miden exactamente lo mismo.
 */

// Entidades con nombre habituales en el HTML que genera Quill
const NAMED_ENTITIES = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

/**
 * Extrae el texto plano de un fragmento HTML: quita las etiquetas y decodifica
 * las entidades (cada entidad cuenta como un carácter, como en textContent).
 */
export const htmlToPlainText = (html) => {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (match, code) => {
      if (code[0] === '#') {
        const isHex = code[1] === 'x' || code[1] === 'X';
        const codePoint = parseInt(code.slice(isHex ? 2 : 1), isHex ? 16 : 10);
        try {
          return String.fromCodePoint(codePoint);
        } catch {
          return match;
        }
      }
      // Entidad con nombre poco común: cuenta como un carácter
      return NAMED_ENTITIES[code.toLowerCase()] ?? ' ';
    });
};

/**
 * true si el HTML no tiene texto visible (p. ej. el '<p><br></p>' que deja
 * Quill al vaciar el editor).
 */
export const isRichTextEmpty = (html) => htmlToPlainText(html).trim() === '';

// Alias histórico (contador de la descripción)
export const getPlainTextFromHtml = htmlToPlainText;

export default getPlainTextFromHtml;
