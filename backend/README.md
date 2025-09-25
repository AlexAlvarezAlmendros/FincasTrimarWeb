# Fincas Trimar - Backend API

Backend completo para el portal inmobiliario Fincas Trimar desarrollado con Node.js, Express y SQLite (Turso).

## 🚀 Características

- **Base de datos**: SQLite con Turso para hosting en la nube
- **Autenticación**: Auth0 JWT con roles (Admin, Seller, Captador)
- **Subida de imágenes**: Integración con ImgBB
- **Emails**: Nodemailer + Gmail OAuth2 para notificaciones
- **Validación**: Zod para validación de esquemas
- **Seguridad**: Helmet, CORS, Rate Limiting
- **Arquitectura**: Repository Pattern + Service Layer

## 📋 Requisitos Previos

- Node.js 18+ 
- Cuenta en [Turso](https://turso.tech/) para base de datos
- Cuenta en [ImgBB](https://api.imgbb.com/) para subida de imágenes
- Configuración OAuth2 de Gmail para emails
- Cuenta en [Auth0](https://auth0.com/) para autenticación

## 🛠️ Instalación

1. **Clonar e instalar dependencias**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:

```env
# Base de datos Turso
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# Auth0
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com/
AUTH0_AUDIENCE=https://api.fincas-trimar.com

# ImgBB API
IMGBB_API_KEY=your-imgbb-api-key

# Gmail OAuth2
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret  
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
GMAIL_SENDER_EMAIL=noreply@tu-dominio.com
```

3. **Inicializar base de datos**
```bash
npm run db:migrate
npm run db:seed
```

4. **Iniciar servidor**
```bash
npm run dev
```

## 🗄️ Base de Datos

### Configuración con Turso

1. Crear base de datos en [Turso](https://turso.tech/)
2. Obtener URL y token de autenticación
3. Configurar variables `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`

### Migraciones

Las migraciones se ejecutan automáticamente al iniciar el servidor. Para ejecutarlas manualmente:

```bash
npm run db:migrate
```

### Seeds de Ejemplo

Para cargar datos de ejemplo en desarrollo:

```bash
npm run db:seed
```

## 🔑 Autenticación

### Auth0 Setup

1. Crear aplicación en Auth0
2. Configurar audiences y permisos
3. Crear roles: `Admin`, `Seller`, `Captador`
4. Configurar variables de entorno

### Roles y Permisos

- **Admin**: Acceso completo a todas las funciones
- **Seller**: Puede crear, editar y eliminar propiedades
- **Captador**: Solo puede crear propiedades (pendientes de aprobación)

## 🖼️ Subida de Imágenes

### ImgBB Configuration

1. Registrarse en [ImgBB](https://api.imgbb.com/)
2. Obtener API key
3. Configurar `IMGBB_API_KEY` en `.env`

### Uso

```javascript
// Subir múltiples imágenes
POST /api/v1/images
Content-Type: multipart/form-data
Field: images (max 10 archivos)

// Asociar imágenes a vivienda
POST /api/v1/viviendas/:id/imagenes
{
  "images": [
    { "url": "https://i.ibb.co/...", "orden": 1 },
    { "url": "https://i.ibb.co/...", "orden": 2 }
  ]
}
```

## 📧 Sistema de Emails

### Gmail OAuth2 Setup

1. Crear proyecto en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilitar Gmail API
3. Crear credenciales OAuth2
4. Obtener refresh token
5. Configurar variables en `.env`

### Emails Automáticos

- **Contacto**: Se envía email cuando un usuario contacta sobre una propiedad
- **Notificaciones**: Alertas administrativas del sistema

## 🌐 API Endpoints

### Propiedades

```
GET    /api/v1/viviendas           # Listar propiedades públicas
GET    /api/v1/viviendas/:id       # Obtener propiedad específica  
POST   /api/v1/viviendas           # Crear propiedad [Auth: Seller+]
PUT    /api/v1/viviendas/:id       # Actualizar propiedad [Auth: Seller+]
DELETE /api/v1/viviendas/:id       # Eliminar propiedad [Auth: Admin]
PUT    /api/v1/viviendas/:id/publish # Publicar/despublicar [Auth: Admin]
```

### Imágenes

```
GET    /api/v1/images/status              # Estado del servicio
POST   /api/v1/images                     # Subir imágenes [Auth: Seller+]
GET    /api/v1/viviendas/:id/imagenes     # Imágenes de propiedad
POST   /api/v1/viviendas/:id/imagenes     # Asociar imágenes [Auth: Seller+]
DELETE /api/v1/viviendas/:vid/imagenes/:id # Eliminar imagen [Auth: Seller+]
PUT    /api/v1/viviendas/:id/imagenes/reorder # Reordenar [Auth: Seller+]
```

### Mensajes

```
GET    /api/v1/mensajes           # Listar mensajes [Auth: Admin]
POST   /api/v1/mensajes           # Enviar mensaje de contacto
PUT    /api/v1/mensajes/:id/read  # Marcar como leído [Auth: Admin]
DELETE /api/v1/mensajes/:id       # Eliminar mensaje [Auth: Admin]
```

### Salud

```
GET    /api/health                # Health check
```

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot-reload
npm run start        # Producción
npm run test         # Ejecutar tests
npm run lint         # Linting
npm run lint:fix     # Linting + auto-fix
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Cargar datos de ejemplo
npm run db:reset     # Resetear DB (migrate + seed)
npm run setup        # Configuración inicial
```

## 🏗️ Estructura del Proyecto

```
backend/
├── src/
│   ├── app.js                 # Configuración Express
│   ├── server.js              # Punto de entrada
│   ├── controllers/           # Controladores HTTP
│   │   ├── propertyController.js
│   │   ├── imageController.js
│   │   └── messageController.js
│   ├── db/                    # Base de datos
│   │   ├── client.js          # Cliente Turso
│   │   ├── migrations/        # Migraciones SQL
│   │   └── seeds/             # Datos de ejemplo
│   ├── middlewares/           # Middlewares personalizados
│   │   ├── authMiddleware.js  # Auth0 JWT
│   │   ├── errorHandler.js    # Manejo de errores
│   │   └── rateLimiter.js     # Rate limiting
│   ├── repos/                 # Repositorios (Data Access)
│   │   ├── viviendaRepository.js
│   │   ├── imagenesViviendaRepository.js
│   │   └── mensajeRepository.js
│   ├── routes/                # Definición de rutas
│   │   ├── propertyRoutes.js
│   │   ├── imageRoutes.js
│   │   ├── messageRoutes.js
│   │   └── health.js
│   ├── schemas/               # Validación Zod
│   │   ├── propertySchemas.js
│   │   ├── imageSchemas.js
│   │   └── messageSchemas.js
│   ├── services/              # Lógica de negocio
│   │   ├── propertyService.js
│   │   ├── imageService.js
│   │   └── emailService.js
│   └── utils/
│       └── logger.js          # Logging con Pino
├── .env.example               # Variables de entorno ejemplo
├── package.json
└── README.md
```

## 🔒 Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configuración de orígenes permitidos  
- **Rate Limiting**: 100 requests por 15min por IP
- **Validación**: Zod para validar entrada de datos
- **JWT**: Verificación de tokens Auth0
- **File Validation**: Tipos y tamaños de archivo

## 🚀 Despliegue

### Variables de Entorno Producción

```env
NODE_ENV=production
PORT=8080
CORS_ORIGINS=https://tu-dominio.com
# ... resto de configuraciones
```

### Docker (opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 8080
CMD ["npm", "start"]
```

## 📊 Logging

El sistema usa Pino para logging estructurado:

```javascript
import { logger } from './utils/logger.js';

logger.info('Mensaje informativo');
logger.error('Error:', error);
logger.warn('Advertencia');
```

## ⚡ Performance

- **Paginación**: Todas las listas están paginadas
- **Índices**: Optimización de consultas DB
- **Cache**: Headers de cache apropiados
- **Compresión**: Automática en producción

## 🧪 Testing

```bash
npm test              # Ejecutar tests
npm run test:watch    # Tests en modo watch
npm run test:coverage # Coverage report
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear feature branch
3. Commit cambios
4. Push al branch  
5. Crear Pull Request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles.

## 🆘 Soporte

Para soporte técnico:
- Issues: GitHub Issues
- Email: dev@fincas-trimar.com
- Documentación: `/docs` endpoint cuando esté disponible

---

**Fincas Trimar Backend** - Sistema completo de gestión inmobiliaria 🏠