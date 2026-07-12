/**
 * Selector de características usando tarjetas
 * Componente contenedor que maneja la selección múltiple de características
 */
import React from 'react';
import CharacteristicCard from '../CharacteristicCard';
import { Caracteristica } from '../../types/vivienda.types.js';
import './CharacteristicsSelector.css';

// Mapeo de características con sus iconos y etiquetas
const CHARACTERISTIC_CONFIG = {
  [Caracteristica.AIRE_ACONDICIONADO]: {
    icon: '❄️',
    label: 'Aire Acondicionado'
  },
  [Caracteristica.ARMARIOS_EMPOTRADOS]: {
    icon: '🚪',
    label: 'Armarios Empotrados'
  },
  [Caracteristica.ASCENSOR]: {
    icon: '🏢',
    label: 'Ascensor'
  },
  [Caracteristica.BALCON]: {
    icon: '🏛️',
    label: 'Balcón'
  },
  [Caracteristica.TERRAZA]: {
    icon: '🌿',
    label: 'Terraza'
  },
  [Caracteristica.EXTERIOR]: {
    icon: '🌞',
    label: 'Exterior'
  },
  [Caracteristica.GARAJE]: {
    icon: '🚗',
    label: 'Garaje'
  },
  [Caracteristica.JARDIN]: {
    icon: '🌳',
    label: 'Jardín'
  },
  [Caracteristica.PISCINA]: {
    icon: '🏊‍♂️',
    label: 'Piscina'
  },
  [Caracteristica.TRASTERO]: {
    icon: '📦',
    label: 'Trastero'
  },
  [Caracteristica.VIVIENDA_ACCESIBLE]: {
    icon: '♿',
    label: 'Vivienda Accesible'
  },
  [Caracteristica.VISTAS_AL_MAR]: {
    icon: '🌊',
    label: 'Vistas al Mar'
  },
  [Caracteristica.VIVIENDA_DE_LUJO]: {
    icon: '✨',
    label: 'Vivienda de Lujo'
  },
  [Caracteristica.VISTAS_A_MONTANA]: {
    icon: '🏔️',
    label: 'Vistas a Montaña'
  },
  [Caracteristica.FUEGO_A_TIERRA]: {
    icon: '🔥',
    label: 'Fuego a Tierra'
  },
  [Caracteristica.CALEFACCION]: {
    icon: '🔥',
    label: 'Calefacción'
  },
  [Caracteristica.GUARDILLA]: {
    icon: '🏠',
    label: 'Guardilla'
  },
  [Caracteristica.COCINA_OFFICE]: {
    icon: '👩‍🍳',
    label: 'Cocina Office'
  }
};

const CharacteristicsSelector = ({
  selectedCharacteristics = [],
  onChange,
  disabled = false,
  className = '',
  title = 'Características',
  subtitle = 'Selecciona todas las características que apliquen a esta vivienda'
}) => {
  
  const handleCharacteristicToggle = (characteristic) => {
    if (disabled) return;

    const isSelected = selectedCharacteristics.includes(characteristic);
    let newSelection;

    if (isSelected) {
      // Remover característica
      newSelection = selectedCharacteristics.filter(item => item !== characteristic);
    } else {
      // Añadir característica
      newSelection = [...selectedCharacteristics, characteristic];
    }

    onChange(newSelection);
  };

  const clearAll = () => {
    if (!disabled) {
      onChange([]);
    }
  };

  const selectAll = () => {
    if (!disabled) {
      onChange(Object.keys(CHARACTERISTIC_CONFIG));
    }
  };

  const selectedCount = selectedCharacteristics.length;
  const totalCount = Object.keys(CHARACTERISTIC_CONFIG).length;

  return (
    <div className={`characteristics-selector ${className}`}>
      <div className="characteristics-selector__header">
        <div className="characteristics-selector__title-section">
          {title && (
            <h3 className="characteristics-selector__title">{title}</h3>
          )}
          {subtitle && (
            <p className="characteristics-selector__subtitle">{subtitle}</p>
          )}
        </div>
        
        <div className="characteristics-selector__controls">
          <div className="characteristics-selector__counter">
            {selectedCount} de {totalCount} seleccionadas
          </div>
          <div className="characteristics-selector__actions">
            <button
              type="button"
              className="btn-link"
              onClick={selectAll}
              disabled={disabled || selectedCount === totalCount}
            >
              Seleccionar todas
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={clearAll}
              disabled={disabled || selectedCount === 0}
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="characteristics-selector__grid">
        {Object.entries(CHARACTERISTIC_CONFIG).map(([characteristic, config]) => (
          <CharacteristicCard
            key={characteristic}
            characteristic={characteristic}
            label={config.label}
            icon={config.icon}
            isSelected={selectedCharacteristics.includes(characteristic)}
            onClick={handleCharacteristicToggle}
            disabled={disabled}
          />
        ))}
      </div>

      {selectedCount > 0 && (
        <div className="characteristics-selector__summary">
          <h4 className="characteristics-selector__summary-title">
            Características seleccionadas:
          </h4>
          <div className="characteristics-selector__selected-list">
            {selectedCharacteristics.map(characteristic => {
              const config = CHARACTERISTIC_CONFIG[characteristic];
              return config ? (
                <span key={characteristic} className="characteristic-chip">
                  {config.icon} {config.label}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacteristicsSelector;