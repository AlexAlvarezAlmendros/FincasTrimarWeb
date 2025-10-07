import React, { useEffect, useState } from 'react';

/**
 * Componente para mostrar un mapa embebido de Google Maps
 * Usa la API de Google Maps Embed para mostrar la ubicación de una propiedad
 */
const GoogleMapEmbed = ({ 
  calle, 
  numero, 
  poblacion, 
  provincia, 
  country = 'España',
  width = '100%',
  height = '300px',
  className = ''
}) => {
  const [mapUrl, setMapUrl] = useState('');
  const [addressText, setAddressText] = useState('');

  useEffect(() => {
    // Construir la dirección completa para el mapa
    const addressParts = [calle, numero, poblacion, provincia, country].filter(Boolean);
    const fullAddress = addressParts.join(', ');
    
    // Crear texto legible para mostrar
    const displayParts = [calle, numero, poblacion, provincia].filter(Boolean);
    const displayAddress = displayParts.join(', ');
    
    setAddressText(displayAddress);

    if (fullAddress) {
      // Codificar la dirección para URL
      const encodedAddress = encodeURIComponent(fullAddress);
      
      // Usar Google Maps Embed sin API key (método alternativo)
      // Construir URL que funciona sin API key
      const mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
      
      setMapUrl(mapUrl);
    }
  }, [calle, numero, poblacion, provincia, country]);

  // Si no hay dirección, mostrar placeholder
  if (!mapUrl || !addressText) {
    return (
      <div className={`map-container ${className}`} style={{ width, height }}>
        <div 
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#f5f5f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>📍</div>
            <div>Ubicación no disponible</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`map-container ${className}`}>
      <div className="map-embed" style={{ width, height, borderRadius: '8px', overflow: 'hidden' }}>
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Mapa de ${addressText}`}
        ></iframe>
      </div>
      
      {addressText && (
        <div className="location-info" style={{ marginTop: '12px' }}>
          <div className="location-text" style={{
            fontSize: '14px',
            color: '#666',
            textAlign: 'center',
            padding: '8px',
            backgroundColor: '#f9f9f9',
            borderRadius: '6px'
          }}>
            📍 {addressText}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoogleMapEmbed;