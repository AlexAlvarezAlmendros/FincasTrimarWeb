import React from 'react';
import './LegalPages.css';

const Cookies = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <header className="legal-header">
          <h1>Política de Cookies</h1>
          <p className="legal-date">Última actualización: 17 de octubre de 2025</p>
        </header>

        <div className="legal-content">
          <section className="legal-section">
            <h2>¿Qué son las cookies?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo (ordenador, tablet o móvil) 
              cuando visita un sitio web. Las cookies permiten que el sitio web reconozca su dispositivo y recuerde 
              información sobre su visita, como su idioma preferido y otras configuraciones, lo que puede hacer que su 
              próxima visita sea más fácil y el sitio más útil para usted.
            </p>
          </section>

          <section className="legal-section">
            <h2>¿Cómo utilizamos las cookies?</h2>
            <p>
              En Finques Trimar utilizamos cookies para mejorar su experiencia de navegación y proporcionar 
              funcionalidades personalizadas. Las cookies nos ayudan a:
            </p>
            <ul>
              <li>Recordar sus preferencias y configuraciones</li>
              <li>Mantener su sesión activa cuando está registrado</li>
              <li>Entender cómo utiliza nuestro sitio web</li>
              <li>Mejorar el rendimiento y funcionalidad del sitio</li>
              <li>Proporcionar contenido relevante y personalizado</li>
              <li>Analizar el tráfico y comportamiento de los usuarios</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Tipos de cookies que utilizamos</h2>
            
            <div className="cookie-type">
              <h3>1. Cookies Estrictamente Necesarias</h3>
              <p>
                Estas cookies son esenciales para que pueda navegar por el sitio web y utilizar sus funciones. 
                Sin estas cookies, no podríamos proporcionar servicios básicos como el inicio de sesión seguro 
                o la gestión de su carrito de propiedades favoritas.
              </p>
              <div className="cookie-table">
                <table>
                  <thead>
                    <tr>
                      <th>Cookie</th>
                      <th>Propósito</th>
                      <th>Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>auth_token</td>
                      <td>Mantiene su sesión de usuario activa</td>
                      <td>Sesión</td>
                    </tr>
                    <tr>
                      <td>csrf_token</td>
                      <td>Protección contra ataques CSRF</td>
                      <td>Sesión</td>
                    </tr>
                    <tr>
                      <td>cookie_consent</td>
                      <td>Registra su consentimiento de cookies</td>
                      <td>1 año</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="cookie-type">
              <h3>2. Cookies de Rendimiento</h3>
              <p>
                Estas cookies recopilan información sobre cómo los visitantes utilizan nuestro sitio web, 
                como qué páginas visitan con más frecuencia y si reciben mensajes de error. Toda la información 
                que recopilan estas cookies es agregada y, por lo tanto, anónima.
              </p>
              <div className="cookie-table">
                <table>
                  <thead>
                    <tr>
                      <th>Cookie</th>
                      <th>Propósito</th>
                      <th>Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>_ga</td>
                      <td>Google Analytics - Distingue usuarios únicos</td>
                      <td>2 años</td>
                    </tr>
                    <tr>
                      <td>_gid</td>
                      <td>Google Analytics - Distingue usuarios únicos</td>
                      <td>24 horas</td>
                    </tr>
                    <tr>
                      <td>_gat</td>
                      <td>Google Analytics - Limita la tasa de solicitudes</td>
                      <td>1 minuto</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="cookie-type">
              <h3>3. Cookies de Funcionalidad</h3>
              <p>
                Estas cookies permiten que el sitio web recuerde las elecciones que realiza (como su nombre de usuario, 
                idioma o región) y proporcionen características mejoradas y más personales.
              </p>
              <div className="cookie-table">
                <table>
                  <thead>
                    <tr>
                      <th>Cookie</th>
                      <th>Propósito</th>
                      <th>Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>user_preferences</td>
                      <td>Guarda sus preferencias de visualización</td>
                      <td>1 año</td>
                    </tr>
                    <tr>
                      <td>search_history</td>
                      <td>Recuerda sus búsquedas recientes</td>
                      <td>30 días</td>
                    </tr>
                    <tr>
                      <td>favorites</td>
                      <td>Almacena sus propiedades favoritas</td>
                      <td>6 meses</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="cookie-type">
              <h3>4. Cookies de Publicidad y Marketing</h3>
              <p>
                Estas cookies se utilizan para ofrecer anuncios más relevantes para usted y sus intereses. 
                También se utilizan para limitar la cantidad de veces que ve un anuncio y ayudar a medir 
                la efectividad de las campañas publicitarias.
              </p>
              <div className="cookie-table">
                <table>
                  <thead>
                    <tr>
                      <th>Cookie</th>
                      <th>Propósito</th>
                      <th>Duración</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>_fbp</td>
                      <td>Facebook Pixel - Seguimiento de conversiones</td>
                      <td>3 meses</td>
                    </tr>
                    <tr>
                      <td>ads_preferences</td>
                      <td>Almacena preferencias de publicidad</td>
                      <td>1 año</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="legal-section">
            <h2>Cookies de Terceros</h2>
            <p>
              Además de nuestras propias cookies, también utilizamos cookies de terceros para diversos propósitos:
            </p>
            <ul>
              <li><strong>Google Analytics:</strong> Para analizar el uso del sitio web y mejorar su rendimiento</li>
              <li><strong>Google Maps:</strong> Para mostrar mapas interactivos de ubicaciones de propiedades</li>
              <li><strong>Auth0:</strong> Para gestionar la autenticación y seguridad de usuarios</li>
              <li><strong>ImgBB:</strong> Para el almacenamiento y visualización de imágenes</li>
            </ul>
            <p>
              Estas cookies están sujetas a las políticas de privacidad de cada tercero. Le recomendamos 
              que revise sus políticas para obtener más información.
            </p>
          </section>

          <section className="legal-section">
            <h2>¿Cómo gestionar las cookies?</h2>
            <p>
              Puede controlar y gestionar las cookies de varias maneras. Tenga en cuenta que eliminar o bloquear 
              cookies puede afectar su experiencia de usuario y es posible que algunas funcionalidades del sitio 
              no funcionen correctamente.
            </p>

            <h3>Configuración del navegador</h3>
            <p>
              La mayoría de los navegadores web le permiten controlar las cookies a través de su configuración. 
              Para obtener más información sobre cómo gestionar cookies, consulte la ayuda de su navegador:
            </p>
            <ul>
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>

            <h3>Herramientas de exclusión voluntaria</h3>
            <p>
              También puede optar por no participar en ciertas cookies de terceros utilizando estas herramientas:
            </p>
            <ul>
              <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Complemento de inhabilitación de Google Analytics</a></li>
              <li><a href="http://www.youronlinechoices.com/es/" target="_blank" rel="noopener noreferrer">Your Online Choices</a></li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>Cambios en nuestra Política de Cookies</h2>
            <p>
              Podemos actualizar esta Política de Cookies ocasionalmente para reflejar cambios en las cookies 
              que utilizamos o por otras razones operativas, legales o regulatorias. Le recomendamos que revise 
              esta página periódicamente para estar informado sobre nuestro uso de cookies.
            </p>
          </section>

          <section className="legal-section">
            <h2>Más información</h2>
            <p>
              Si tiene preguntas sobre nuestra Política de Cookies, puede contactarnos:
            </p>
            <div className="contact-info">
              <p><strong>Finques Trimar</strong></p>
              <p>Email: <a href="mailto:finquestrimar@gmail.com">finquestrimar@gmail.com</a></p>
              <p>Teléfono: <a href="tel:+34615840273">615 84 02 73</a></p>
            </div>
            <p>
              Para obtener más información sobre cómo protegemos su privacidad, consulte nuestra 
              <a href="/politica-privacidad"> Política de Privacidad</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Cookies;
