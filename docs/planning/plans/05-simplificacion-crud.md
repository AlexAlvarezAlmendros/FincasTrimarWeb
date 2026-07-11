# Plan 05 — Simplificación del panel admin (CRUD de viviendas)

> Fase: 5 de 5 | Status: ✅ Casi completa (pendiente F.2 recorrido manual + B.4 opcional) | Started: 2026-07-11
> Milestone: Panel admin reducido a **CRUD de viviendas + Mensajes + Usuarios + Configuración**. Todo el flujo de **captación** eliminado y el alta de viviendas simplificada al máximo.

## Objetivo

Hacer que el CRUD de viviendas sea **mucho más simple**: un panel con una lista de viviendas y crear / editar / publicar-despublicar / eliminar, más mensajes, usuarios y configuración. Se elimina por completo el flujo de captación (pensado para el rol Captador) y las herramientas de importación masiva.

## Decisiones de alcance (confirmadas con el usuario 2026-07-11)

| Tema | Decisión |
|------|----------|
| **Borradores** | Conservar el estado borrador/publicado como **toggle publicar/despublicar en la lista**. Se elimina la pantalla dedicada `DraftsPage` y el badge del sidebar. |
| **Import masivo JSON** (`JsonBulkImport`, dentro de crear vivienda) | **Eliminar.** CRUD 100% manual. Revierte la UI de los 2 últimos commits en el frontend. |
| **Roles de acceso al panel** | **Solo `AdminTrimar`.** Se retira `SellerTrimar` y `CaptadorTrimar` del gate del área `/admin`. |
| **Página pública "Vender"** | **Se conserva.** No es captación de admin: es un formulario de lead que va a `/api/v1/messages/send-contact`. Independiente del CRUD. |

## Dependencias
- **Requiere:** ninguna (se puede empezar ya).
- **Desbloquea:** simplifica la Fase 3 (menos superficie que lintar/testear) y absorbe parte de la Fase 2 (borrado de código muerto).
- **Backend (hecho en seguimiento):** ✅ retiradas las rutas huérfanas `/api/v1/json`, `/api/v1/csv`, `/api/v1/duplicates`, `GET /viviendas/captacion`, `GET /viviendas/drafts` y `PATCH /viviendas/:id/captacion`, con sus cadenas routes→controller→service→repo y los schemas asociados. Se reconcilió la visibilidad de borradores (`IsDraft=1`) cableando `includeDrafts` en el listado. Commit `b8a2972`.

---

## Tasks

### A · Eliminar el subgrafo de captación
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| A.1 | Borrar componentes de captación: `CaptacionPage.jsx/.css`, `CaptacionEditModal.jsx/.css`, `CaptacionPropertyCard.jsx`, `JsonImportButton.jsx/.css` | ✅ Done | Subgrafo cerrado que cuelga de `Admin.jsx:40` |
| A.2 | Borrar `DraftsPage.jsx/.css` (borradores pasan a toggle en la lista, ver C) | ✅ Done | Cuelga de `Admin.jsx:45` |
| A.3 | `Admin.jsx`: quitar imports de `CaptacionPage`/`DraftsPage` (líneas 11-12) y las rutas `viviendas/captacion` (40) y `viviendas/borradores` (45) | ✅ Done | — |
| A.4 | `Admin.jsx`: eliminar `DashboardIndex` con el redirect a captación (líneas 20-25); el index del admin pasa a ser siempre `<AdminDashboard />` | ✅ Done | Sin captadores no hay a dónde redirigir |
| A.5 | `AdminSidebar.jsx`: quitar el item `captacion-direct` (18-23), el subitem "Captación" (35) y el subitem "Borradores" (34) con su badge | ✅ Done | — |

### B · Roles → solo AdminTrimar
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| B.1 | `App.jsx:57`: gate del área `/admin` → `roles={["AdminTrimar"]}` | ✅ Done | — |
| B.2 | `AdminLayout.jsx:14,27`: simplificar el chequeo de acceso a solo `isAdmin` (quitar `isSeller`/`isCaptador`) | ✅ Done | — |
| B.3 | `Admin.jsx`: como todo el área es admin-only, se puede retirar el wrapper `adminOnly(...)` por ruta y aplicar el gate una sola vez (o dejarlo, es defensivo). Decidir al implementar | ✅ Done | Simplificación opcional |
| B.4 | `useUserRoles.js`: (opcional) podar `isSeller`/`isCaptador`/`isUser` si dejan de usarse tras B.1–B.2 | ⬜ Pendiente | No podado: se dejaron intactos (inofensivos). Limpieza opcional futura |

### C · Borradores → toggle en la lista
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| C.1 | `PropertiesListPage.jsx`: garantizar acción **publicar/despublicar** por fila usando `propertyService.togglePublish` (ya existe, `:326`) y mostrar el estado publicado/borrador; añadir filtro simple por estado si aporta | ✅ Done | Sustituye a la pantalla Borradores |
| C.2 | Quitar `draftsCount`: de `AdminLayout.jsx` (props al sidebar) y del cálculo en `useAdminStats.js` (`getDrafts`) | ✅ Done | — |
| C.3 | `propertyService.js`: podar métodos huérfanos `getDrafts` (:703), `getCaptacionProperties` (:760), `updateCaptacionData` (:812) | ✅ Done | Conservar create/update/delete/togglePublish/deletePropertyImage |

### D · Eliminar import masivo JSON del alta
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| D.1 | `PropertyCreatePage.jsx`: quitar el import de `JsonBulkImport` (:13) y su uso en el formulario | ✅ Done | El alta queda 100% manual |
| D.2 | Borrar la carpeta `JsonBulkImport/` (`.jsx`, `.css`, `index.js`) | ✅ Done | — |

### E · Limpieza de código muerto (aprovechada de Fase 2)
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| E.1 | Borrar componentes ya muertos hoy: `PropertyCreatePageSimple.jsx`, `PropertiesManager.jsx/.css`, `PropertyForm.jsx/.css`, `TestCreateProperty.jsx` | ✅ Done | Nadie los importa |
| E.2 | Borrar botones muertos: `CsvImportButton.jsx/.css`, `DuplicateCleanupButton.jsx` | ✅ Done | Sin importadores |
| E.3 | Borrar hooks muertos: `useAdminApi.js` (cae con `PropertyForm`), y la cadena `useCreateVivienda.js` + `useViviendaManager.js`; limpiar reexports en `hooks/index.js` | ✅ Done | Verificar `useFormValidation` antes de tocar |
| E.4 | Consolidar el alta en un único hook: el activo es `useCreateViviendaSimple` (usado por `PropertyCreatePage`). Dejarlo como único hook de creación (opcional: renombrar a `useCreateVivienda` para claridad) | ✅ Done | Cierra la deuda 2.1 |

### F · Verificación
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| F.1 | `npm run build` del frontend sin imports rotos; grep de referencias colgantes a lo borrado | ✅ Done | Build OK: 356 módulos, sin errores. Sin refs colgantes |
| F.2 | Recorrido manual: crear vivienda · editar · publicar/despublicar · eliminar · mensajes · usuarios · configuración | ⬜ Pendiente | Requiere levantar frontend+backend con datos; no ejecutado en esta sesión |

---

## Componentes que se CONSERVAN (el CRUD final)

- `PropertiesListPage.jsx` — lista + acciones (editar, publicar/despublicar, eliminar).
- `PropertyCreatePage.jsx` — crear y editar (rutas `viviendas/crear` y `viviendas/:id/edit`).
- `useCreateViviendaSimple`, `useImageManager`, `ImageUploadManager/`, `propertyService` (podado).
- `MessagesPage`, `UsersPage`, `SettingsPage`, `AnalyticsPage`, `AdminDashboard`.
- Sitio público completo, incluida la página **Vender**.

## Riesgos / cuidado
- No romper `useAgents` → lo usa `UsersPage` (queda vivo aunque lo usaran los modales de captación).
- `togglePublish` debe existir y funcionar en backend para C.1 (verificar endpoint `/publish` vs `/publicar` — hay discrepancia conocida entre `propertyService` y la vieja capa API; ver deuda 2.2).
- Tras podar roles (B.4), confirmar que ningún componente vivo importa `isSeller`/`isCaptador`.
- La API backend `/api/v1/json`, `/csv`, `/duplicates` queda huérfana desde el front: anotada como decisión backend aparte, no se toca aquí.

## Orden sugerido de commits
1. `refactor: eliminar flujo de captación del panel admin` (A + B)
2. `refactor: borradores como toggle en la lista de viviendas` (C)
3. `refactor: quitar import masivo JSON del alta de viviendas` (D)
4. `chore: eliminar código muerto del CRUD de viviendas` (E)

## Completion log
| Date | Task | Notes |
|------|------|-------|
| 2026-07-11 | Plan creado | Análisis del frontend + decisiones de alcance confirmadas con el usuario |
| 2026-07-11 | A + B + C + D | Captación eliminada; panel a AdminTrimar; borradores como toggle en el listado; import JSON quitado del alta. Commit `c6c12a3` |
| 2026-07-11 | E | Código muerto borrado (6 componentes + 3 hooks). Commit `9b6569b` |
| 2026-07-11 | F.1 | `vite build` verde (356 módulos, 0 errores). Sin referencias colgantes |
| 2026-07-11 | Backend | Rutas huérfanas (json/csv/duplicates/captación/drafts) retiradas + fix visibilidad de borradores (`includeDrafts`). `node --check` OK en 6 ficheros, build frontend verde. Commit `b8a2972` |
