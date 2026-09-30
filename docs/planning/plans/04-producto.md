# Plan 04 — Producto

> Fase: 4 de 4 | Status: 🔄 In Progress | Started: 2026-07-15 | Last updated: 2026-09-30
> Milestone: Backlog de features y mejoras UX/SEO

## Dependencias
- **Requiere:** ninguna (en paralelo con Fase 1/2 según prioridad de negocio)
- **Desbloquea:** —

## Tasks

### Tipos de inmueble
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| 1.1 | API externa de import/edición (`/api/v1/json/import`) debe admitir inmuebles no-vivienda (Terreno, Local/Comercio, Nave, Oficina, Garaje…): ampliar keywords de inferencia, matching por primera coincidencia con límite de palabra, formato legacy también inferido, limpiar `tipoVivienda` obsoleto en updates | ✅ Done | Título prioritario sobre tipo_inmueble scrapeado (venía mal etiquetado); probado con los 8 inmuebles del JSON real |
| 1.2 | CRUD manual (`POST/PUT /api/v1/viviendas`): aceptar `tipoInmueble`/`tipoVivienda` null en Zod para inmuebles sin tipo de vivienda | ✅ Done | `.nullable()` en ambos campos de propertySchema |

### Edición de viviendas (repaso)
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| 2.1 | Botón «Actualizar vivienda» que no hace nada: causa raíz + fix | ✅ Done | La validación abortaba en silencio: descripción medida en HTML crudo (>2000) y límites numéricos/`max` nativo que bloqueaban datos importados; solo nombre/precio pintaban error. Ahora texto plano (máx. 5000), `noValidate`, error inline en todos los campos y resumen junto a los botones. `useApi` lanza `Error` con `status` (antes «Error inesperado») |
| 2.2 | Auto-scroll al reordenar imágenes arrastrando (grids de guardadas y pendientes) | ✅ Done | Hook `useDragAutoScroll` (dragover+dragenter+drag, franja que descuenta la cabecera sticky, velocidad proporcional). Además: indicador de inserción, drop en huecos, botones ← ★ → accesibles, reordenación en cola sin popup bloqueante y con rollback + aviso |
| 2.3 | Repaso del flujo de edición: bugs encontrados en la revisión | ✅ Done | Editar ya no republica/despublica ni reinicia FechaPublicacion; «Guardar borrador» ya no publica; sin defaults inventados (Terreno→«Piso»); vaciar campos se guarda; imágenes nuevas al final; fallo de subida detectado; sin bucle si falla la carga; autoguardado sin banner falso; confirmación al borrar imagen; rate limit por usuario autenticado |
| 2.4 | Anónimos pueden ver viviendas despublicadas y borradores (`GET /viviendas?published=false` y ficha por id sin filtrar `Published`) | ⬜ Ready | Preexistente, detectado en el repaso. Pesa más ahora que «Despublicar» funciona. Encaja con Fase 1 (seguridad) |
| 2.5 | «Marcar como reservada» en el listado sobre una vivienda en estado de captación la pasa a Disponible y la publica | ⬜ Ready | Preexistente (HEAD hacía lo mismo) |
| 2.6 | `sitemapController` hace `forEach` sobre el objeto que devuelve `findAll`: el sitemap falla | ⬜ Ready | Preexistente |
| 2.7 | Características del seed fuera del enum (`Finca`, `Pozo`): el PUT da 400 (ahora con el detalle visible) y el selector no permite quitarlas | ⬜ Ready | Decidir si se añaden al enum o se migran los datos |
| 2.8 | Rate limiter en memoria por instancia en Vercel (no compartido entre instancias); `searchProperties` del admin sigue sin Bearer | ⬜ Ready | Mejora de infraestructura, no urgente |

### Listado de viviendas del admin
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| 3.1 | Paginación en `/admin/viviendas` (hoy solo se ven las 10 primeras): controles, tamaño de página, página en la URL y volver a la misma página tras editar | ✅ Done | Componente compartido `common/Pagination` (elipsis, «Mostrando X–Y de Z», 10/25/50, `aria-disabled` para no perder el foco). Filtros↔URL; Editar→Volver regresa a la misma página (`navigate(-1)`). `useViviendas`: descarta respuestas obsoletas (requestId + `signal` real a `fetch`) y cancela el debounce pendiente |
| 3.2 | Filtros del listado sin efecto: el backend ignora `estadoVenta` y `sortBy`, «Más antiguas» no existe; contador lee `totalItems` (backend devuelve `total`); cabecera lee `search` en vez de `q` | ✅ Done | Listas blancas y saneado de filtros en `propertyService.searchProperties` (común a GET y POST /search); los select ya no esperan el debounce |
| 3.3 | Orden determinista para paginar (desempate en `ORDER BY`) y `page`/`pageSize` acotados en la API (una consulta por vivienda de la página) | ✅ Done | Desempate `CreatedAt, Id` en el sentido del orden; `pageSize` 1–50 y `page` 1–100000 (antes un page enorme daba 500) |

### Formato de las descripciones importadas
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| 5.1 | El import (`/api/v1/json/import`) formatea la descripción: párrafos, listas y subtítulos en HTML compatible con Quill; repara el texto «pegado» que manda el bot (sin saltos de línea); quita «Leer comentario completo»; escapa HTML. Descripción corta desde la primera línea | ✅ Done | `utils/descriptionFormatter.js` (20 tests). La reparación de texto pegado solo se aplica si no hay ningún salto de línea; no parte números, unidades («90m2»), abreviaturas ni siglas. HTML verificado en Quill (21/22 idénticos; el otro solo fusiona dos listas seguidas) |
| 5.2 | Script para reformatear las descripciones que ya hay en la BD (simulación por defecto, copia de seguridad y restauración) | 🔄 In Progress | Script hecho y probado (`npm run db:reformat-descriptions`). **Falta ejecutarlo en producción** tras desplegar el backend. Solo toca descripciones de un único bloque; la corta solo se regenera si salía de la descripción |
| 5.3 | Estilos de la descripción en la ficha: sin sangría de primera línea (choca con listas y subtítulos) | ✅ Done | Además, en móvil (≤768px) alineado a la izquierda: justificado dejaba huecos grandes |
| 5.4 | (Repo HomeScrapper) El scraper de la agencia conserva los saltos de línea de la descripción y no captura el botón «Leer comentario completo» | ✅ Done | Rama `fix/descripcion-con-formato` de HomeScrapper (2346 tests OK). Pendiente de subir y desplegar en la máquina del bot; con él, cada ejecución diaria reescribe las descripciones con el texto original |
| 5.5 | La API pública (`GET /viviendas`) devuelve campos internos: `observaciones`, `telefonoContacto`, `nombreContacto`, `comisionGanada`, `captadoPor`, `porcentajeCaptacion` | ⬜ Ready | Detectado al revisar las descripciones. Hoy ninguna vivienda publicada los tiene rellenos salvo `observaciones`, pero se filtrarían en cuanto se rellenen. Encaja con 2.4 y la Fase 1 |

## Completion log
| Date | Task | Notes |
|------|------|-------|
| 2026-07-15 | 1.1, 1.2 | Import JSON y CRUD admiten Terreno/Local(Comercio)/Nave/Oficina/Garaje/Trastero/Edificio. Inferencia: título > tipo_inmueble, primera keyword con límite de palabra. mergeForUpdate limpia TipoVivienda al pasar a no-vivienda. Helper legacy inferirTipoVivienda eliminado (sustituido por inferirTiposDesdeInmueble). |
| 2026-07-15 | 1.1 | API `/api/v1/json` restaurada tras el rebase sobre la Fase 5 (que la había retirado como huérfana del panel): rutas + controller remontados en app.js antes del checkJwt global (auth dual X-API-Key/JWT Admin). Smoke test HTTP: 200 con key, 401 sin key. El import externo va solo por API, sin UI en el panel. |
| 2026-09-25 | 2.1, 2.2, 2.3 | Repaso de la edición de viviendas (investigación con verificación adversarial + 3 implementadores + revisión + crítica final). Verificado con build, E2E Playwright con drags reales de Blink (34/34 a 1440×900 y 390×844, también con `.admin-content` como contenedor de scroll), E2E del formulario con la API interceptada y tests de backend sobre SQLite local (47 + 17 OK). Pendiente: recorrido manual en Chrome/Firefox reales con Auth0 + Turso. Hallazgos preexistentes anotados como 2.4–2.8 |
| 2026-09-25 | 3.1, 3.2, 3.3 | Paginación del listado del admin. Verificado con E2E Playwright sobre `Admin.jsx` real y API simulada (153/154; el único fallo es una expectativa obsoleta del halo de foco, sustituido por el anillo global con contraste 3,09:1), suite del revisor 16/16, humo de Home/Listado públicos con el hook compartido y backend en SQLite local (98 + 47 + 11 OK). Preexistente fuera de alcance: `imageCount` del listado es un stub |
| 2026-09-30 | 5.1, 5.3, 5.4 | Descripciones importadas con formato. Causa raíz en el bot (HomeScrapper): `get_text(strip=True)` + `limpiar_texto` perdían los saltos y el selector cogía el botón «Leer comentario completo». Web: formateador en el import + reparación heurística del texto pegado, probado sobre las 22 descripciones publicadas, import E2E en SQLite local (creación y actualización), capturas en escritorio y móvil, ida y vuelta por Quill y build del frontend. Contenido de origen a revisar en Idealista: «Piso en venta en Òdena» incluye tres variantes de ChatGPT («2. Versión corta para redes sociales…») y «Piso en venta en Centro» (Vidreres) tiene un «[X]%» sin rellenar |
