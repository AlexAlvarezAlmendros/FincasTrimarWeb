import React from 'react';
import './FormField.css';

/**
 * Envoltorio unificado de campo de formulario: etiqueta + control (children)
 * + texto de ayuda + un único estilo de error. Sustituye a los .form-group
 * divergentes del admin y de ContactForm.
 */
const FormField = ({
  label,
  htmlFor,
  required = false,
  error,
  help,
  children,
  className = '',
}) => (
  <div className={`form-field${error ? ' form-field--error' : ''}${className ? ` ${className}` : ''}`}>
    {label && (
      <label className="form-field__label" htmlFor={htmlFor}>
        {label}
        {required && <span className="form-field__required" aria-hidden="true"> *</span>}
      </label>
    )}
    {children}
    {help && !error && <small className="form-field__help">{help}</small>}
    {error && <span className="form-field__error" role="alert">{error}</span>}
  </div>
);

export default FormField;
