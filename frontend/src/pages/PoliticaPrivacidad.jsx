import React from 'react';
import './LegalPages.css';

const PoliticaPrivacidad = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <h1>Política de Privacidad</h1>
          <p className="legal-date">Última actualización: 17 de octubre de 2025</p>
        </header>

        <div className="legal-content">
          <section className="legal-section">
            <h2>1. Información que Recopilamos</h2>
            <p>
              En Finques Trimar, recopilamos información personal que usted nos proporciona directamente cuando:
            </p>
            <ul>
              <li>Se registra en nuestro sitio web</li>
              <li>Solicita información sobre una propiedad</li>
              <li>Se pone en contacto con nosotros a través de formularios</li>
              <li>Se suscribe a nuestro boletín de noticias</li>
              <li>Publica una propiedad en venta o alquiler</li>
            </ul>
            <p>
              Los datos que podemos recopilar incluyen: nombre, apellidos, dirección de correo electrónico, 
              número de teléfono, dirección postal, información sobre propiedades, y cualquier otra información 
              que decida proporcionarnos.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Uso de la Información</h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul>
              <li>Proporcionar, operar y mantener nuestros servicios</li>
              <li>Mejorar, personalizar y expandir nuestros servicios</li>
              <li>Entender y analizar cómo utiliza nuestros servicios</li>
              <li>Comunicarnos con usted para servicio al cliente, actualizaciones y promociones</li>
              <li>Procesar sus solicitudes y transacciones</li>
              <li>Enviarle correos electrónicos sobre propiedades que puedan interesarle</li>
              <li>Detectar, prevenir y abordar problemas técnicos o de seguridad</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Base Legal para el Tratamiento</h2>
            <p>
              Procesamos sus datos personales bajo las siguientes bases legales conforme al RGPD:
            </p>
            <ul>
              <li><strong>Consentimiento:</strong> Cuando usted nos ha dado su consentimiento explícito para procesar sus datos</li>
              <li><strong>Ejecución de contrato:</strong> Cuando el procesamiento es necesario para cumplir con un contrato</li>
              <li><strong>Interés legítimo:</strong> Para nuestros intereses comerciales legítimos, siempre que no prevalezcan sus derechos</li>
              <li><strong>Obligación legal:</strong> Cuando debemos cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Compartir Información</h2>
            <p>
              No vendemos, intercambiamos ni transferimos su información personal a terceros sin su consentimiento, 
              excepto en los siguientes casos:
            </p>
            <ul>
              <li>Proveedores de servicios que nos ayudan a operar nuestro sitio web y negocio</li>
              <li>Cuando sea requerido por ley o para proteger nuestros derechos</li>
              <li>En caso de fusión, venta o transferencia de activos empresariales</li>
            </ul>
            <p>
              Todos los terceros que tienen acceso a su información están obligados a mantener la confidencialidad 
              y no pueden utilizarla para ningún otro propósito.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Seguridad de los Datos</h2>
            <p>
              Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información 
              personal contra acceso no autorizado, alteración, divulgación o destrucción. Estas medidas incluyen:
            </p>
            <ul>
              <li>Encriptación SSL/TLS para la transmisión de datos</li>
              <li>Almacenamiento seguro de contraseñas mediante hash</li>
              <li>Acceso restringido a datos personales solo a empleados autorizados</li>
              <li>Auditorías de seguridad regulares</li>
              <li>Copias de seguridad periódicas</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Sus Derechos</h2>
            <p>
              De acuerdo con el RGPD, usted tiene los siguientes derechos respecto a sus datos personales:
            </p>
            <ul>
              <li><strong>Derecho de acceso:</strong> Puede solicitar una copia de sus datos personales</li>
              <li><strong>Derecho de rectificación:</strong> Puede solicitar que corrijamos datos inexactos o incompletos</li>
              <li><strong>Derecho de supresión:</strong> Puede solicitar que eliminemos sus datos personales</li>
              <li><strong>Derecho de limitación:</strong> Puede solicitar que limitemos el procesamiento de sus datos</li>
              <li><strong>Derecho de portabilidad:</strong> Puede solicitar recibir sus datos en un formato estructurado</li>
              <li><strong>Derecho de oposición:</strong> Puede oponerse al procesamiento de sus datos</li>
              <li><strong>Derecho a retirar el consentimiento:</strong> Puede retirar su consentimiento en cualquier momento</li>
            </ul>
            <p>
              Para ejercer cualquiera de estos derechos, contáctenos en: 
              <a href="mailto:info@fincastrimar.com"> info@fincastrimar.com</a>
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Retención de Datos</h2>
            <p>
              Conservaremos sus datos personales solo durante el tiempo necesario para cumplir con los propósitos 
              descritos en esta política, a menos que la ley requiera o permita un período de retención más largo. 
              Los criterios utilizados para determinar nuestros períodos de retención incluyen:
            </p>
            <ul>
              <li>La duración de nuestra relación comercial con usted</li>
              <li>Si existe una obligación legal a la que estamos sujetos</li>
              <li>Si la retención es aconsejable en función de nuestra posición legal</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Cookies y Tecnologías Similares</h2>
            <p>
              Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestro sitio web. 
              Para obtener más información sobre cómo usamos las cookies, consulte nuestra 
              <a href="/cookies"> Política de Cookies</a>.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Enlaces a Terceros</h2>
            <p>
              Nuestro sitio web puede contener enlaces a sitios de terceros. No somos responsables de las 
              prácticas de privacidad o el contenido de estos sitios. Le recomendamos que revise las políticas 
              de privacidad de cualquier sitio de terceros que visite.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Cambios a Esta Política</h2>
            <p>
              Nos reservamos el derecho de actualizar esta Política de Privacidad en cualquier momento. 
              Le notificaremos sobre cualquier cambio publicando la nueva política en esta página y 
              actualizando la fecha de "Última actualización". Le recomendamos que revise periódicamente 
              esta política para estar informado sobre cómo protegemos su información.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Contacto</h2>
            <p>
              Si tiene preguntas o inquietudes sobre esta Política de Privacidad o sobre el tratamiento 
              de sus datos personales, puede contactarnos:
            </p>
            <div className="contact-info">
              <p><strong>Finques Trimar</strong></p>
              <p>Email: <a href="mailto:finquestrimar@gmail.com">finquestrimar@gmail.com</a></p>
              <p>Teléfono: <a href="tel:+34615840273">615 84 02 73</a></p>
              <p>Dirección: Igualada, Barcelona, España</p>
            </div>
            <p>
              También puede presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD) 
              si considera que el tratamiento de sus datos personales vulnera la normativa vigente.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PoliticaPrivacidad;
