# Sistema de Splash Screens Animadas - Sefardlab

## Estado: 🔧 EN IMPLEMENTACIÓN (Fase 6)

Este documento describe el sistema de Splash Screens con mascota pixel art que debe implementarse en Sefardlab.

### Referencias Visuales Confirmadas ✅
- **6 variantes de mascota búho sefardí**: Clásico, Sefardí, Desarrollador, Estudiante, Maestro/Rabínico, Gamificación
- **Pixel art:** Marrón, crema, gafas doradas, kipá azul, detalles sefardíes

### Arquitectura Definida

**Componentes:**
```
SplashProvider (Context)
├── SplashScreen (Overlay)
│   └── Mascot (SVG Animado)
└── SplashNavigationMonitor (Auto-integración)
```

**Estados de Animación:**
- `idle`: Respiración sutil, parpadeo natural
- `enter`: Fade-in + escala (0.6s)
- `loading`: Animación contextual por variante (loop)
- `success`: Pulse + checkmark
- `exit`: Fade-out (0.4s)
- `error`: Shake confuso

**6 Variantes de Mascota:**
1. **Clásico** - Túnica, libro hebreo, puntero (Pantalla principal)
2. **Sefardí** - Talit, franjas azules (Contenido cultural)
3. **Desarrollador** - Laptop, código (Herramientas interactivas)
4. **Estudiante** - Libros, cuaderno (Lecciones)
5. **Maestro/Rabínico** - Talit formal, libro Torá (Logros importantes)
6. **Gamificación** - Celebrando, mochila (XP, insignias, rachas)

### Integración

**1. En `app/providers.tsx`:**
```tsx
import { SplashProvider } from "@/components/splash/SplashProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <SplashProvider>
          <AuthProvider>
            <UserProvider>{children}</UserProvider>
          </AuthProvider>
        </SplashProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
}
```

**2. En `app/(app)/layout.tsx`:**
```tsx
import { SplashNavigationMonitor } from "@/components/splash/SplashNavigationMonitor";

export default function AppLayout({ children }) {
  return (
    <div>
      <SplashNavigationMonitor />
      {/* resto del layout */}
    </div>
  );
}
```

**3. Hook en cualquier componente cliente:**
```tsx
"use client";
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
    } catch {
      // Error handling
    }
  };

  return <button onClick={handleLoadData}>Cargar</button>;
}
```

### Próximos Pasos

**Fase 6 - Implementación Final (Estimado: 2 horas Haiku):**

1. ✅ Crear tipos TypeScript (MascotTypes.ts)
2. ✅ Crear componente SVG animado (Mascot.tsx)
3. ✅ Crear estilos CSS (mascot.css, splash.css)
4. ✅ Crear SplashScreen.tsx
5. ✅ Crear SplashProvider.tsx
6. ✅ Crear hooks (useSplash.ts, useSplashIntegration.ts)
7. ✅ Crear routeConfig.ts
8. ✅ Integrar con providers.tsx
9. ✅ Testing en navegadores (Chrome, Firefox, Safari)
10. ✅ Verificar WCAG AA, responsive, performance

### Validaciones Requeridas

- [ ] Typecheck (`npm run typecheck`)
- [ ] Lint (`npm run lint`)
- [ ] Animations 60 FPS (DevTools Performance)
- [ ] Responsive: 375px, 768px, 1280px
- [ ] WCAG AA compliance
- [ ] Tema claro/oscuro
- [ ] prefers-reduced-motion respetado
- [ ] SSR compatible (sin hydration mismatch)

### Archivos Base a Crear

**Por Vinicius Salazar - MIT License**
Sefardlab © 2026 - Open Source

### Notas
- Sin dependencias adicionales (solo React + CSS)
- SVG inline para máximo control y rendimiento
- Context + useState para estado global
- Compatible con Next.js App Router
- Accesibilidad nativa (ARIA, contraste, keyboard nav)

**Contacto:** vipasa.gbc@gmail.com | @invertilo
