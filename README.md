<div align="center">

# Fincas Trimar

**El portal de una inmobiliaria de barrio, con la ficha de vivienda que se merece y un panel que se entiende sin manual.**

[![En producción](https://img.shields.io/badge/en%20producci%C3%B3n-finquestrimar.com-4dd4ac)](https://www.finquestrimar.com/)
[![Licencia Apache 2.0](https://img.shields.io/badge/licencia-Apache%202.0-lightgrey)](LICENSE)
[![React 18](https://img.shields.io/badge/React-18-61dafb)](frontend/)
[![Express + Turso](https://img.shields.io/badge/Express-Turso%20(libSQL)-4c8bf5)](backend/)

[Qué hace](#qué-hace) ·
[El panel](#el-panel-de-la-inmobiliaria) ·
[Sincronización externa](#sincronización-desde-fuera) ·
[Arrancarlo](#arrancarlo) ·
[Roadmap](docs/planning/ROADMAP.md)

</div>

---

Una inmobiliaria pequeña no necesita otro portal genérico: necesita **su** escaparate, con sus
viviendas, su teléfono y su gente, y necesita poder publicar un piso un domingo por la tarde sin
llamar a nadie.

Eso es esto. Un portal público rápido y orientado a SEO, y detrás un panel donde el equipo da de
alta viviendas, sube fotos, contesta mensajes y poco más — porque todo lo que se añadió de más
acabó estorbando, y las fases 5 y 6 del roadmap consistieron precisamente en quitarlo.

## Qué hace

**Para quien busca casa**

- **Listado con filtros** por operación, tipo de inmueble, zona, precio, habitaciones y baños.
- **Ficha de vivienda** con galería, descripción en texto rico, características y mapa
  (Google Maps), pensada para compartirse tal cual por WhatsApp.
- **Formulario de contacto** por vivienda y **página de «Vender»** para quien quiere que le tasen
  la suya: los dos acaban en el buzón del panel y en un correo al equipo.
- **SEO de verdad**: metadatos por página con `react-helmet-async`, sitemap generado desde la base
  de datos y páginas legales (privacidad, cookies, términos) servidas como parte del sitio.

**Para la inmobiliaria**

- **Alta y edición de viviendas** con subida de imágenes, orden de galería y estados de
  publicación.
- **Bandeja de mensajes** con el contexto de la vivienda por la que preguntan.
- **Agentes** y **configuración**, y un dashboard que dice lo que realmente sabe: sin métricas
  inventadas.

## El panel de la inmobiliaria

El acceso va con **Auth0** (JWT verificado en el backend con `express-oauth2-jwt-bearer`), y las
rutas de administración exigen rol, no solo sesión iniciada. Las imágenes se alojan en **ImgBB** y
los correos salen por **Gmail con OAuth2** — sin contraseñas de aplicación ni SMTP con credenciales
en claro.

Todo endpoint público pasa por `helmet`, CORS con lista blanca y **rate limiting** por ventana
configurable, porque un formulario de contacto abierto a internet es un buzón de spam esperando a
que lo encuentren.

## Sincronización desde fuera

`/api/v1/json/*` permite volcar inmuebles desde otro sistema (o desde un scraper propio) sin pasar
por el panel:

- Autenticación por **cabecera `X-API-Key`**, con **varias claves admitidas a la vez** para poder
  rotarlas sin cortar el servicio.
- Admite tipos **no residenciales** — terreno, local, nave — además de viviendas.
- Deliberadamente **fuera de la UI**: es una integración máquina-a-máquina, y meterla en el panel
  solo servía para que alguien la tocara sin querer.

También hay un parser de fichas de portales externos (`idealistaParserService`) para dar de alta
una vivienda a partir del HTML ya publicado en vez de teclear los campos otra vez.

## Arrancarlo

```bash
npm run install:all             # workspaces: frontend + backend
cp backend/.env.example backend/.env    # Turso, Auth0, ImgBB, Gmail OAuth2, CORS
npm run dev                     # front en :5173 y API en :8080, a la vez
```

| | |
|---|---|
| Portal | http://localhost:5173 |
| API | http://localhost:8080/api/v1 |
| Health | http://localhost:8080/api/health |

```bash
npm run --workspace backend db:migrate   # migraciones
npm run --workspace backend db:seed      # datos iniciales
npm run lint                             # ESLint en los dos paquetes
npm run --workspace backend test         # Vitest + supertest
```

## Cómo está montado

```
frontend/   React 18 + Vite · React Router · Auth0 SPA SDK · editor de texto rico · Google Maps
backend/    Express 4 en capas —  routes → controllers → services → repos
            Zod para validar, pino para los logs, Turso (libSQL) como base
docs/       Roadmap y planes por fase
Documentacion/  Modelo de datos, documentación técnica y guía de estilo de la marca
```

El backend mantiene la separación de capas a rajatabla: la ruta no sabe de SQL, el repositorio no
sabe de HTTP, y entre medias los servicios. Las migraciones y el `transformRow` que traduce las
filas de la base a los modelos del dominio están documentados en `Documentacion/`.

## Estado

**En producción** en [finquestrimar.com](https://www.finquestrimar.com/) y en uso real por la
inmobiliaria.

El [roadmap](docs/planning/ROADMAP.md) prioriza **seguridad → deuda técnica → calidad → producto**.
Las fases 5 y 6 (simplificación del CRUD y de la UI) están prácticamente cerradas; la fase 1
(endurecer autorización por rol y sacar del repo los secretos que quedan) sigue siendo la deuda
estructural pendiente, y está reconocida como tal.

## Desarrollo con Claude Code

El repo trae las skills `/fincastrimar-plan`, `/fincastrimar-nuevo-modulo-backend`,
`/fincastrimar-nuevo-componente` y `/fincastrimar-nueva-migracion`, que codifican las convenciones
reales del proyecto: el orden de las capas, el sobre de respuesta de la API, la convención de
carpeta por componente y el cableado de migraciones.

## Licencia

Apache 2.0 — ver [LICENSE](LICENSE). El `package.json` del backend declara MIT por herencia de la plantilla; manda el fichero LICENSE.
