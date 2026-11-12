/**
 * Datos de contacto de la agencia, en un único sitio para la web pública.
 */
export const CONTACT = {
  phoneDisplay: '615 84 02 73',
  phoneHref: 'tel:+34615840273',
  whatsappHref: 'https://wa.me/34615840273',
  email: 'finquestrimar@gmail.com',
  location: 'Igualada, Barcelona',
};

/** Enlace de WhatsApp con un mensaje ya escrito. */
export const whatsappLink = (text) =>
  text ? `${CONTACT.whatsappHref}?text=${encodeURIComponent(text)}` : CONTACT.whatsappHref;
