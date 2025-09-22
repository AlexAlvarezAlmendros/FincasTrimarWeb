# 🏠 Fincas Trimar - Portal Inmobiliario

**La mejor forma de encontrar tu vivienda**

Portal web moderno para la inmobiliaria Fincas Trimar que ofrece servicios completos de venta, compra y alquiler de viviendas.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Git

### Instalación y Desarrollo

1. **Clonar el repositorio**
```bash
git clone https://github.com/AlexAlvarezAlmendros/FincasTrimarWeb.git
cd FincasTrimarWeb
```

2. **Configurar el Frontend**
```bash
cd frontend
npm install
cp .env.example .env
# Editar .env con tus configuraciones
npm run dev
```

3. **Configurar el Backend**
```bash
cd ../backend
npm install
cp .env.example .env
# Editar .env con tus configuraciones
npm run dev
```

4. **Acceder a la aplicación**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080/api/v1
- Health Check: http://localhost:8080/api/health

## 🏗️ Arquitectura del Proyecto

```
FincasTrimarWeb/
├── frontend/                 # Aplicación React
│   ├── src/
│   │   ├── app/             # Configuración principal de la app
│   │   ├── pages/           # Páginas principales
│   │   ├── components/      # Componentes reutilizables
│   │   ├── hooks/           # Custom hooks
│   │   ├── services/        # Servicios API
│   │   ├── styles/          # Estilos globales
│   │   ├── utils/           # Utilidades
│   │   └── types/           # Definiciones TypeScript
│   ├── public/
│   └── package.json
├── backend/                  # API REST Node.js
│   ├── src/
│   │   ├── routes/          # Definición de rutas
│   │   ├── controllers/     # Lógica de controladores
│   │   ├── services/        # Lógica de negocio
│   │   ├── repos/           # Acceso a datos
│   │   ├── db/              # Configuración BD y migraciones
│   │   ├── middlewares/     # Middlewares Express
│   │   ├── schemas/         # Validación con Zod
│   │   └── utils/           # Utilidades
│   └── package.json
├── Documentacion/            # Documentación del proyecto
└── README.md
```

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** - Librería UI
- **Vite + SWC** - Build tool y compilador rápido
- **React Router** - Enrutamiento SPA
- **Auth0** - Autenticación y autorización
- **CSS Variables** - Sistema de diseño consistente

### Backend
- **Node.js + Express** - Servidor y API REST
- **Turso (SQLite)** - Base de datos remota
- **Auth0 JWT** - Autenticación basada en tokens
- **Zod** - Validación de esquemas
- **Pino** - Logging estructurado

### Servicios Externos
- **ImgBB** - Almacenamiento de imágenes
- **Gmail API** - Envío de notificaciones
- **Auth0** - Gestión de usuarios

## 📋 Características Principales

- ✅ **Sistema completo de autenticación** (Auth0)
- ✅ **Búsqueda y filtrado** de viviendas
- ✅ **Gestión de imágenes** (múltiples fotos por vivienda)
- ✅ **Panel de administración** para gestores
- ✅ **Formulario de contacto** con notificaciones
- ✅ **Responsive design** adaptado a móviles
- ✅ **SEO optimizado** para buscadores

## 🎯 Estado del Proyecto

### ✅ Completado
- [x] Estructura de carpetas frontend y backend
- [x] Configuración React + Vite + SWC
- [x] Configuración Express + middlewares básicos
- [x] Sistema de rutas y páginas principales
- [x] Hello World funcional con conexión frontend-backend
- [x] Sistema de diseño y variables CSS
- [x] Estructura de auth con Auth0 (pendiente configuración)

### ⏳ En Desarrollo
- [ ] Configuración completa de Auth0
- [ ] Conexión y migraciones de base de datos Turso
- [ ] Endpoints CRUD para viviendas
- [ ] Integración con ImgBB para imágenes
- [ ] Sistema de notificaciones Gmail
- [ ] Componentes UI avanzados

### 📋 Próximos Pasos
- [ ] Tests unitarios y de integración
- [ ] Despliegue en producción
- [ ] Documentación API completa
- [ ] Optimizaciones de rendimiento

## 🔧 Comandos Disponibles

### Frontend
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Preview del build
npm run lint         # Linting con ESLint
```

### Backend
```bash
npm run dev          # Servidor con auto-restart
npm start            # Servidor en producción
npm test             # Ejecutar tests
npm run lint         # Linting con ESLint
npm run db:migrate   # Ejecutar migraciones
npm run db:seed      # Poblar BD con datos iniciales
```

## 📄 Documentación Adicional

- [Documentación Técnica](./Documentacion/Documentación%20Técnica.md)
- [Documentación de Modelos](./Documentacion/Documentación%20de%20Modelos.md)
- [Guía de Estilo](./Documentacion/Guía%20descriptiva%20y%20de%20estilo%20–%20Web%20Inmobiliaria.md)

---