# FincasTrimarWeb — Project Roadmap

> Last updated: 2026-07-11

Portal inmobiliario ya funcional. El roadmap prioriza **hardening → limpieza → calidad → producto**.

## Phases

| # | Fase | Status | Plan | Milestone |
|---|------|--------|------|-----------|
| 1 | Seguridad | ⬜ Ready | [01-seguridad.md](plans/01-seguridad.md) | Sin fallos de seguridad ALTOS (authz por rol, secretos rotados/fuera del repo) |
| 2 | Deuda técnica | ⬜ Ready | [02-deuda-tecnica.md](plans/02-deuda-tecnica.md) | Sin código muerto ni duplicados; migraciones cableadas; comandos arreglados |
| 3 | Calidad | 🔒 Blocked | [03-calidad.md](plans/03-calidad.md) | Lint en frontend + red mínima de tests automatizados |
| 4 | Producto | ⬜ Ready | [04-producto.md](plans/04-producto.md) | Backlog de features y mejoras UX/SEO |
| 5 | Simplificación CRUD | 🔄 In Progress | [05-simplificacion-crud.md](plans/05-simplificacion-crud.md) | Panel admin reducido a: CRUD de viviendas + mensajes + usuarios + configuración. Captación eliminada |

## Current focus

**Fase 5 — Simplificación del panel admin** (petición directa de negocio: hacer el CRUD de viviendas mucho más simple eliminando todo el flujo de captación). Absorbe de paso parte de la limpieza de código muerto de la Fase 2.

## Dependency graph

```
Fase 1 — Seguridad ─┐
Fase 2 — Deuda técnica ─┼──► Fase 3 — Calidad (lint + tests sobre código ya limpio)
Fase 4 — Producto (en paralelo, según prioridad de negocio)
Fase 5 — Simplificación CRUD (elimina captación; solapa con Fase 2 en borrado de muertos)
```
