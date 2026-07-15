# Plan 04 — Producto

> Fase: 4 de 4 | Status: 🔄 In Progress | Started: 2026-07-15
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

## Completion log
| Date | Task | Notes |
|------|------|-------|
| 2026-07-15 | 1.1, 1.2 | Import JSON y CRUD admiten Terreno/Local(Comercio)/Nave/Oficina/Garaje/Trastero/Edificio. Inferencia: título > tipo_inmueble, primera keyword con límite de palabra. mergeForUpdate limpia TipoVivienda al pasar a no-vivienda. Helper legacy inferirTipoVivienda eliminado (sustituido por inferirTiposDesdeInmueble). |
| 2026-07-15 | 1.1 | API `/api/v1/json` restaurada tras el rebase sobre la Fase 5 (que la había retirado como huérfana del panel): rutas + controller remontados en app.js antes del checkJwt global (auth dual X-API-Key/JWT Admin). Smoke test HTTP: 200 con key, 401 sin key. El import externo va solo por API, sin UI en el panel. |
