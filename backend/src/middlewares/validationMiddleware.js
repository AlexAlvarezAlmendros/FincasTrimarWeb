import { 
  propertySchema, 
  searchFiltersSchema, 
  messageSchema 
} from '../schemas/validationSchemas.js';

/**
 * Middleware de validación usando Zod
 * Sigue la nomenclatura camelCase para archivos de middleware
 */

/**
 * Crea middleware de validación para un esquema Zod específico
 * @param {Object} schema - Esquema Zod para validar
 * @param {string} property - Propiedad del request a validar ('body', 'query', 'params')
 * @returns {Function} Middleware de Express
 */
export const validateSchema = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[property];
      const validatedData = schema.parse(dataToValidate);
      
      // Reemplazar los datos originales con los validados/transformados
      req[property] = validatedData;
      
      next();
    } catch (error) {
      // Formatear errores de Zod
      const formattedErrors = error.errors?.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));

      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos de entrada inválidos',
          details: formattedErrors || error.message
        }
      });
    }
  };
};

/**
 * Middleware específico para validar el cuerpo de creación de propiedades
 */
export const validatePropertyCreation = validateSchema(propertySchema, 'body');

/**
 * Middleware específico para validar filtros de búsqueda en query params
 */
export const validateSearchFilters = validateSchema(searchFiltersSchema, 'query');

/**
 * Middleware específico para validar mensajes de contacto
 */
export const validateMessage = validateSchema(messageSchema, 'body');

/**
 * Middleware para validar UUID en parámetros
 */
export const validateUUID = (paramName = 'id') => {
  return (req, res, next) => {
    const uuid = req.params[paramName];
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(uuid)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_UUID',
          message: `El parámetro ${paramName} debe ser un UUID válido`
        }
      });
    }
    
    next();
  };
};