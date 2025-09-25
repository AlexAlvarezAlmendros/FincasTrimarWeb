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
export const validatePropertyCreation = (req, res, next) => {
  // Importar aquí para evitar dependencias circulares
  import('../schemas/validationSchemas.js').then(({ propertySchema }) => {
    validateSchema(propertySchema, 'body')(req, res, next);
  }).catch(next);
};

/**
 * Middleware específico para validar filtros de búsqueda
 */
export const validateSearchFilters = (req, res, next) => {
  import('../schemas/validationSchemas.js').then(({ searchFiltersSchema }) => {
    validateSchema(searchFiltersSchema, 'query')(req, res, next);
  }).catch(next);
};

/**
 * Middleware específico para validar mensajes de contacto
 */
export const validateMessage = (req, res, next) => {
  import('../schemas/validationSchemas.js').then(({ messageSchema }) => {
    validateSchema(messageSchema, 'body')(req, res, next);
  }).catch(next);
};