/**
 * Componente de tarjeta para mostrar una característica individual
 * Permite seleccionar/deseleccionar características en el formulario de vivienda
 */
import React from 'react';
import './CharacteristicCard.css';

const CharacteristicCard = ({ 
  characteristic, 
  label, 
  icon, 
  isSelected, 
  onClick, 
  disabled = false 
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(characteristic);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      onClick(characteristic);
    }
  };

  return (
    <div 
      className={`characteristic-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      aria-label={`${label}${isSelected ? ' - Seleccionado' : ' - No seleccionado'}`}
    >
      <div className="characteristic-card__content">
        <div className="characteristic-card__icon" aria-hidden="true">
          {icon}
        </div>
        <div className="characteristic-card__label">
          {label}
        </div>
        {isSelected && (
          <div className="characteristic-card__check" aria-hidden="true">
            ✓
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacteristicCard;