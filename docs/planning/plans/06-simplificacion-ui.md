# Plan 06 — Simplificación de la UI del admin

> Fase: 6 | Status: ✅ Completa a nivel de código (28/28) — pendiente recorrido manual en entorno real | Started: 2026-07-11
> Milestone: Formulario de crear/editar vivienda mucho más fácil y rápido; gestión de mensajes y dashboard simples, honestos y sin ruido.

## Objetivo

Reducir la complejidad de uso del panel admin, con foco en (1) el **formulario de crear/editar viviendas**, (2) la **gestión de mensajes** y (3) el **dashboard**. Análisis hecho con una fan-out de 4 lectores + síntesis (Workflow `analisis-simplificacion-ui`).

## Diagnóstico

La complejidad se concentra en el **form de viviendas** (`PropertyCreatePage`, monolito de ~700 líneas que crea y edita con ~24 campos + 18 cards + imágenes todo expandido, validación ad-hoc tardía, dos caminos de validación y de botones, y código muerto). Segundo foco: el **design system** — `index.css` define tokens `--color-*` pero ~25 CSS usan nombres legacy inexistentes (`--brand-primary`, `--neutral-*`, `--semantic-*`, `--color-text-*`) → colores rotos sin fallback. **Mensajes** y **dashboard** arrastran duplicados/muertos (`pages/admin/*`, hooks zombie) y métricas de dinero engañosas (SUM(Price) por `FechaPublicacion`, no hay fecha de venta real).

Lo que más reduce complejidad de golpe: **aliases de tokens** (arregla ~25 ficheros sin tocar componentes), **borrar duplicados muertos**, **colapsar lo avanzado del form** y **cablear la validación/infra que YA existe** (`useFormValidation`, `CustomSelect`, `ValidationRules`). Casi todo reutilizando piezas existentes, sin librerías nuevas.

## Principios

1. **Reutilizar lo que ya existe** (CustomSelect, useFormValidation, ValidationRules, popups, tokens) antes de crear nada nuevo.
2. **Divulgación progresiva**: mostrar solo lo esencial; colapsar lo avanzado para que el 90% de los casos sea rellenar 4-5 campos.
3. **Un único camino por concepto**: una validación, un sistema de botones, un esquema de tokens, un componente de campo.
4. **Borrar antes que refactorizar**: eliminar ficheros/CSS/hooks muertos reduce ruido con riesgo casi nulo.
5. **Feedback honesto e inline**: errores bajo el campo culpable; estados reales (imágenes, mensajes pendientes) en vez de éxitos falsos o contadores hardcode.
6. **Respetar convenciones del repo**: CSS plano con tokens, folder-per-component, sin dependencias nuevas, incrementos de bajo riesgo primero.

## Tareas (I=impacto / E=esfuerzo / R=riesgo)

### Formulario de viviendas
| # | Tarea | I/E/R | Status |
|---|-------|-------|--------|
| F1 | Eliminar código muerto del form y sus hooks (debug block, console.log, campos fantasma de captación, SimpleTextEditor 0 bytes) | alto/bajo/bajo | ✅ |
| F2 | Divulgación progresiva: colapsar en acordeones las secciones avanzadas (ubicación detallada, clasificación avanzada, características) | alto/medio/bajo | ✅ |
| F3 | Validación inline por campo cableando `useFormValidation` + `ValidationRules` (quitar la ad-hoc de submit) | alto/medio/bajo | ✅ |
| F4 | Reemplazar los 6 `<select>` nativos por `CustomSelect` | medio/bajo/bajo | ✅ |
| F5 | Feedback honesto del flujo de imágenes en 2 fases (no mostrar éxito si fallan; reintento con el id ya creado) | alto/bajo/bajo | ✅ |
| F6 | Deduplicar y adelgazar el CSS del form (un solo sistema de botones, clases muertas, mover reglas de imágenes) | medio/medio/medio | ✅ |
| F7 | Autoguardado de borrador en localStorage con recuperación (namespaced por id) | alto/medio/medio | ✅ |
| F8 | Trocear el monolito en subcomponentes de sección (`sections/`) | medio/medio/bajo | ✅ |
| F9 | Defaults inteligentes + contador de descripción eficiente + toolbar Quill reducida | bajo/bajo/bajo | ✅ |

### Mensajes
| # | Tarea | I/E/R | Status |
|---|-------|-------|--------|
| M1 | Eliminar código muerto/duplicado (`pages/admin/MessagesPage.jsx`, `useContactMessage`, export `useMessage`, CSS de PIN huérfano) | medio/bajo/bajo | ✅ |
| M2 | Adelgazar `useMessages` y quitar la caché/HookStates/isMountedRef; update optimista sin refetch | alto/medio/medio | ✅ |
| M3 | Leído/no leído como toggle real y separado del pipeline; marcar leído al abrir | alto/medio/medio | ✅ |
| M4 | Botón 'Responder' con `mailto` enriquecido (Re:, cita, pasa a EnCurso) | medio/bajo/bajo | ✅ |
| M5 | Rediseñar a patrón lista/detalle (bandeja de entrada) | alto/alto/medio | ✅ |
| M6 | Unificar iconografía FontAwesome + tokens de color | bajo/medio/bajo | ✅ |

### Dashboard
| # | Tarea | I/E/R | Status |
|---|-------|-------|--------|
| D1 | Borrar el dashboard duplicado muerto y su cadena (`pages/admin/Dashboard.jsx`, `components/dashboard/StatCard`+`MonthlyChart`, `SalesSummary/`) | alto/bajo/bajo | ✅ |
| D2 | Reducir a 3-4 métricas reales; quitar las de dinero falsas | alto/bajo/bajo | ✅ |
| D3 | Arreglar enlaces rotos de quick actions y tabla (rutas reales de Admin.jsx) | medio/bajo/bajo | ✅ |
| D4 | Cablear el contador real de mensajes pendientes (`useAdminStats` vía messageService) | alto/medio/bajo | ✅ |
| D5 | Purgar hooks/métodos de servicio/CSS muertos del dashboard | medio/bajo/bajo | ✅ |

### Design system / compartidos
| # | Tarea | I/E/R | Status |
|---|-------|-------|--------|
| X1 | Aliases de compatibilidad de tokens en `index.css` (repara ~25 CSS sin tocar componentes) | alto/bajo/bajo | ✅ |
| X2 | Eliminar ficheros muertos del design system (`Icon.jsx/css` 0 bytes, `ContactForm.module.css` 0 bytes) | bajo/bajo/bajo | ✅ |
| X3 | Ampliar tokens que faltan (sombras, focus-ring, overlay, success-strong) | medio/bajo/bajo | ✅ |
| X4 | Componente `Button` unificado con variantes | alto/medio/medio | ✅ |
| X5 | Componente `FormField` compartido (label + control + error) | alto/medio/medio | ✅ |
| X6 | Modal/Overlay base + spinner único | medio/medio/medio | ✅ |
| X7 | Migrar componentes legacy a `--color-*` y retirar los aliases de X1 | medio/alto/bajo | ✅ |
| X8 | Arreglar los `<i className="fas">` del admin que no pintan (el proyecto no carga el webfont FA, solo el SVG core): convertir a `<FontAwesomeIcon>` o activar `dom.watch()`. Descubierto en M6; requiere verificación visual | medio/medio/medio | ✅ |

## Primera tanda (alto impacto / bajo riesgo — implementar ya)

**X1 · D1 · F1 · D2 · F5 · F2 · F3** — en este orden. Empieza por deletes/aliases (riesgo casi nulo), sigue por el feedback honesto de imágenes y termina por los dos cambios estrella de UX del form (colapsado + validación inline).

## Riesgos

- Verificar con grep que los "muertos" no tienen imports (incluidos barrels `index.js`) antes de borrar.
- X1 puede exponer un color antes invisible: revisar visualmente popups, ErrorMessage y RichTextEditor.
- F3 cambia qué se considera válido: probar crear y editar de punta a punta.
- F7 (autoguardado) debe namespacear la clave por id y limpiar tras submit correcto.
- D2/D5 no deben romper endpoints backend aún referenciados (`/property-types`, `/locations`): comprobar consumidores.
- X4/X5/X6 tocan muchos consumidores: incrementales y fuera de la primera tanda.
- Sin librerías nuevas: CSS plano con tokens, folder-per-component, patrones existentes.

## Completion log
| Date | Task | Notes |
|------|------|-------|
| 2026-07-11 | Plan creado | Análisis vía Workflow `analisis-simplificacion-ui` (4 lectores + síntesis). 27 tareas priorizadas |
| 2026-07-11 | X1 | Aliases legacy→`--color-*` en index.css (29 tokens rotos reparados). `9afcf72` |
| 2026-07-11 | D1/F1 | Dashboard duplicado + SimpleTextEditor borrados; 26 console.log y campos fantasma fuera. `9afcf72` |
| 2026-07-11 | D2/D3 | Dashboard con 4 métricas reales (sin dinero falso); enlaces rotos arreglados. `38c93fc` |
| 2026-07-11 | F5 | Feedback honesto de imágenes (variante warning + reintento). `cabd97f` |
| 2026-07-11 | F2 | Divulgación progresiva con acordeones `<details>`. `c8c0524` |
| 2026-07-11 | F3 | Validación inline (ValidationRules/FormValidator); lógica verificada por test node. `41c0833` |
| 2026-07-11 | M1/M2 | Mensajes muertos borrados; `useMessages` adelgazado (sin caché/HookStates/safe-setters; AbortController real; update optimista; stats). `dfa11a4` |
| 2026-07-11 | M3/M4/M5/M6 | `MessagesPage` reescrita a bandeja lista/detalle: leído/no leído reversible + leído al abrir, Responder (mailto), iconos FontAwesome + tokens. `9537caf` |
| 2026-07-11 | X2/D5/D4 | Muertos design-system/dashboard borrados; `useAdminStats` con conteo real de mensajes pendientes (badge + MetricCard clicable) vía useApi. `94d9363` |
| 2026-07-11 | F4/F9 | 6 selects → CustomSelect; toolbar Quill mínima; default tipoAnuncio='Venta'; contador de descripción memoizado. `84bc48d` |
| 2026-07-11 | X3/F7 | Tokens shadow-modal/overlay/focus-ring/success-strong; autoguardado del form en localStorage con recuperación. `9d7c103` |
| 2026-07-11 | X4/X5/X6/F6 | Componentes compartidos Button/FormField/Modal; popups sobre Modal; purga de ~326 líneas de CSS muerto del form. `30fce2f` |
| 2026-07-11 | X8 | `<i class="fas">` del admin → `<FontAwesomeIcon>` (no hay webfont FA); iconos registrados. `45a5744` |
| 2026-07-11 | X7 | 46 CSS migrados legacy→`--color-*` (visualmente idéntico); alias sin uso retirados; verificado sin tokens indefinidos. `2a8d03b` |
| 2026-07-11 | F8/X5 | Form troceado en `sections/` (BasicInfo/Features/Location/Classification) adoptando FormField; PropertyCreatePage 800→508 líneas. `44ed228` |
| — | Estado | **28/28 tareas completas a nivel de código.** Pendiente: recorrido manual en entorno real (Auth0+Turso) que no pude ejecutar; toda la verificación fue build + lógica |
