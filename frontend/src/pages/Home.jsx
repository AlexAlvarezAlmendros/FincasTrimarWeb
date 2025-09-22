import { useState, useEffect } from 'react';

export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Conectar con el backend para el hello world
    fetch(import.meta.env.VITE_API_BASE_URL + '/hello')
      .then(response => response.json())
      .then(data => {
        setMessage(data.message || 'Frontend conectado correctamente!');
      })
      .catch(() => {
        setMessage('Frontend funcionando - Backend pendiente de conectar');
      });
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <h1 style={{ 
        color: 'var(--color-brand-primary)', 
        marginBottom: '1rem',
        fontSize: 'var(--font-size-3xl)'
      }}>
        🏠 Fincas Trimar
      </h1>
      
      <h2 style={{ 
        color: 'var(--color-neutral-800)', 
        marginBottom: '2rem',
        fontWeight: 'var(--font-weight-medium)'
      }}>
        La mejor forma de encontrar tu vivienda
      </h2>
      
      <div style={{
        backgroundColor: 'var(--color-neutral-50)',
        padding: '1.5rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-neutral-300)',
        maxWidth: '600px'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Estado del proyecto:</h3>
        <p style={{ 
          color: 'var(--color-success)', 
          fontWeight: 'var(--font-weight-medium)',
          marginBottom: '1rem'
        }}>
          ✅ {message}
        </p>
        
        <div style={{ textAlign: 'left' }}>
          <h4 style={{ marginBottom: '0.5rem', fontSize: 'var(--font-size-lg)' }}>
            Estructura creada:
          </h4>
          <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
            <li>✅ Frontend React + Vite + SWC</li>
            <li>✅ React Router configurado</li>
            <li>✅ Auth0 Provider integrado</li>
            <li>✅ Sistema de diseño implementado</li>
            <li>⏳ Backend Node.js + Express (siguiente paso)</li>
            <li>⏳ Base de datos Turso SQLite</li>
            <li>⏳ Integración ImgBB + Gmail</li>
          </ul>
        </div>
      </div>
      
      <p style={{ 
        marginTop: '2rem', 
        color: 'var(--color-neutral-600)',
        fontSize: 'var(--font-size-sm)'
      }}>
        Ofrecemos el servicio completo de venta, compra o alquiler de tu vivienda
      </p>
    </div>
  );
}