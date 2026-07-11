# Plan 05 — Simplificación del panel admin (CRUD de viviendas)

> Fase: 5 de 5 | Status: 🔄 In Progress | Started: 2026-07-11
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
- **Nota backend (fuera de scope frontend):** al eliminar `JsonImportButton` + `JsonBulkImport`, la API `/api/v1/json/*` (`jsonImportService.js`, con cambios sin commitear en el working tree original) queda **sin consumidor en el front**. Igual ocurre con `/api/v1/csv/*` y `/api/v1/duplicates/*` (ya muertos en front). Decidir en una tarea aparte si se retiran también del backend. Este plan solo toca frontend.

---

## Tasks

### A · Eliminar el subgrafo de captación
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| A.1 | Borrar componentes de captación: `CaptacionPage.jsx/.css`, `CaptacionEditModal.jsx/.css`, `CaptacionPropertyCard.jsx`, `JsonImportButton.jsx/.css` | ⬜ Ready | Subgrafo cerrado que cuelga de `Admin.jsx:40` |
| A.2 | Borrar `DraftsPage.jsx/.css` (borradores pasan a toggle en la lista, ver C) | ⬜ Ready | Cuelga de `Admin.jsx:45` |
| A.3 | `Admin.jsx`: quitar imports de `CaptacionPage`/`DraftsPage` (líneas 11-12) y las rutas `viviendas/captacion` (40) y `viviendas/borradores` (45) | ⬜ Ready | — |
| A.4 | `Admin.jsx`: eliminar `DashboardIndex` con el redirect a captación (líneas 20-25); el index del admin pasa a ser siempre `<AdminDashboard />` | ⬜ Ready | Sin captadores no hay a dónde redirigir |
| A.5 | `AdminSidebar.jsx`: quitar el item `captacion-direct` (18-23), el subitem "Captación" (35) y el subitem "Borradores" (34) con su badge | ⬜ Ready | — |

### B · Roles → solo AdminTrimar
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| B.1 | `App.jsx:57`: gate del área `/admin` → `roles={["AdminTrimar"]}` | ⬜ Ready | — |
| B.2 | `AdminLayout.jsx:14,27`: simplificar el chequeo de acceso a solo `isAdmin` (quitar `isSeller`/`isCaptador`) | ⬜ Ready | — |
| B.3 | `Admin.jsx`: como todo el área es admin-only, se puede retirar el wrapper `adminOnly(...)` por ruta y aplicar el gate una sola vez (o dejarlo, es defensivo). Decidir al implementar | ⬜ Ready | Simplificación opcional |
| B.4 | `useUserRoles.js`: (opcional) podar `isSeller`/`isCaptador`/`isUser` si dejan de usarse tras B.1–B.2 | ⬜ Ready | Verificar que `UsersPage` no dependa de ellos antes de podar |

### C · Borradores → toggle en la lista
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| C.1 | `PropertiesListPage.jsx`: garantizar acción **publicar/despublicar** por fila usando `propertyService.togglePublish` (ya existe, `:326`) y mostrar el estado publicado/borrador; añadir filtro simple por estado si aporta | ⬜ Ready | Sustituye a la pantalla Borradores |
| C.2 | Quitar `draftsCount`: de `AdminLayout.jsx` (props al sidebar) y del cálculo en `useAdminStats.js` (`getDrafts`) | ⬜ Ready | — |
| C.3 | `propertyService.js`: podar métodos huérfanos `getDrafts` (:703), `getCaptacionProperties` (:760), `updateCaptacionData` (:812) | ⬜ Ready | Conservar create/update/delete/togglePublish/deletePropertyImage |

### D · Eliminar import masivo JSON del alta
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| D.1 | `PropertyCreatePage.jsx`: quitar el import de `JsonBulkImport` (:13) y su uso en el formulario | ⬜ Ready | El alta queda 100% manual |
| D.2 | Borrar la carpeta `JsonBulkImport/` (`.jsx`, `.css`, `index.js`) | ⬜ Ready | — |

### E · Limpieza de código muerto (aprovechada de Fase 2)
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| E.1 | Borrar componentes ya muertos hoy: `PropertyCreatePageSimple.jsx`, `PropertiesManager.jsx/.css`, `PropertyForm.jsx/.css`, `TestCreateProperty.jsx` | ⬜ Ready | Nadie los importa |
| E.2 | Borrar botones muertos: `CsvImportButton.jsx/.css`, `DuplicateCleanupButton.jsx` | ⬜ Ready | Sin importadores |
| E.3 | Borrar hooks muertos: `useAdminApi.js` (cae con `PropertyForm`), y la cadena `useCreateVivienda.js` + `useViviendaManager.js`; limpiar reexports en `hooks/index.js` | ⬜ Ready | Verificar `useFormValidation` antes de tocar |
| E.4 | Consolidar el alta en un único hook: el activo es `useCreateViviendaSimple` (usado por `PropertyCreatePage`). Dejarlo como único hook de creación (opcional: renombrar a `useCreateVivienda` para claridad) | ⬜ Ready | Cierra la deuda 2.1 |

### F · Verificación
| # | Tarea | Status | Notas |
|---|-------|--------|-------|
| F.1 | `npm run build` del frontend sin imports rotos; grep de referencias colgantes a lo borrado | ⬜ Ready | — |
| F.2 | Recorrido manual: crear vivienda · editar · publicar/despublicar · eliminar · mensajes · usuarios · configuración | ⬜ Ready | Skill `verify` / `run` |

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
