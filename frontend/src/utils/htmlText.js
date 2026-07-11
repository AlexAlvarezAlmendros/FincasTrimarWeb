/**
 * Extrae el texto plano de un fragmento HTML (para contar caracteres).
 */
export const getPlainTextFromHtml = (html) => {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

export default getPlainTextFromHtml;
