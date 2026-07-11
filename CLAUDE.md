# FincasTrimarWeb — CLAUDE.md

Portal inmobiliario de **Fincas Trimar** (el logo lee *Finques TriMar*, agencia de Igualada).
Monorepo de dos paquetes: **frontend** React 18 + Vite/SWC · **backend** Express 4 + Turso (libSQL) + Auth0.
Despliegue en **Vercel** (dos proyectos independientes). Idioma del producto y de los comentarios: **español**.

---

## ⚠️ El CLAUDE.md ancestro NO aplica a este proyecto

Por herencia de directorios, Claude Code carga también `/home/poio/Documentos/CLAUDE.md`, que describe **otro proyecto** ("OpenDev Protocol": Solidity/Foundry, Turborepo, viem/wagmi, DI por constructor, `exactOptionalPropertyTypes`, Biome, Vitest-only, `pnpm`).

**Ignora por completo esas reglas aquí.** Este proyecto es JavaScript plano (no TypeScript), Express con singletons por import directo (no DI), `npm` (no `pnpm`), ESLint (no Biome), y no tiene contratos ni monorepo Turborepo. Manda **este** archivo.

---

## Comandos esenciales

```bash
# Instalación (dos npm install separados; los workspaces están declarados pero NO se usan)
npm run install:all

# Desarrollo (concurrently: backend node --watch + frontend vite)
npm run dev
npm run dev:backend      # solo API   → http://localhost:8080/api/v1
npm run dev:frontend     # solo web   → http://localhost:5173

# Build (SOLO frontend; el backend es serverless, no se "buildea")
npm run build            # == build:frontend → frontend/dist

# Lint (SOLO backend funciona)
cd backend && npm run lint          # eslint src
cd backend && npm run lint:fix

# Base de datos (Turso) — desde backend/
npm run db:migrate       # node migrate.js  (crea SOLO las tablas base de 001; ver ⚠️ abajo)
npm run db:seed          # inserta viviendas de ejemplo
npm run db:reset         # migrate + seed
npm run db:verify        # node verify-turso.js — comprueba conexión y lista tablas
npm run auth:check       # node check-auth0.js — imprime estado de config Auth0
node run-agents-migration.js   # ejecuta la migración 008 (tabla Agentes) — sin alias npm

# Tests (backend tiene vitest+supertest instalados pero 0 tests; frontend no tiene tooling)
cd backend && npm test
```

**Comandos rotos / con trampa (no los uses tal cual):**
- `npm run verify:permissions` → ejecuta `node verify-permissions.js`, **fichero inexistente**. Falla.
- `npm run lint` / `lint:frontend` → el frontend **no tiene** config ESLint ni script `lint`. Falla. Lint efectivo solo en backend.
- `cd backend && npm run setup` → es `copy .env.example .env` (**cmd.exe de Windows**). En Linux/macOS usa `cp .env.example .env`.

---

## Estructura del monorepo

```
FincasTrimarWeb/
├── frontend/                 React 18 + Vite (SPA)  → deploy Vercel (Root Dir = frontend/)
│   └── src/{app,pages,components,hooks,services,config,utils,types,styles}
├── backend/                  Express 4 API (ESM)    → deploy Vercel serverless (Root Dir = backend/)
│   ├── api/index.js          wrapper serverless: re-exporta la app de src/app.js
│   └── src/{routes,controllers,services,repos,middlewares,schemas,db/{migrations,seeds},utils}
├── .github/instructions/     Convenciones canónicas (Diseño, Nomenclatura, Modelo de datos, Doc. Técnica)
├── Documentacion/            Docs largas en español (técnica, modelos, guía de estilo)
└── ejemplo.json              Salida del scraper de Idealista (input del import JSON)
```

**Docs de referencia dentro del repo** (léelas antes de tocar su área): `.github/instructions/Nomenclatura.instructions.md`, `Diseño.instructions.md`, `Modelo de datos.instructions.md`, `Documentacion Tecnica.instructions.md`, y `backend/docs/api-sincronizacion-json.md` (API de sync JSON). Están algo desactualizadas respecto al código real: **ante conflicto, manda el código** (ver «Trampas»).

---

## Stack y versiones

| Área | Tecnología |
|---|---|
| Node | **20.17.0** (`.nvmrc`) — los README dicen "18+", desactualizado. Usa 20.17. |
| Frontend | React **18.3** (no 19), Vite **5.4** + `@vitejs/plugin-react-swc`, react-router-dom **6**, JS/JSX plano |
| Auth (front) | `@auth0/auth0-react` 2.2 |
| Backend | Express **4.18** (ESM, `type: module`), `@libsql/client` 0.4 (Turso), Zod 3.22, Pino 8 |
| Auth (back) | `express-oauth2-jwt-bearer` 1.6 (RS256) |
| Integraciones | ImgBB (imágenes), Nodemailer + Gmail App Password (email), Google Maps JS API, jsdom (parser Idealista) |
| Lint | ESLint **8** legacy (`.eslintrc.json`, no flat config) — solo backend |
| Deploy | Vercel (2 proyectos) |

Detalles de UI: FontAwesome, `react-quill` (rich text), `dompurify` (sanitizar HTML). **NO** hay TypeScript (los `@types/*` son ruido), ni Tailwind, ni CSS-in-JS, ni state manager global, ni React Context (solo `Auth0Provider`).

---

## Arquitectura backend

**Flujo en 4 capas:** `routes → controllers → services → repos → src/db/client.js`.

- **Sin DI.** Cada capa es un **singleton de módulo** cableado por `import` directo. Services y repos son **clases** exportadas como instancia (`export default new XService()`). Los controllers son a veces objeto literal (`propertyController`, `messageController`, `imageController`, `agenteController`, `dashboardController`) y a veces clase-singleton (`csvImport`, `jsonImport`, `htmlParser`). Un controller importa su service; un service importa sus repos. **No** inyectes por constructor.
- **Responsabilidades:** controllers = solo HTTP (parsear req, dar forma a la respuesta, `next(error)`). Services = lógica de negocio + validación; lanzan `Error` decorado con `.statusCode` y `.code`. Repos = SQL crudo vía `executeQuery(sql, params)` / `executeTransaction(queries)`. **Los controllers nunca tocan el cliente DB.**
- **`transformRow`:** las columnas DB son **PascalCase**; los repos mapean a objetos **camelCase** en un método `transformRow`. Añadir una columna ⇒ actualizar `transformRow` **y** las listas de columnas de create/update.

**Rutas y montaje (`src/app.js`) — el orden es load-bearing:**
- Prefijo de versión: **`/api/v1`**. Health en `/api/health`. Sitemap en la raíz `/sitemap.xml`.
- Split público/privado con **exports con nombre**: `propertyRoutes`/`messageRoutes` exportan `{ publicRoutes, privateRoutes }`; `imageRoutes` → `{ imagePublicRoutes, imagePrivateRoutes }`; `dashboardRoutes` → solo `{ privateRoutes }`. El resto default-exportan un Router.
- Se montan primero los routers públicos, luego el **gate global** `app.use('/api/v1', checkJwt)`, y después los privados. **Ese gate es lo único que protege las rutas privadas** (ver «Seguridad»: falta autorización por rol).
- **Excepción 1:** `GET /api/v1/viviendas/captacion` se registra directamente en `app.js` (con `checkJwt, requireCaptador`) **antes** del router público para que `/viviendas/:id` no capture la palabra "captacion" como id.
- **Excepción 2:** `/api/v1/json` se monta **antes** del gate `checkJwt` porque trae su propia auth dual (API key o JWT Admin).
- **Regla general:** dentro de cualquier router, registra rutas literales (`/viviendas/stats`, `/drafts`, `/:id/similar`) **antes** de `/:id`.

**Envelope de respuesta:**
- Éxito: `{ success: true, data, pagination? , message? }` (201 al crear). `pagination = { page, pageSize, total, totalPages }`.
- Error: **inconsistente** — el `errorHandler` central, el rate limiter y el 404 devuelven `{ error: { code, message } }` (sin `success`); los errores manuales de controllers/auth y el timeout devuelven `{ success: false, error: { code, message } }`. **Para código nuevo usa `{ success: false, error: { code, message } }`** con `code` en UPPER_SNAKE_CASE.

**DB client (`src/db/client.js`):** crea un cliente libSQL desde `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`. `executeQuery` tiene timeout de 20s y **un** reintento con reconexión ante `DB_TIMEOUT`. Hay un timeout de request de 25s en `/api/`. Cuidado: si `TURSO_DATABASE_URL` no está, cae a `file:local.db` silenciosamente.

---

## Arquitectura frontend

- **Entrada:** `main.jsx → app/App.jsx`. Stack de providers: `HelmetProvider` → `Auth0Provider` → `AuthWrapper` (spinner mientras Auth0 inicializa) → `BrowserRouter`.
- **Routing:** react-router-dom v6. Rutas públicas dentro de `<Layout />`; el subárbol admin es `/admin/*` protegido por `<RequireAuth roles={["AdminTrimar","SellerTrimar","CaptadorTrimar"]}>` y delega en `pages/Admin.jsx`, que tiene sus **propias `<Routes>` anidadas** con re-chequeo por ruta vía `adminOnly()` (solo `AdminTrimar`; captación es la excepción abierta a los 3 roles). **No hay** lazy loading; el code-splitting es solo a nivel de bundler (`manualChunks`).
- **Capa API:** servicios como **clase-singleton** en `src/services/*.js` (`export default new Service()`). Leen la base URL de `import.meta.env.VITE_API_BASE_URL` en el constructor. Cada método: `try/catch` + `response.ok` + `throw new Error(errorData.error?.message || fallback)`.
- **Auth en peticiones:** nunca leas el token de `localStorage`. Usa `useAuth0().getAccessTokenSilently()` (vía `hooks/useApi.js` o `hooks/admin/useAdminApi.js`, que adjuntan el token solos) o pasa un callback `getAccessToken` al método del servicio. Adjunta `Authorization: Bearer ${token}`. En `FormData` **omite** `Content-Type` (el navegador pone el boundary).
- **Data fetching:** solo custom hooks + `useState` local. El patrón canónico (`hooks/useViviendas.js`) expone un estado tipo máquina (`HookStates` IDLE/LOADING/SUCCESS/ERROR de `types/vivienda.types.js`) + booleanos derivados `isLoading/isError/isSuccess/isEmpty`, con cache TTL a nivel de módulo, debounce, `AbortController` e `isMountedRef`. Los hooks admin (`useAdminApi`) son más simples: `{ apiCall, loading, error, clearError }`.
- **Componentes:** convención dominante = **una carpeta por componente** con `Component.jsx` + `Component.css` + `index.js` (barrel). Se aplica de forma **inconsistente** (algunas carpetas sin barrel/CSS, otras planas). CSS: **CSS plano co-localizado global**, no CSS Modules (solo 2 excepciones heredadas). **No añadas `.module.css` nuevos.**

---

## Modelo de datos (Turso / SQLite, sin ORM)

Cuatro tablas de negocio + `migrations` (bookkeeping). Agregado central: **Vivienda**.

- **Vivienda** (propiedad). Columnas clave (PascalCase): `Id` (uuid v4 TEXT), `Name`, `ShortDescription`, `Description`, `Price` (INTEGER, euros enteros, sin decimales), `Rooms/BathRooms/Garage/SquaredMeters` (INTEGER), dirección `Provincia/Poblacion/Calle/Numero`, enums `TipoInmueble/TipoVivienda/Estado/Planta/TipoAnuncio/EstadoVenta`, `Caracteristicas` (array JSON en TEXT), `Published` (0/1), `FechaPublicacion`, `IsDraft` (0/1), captación (`ComisionGanada`, `CaptadoPor`, `PorcentajeCaptacion`, `FechaCaptacion`), contacto (`TelefonoContacto`, `NombreContacto`, `UrlReferencia`), `Observaciones`, `CreatedAt/UpdatedAt`.
- **ImagenesVivienda** 1:N (`ON DELETE CASCADE`): `Orden` INTEGER **1-based**; la portada es el `Orden` más bajo; `findByViviendaId` pagina en lotes de 40 (límite ~10KB de Turso).
- **Mensaje** 1:N (`ON DELETE SET NULL`): leads de contacto (PII). `Estado` (Nuevo/EnCurso/Cerrado), `Pinned` (0/1). Orden: `Pinned DESC, Fecha DESC`.
- **Agentes** (migración 008): `Nombre` UNIQUE, `Activo` (0/1). Alimenta el dropdown de captación. Seed: Aina, Maria, Trini.

**Convenciones SQLite obligatorias:**
- IDs = **uuid v4 en JS** (`uuidv4()`) antes del INSERT, nunca autoincrement.
- Booleanos = **INTEGER 0/1**: escribe `x ? 1 : 0`, lee `Boolean(row.Col)`. Nunca `true/false`.
- Listas (`Caracteristicas`) = `JSON.stringify` en una columna TEXT, `JSON.parse` en `transformRow` (con guard: si len > 5000 devuelve `[]`).
- Fechas = TEXT. App usa `new Date().toISOString()`; `CreatedAt/UpdatedAt` usan `CURRENT_TIMESTAMP` (formato distinto → conviven dos formatos).
- **Enums NO están validados en DB** (son TEXT sin CHECK, salvo `IsDraft` y los dos REAL de %). Valida la pertenencia en la capa app/Zod usando las listas de `Modelo de datos.instructions.md`.
- **Estado de publicación derivado:** no lo fijan los clientes. `ViviendaRepository.create/update` calcula `Published`/`FechaPublicacion` a partir de `isDraft` + `estadoVenta` + `published` (draft ⇒ no publicado; no-draft + `Disponible` ⇒ auto-publica).

**⚠️ Migraciones parcialmente cableadas:** `migrate.js` y `migrationRunner.js` solo crean/registran las tablas base de **001**. Las migraciones **004–008** son módulos `up()/down()` sueltos **no registrados** en ningún runner → hay que ejecutarlas a mano (p. ej. `node run-agents-migration.js` para la 008). Una DB nueva creada solo con `db:migrate` **le faltarán** las columnas de captación/draft/contacto/observaciones y la tabla Agentes. Numeración no contigua (002/003 no existen). Nueva columna ⇒ crea un módulo `NNN_*.js` con `up()/down()` (ALTER en try/catch que traga "duplicate column"; `down()` no puede `DROP COLUMN` en SQLite).

---

## Convenciones de nomenclatura

- **Idioma:** identificadores del **dominio**, comentarios y JSDoc en **español**; nombres estructurales/framework y **mensajes de commit** en inglés; texto de UI en español. Convive un split español/inglés persistente (la entidad es `Vivienda`/`viviendas`, pero el controller/service son `propertyController`/`propertyService` y el repo vuelve a `viviendaRepository`). Cuenta con traducir mentalmente en cada toque al dominio propiedad.
- **Casing:** componentes React y sus carpetas `PascalCase` (extensión **`.jsx`**, no `.js`); hooks `camelCase` con prefijo `use`, uno por fichero; módulos backend `camelCase` + sufijo de rol (`propertyController.js`, `propertyService.js`, `viviendaRepository.js`, `propertyRoutes.js`); tablas y columnas DB `PascalCase`; env vars `UPPER_SNAKE_CASE` (frontend con prefijo `VITE_`); clases CSS `kebab-case` prefijadas por componente (estilo BEM tras refactors).
- **REST:** prefijo `/api/v1`, recursos en plural, `GET` (leer), `POST` (crear + acciones), `PUT` (update), `PATCH` (cambios de estado: `/publish`, `/pin`, `/captacion`), `DELETE`. Acciones no-CRUD como sub-path (`/viviendas/search`, `/json/import`, `/csv/import`, `/parse/idealista/*`).
- **Commits:** Conventional Commits en inglés — `feat:`, `fix:`, `refactor:` (a veces `debug:`).
- **No** crees un segundo fichero para el mismo concern en otro casing (evita repetir el patrón `errorHandler.js` vs `error-handler.js`). **No** commitees scaffolding `Test*`/`Debug*`/`*Simple`.

---

## Sistema de diseño

**Fuente única de tokens:** el bloque `:root` de `frontend/src/styles/index.css` (importado global en `main.jsx`). **Nunca hardcodees** color/tamaño/espaciado — usa siempre las CSS custom properties.

- **Primario (CTA):** `var(--color-primary)` = `#3A8DFF` (hover `#2F78DB`). Ojo: el azul del logo (`#104fb5`) es más oscuro y **no** coincide con el token.
- **Neutros:** rampa `--color-neutral-0..900` (texto = `--color-neutral-600`, headings = `--color-neutral-800`, fondos = `-0`/`-50`).
- **Chips semánticos:** verde `--color-success` (estado/"Vivienda"), amarillo `--color-warning` (tipo/"Piso/Casa"), morado `--color-info` (operación/"Venta"). No inventes colores de chip.
- **Radios:** cards `--radius-lg` (20px), imágenes `--radius-md`, inputs `--radius-sm/md`, botones/chips `--radius-pill`. **Sombras:** solo `--shadow-sm` (reposo) y `--shadow-md` (hover). Espaciado: escala `--spacing-*`.
- **Botones:** reutiliza `.btn` / `.btn--primary` / `.btn--secondary` de `Header.css`.
- **Tipografía:** headings `Poppins`, body `Inter` (declaradas pero **no se cargan**; caen a system-ui — mejorable). Usa tokens `--font-size-*`, nunca px.
- **Responsive:** **desktop-first** con `@media (max-width: 768px)` (móvil) y `480px` (móvil pequeño); `min-width: 769px` solo para activar grids de 2 columnas. `.container` max 1200px.
- **Iconos:** FontAwesome vía `<FontAwesomeIcon icon="fa-solid fa-..." />` (v7 npm). `Icon.jsx`/`IconManager.js` son stubs **vacíos** — no construyas sobre ellos.
- **Accesibilidad:** obligatoria. Anillo global `*:focus-visible`, `.sr-only` para labels ocultas, `alt` descriptivo en toda imagen, roles ARIA según `Diseño.instructions.md` (tabs de operación, `article`+`aria-labelledby` en cards, `aria-live=polite` en errores de formulario).

---

## Seguridad

**Auth0 (`src/middlewares/authMiddleware.js`):** `checkJwt` con `AUTH0_AUDIENCE` + `AUTH0_ISSUER_BASE_URL`, `RS256` fijado (el módulo lanza al importar si faltan → fail-closed). Roles leídos del claim **`https://otp-records.com/roles`** (namespace heredado de otro proyecto; frágil pero funcional), con fallback a `permissions` y `${AUTH0_AUDIENCE}/roles`. Jerarquía: `requireAdmin=['AdminTrimar']` ⊃ `requireSeller=['SellerTrimar','AdminTrimar']` ⊃ `requireCaptador=['CaptadorTrimar','SellerTrimar','AdminTrimar']`.

**Sync JSON — auth dual (`requireApiKeyOrAdmin`):** header `X-API-Key` comparado contra `JSON_IMPORT_API_KEY` (soporta lista separada por comas para rotación) con **SHA-256 + `crypto.timingSafeEqual`** (bien hecho, sin fuga de timing/longitud), **o** JWT Admin. La API key da capacidad Admin completa.

**Otros controles:** rate limiter `RateLimiterMemory` 100 req / 15 min por `req.ip` (⚠️ **inútil en serverless**: memoria por instancia, se resetea por cold start; además `trust proxy` **no** está puesto). Validación con **Zod** (`validationMiddleware` + `schemas/`; `validateUUID` existe). XSS: `SafeHtmlRenderer` usa **DOMPurify** con allowlist (bien); `HtmlContent` usa un sanitizador casero (**reemplázalo por DOMPurify**). El parser Idealista usa jsdom **sin** ejecutar scripts y extrae `textContent` (se guarda como texto plano, no HTML). Helmet con config por defecto.

**⚠️ Riesgos conocidos (arréglalos, no los repliques):**
- **[ALTO] Falta autorización por rol** en las rutas privadas de viviendas y mensajes: solo pasan por `checkJwt`, sin `requireRoles`. **Cualquier usuario autenticado (cualquier rol) puede crear/editar/borrar viviendas y leer/borrar mensajes (PII de clientes).** Añade `requireSeller`/`requireAdmin` a esos routers. (`canModifyProperty` es un stub TODO sin cablear.)
- **[ALTO] `JSON_IMPORT_API_KEY` real (64 hex) commiteado** en `backend/.env.example`. Rótalo y purga de la historia.
- **[ALTO] `backend/local.db.backup` commiteado** (SQLite con posible PII; `.gitignore` no atrapa `*.backup`). Quítalo del árbol e historia.
- **[MEDIO]** el body de 403 y los logs filtran `userRoles`, `userId` (sub) y namespaces (ayuda a sondear privilegios) → strip en prod. CORS de Vercel edge (`Allow-Origin:*` + `Allow-Credentials:true`) contradice el allowlist de Express y es inválido. `propertyController` loguea el body completo al crear. `HtmlContent` sanitizador casero. Sin rate-limit dedicado en los endpoints que envían email (mail-flooding). Endpoint `GET /api/v1/images/debug` **público** filtra config de entorno.
- **[BAJO]** Helmet sin CSP; inyección de HTML en el email de notificación vía `POST /messages` (campos sin escapar); `POST /viviendas/search` sin validar; rutas `/api/v1/parse` probablemente públicas.

**Reglas:** nunca loguees keys/tokens completos; valida con Zod antes de procesar; añade `requireRoles` explícito a toda ruta que mute datos (no confíes en el JSDoc `@access Private`); simula/valida en frontend antes de acciones destructivas.

---

## Variables de entorno

**Backend** (`process.env`, sin config centralizada — añade nuevas a `backend/.env.example`):
`PORT` (8080), `NODE_ENV`, `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` (obligatorias), `AUTH0_AUDIENCE` + `AUTH0_ISSUER_BASE_URL` (obligatorias, el server no arranca sin ellas), `CORS_ORIGINS` (coma-separado), `IMGBB_API_KEY`, `JSON_IMPORT_API_KEY`, `GMAIL_USER` + `GMAIL_APP_PASSWORD` + `GMAIL_FROM_EMAIL` + `GMAIL_FROM_NAME`, `FRONTEND_URL`.
> ⚠️ `backend/.env.example` documenta vars de Gmail **equivocadas** (OAuth2: `GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN/...`). El código usa **App Password** (`GMAIL_USER`/`GMAIL_APP_PASSWORD`). `FRONTEND_URL` no está documentada. `RATE_LIMIT_*` documentadas pero no cableadas.

**Frontend** (`import.meta.env`, prefijo `VITE_` obligatorio): `VITE_API_BASE_URL`, `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE`, `VITE_GOOGLE_MAPS_API_KEY` (pública por diseño → restríngela por referrer en Google Cloud).

---

## Despliegue (Vercel)

Dos proyectos independientes, cada uno con su `vercel.json`:
- **Frontend** (Root Dir = `frontend/`): build estático Vite → `dist/`, rewrite SPA a `/index.html`, headers de seguridad + cache, redirects legacy (`/home→/`, `/properties→/viviendas`, `/sell→/vender`, `/contact→/contacto`).
- **Backend** (Root Dir = `backend/`): función serverless (`backend/api/index.js` re-exporta la app de `src/app.js`), `functions api/**/*.js` (mem 1024MB, maxDuration 30s), rewrite `/(.*)→/api`, CORS edge amplio (en conflicto con el de Express).
- `vercel.json` raíz es un stub vacío. `.vercelignore` raíz excluye `backend/`, `Documentacion`, `*.md`.

---

## Testing

Estado real: **0 tests automatizados**. El backend tiene `vitest` + `supertest` en devDeps y script `test`, pero sin `vitest.config.js` ni ficheros de test. El frontend no tiene tooling de test ni lint.

Al añadir tests (recomendado, empezando por lo sensible: `jsonImportService`, auth, `viviendaRepository`):
- **Backend (Vitest, ESM):** unit de services con repos/DB mockeados; tests de rutas con `supertest` contra `app.js` (se exporta aparte de `server.js`, así que no hace falta servidor real). Sin tests de repos (probarían libSQL, no nuestro código).
- **Frontend:** Vitest + Testing Library; testear hooks (`renderHook` con providers mockeados) y lógica propia, no componentes de librería.

---

## Deuda técnica y trampas conocidas

- **Ficheros muertos (bórralos, no edites el gemelo equivocado):** `backend/src/middlewares/error-handler.js` (vivo: `errorHandler.js`), `backend/src/routes/health.js` (vivo: `healthRoutes.js`), `backend/src/middlewares/debugAuth.js`, `frontend/src/config/auth0Config.js` (vivo: **`auth0.config.js`**), `frontend/src/components/Admin/Properties/PropertyCreatePageSimple.jsx`, y los harness `frontend/src/components/Test{ApiConnection,CreateProperty,ImageUpload}.jsx` + `Auth/Auth0Debug.jsx`.
- **`duplicateCleanupRoutes`/Controller/Service existen pero NO se montan** en `app.js` → feature inalcanzable.
- **Hooks CRUD duplicados y ambos vivos:** `useCreateVivienda.js` (vía `hooks/index.js` + `useViviendaManager`) y `useCreateViviendaSimple.js` (vía `PropertyCreatePage`). Consolídalos.
- **Dos capas de acceso API en frontend** que se solapan y **discrepan en endpoints** (`propertyService` usa `PATCH /{id}/publish`; `usePropertiesApi` usa `POST /{id}/publicar`). Verifica cuál llamas.
- **N+1 deliberado** en `viviendaRepository.findAll` (workaround del bug de Turso con `LIMIT>=7` y columnas grandes): trae IDs y luego un SELECT por fila.
- **FK sin garantía:** `ON DELETE CASCADE/SET NULL` declaradas pero nada hace `PRAGMA foreign_keys=ON` por conexión.
- **Deps sin usar:** `@uiw/react-md-editor`, `quill` (solo se usa `react-quill`), `terser` (Vite usa esbuild), `nodemon` (dev usa `node --watch`).
- **`.gitignore` sucio:** ~30 entradas ad-hoc de ficheros scratch; incluso oculta un fichero fuente real (`frontend/src/services/messageService.js`) y `.github/instructions/*.md`.
