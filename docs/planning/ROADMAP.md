# FincasTrimarWeb — Project Roadmap

> Last updated: 2026-07-15

Portal inmobiliario ya funcional. El roadmap prioriza **hardening → limpieza → calidad → producto**.

## Phases

| # | Fase | Status | Plan | Milestone |
|---|------|--------|------|-----------|
| 1 | Seguridad | ⬜ Ready | [01-seguridad.md](plans/01-seguridad.md) | Sin fallos de seguridad ALTOS (authz por rol, secretos rotados/fuera del repo) |
| 2 | Deuda técnica | ⬜ Ready | [02-deuda-tecnica.md](plans/02-deuda-tecnica.md) | Sin código muerto ni duplicados; migraciones cableadas; comandos arreglados |
| 3 | Calidad | 🔒 Blocked | [03-calidad.md](plans/03-calidad.md) | Lint en frontend + red mínima de tests automatizados |
| 4 | Producto | 🔄 In Progress | [04-producto.md](plans/04-producto.md) | Backlog de features y mejoras UX/SEO |
| 5 | Simplificación CRUD | ✅ Casi completa | [05-simplificacion-crud.md](plans/05-simplificacion-crud.md) | Panel admin reducido a: CRUD de viviendas + mensajes + usuarios + configuración. Captación eliminada (pendiente recorrido manual F.2) |
| 6 | Simplificación UI | ✅ Casi completa | [06-simplificacion-ui.md](plans/06-simplificacion-ui.md) | Form de crear/editar vivienda mucho más fácil; mensajes y dashboard simples y honestos. 27 tareas priorizadas |

## Current focus

**Fase 4 — Producto**: la API externa de sincronización JSON (`/api/v1/json`) se restaura
(la Fase 5 la había retirado como huérfana del panel) y admite tipos de inmueble
no-vivienda (Terreno, Local/Comercio, Nave…). El panel sigue simplificado: el import
externo va por API key, no por UI.
(Fase 1 — Seguridad sigue siendo la prioridad estructural pendiente.)

## Dependency graph

```
Fase 1 — Seguridad ─┐
Fase 2 — Deuda técnica ─┼──► Fase 3 — Calidad (lint + tests sobre código ya limpio)
Fase 4 — Producto (en paralelo, según prioridad de negocio)
Fase 5 — Simplificación CRUD (elimina captación; solapa con Fase 2 en borrado de muertos)
```
