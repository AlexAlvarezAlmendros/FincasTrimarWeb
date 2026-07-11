import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './Button.css';

/**
 * Botón unificado del panel.
 * variant: primary | secondary | outline | danger | draft | ghost
 * size: sm | md
 * icon: nombre de icono FontAwesome (opcional); loading muestra un spinner.
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  icon,
  loading = false,
  disabled = false,
  className = '',
  ...rest
}) => {
  const isDisabled = disabled || loading;
  const classes = `btn-ui btn-ui--${variant} btn-ui--${size}${className ? ` ${className}` : ''}`;

  return (
    <button type={type} className={classes} disabled={isDisabled} {...rest}>
      {loading ? (
        <FontAwesomeIcon icon="spinner" spin />
      ) : icon ? (
        <FontAwesomeIcon icon={icon} />
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;
