import { z } from 'zod';

/**
 * Esquemas de validación usando Zod
 * Sigue la nomenclatura camelCase para archivos
 */

// Esquema para crear/actualizar propiedades
export const propertySchema = z.object({
  name: z.string()
    .min(5, 'El nombre debe tener al menos 5 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  
  shortDescription: z.string()
    .max(300, 'La descripción corta no puede exceder 300 caracteres')
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  description: z.string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  price: z.coerce.number()
    .int('El precio debe ser un número entero')
    .min(0, 'El precio no puede ser negativo'),
  
  rooms: z.coerce.number()
    .int('Las habitaciones deben ser un número entero')
    .min(0, 'No puede tener habitaciones negativas')
    .default(0),
  
  bathRooms: z.coerce.number()
    .int('Los baños deben ser un número entero')
    .min(0, 'No puede tener baños negativos')
    .default(0),
  
  garage: z.coerce.number()
    .int('Los garajes deben ser un número entero')
    .min(0, 'No puede tener garajes negativos')
    .default(0),
  
  squaredMeters: z.coerce.number()
    .int('Los metros cuadrados deben ser un número entero')
    .min(0, 'No puede tener metros negativos')
    .optional(),
  
  provincia: z.string()
    .max(100, 'La provincia no puede exceder 100 caracteres')
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  poblacion: z.string()
    .max(100, 'La población no puede exceder 100 caracteres')
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  calle: z.string()
    .max(100, 'La calle no puede exceder 100 caracteres')
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  numero: z.string()
    .max(20, 'El número no puede exceder 20 caracteres')
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  tipoInmueble: z.string()
    .refine(val => val === '' || ['Vivienda', 'Oficina', 'Local', 'Nave', 'Garaje', 'Terreno', 'Trastero', 'Edificio', 'ObraNueva'].includes(val))
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  tipoVivienda: z.string()
    .refine(val => val === '' || ['Piso', 'Ático', 'Dúplex', 'Casa', 'Chalet', 'Villa', 'Masía', 'Finca', 'Loft'].includes(val))
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  estado: z.string()
    .refine(val => val === '' || ['ObraNueva', 'BuenEstado', 'AReformar'].includes(val))
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  planta: z.string()
    .refine(val => val === '' || ['UltimaPlanta', 'PlantaIntermedia', 'Bajo'].includes(val))
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  tipoAnuncio: z.string()
    .refine(val => val === '' || ['Venta', 'Alquiler'].includes(val))
    .transform(val => val === '' ? undefined : val)
    .optional(),
  
  estadoVenta: z.string()
    .refine(val => ['Pendiente', 'Contactada', 'Captada', 'Rechazada', 'Disponible', 'Reservada', 'Vendida', 'Cerrada'].includes(val))
    .default('Disponible'),
  
  caracteristicas: z.array(z.enum([
    'AireAcondicionado', 'ArmariosEmpotrados', 'Ascensor', 'Balcón',
    'Terraza', 'Exterior', 'Garaje', 'Jardín', 'Piscina', 'Trastero',
    'ViviendaAccesible', 'VistasAlMar', 'ViviendaDeLujo', 'VistasAMontaña',
    'FuegoATierra', 'Calefacción', 'Guardilla', 'CocinaOffice'
  ])).default([]),
  
  published: z.boolean().default(false),
  
  // Campos de borrador
  isDraft: z.boolean().default(false),
  
  // Campos de captación
  comisionGanada: z.coerce.number()
    .min(0, 'La comisión no puede ser negativa')
    .max(100, 'La comisión no puede exceder 100%')
    .default(0),
    
  captadoPor: z.string()
    .max(100, 'El campo captadoPor no puede exceder 100 caracteres')
    .transform(val => val === '' ? undefined : val)
    .optional(),
    
  porcentajeCaptacion: z.coerce.number()
    .min(0, 'El porcentaje de captación no puede ser negativo')
    .max(100, 'El porcentaje de captación no puede exceder 100%')
    .default(0),
    
  fechaCaptacion: z.string()
    .transform(val => val === '' ? undefined : val)
    .optional()
});

// Esquema para filtros de búsqueda
export const searchFiltersSchema = z.object({
  q: z.string().optional(), // Búsqueda de texto libre
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  rooms: z.number().int().min(0).optional(),
  bathRooms: z.number().int().min(0).optional(),
  tipoInmueble: z.string().optional(),
  tipoVivienda: z.string().optional(),
  provincia: z.string().optional(),
  poblacion: z.string().optional(),
  published: z.boolean().default(true),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20)
});

// Esquema para mensajes de contacto
export const messageSchema = z.object({
  viviendaId: z.string().uuid().optional(),
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  email: z.string()
    .email('El email no es válido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  
  telefono: z.string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional(),
  
  asunto: z.string()
    .max(200, 'El asunto no puede exceder 200 caracteres')
    .optional(),
  
  descripcion: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  
  estado: z.enum(['Nuevo', 'EnCurso', 'Cerrado']).default('Nuevo'),
  pinned: z.boolean().default(false)
});

// Esquema específico para formularios de contacto (más estricto)
export const contactFormSchema = z.object({
  viviendaId: z.string().uuid().optional(), // Opcional - para contactos desde detalle de vivienda
  
  nombre: z.string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  
  email: z.string()
    .trim()
    .email('El formato del email no es válido')
    .max(100, 'El email no puede exceder 100 caracteres')
    .toLowerCase(),
  
  telefono: z.string()
    .trim()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .regex(/^[+]?[\d\s\-()]+$/, 'El teléfono contiene caracteres no válidos')
    .optional()
    .transform(val => val === '' ? undefined : val),
  
  asunto: z.string()
    .trim()
    .min(3, 'El asunto debe tener al menos 3 caracteres')
    .max(200, 'El asunto no puede exceder 200 caracteres')
    .default('Contacto desde web'),
  
  descripcion: z.string()
    .trim()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  
  tipo: z.enum(['general', 'propiedad', 'venta', 'compra', 'alquiler', 'valoracion'])
    .default('general'),
  
  acepta_politicas: z.boolean()
    .refine(val => val === true, 'Debe aceptar la política de privacidad'),
  
  // Campo honeypot para prevenir spam
  website: z.string()
    .optional()
    .refine(val => !val || val === '', 'Campo de seguridad no válido')
});

// Esquema para validar parámetros de ID UUID
export const uuidSchema = z.string().uuid('ID no válido');