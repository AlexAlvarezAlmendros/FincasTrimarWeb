import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

/**
 * Servicio de email con Nodemailer y Gmail OAuth2
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    
    this.config = {
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      senderEmail: process.env.GMAIL_SENDER_EMAIL,
      senderName: process.env.GMAIL_SENDER_NAME || 'Inmobiliaria Fincas Trimar'
    };
    
    this.initialize();
  }

  /**
   * Inicializar transportador de Nodemailer
   */
  initialize() {
    try {
      const { clientId, clientSecret, refreshToken, senderEmail } = this.config;
      
      if (!clientId || !clientSecret || !refreshToken || !senderEmail) {
        logger.warn('⚠️  Configuración de Gmail incompleta - servicio de email deshabilitado');
        logger.warn('Variables requeridas: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_SENDER_EMAIL');
        return;
      }

      this.transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: senderEmail,
          clientId: clientId,
          clientSecret: clientSecret,
          refreshToken: refreshToken,
          accessToken: undefined // Se genera automáticamente
        }
      });

      this.isConfigured = true;
      logger.info('✅ Servicio de email configurado correctamente');
      
    } catch (error) {
      logger.error('❌ Error configurando servicio de email:', error);
      this.isConfigured = false;
    }
  }

  /**
   * Verificar configuración
   */
  async verifyConnection() {
    if (!this.isConfigured || !this.transporter) {
      throw new Error('Servicio de email no configurado');
    }

    try {
      await this.transporter.verify();
      logger.info('✅ Conexión de email verificada');
      return true;
    } catch (error) {
      logger.error('❌ Error verificando conexión de email:', error);
      throw error;
    }
  }

  /**
   * Generar HTML para email de contacto
   */
  generateContactEmailHTML({ vivienda, mensaje }) {
    const {
      nombre,
      email,
      telefono,
      asunto,
      descripcion
    } = mensaje;

    const propertyInfo = vivienda ? `
      <div style="background-color: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3A8DFF;">
        <h3 style="color: #3A8DFF; margin: 0 0 15px 0;">📍 Propiedad de Interés</h3>
        <p><strong>Nombre:</strong> ${vivienda.name}</p>
        <p><strong>Precio:</strong> ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(vivienda.price)}</p>
        <p><strong>Ubicación:</strong> ${vivienda.calle} ${vivienda.numero}, ${vivienda.poblacion} (${vivienda.provincia})</p>
        <p><strong>Características:</strong> ${vivienda.rooms} hab. • ${vivienda.bathRooms} baños • ${vivienda.squaredMeters} m² • ${vivienda.garage} garajes</p>
      </div>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuevo Contacto - ${this.config.senderName}</title>
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3A8DFF; margin: 0; font-size: 28px;">🏠 ${this.config.senderName}</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Nuevo mensaje de contacto</p>
          </div>

          <div style="background-color: #fff; border: 1px solid #e1e5e9; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            
            <div style="background-color: #3A8DFF; color: white; padding: 20px;">
              <h2 style="margin: 0; font-size: 20px;">📧 ${asunto || 'Consulta General'}</h2>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Recibido el ${new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

            <div style="padding: 25px;">
              
              <div style="margin-bottom: 25px;">
                <h3 style="color: #3A8DFF; margin: 0 0 15px 0; font-size: 18px;">👤 Datos de Contacto</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 100px;">Nombre:</td>
                    <td style="padding: 8px 0;">${nombre}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                    <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #3A8DFF; text-decoration: none;">${email}</a></td>
                  </tr>
                  ${telefono ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold;">Teléfono:</td>
                    <td style="padding: 8px 0;"><a href="tel:${telefono}" style="color: #3A8DFF; text-decoration: none;">${telefono}</a></td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              ${propertyInfo}

              <div style="margin-top: 25px;">
                <h3 style="color: #3A8DFF; margin: 0 0 15px 0; font-size: 18px;">💬 Mensaje</h3>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; border-left: 4px solid #28a745;">
                  <p style="margin: 0; white-space: pre-wrap;">${descripcion}</p>
                </div>
              </div>

              <div style="margin-top: 30px; padding: 20px; background-color: #f1f3f5; border-radius: 6px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #666;">
                  💡 <strong>Responde rápidamente</strong> para brindar el mejor servicio al cliente
                </p>
              </div>

            </div>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #e1e5e9;">
            <p style="margin: 0;">Este email fue generado automáticamente por el sistema de contacto web</p>
            <p style="margin: 5px 0 0 0;">${this.config.senderName} • Gestión Inmobiliaria</p>
          </div>

        </body>
      </html>
    `;
  }

  /**
   * Generar texto plano como alternativa
   */
  generateContactEmailText({ vivienda, mensaje }) {
    const {
      nombre,
      email,
      telefono,
      asunto,
      descripcion
    } = mensaje;

    let text = `NUEVO CONTACTO - ${this.config.senderName}\n\n`;
    text += `Asunto: ${asunto || 'Consulta General'}\n`;
    text += `Fecha: ${new Date().toLocaleDateString('es-ES')}\n\n`;
    
    text += `DATOS DE CONTACTO:\n`;
    text += `Nombre: ${nombre}\n`;
    text += `Email: ${email}\n`;
    if (telefono) text += `Teléfono: ${telefono}\n`;
    
    if (vivienda) {
      text += `\nPROPIEDAD DE INTERÉS:\n`;
      text += `Nombre: ${vivienda.name}\n`;
      text += `Precio: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(vivienda.price)}\n`;
      text += `Ubicación: ${vivienda.calle} ${vivienda.numero}, ${vivienda.poblacion} (${vivienda.provincia})\n`;
      text += `Características: ${vivienda.rooms} hab. • ${vivienda.bathRooms} baños • ${vivienda.squaredMeters} m² • ${vivienda.garage} garajes\n`;
    }
    
    text += `\nMENSAJE:\n${descripcion}\n\n`;
    text += `---\n`;
    text += `Email generado automáticamente por el sistema web\n`;
    
    return text;
  }

  /**
   * Enviar email de contacto
   */
  async sendContactEmail(emailData) {
    try {
      if (!this.isConfigured) {
        logger.warn('⚠️  Servicio de email no configurado, simulando envío');
        return { 
          success: true, 
          messageId: 'simulated-' + Date.now(),
          simulated: true 
        };
      }

      const { vivienda, mensaje, recipientEmail } = emailData;
      
      // Email destinatario (por defecto el configurado, o parámetro específico)
      const toEmail = recipientEmail || this.config.senderEmail;
      
      // Generar contenido
      const html = this.generateContactEmailHTML({ vivienda, mensaje });
      const text = this.generateContactEmailText({ vivienda, mensaje });
      
      // Configurar email
      const mailOptions = {
        from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
        to: toEmail,
        replyTo: mensaje.email, // Responder directamente al cliente
        subject: `🏠 Nuevo contacto: ${mensaje.asunto || 'Consulta General'}`,
        text: text,
        html: html,
        headers: {
          'X-Mailer': 'Inmobiliaria-API',
          'X-Contact-Type': vivienda ? 'property-inquiry' : 'general-contact'
        }
      };

      // Enviar email
      logger.info(`📧 Enviando email de contacto a ${toEmail}...`);
      const info = await this.transporter.sendMail(mailOptions);

      logger.info(`✅ Email enviado exitosamente: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
        sentTo: toEmail,
        replyTo: mensaje.email
      };

    } catch (error) {
      logger.error('❌ Error enviando email:', error);
      throw error;
    }
  }

  /**
   * Enviar email de notificación administrativa
   */
  async sendNotification({ subject, message, type = 'info', recipientEmail }) {
    try {
      if (!this.isConfigured) {
        logger.warn('⚠️  Servicio de email no configurado, simulando notificación');
        return { success: true, simulated: true };
      }

      const toEmail = recipientEmail || this.config.senderEmail;
      
      const mailOptions = {
        from: `"${this.config.senderName}" <${this.config.senderEmail}>`,
        to: toEmail,
        subject: `[${type.toUpperCase()}] ${subject}`,
        text: message,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3A8DFF;">${subject}</h2>
            <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
              <p style="white-space: pre-wrap;">${message}</p>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              ${this.config.senderName} - Sistema Automático
            </p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info(`✅ Notificación enviada: ${info.messageId}`);
      return { success: true, messageId: info.messageId };

    } catch (error) {
      logger.error('❌ Error enviando notificación:', error);
      throw error;
    }
  }
}

// Instancia singleton
const emailService = new EmailService();

export default emailService;
export { EmailService };