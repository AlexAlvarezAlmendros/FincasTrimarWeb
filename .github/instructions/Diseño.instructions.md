---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# Guía descriptiva y de estilo – Web Inmobiliaria

# Guía descriptiva y de estilo – Web Inmobiliaria

---

## 0) Identidad general

- **Tono visual:** limpio, confiable y cercano. Mucho blanco/gris muy claro, con **acentos azules** (azul medio brillante) para acciones primarias. Notas secundarias en **gris oscuro** para textos y **píldoras de color** en chips/etiquetas (verde, amarillo, lila) que clasifican propiedades.
- **Geometría:** esquinas **muy redondeadas** (píldoras y tarjetas), sombras suaves, aireado. Sensación de “app moderna” más que portal clásico.
- **Fotografía:** casas luminosas, exposición alta, sin saturación excesiva. Hero con **fachada de vivienda** a la derecha.
- **Accesibilidad:** alto contraste para CTAs, foco visible, navegación por teclado, etiquetas ARIA en controles.

---

## 1) Arquitectura de navegación

- **Barra superior (header)** fija arriba, sticky en scroll.
    - Izquierda: **logotipo** (trazo fino, montaña/casa). Actúa como enlace a Inicio.
    - Centro: enlaces: **INICIO**, **VIVIENDAS**, **VENDER**, **CONTACTO**.
    - Derecha: botón destacado Login si el usuario esta desloggeado y CREAR VIVIENDA cuando el usuario este loggeado (primario azul) y un boton secundario a la derecha en borde redondeado para el log out.
- **Pie (footer)** con 3 columnas: breve texto de la empresa (izquierda + redes sociales), **Nuestra Empresa** (enlaces), y **Suscríbete** (cuadro de email con botón esférico azul).

---

## 2) Descripción auditiva de las pantallas

### A) **Inicio**

1. **Hero**
    - Fondo amplio con **imagen de casa** a la derecha. A la izquierda, titular grande en dos líneas: *“La mejor forma de encontrar tu vivienda”*. Subtítulo corto: ''Ofrecemos el servicio completo de venta, ***compra o alquiler de tu vivienda''***.
2. **Bloque “Añadidas recientemente”**
    - Título a la izquierda. A la derecha, enlace **“VER TODO”** discreto.
    - **Lista de 6 tarjetas** en dos columnas (desktop). Cada **tarjeta**:
        - Miniatura fotográfica cuadrada/ligeramente rectangular a la izquierda.
        - A la derecha, **título** (máx. dos líneas con truncado “…”) y **metadatos** en 2 columnas: habitaciones, garajes, metros, baños.
        - Fila de **chips** (píldoras pequeñas con color): “Vivienda”, “Piso”, “Venta”, etc.
        - **Precio** en botón/grupo a la derecha con icono de moneda “€” y borde suave.
    - Los ítems alternan visualmente por equilibrio, pero mantienen el mismo patrón.
3. **Banda promocional** “Vende tu inmueble hoy mismo”
    - Imagen de un edificio en el lado derecho. A la izquierda, texto grande **y botón** “CONTACTANOS”. Bloque con fondo gris azulado claro y bordes redondeados.
4. **Footer** como en la arquitectura.

### B) **Listado de Viviendas**

- **Barra de filtros** bajo el header, de lado a lado, con tarjeta blanca elevada:
    - **Filtro Ubicación** (con icono de marcador).
    - **Filtro Tipo de vivienda** (desplegable).
    - A la derecha un pequeño grupo de **botones circulares** con iconos Todos con borde redondeado:
        - Lupa: Aplica los filtros.
        - Filtro avanzado: Abre un Modal con los filtros avanzados
        - Añadir: Te redirige a la pantalla de crear viviendas
- **Listado en tarjetas** (grid de 2 columnas desktop): mismo patrón que “Añadidas recientemente”.
- **Precio** siempre en el extremo derecho de cada tarjeta para cierre visual.

### C) **Vender**

- **Hero** con imagen de casa grande a la derecha. A la izquierda, titular “Vende tu inmueble hoy mismo” y subtítulo breve "**Vende tu inmueble de forma rapida y sencilla**
    
    **con nosotros!**".
    
- Tarjeta flotante centrada con **formulario mínimo** (Nombre*, Teléfono*) y botón primario **“INFÓRMATE”**. Sobre el formulario texto orientativo: "**Agenda una llamada y te informaremos de todo. Sin Compromiso**", Bajo el formulario, **texto alternativo**: número de teléfono directo "O si prefieres, llámanos directamente al 615 84 02 73".

## D) Descripción auditiva por bloques

### d.1 Galería principal (Hero visual)

- **Qué se percibe:** una **imagen grande** de la vivienda en formato panorámico (relación ~16:9) ocupando todo el ancho del contenido, con **esquinas redondeadas**. Sobre la imagen, texto discreto “**Ver todas las imágenes**”.
- **Comportamiento esperado:** clic o teclado abre **visor/lightbox** con carrusel. En móvil, imagen a ancho completo; en desktop mantiene proporción sin recortar información relevante.

### d.2 Encabezado de la propiedad

- **Título (H1)**: texto largo y descriptivo, por ejemplo: “**Piso reformado en edificio histórico en el centro de Igualada 102 m2**”. Se parte en dos líneas si es necesario; peso semibold.
- **Subtítulo (lead)**: una frase breve que contextualiza (“Precioso piso en una de las mejores zonas de Igualada”).
- **Chips de clasificación:** tres **píldoras** pequeñas con colores: “Vivienda” (verde), “Piso” (amarillo), “Venta” (lila).
- **Precio:** chip/botón claro con valor “240.000 €” y símbolo de euro. Contraste suficiente y `aria-label` con lectura completa ("Precio: 240.000 euros").
- **Especificaciones rápidas:** fila con **4 indicadores** en texto conciso (sin icono obligatorio): “3 Habitaciones”, “0 Garajes”, “102 M”, “2 Baños”. Estilo microtexto en gris oscuro.

### d.3 Descripción y características

- **Párrafos introductorios:** texto corrido en 2–4 párrafos, tono comercial pero concreto (materiales, estado, orientación, luz, servicios cercanos). Interlineado cómodo.
- **Bloque “Características principales”**: subtítulo H3 seguido de **lista con viñetas** (p. ej. aparatos, calefacción, ventanas, suelos, cocina equipada). Viñetas estándar o checkmarks discretos.
- **Bloque “Distribución”**: subtítulo H3 + lista/ párrafo que describe **estancias y su orden** (salón, habitaciones, baños, cocina, recibidor, balcones, etc.).
- **Bloque “Extra destacado”**: subtítulo H3 + **párrafo resaltado** (texto ventajoso: terraza privada, vistas, ascensor, zona premium…). Fondo o margen no necesario; basta jerarquía tipográfica.
- **Sección “Características”** adicional: espacio para **tabla o lista** de atributos técnicos (a rellenar si hay datos; si está vacío, **ocultar** la sección para no generar ruido).

### d.4 Formulario “Agenda una visita”

- **Contenedor** con borde gris claro, **esquinas redondeadas** y sombra suave.
- **Campos** en una sola tarjeta (desktop en una fila):
    - 1º **Mensaje** (textarea de una línea con placeholder “¿Estás interesado en agendar una visita para este inmueble…?”).
    - 2º **Tu nombre** (input texto).
    - 3º **Tu Email** (input email).
    - 4º **Tu Teléfono** (input tel).
- **Botón** primario a la derecha: **“AGENDAR VISITA”** (azul, texto blanco, forma píldora).
- **Accesibilidad:** labels visibles, `aria-required` en campos obligatorios, errores en rojo discreto bajo el campo, `aria-live="polite"` para mensajes.

### d.5 Ubicación (mapa)

- Mapa embebido (estático o interactivo) dentro de **contenedor con bordes redondeados**. Texto de soporte encima: **“Ubicación”** (H3).
- **Accesibilidad:** ofrecer alternativa textual (barrio, calle aproximada). Evitar depender solo del mapa para transmitir ubicación.

### d.6 Galería de imágenes

- **Sección “Imágenes”** (H3).
- **Grid** de miniaturas con **bordes redondeados** y **espaciado uniforme**; en desktop se perciben **3–4 columnas**; en móvil 1 columna con scroll vertical.
- **Interacción:** al pulsar, abrir **lightbox** con navegación por teclado y gestos. Carga `lazy`.

### d.7 Plano de la vivienda (opcional)

- Imagen de plano arquitectónico con **amplio ancho** y bordes redondeados. Texto alternativo: “Plano con distribución y medidas aproximadas”.

### d.8 Inmuebles similares

- **Título** H3 “Inmuebles similares” y, a la derecha, enlace “**VER MÁS**”.
- **Cuadrícula de tarjetas** (2 columnas en desktop): miniatura a la izquierda, título truncado a 2 líneas, chips de categoría, precio en chip a la derecha. Misma estética que las tarjetas del listado.

---

## 3) Componentes (definición visual + estados)

### 3.1 Botón

- **Primario**: fondo azul, texto blanco, alto 44–48 px, radios redondeados, sombra leve. Hover: azul ligeramente más oscuro. Focus: anillo de enfoque de 2 px.
- **Secundario**: fondo blanco, borde gris claro, texto gris oscuro. Hover: gris muy claro.
- **Icon button**: círculo 40–44 px, sombra suave.

### 3.2 Pestañas conmutables (ALQUILER/COMPRA/VENTA)

- Píldoras, alto ~36–40 px. La activa en **relleno azul** y texto blanco. Inactivas con borde gris claro y texto gris oscuro.

### 3.3 Barra de búsqueda

- Contenedor con **borde 1 px gris claro**, esquinas 16–24 px, sombra sutil. Campos con icono inicial.
- Botón de **lupa** integrado al extremo derecho con color primario.

### 3.4 Tarjeta de propiedad

- Contenedor blanco, borde 1 px gris claro, radio 16–20 px, sombra muy ligera.
- **Imagen** con radio a juego (no totalmente redonda).
- **Título** en negrita media; **metadatos** en dos columnas de microtexto.
- **Chips**: píldoras pequeñas con colores de categoría (ver tokens de color).
- **Precio**: botón/chip a la derecha, con icono “€” y fondo gris muy claro.

### 3.5 Chip/Etiqueta

- Altura 24–28 px, padding horizontal 8–12 px, texto 12–14 px.
- Colores:
    - **Verde** (estado/positivo): “Vivienda”.
    - **Amarillo** (categoría): “Piso”, “Casa”, “Chalet”.
    - **Lila** (operación): “Venta”.

### 3.6 Formulario mínimo

- Campos de texto con borde 1 px gris claro, radio 10–12 px. Placeholders claros.
- Errores en rojo discreto bajo el campo; label siempre visible.

---

## 4) Sistema de diseño (tokens sugeridos)

> Los valores son aproximados y pueden ajustarse tras extraer paleta exacta. Úsalos como fuente de verdad en cualquier stack.
> 

```yaml
colors:
  brand:
    primary: "#3A8DFF"   # Azul acción
    primary_hover: "#2F78DB"
    primary_focus: "#2B6CC8"
  neutral:
    0: "#FFFFFF"
    50: "#F7F9FC"      # fondos muy claros / bandas
    100: "#EEF2F7"     # bordes y contenedores suaves
    300: "#CBD5E1"     # líneas
    600: "#475569"     # texto principal
    800: "#1F2937"     # títulos
  semantic:
    success: "#22C55E"  # verde chips
    warning: "#F59E0B"  # amarillo chips
    info: "#8B5CF6"     # lila chips
    danger: "#EF4444"   # errores

radius:
  xs: 8
  sm: 12
  md: 16
  lg: 20
  pill: 9999

shadow:
  sm: "0 1px 2px rgba(0,0,0,0.06)"
  md: "0 6px 16px rgba(0,0,0,0.08)"

spacing:
  xs: 4
  sm: 8
  md: 12
  lg: 16
  xl: 24
  2xl: 32
  3xl: 48

font:
  family_heading: "Poppins, Inter, system-ui, sans-serif"
  family_body: "Inter, system-ui, sans-serif"
  size:
    xs: 12
    sm: 14
    md: 16
    lg: 18
    xl: 24
    2xl: 32
    3xl: 40
  weight:
    regular: 400
    medium: 500
    semibold: 600

breakpoints:
  xs: 360
  sm: 640
  md: 768
  lg: 1024
  xl: 1280
  2xl: 1536

```

---

## 5) Layout y rejilla

- **Contenedor** central a 1140–1200 px en desktop.
- **Rejilla**: 12 columnas, gutter 24 px. Tarjetas en **2 columnas** en desktop; **1 columna** en móvil.
- **Espaciado vertical** generoso (32–48 px entre secciones).

---

## 6) Accesibilidad

- **Orden de tabulación**: Logo → menú → CTA → pestañas → campos búsqueda → botón buscar → listado.
- **ARIA y roles**:
    - `header` con `nav` y `aria-label="Navegación principal"`.
    - Pestañas como `role="tablist"`, cada pestaña `role="tab"` y `aria-selected`.
    - Barra de búsqueda como `form` con `aria-label="Buscador de viviendas"`.
    - Tarjetas de propiedad como `article` con `aria-labelledby` al título.
    - Precio con `aria-label="Precio: 240.000 euros"`.
    - Formulario “Vender” con labels explícitos, `aria-required` y mensajes de error `aria-live="polite"`.
- **Foco visible** en todos los interactivos. Contraste mínimo 4.5:1 en texto.
- **Alternativas textuales**: todas las imágenes deben tener `alt` descriptivo (p. ej., “Fachada de casa adosada con garaje doble y tejado gris”).

---

## 7) Microinteracciones

- Hover en tarjetas: **elevación +2** y borde ligeramente más oscuro.
- `:focus` con anillo azul (#3A8DFF) de 2 px.
- Truncado de títulos con `…` a 2 líneas (`line-clamp: 2`).
- Chips con `cursor: default` salvo que filtren; si filtran, hover aclara el color y muestra `cursor: pointer`.

---

## 8) Contenido textual (referencia)

- Hero principal: **H1** “La mejor forma de encontrar tu vivienda”.
- Subtítulo: frase corta y concreta sobre servicio completo de venta, compra y alquiler.
- Sección listado: **H2** “Añadidas recientemente”.
- Banner: **H2** “Vende tu inmueble hoy mismo”.
- CTA footer de newsletter: “Suscríbete a nuestra newsletter para enterarte de las novedades”.

---

---

## 11) Comportamiento responsive

- **Móvil (≤768 px):**
    - Menú como fila simple; CTA “Crear vivienda” pasa a botón con icono si hace falta.
    - Hero: texto encima, imagen **debajo** u oculta parcialmente.
    - Buscador en **stack vertical** (Ubicación → Tipo → Buscar).
    - Listado en **1 columna**.
- **Tablet (768–1024 px):**
    - Dos columnas ajustadas, buscador en una fila si cabe, si no en 2.
- **Desktop (≥1024 px):**
    - Diseño descrito arriba.

---

## 12) Rendimiento y buenas prácticas

- Optimizar imágenes (`<img loading="lazy" width height>` y fuentes con `display=swap`).
- Reutilizar **componentes**: Header, Footer, Barra de búsqueda, Tarjeta propiedad, Chips, Banner, Formulario mínimo.
- Tokens centralizados para theming ligero (modo oscuro opcional futuro: invertir grises y ajustar azul).

---

## 13) Indicaciones para reimplementación por IA

- **Objetivo**: replicar estructura, jerarquía visual y estilo.
- **Tecnología**: React. Respetar tokens y semántica.
- **Entrega mínima**:
    1. Layout y navegación.
    2. Hero con barra de búsqueda funcional (mock).
    3. Grid de tarjetas con datos de ejemplo (6 ítems).
    4. Página de Listado con barra de filtros.
    5. Página Vender con formulario mínimo.
    6. Footer con newsletter (sin backend, sólo UI).
- **Criterio de aceptación**:
    - Contraste y foco correctos.
    - Responsive estable (sin saltos bruscos).
    - Títulos y chips truncados sin desbordes.
    - Teclado: se puede buscar y enviar el formulario sin ratón.

---