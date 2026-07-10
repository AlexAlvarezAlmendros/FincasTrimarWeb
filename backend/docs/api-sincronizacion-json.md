# API de sincronización de inmuebles (JSON)

API para **crear o actualizar inmuebles de forma masiva** desde un sistema externo
(feed de agencia, CRM, scraper, etc.). Funciona como **upsert**: los inmuebles
nuevos se crean y los que ya existen se actualizan, identificándolos por su
**URL de referencia**.

- **Base URL:** `https://<tu-dominio>/api/v1/json`
- **Formato:** JSON (`Content-Type: application/json`)
- **Autenticación:** API key (`X-API-Key`) o JWT de administrador (Auth0)
- **Tamaño máximo de petición:** 10 MB

---

## Índice

1. [Autenticación](#autenticación)
2. [Endpoints](#endpoints)
   - [POST /import — Crear o actualizar](#post-import--crear-o-actualizar)
   - [POST /validate — Validar sin persistir](#post-validate--validar-sin-persistir)
3. [Formatos de entrada aceptados](#formatos-de-entrada-aceptados)
4. [Campos del inmueble](#campos-del-inmueble)
5. [Lógica de upsert (crear vs editar)](#lógica-de-upsert-crear-vs-editar)
6. [Respuesta](#respuesta)
7. [Códigos de error](#códigos-de-error)
8. [Ejemplos completos](#ejemplos-completos)
9. [Límites y buenas prácticas](#límites-y-buenas-prácticas)

---

## Autenticación

El endpoint admite **dos métodos** (basta con uno):

### 1. API key (integraciones externas — recomendado)

Envía la clave en la cabecera HTTP:

```
X-API-Key: <tu-clave>
```

- La clave se configura en el backend con la variable de entorno
  `JSON_IMPORT_API_KEY`.
- Admite **varias claves separadas por comas** para rotación sin downtime:
  `JSON_IMPORT_API_KEY=clave_nueva,clave_antigua`.
- La comparación se hace en **tiempo constante** (hash SHA-256 + `timingSafeEqual`).

### 2. JWT de administrador (panel interno)

Usuarios del panel autenticados con Auth0 y rol `AdminTrimar`:

```
Authorization: Bearer <access_token>
```

Si no se aporta ninguna credencial válida, la respuesta es `401 UNAUTHORIZED`.

---

## Endpoints

### POST /import — Crear o actualizar

Procesa un lote (o un único inmueble) y realiza el upsert en la base de datos.

```
POST /api/v1/json/import
```

| Cabecera        | Valor                          |
| --------------- | ------------------------------ |
| `Content-Type`  | `application/json`             |
| `X-API-Key`     | `<tu-clave>` (o `Authorization: Bearer <jwt>`) |

**Cuerpo:** uno de los [formatos de entrada](#formatos-de-entrada-aceptados).

---

### POST /validate — Validar sin persistir

Comprueba que la estructura del JSON es correcta **sin escribir nada** en la base
de datos. Útil para previsualizar antes de importar.

```
POST /api/v1/json/validate
```

**Respuesta (200):**

```json
{
  "success": true,
  "data": {
    "valid": true,
    "format": "agencia",
    "viviendasCount": 12,
    "metadata": { "timestamp": null, "url": null, "total": null }
  }
}
```

---

## Formatos de entrada aceptados

El endpoint reconoce **tres formatos**. Se detecta automáticamente cuál se envía.

### A) Lote de agencia (recomendado) — `format: "agencia"`

```json
{
  "agencia_url": "https://agencia.example.com",
  "inmuebles": [
    {
      "titulo": "Piso luminoso en el centro de Manresa",
      "precio": "150.000€",
      "ubicacion": "Poble Nou, Manresa",
      "url": "https://agencia.example.com/inmueble/1234",
      "descripcion": "Precioso piso reformado con ascensor y parking.",
      "habitaciones": "3 hab",
      "banos": "2",
      "garajes": "1",
      "metros_cuadrados": "90 m2",
      "tipo_inmueble": "piso",
      "estado": "Buen estado",
      "caracteristicas": ["Ascensor", "Parking", "Aire acondicionado"],
      "imagenes": [
        "https://cdn.example.com/.../image.master/aa/bb/cc/111.jpg"
      ]
    }
  ]
}
```

### B) Inmueble único — `format: "single"`

Un solo inmueble suelto (mismo esquema que un elemento de `inmuebles`). Ideal para
webhooks o sincronización de un alta/edición individual.

```json
{
  "titulo": "Ático con terraza en el Eixample",
  "precio": "320.000€",
  "ubicacion": "Eixample, Barcelona",
  "url": "https://agencia.example.com/inmueble/9876",
  "tipo_inmueble": "ático"
}
```

### C) Lote legacy — `format: "legacy"`

Formato antiguo del scraper. Aquí `url` **es obligatorio**. Los inmuebles se crean
como captación pendiente (`EstadoVenta: "Pendiente"`, sin publicar).

```json
{
  "viviendas": {
    "todas": [
      {
        "titulo": "Casa en Sitges",
        "precio": "450.000€",
        "ubicacion": "Sitges",
        "url": "https://portal.example.com/casa/1",
        "descripcion": "...",
        "habitaciones": "4 habitaciones",
        "metros": "180 m2",
        "anunciante": "Particular"
      }
    ]
  }
}
```

**Campos obligatorios por formato:**

| Formato   | Obligatorios                          |
| --------- | ------------------------------------- |
| `agencia` | `titulo`, `precio`, `ubicacion`       |
| `single`  | `titulo`, `precio`, `ubicacion`       |
| `legacy`  | `titulo`, `precio`, `ubicacion`, `url` |

> ⚠️ Aunque `url` no es obligatorio en el formato agencia/single, **se recomienda
> encarecidamente** enviarlo: es la clave que permite **editar** un inmueble en
> lugar de crear un duplicado (ver [Lógica de upsert](#lógica-de-upsert-crear-vs-editar)).

---

## Campos del inmueble

Mapeo de los campos del JSON (formato agencia/single) a la vivienda de la
plataforma. Los valores se **parsean y normalizan** automáticamente.

| Campo JSON         | Campo interno     | Notas / transformación                                          |
| ------------------ | ----------------- | --------------------------------------------------------------- |
| `titulo`           | `name`            | Obligatorio. Mínimo 3 caracteres.                               |
| `precio`           | `price`           | Se extrae el número: `"150.000€"` → `150000`. Debe ser > 0.     |
| `ubicacion`        | `poblacion`       | Obligatorio.                                                    |
| `descripcion`      | `description`     | Se convierte a HTML (una `<p>` por línea).                      |
| `descripcion`      | `shortDescription`| Se genera un resumen (primera frase, máx. 300 caracteres).      |
| `habitaciones`     | `rooms`           | Se extrae el número: `"3 hab"` → `3`.                            |
| `banos`            | `bathRooms`       | Se extrae el número.                                             |
| `garajes`          | `garage`          | Se extrae el número.                                             |
| `metros_cuadrados` | `squaredMeters`   | Se extrae el número.                                             |
| `tipo_inmueble`    | `tipoInmueble` / `tipoVivienda` | Se infiere (ver más abajo).                       |
| `estado`           | `estado`          | Se infiere: `ObraNueva`, `BuenEstado` o `AReformar`.            |
| `caracteristicas`  | `caracteristicas` | Se hace *matching* contra la lista de la plataforma.            |
| `url`              | `urlReferencia`   | **Clave de deduplicación / edición.**                           |
| `imagenes`         | (tabla imágenes)  | Se filtran (solo fotos reales) y se desduplican.                |

**Valores fijados automáticamente al crear (formato agencia/single):**

- `tipoAnuncio` = `"Venta"`
- `estadoVenta` = `"Disponible"`
- `published` = `true` (se **publica automáticamente**)

### Inferencia de tipo

`tipo_inmueble` (o, en su defecto, el `titulo`) se analiza para asignar:

- **Vivienda** → `tipoVivienda`: Piso, Ático, Dúplex, Casa, Chalet, Villa, Masía,
  Finca, Loft, Estudio. (Por defecto: `Piso`.)
- **No vivienda** → `tipoInmueble`: Oficina, Local, Nave, Garaje, Terreno,
  Trastero, Edificio.

### Características reconocidas

El texto de `caracteristicas` se compara (con sinónimos) contra esta lista y se
guardan solo las coincidencias:

```
AireAcondicionado, ArmariosEmpotrados, Ascensor, Balcón, Terraza, Exterior,
Garaje, Jardín, Piscina, Trastero, ViviendaAccesible, VistasAlMar, ViviendaDeLujo,
VistasAMontaña, FuegoATierra, Calefacción, Guardilla, CocinaOffice
```

### Imágenes

Del array `imagenes` solo se conservan **fotos reales de la propiedad**:

- Se descartan SVGs, banderas (`/flags/`), logos y assets que no sean fotos.
- Solo se aceptan URLs que contengan `image.master`.
- Se **desduplican** por hash de imagen.

---

## Lógica de upsert (crear vs editar)

Para cada inmueble el sistema decide entre **crear** o **actualizar**:

1. **Búsqueda por `url` (clave principal).** Si existe una vivienda con la misma
   `urlReferencia` → se **actualiza**.
2. **Respaldo por título + precio.** Si no hay `url` coincidente pero existe una
   vivienda con el mismo `titulo` y `precio` exactos → se **actualiza** (evita
   duplicados si la URL cambió).
3. Si no hay coincidencia → se **crea** un inmueble nuevo.
4. Los **duplicados exactos dentro del mismo lote** (mismo inmueble repetido) se
   **omiten** (`status: "duplicate"`).

### Qué se actualiza y qué se preserva al editar

Al **actualizar** un inmueble existente:

- ✅ **Se sobrescribe el contenido del anuncio** desde el JSON: título, precio,
  descripción, habitaciones, baños, metros, ubicación, tipo, estado, características.
- 🔒 **Se preservan los datos de gestión/captación** que hubiera fijado un agente
  manualmente y que **no** vienen en el feed:
  `estadoVenta`, `published`, `isDraft`, `captadoPor`, `comisionGanada`,
  `porcentajeCaptacion`, `fechaCaptacion`, `telefonoContacto`, `nombreContacto`,
  `observaciones`.
- 🖼️ **Imágenes:** solo se añaden si la vivienda **no tenía ninguna**. Si ya tenía
  imágenes, se respetan (no se duplican ni se reordena una selección manual).

> En la práctica: si marcas un piso como *Reservada* y le asignas un captador, una
> reimportación del feed **actualizará el precio y la descripción sin tocar** ese
> estado ni el captador.

---

## Respuesta

**200 OK**

```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 3,
      "created": 1,
      "updated": 1,
      "duplicates": 1,
      "errors": 0,
      "success": 2
    },
    "details": [
      { "row": 1, "status": "created",   "title": "Piso ...", "id": "uuid", "images": 5 },
      { "row": 2, "status": "updated",   "title": "Chalet ...", "id": "uuid", "images": 0 },
      { "row": 3, "status": "duplicate", "titulo": "Piso ...", "reason": "URL duplicada en el mismo lote" }
    ],
    "metadata": {
      "format": "agencia",
      "timestamp": null,
      "url": "https://agencia.example.com",
      "total": 3
    }
  }
}
```

### `summary`

| Campo        | Descripción                                            |
| ------------ | ------------------------------------------------------ |
| `total`      | Inmuebles recibidos en la petición.                    |
| `created`    | Inmuebles nuevos creados.                              |
| `updated`    | Inmuebles existentes actualizados.                     |
| `duplicates` | Duplicados omitidos (repetidos dentro del mismo lote). |
| `errors`     | Inmuebles que fallaron.                                |
| `success`    | Alias de compatibilidad = `created + updated`.         |

### `details[]` — `status` por inmueble

| `status`    | Significado                                    |
| ----------- | ---------------------------------------------- |
| `created`   | Creado. Incluye `id` e `images` (nº añadidas). |
| `updated`   | Actualizado. Incluye `id` e `images` nuevas.   |
| `duplicate` | Omitido; incluye `reason`.                     |
| `error`     | Falló; incluye `error` con el motivo.          |

---

## Códigos de error

| HTTP  | `error.code`             | Causa                                                        |
| ----- | ------------------------ | ------------------------------------------------------------ |
| `400` | `NO_DATA`                | Cuerpo vacío o no es un objeto JSON.                         |
| `400` | `INVALID_JSON_STRUCTURE` | Falta `inmuebles`/`viviendas.todas` o campos obligatorios.   |
| `400` | `VALIDATION_ERROR`       | Error de validación durante el procesamiento.               |
| `401` | `UNAUTHORIZED`           | Falta la API key o el token de administrador (o no válidos). |
| `429` | —                        | Se superó el *rate limit*.                                   |
| `503` | `REQUEST_TIMEOUT`        | El procesamiento superó los 25 s.                            |

Formato de error:

```json
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "Se requiere una API key válida (cabecera X-API-Key) o un token de administrador" }
}
```

> Nota: los errores de inmuebles **individuales** no hacen fallar la petición
> completa. La respuesta es `200` y cada fallo aparece en `details[]` con
> `status: "error"`, reflejado en `summary.errors`.

---

## Ejemplos completos

### Crear/actualizar un lote (cURL)

```bash
curl -X POST https://tu-dominio/api/v1/json/import \
  -H "Content-Type: application/json" \
  -H "X-API-Key: TU_CLAVE" \
  -d '{
    "inmuebles": [
      {
        "titulo": "Piso luminoso en el centro de Manresa",
        "precio": "150.000€",
        "ubicacion": "Poble Nou, Manresa",
        "url": "https://agencia.example.com/inmueble/1234",
        "descripcion": "Precioso piso reformado con ascensor y parking.",
        "habitaciones": "3 hab",
        "banos": "2",
        "metros_cuadrados": "90 m2",
        "tipo_inmueble": "piso",
        "caracteristicas": ["Ascensor", "Parking"],
        "imagenes": ["https://cdn.example.com/.../image.master/aa/bb/cc/1.jpg"]
      }
    ]
  }'
```

### Sincronizar un único inmueble (webhook)

```bash
curl -X POST https://tu-dominio/api/v1/json/import \
  -H "Content-Type: application/json" \
  -H "X-API-Key: TU_CLAVE" \
  -d '{
    "titulo": "Ático con terraza en el Eixample",
    "precio": "320.000€",
    "ubicacion": "Eixample, Barcelona",
    "url": "https://agencia.example.com/inmueble/9876",
    "tipo_inmueble": "ático"
  }'
```

### Validar antes de importar

```bash
curl -X POST https://tu-dominio/api/v1/json/validate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: TU_CLAVE" \
  -d '{ "inmuebles": [ { "titulo": "...", "precio": "100.000€", "ubicacion": "Manresa" } ] }'
```

### Node.js (fetch)

```js
const res = await fetch("https://tu-dominio/api/v1/json/import", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": process.env.JSON_IMPORT_API_KEY,
  },
  body: JSON.stringify({ inmuebles: [/* ... */] }),
});

const { data } = await res.json();
console.log(`Creadas: ${data.summary.created}, Actualizadas: ${data.summary.updated}`);
```

---

## Límites y buenas prácticas

- **Envía siempre `url`.** Es lo que permite editar en vez de duplicar.
- **Tamaño de petición:** máximo 10 MB. Divide los feeds muy grandes en varios lotes.
- **Timeout:** 25 s por petición. Para catálogos grandes, envía lotes de tamaño
  moderado (p. ej. 50–100 inmuebles por llamada).
- **Rate limiting:** se aplica el límite global de `/api/`
  (`RATE_LIMIT_MAX_REQUESTS` por `RATE_LIMIT_WINDOW_MS`). Si vas a sincronizar con
  mucha frecuencia, coordina el ajuste de estos valores.
- **Idempotencia:** reenviar el mismo lote es seguro — la segunda vez actualiza en
  lugar de duplicar.
- **Rotación de claves:** configura `JSON_IMPORT_API_KEY` con la clave nueva y la
  antigua separadas por coma, migra los clientes y retira la antigua.

---

## Configuración del backend

Variable de entorno necesaria (`backend/.env`):

```bash
# API key para la sincronización JSON externa (admite varias separadas por comas)
JSON_IMPORT_API_KEY=genera_una_clave_larga_y_aleatoria
```

Generar una clave segura:

```bash
openssl rand -hex 32
```
