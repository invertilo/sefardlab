# Sistema de Splash Screens Sefardlab

Documentación del sistema de Splash Screens animadas con mascota pixel art para Sefardlab.

## Características

- 🦉 **Mascota pixel art**: Búho académico sefardí con 6 variantes
- ✨ **Animaciones fluidas**: Estados (IDLE, ENTER, LOADING, SUCCESS, EXIT, ERROR)
- 🎨 **Tema dinámico**: Soporta modos claro/oscuro automáticamente
- ♿ **Accesibilidad**: Respeta `prefers-reduced-motion`
- 📱 **Responsive**: Funciona en todos los tamaños de pantalla
- ⚡ **Rendimiento**: CSS animations, sin dependencias pesadas

## Variantes de Mascota

### 1. Clásico
- Búho con kipá azul, gafas doradas
- Túnica académica, libro hebreo, puntero
- Uso: Pantalla principal, navegación general

### 2. Estilo Sefardí
- Talit blanco con franjas azules
- Libro o rollo de estudio
- Uso: Contenido cultural, aprendizaje tradicional

### 3. Desarrollador/Tecnología
- Laptop, código/terminal
- Prenda tecnológica discreta
- Uso: Herramientas interactivas, contenido técnico

### 4. Estudiante
- Libros, cuaderno/laptop
- Pose de lectura
- Uso: Lecciones, ejercicios

### 5. Maestro/Rabínico
- Talit formal, libro de Torá
- Ala levantada en gesto de enseñanza
- Uso: Lecciones avanzadas, logros importantes

### 6. Gamificación
- Mochila académica, celebrando
- Estrella/trofeo
- Uso: XP, insignias, rachas, logros

## Uso

### 1. Instalación automática

Ya está integrado en `app/providers.tsx`:

```tsx
<SplashProvider>
  {children}
</SplashProvider>
```

### 2. Hook `useSplash()`

```tsx
import { useSplash } from "@/hooks/useSplash";

export function MyComponent() {
  const { show, hide } = useSplash();

  const handleLoadData = async () => {
    show({
      variant: "student",
      message: "Cargando lección...",
      showProgress: true,
    });

    try {
      await fetchData();
      hide();
    } catch (error) {
      // El splash se ocultará automáticamente
    }
  };

  return <button onClick={handleLoadData}>Cargar</button>;
}
```

### 3. Mostrar con auto-hide

```tsx
const { show } = useSplash();

show({
  variant: "gamification",
  message: "¡Has ganado 100 XP!",
  duration: 2000, // Se ocultará automáticamente en 2 segundos
});
```

### 4. Integración automática con rutas

El `SplashNavigationMonitor` en el layout de `/app` automaticamente:
- Detecta cambios de ruta
- Selecciona la variante apropiada
- Muestra el splash para navegaciones lentas

Las rutas se mapean en `lib/splash/routeConfig.ts`.

## Componentes

### `<SplashScreen />`
Componente principal del overlay.

```tsx
<SplashScreen
  isVisible={true}
  variant="classic"
  message="Preparando..."
  showProgress={true}
/>
```

### `<Mascot />`
Renderiza el búho SVG con animaciones.

```tsx
<Mascot
  variant="student"
  state="loading"
  className="custom-class"
/>
```

### `<SplashProvider />`
Context provider para controlar el Splash globalmente.

Envuelve la app para que `useSplash()` funcione en cualquier componente cliente.

### `<SplashNavigationMonitor />`
Monitorea cambios de ruta automáticamente.

```tsx
export default function AppLayout({ children }) {
  return (
    <>
      <SplashNavigationMonitor />
      {/* resto del layout */}
    </>
  );
}
```

### `<SplashShowcase />`
Herramienta de testing para ver todas las variantes.

```tsx
import { SplashShowcase } from "@/components/splash/SplashShowcase";

export default function TestPage() {
  return <SplashShowcase />;
}
```

## Estados de Animación

### `idle`
Reposo: respiración sutil, parpadeo natural.

### `enter`
Aparición: fade-in + scale suave.

### `loading`
Cargando: animación contextual específica por variante.

### `success`
Éxito: pequeña celebración, checkmark.

### `exit`
Desaparición: fade-out suave.

### `error`
Error: movimiento de confusión, sin éxito falso.

## Personalización

### Cambiar variante por ruta

Edita `lib/splash/routeConfig.ts`:

```ts
export const routeVariantMap: Record<string, RouteConfig> = {
  "/my-route": { 
    variant: "student", 
    message: "Preparando..." 
  },
};
```

### Modificar colores

Los colores se heredan de las variables CSS de Sefardlab:
- `--primary`: Azul marino (#1b4965)
- `--secondary`: Dorado (#e8b441)
- `--success`: Verde (#276c44)
- `--bg`: Fondo

Para cambiar, edita `app/globals.css`.

### Agregar nueva animación

1. Edita `components/splash/mascot/mascot.css`
2. Agrega nueva animación CSS
3. Referencias en el componente `<Mascot />`

Ejemplo:

```css
@keyframes mi-nueva-animacion {
  from { transform: rotateZ(0deg); }
  to { transform: rotateZ(360deg); }
}

.mascot-custom.mascot-loading {
  animation: mi-nueva-animacion 2s ease-in-out infinite;
}
```

## Optimización

### Desactivar automáticamente en ciertas rutas

Edita `hooks/useSplashIntegration.ts`:

```ts
const SKIP_SPLASH_ROUTES = ["/settings", "/profile"];

if (SKIP_SPLASH_ROUTES.some(r => pathname.startsWith(r))) {
  hide();
  return;
}
```

### Rendimiento

- **SVG inline**: No requiere HTTP requests
- **CSS animations**: GPU-aceleradas, 60 FPS
- **No re-renders**: React Context con memoización
- **Lazy loading**: Componentes cargados bajo demanda

## Accesibilidad

- ✅ Respeta `prefers-reduced-motion`
- ✅ ARIA labels en SVG
- ✅ Contraste WCAG AA
- ✅ Sin parpadeos (< 3 Hz)
- ✅ Sin bloqueo de interacción cuando contenido está listo

## Troubleshooting

### El splash no aparece

1. Verifica que `<SplashProvider>` envuelve la app
2. Usa el hook `useSplash()` dentro de un Client Component
3. Revisa que el componente está en el árbol de React

### Las animaciones se sienten lentas

1. Abre DevTools → Performance
2. Registra una animación
3. Verifica que están en 60 FPS
4. Mira si hay long tasks (> 50ms)

### El tema no cambia

1. Verifica que `<PreferencesProvider>` envuelve `<SplashProvider>`
2. Comprueba que `data-theme` se establece en `<html>`
3. Revisa las variables CSS en `app/globals.css`

## Archivos

```
components/splash/
├── SplashScreen.tsx          # Componente principal
├── SplashProvider.tsx        # Context provider
├── SplashNavigationMonitor.tsx  # Monitor de rutas
├── SplashShowcase.tsx        # Herramienta de testing
├── splash.css                # Estilos del overlay
└── mascot/
    ├── Mascot.tsx            # SVG del búho
    ├── MascotTypes.ts        # TypeScript types
    └── mascot.css            # Animaciones del búho

hooks/
├── useSplash.ts              # Hook principal
└── useSplashIntegration.ts   # Hook de integración

lib/splash/
├── routeConfig.ts            # Mapeo de rutas a variantes
└── README.md                 # Este archivo
```

## Próximas mejoras

- [ ] Agregar animaciones basadas en Intersection Observer
- [ ] Sistema de eventos para sincronizar con Supabase
- [ ] Más variantes especializadas
- [ ] Animaciones de transición entre variantes
- [ ] Soporte para custom rendering de mascota

## Más información

Voir `CONTRIBUTING.md` para directrices de desarrollo.
