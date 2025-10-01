# CustomSelect Component

## 🎯 Propósito
Componente de dropdown/select personalizado que reemplaza los `<select>` nativos del navegador para tener control total sobre el diseño y la experiencia de usuario.

## ✨ Características

### 🎨 Diseño Personalizado
- **Dropdown completamente estilizado** - No más dropdowns feos del navegador
- **Animaciones suaves** - Transiciones y efectos visuales profesionales
- **Estados interactivos** - Hover, focus, selected y disabled states
- **Flecha personalizada** - SVG que rota al abrir/cerrar

### ♿ Accesibilidad Completa
- **Navegación por teclado** - Arrow keys, Enter, Space, Escape
- **ARIA attributes** - Roles y labels correctos para screen readers
- **Focus management** - Enfoque visible y lógico
- **High contrast support** - Colores accesibles para usuarios con discapacidad visual

### 📱 Responsive
- **Mobile optimized** - Touch-friendly en dispositivos móviles
- **Adaptive sizing** - Se ajusta al contenedor padre
- **Scroll automático** - Para listas largas de opciones

### 🚀 Performance
- **Click outside detection** - Cierra automáticamente al hacer click fuera
- **Lazy rendering** - Solo renderiza el dropdown cuando está abierto
- **Event cleanup** - Gestión correcta de event listeners

## 💻 Uso

```jsx
import CustomSelect from '../components/CustomSelect';

const options = [
  { value: 'all', label: 'Todas las opciones' },
  { value: 'option1', label: 'Opción 1' },
  { value: 'option2', label: 'Opción 2' },
];

function MyComponent() {
  const [value, setValue] = useState('all');

  return (
    <CustomSelect
      value={value}
      onChange={setValue}
      options={options}
      placeholder="Seleccionar..."
      disabled={false}
    />
  );
}
```

## 🔧 Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | string | - | Valor seleccionado actual |
| `onChange` | function | - | Callback cuando cambia la selección |
| `options` | array | [] | Array de objetos `{value, label}` |
| `placeholder` | string | "Seleccionar..." | Texto cuando no hay selección |
| `className` | string | "" | Clases CSS adicionales |
| `disabled` | boolean | false | Si el select está deshabilitado |

## 🎹 Navegación por Teclado

- **Tab** - Enfocar el select
- **Enter/Space** - Abrir/cerrar dropdown o seleccionar opción
- **Arrow Down** - Navegar hacia abajo o abrir dropdown
- **Arrow Up** - Navegar hacia arriba
- **Escape** - Cerrar dropdown

## 🎨 Integración con Listado

Se integra perfectamente con los estilos existentes de los filtros:
- **Filtros principales** - Mantiene el diseño de la barra superior
- **Filtros avanzados** - Se adapta al estilo de tarjetas individuales
- **Responsive** - Funciona en mobile y desktop

## ✅ Beneficios vs Select Nativo

| Característica | Select Nativo | CustomSelect |
|---------------|---------------|-------------|
| Diseño personalizable | ❌ Limitado | ✅ Total control |
| Animaciones | ❌ No | ✅ Suaves |
| Estados hover/focus | ❌ Básicos | ✅ Personalizados |
| Mobile experience | ❌ Inconsistente | ✅ Optimizado |
| Accesibilidad | ✅ Básica | ✅ Completa |
| Cross-browser | ❌ Inconsistente | ✅ Consistente |

## 🔄 Reemplazo Completo

Hemos reemplazado todos los selects en Listado.jsx:
- ✅ Tipo de vivienda (filtro principal)
- ✅ Habitaciones (filtro avanzado)
- ✅ Baños (filtro avanzado)
- ✅ Garaje (filtro avanzado)
- ✅ Estado (filtro avanzado)
- ✅ Tipo de operación (filtro avanzado)

Ahora todos los dropdowns tienen una apariencia **profesional y consistente** en todos los navegadores y dispositivos. 🎨✨