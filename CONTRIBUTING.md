# Guía de Contribución

¡Gracias por tu interés en contribuir a Sefardlab! Este documento te ayudará a entender cómo contribuir al proyecto.

## Antes de Empezar

1. Lee el [README.md](./README.md) para entender el proyecto
2. Revisa el [SETUP.md](./SETUP.md) para configurar tu entorno
3. Familiarízate con la estructura del proyecto

## Estructura del Proyecto

```
sefardlab-nextjs/
├── app/                      # Next.js App Router
│   ├── (app)/               # Rutas protegidas (requieren sesión)
│   │   ├── dashboard/       # Panel principal
│   │   ├── lesson/          # Páginas de lecciones
│   │   ├── achievements/    # Página de insignias
│   │   └── settings/        # Página de ajustes
│   ├── (auth)/              # Rutas de autenticación
│   │   ├── login/
│   │   └── signup/
│   ├── api/                 # API routes
│   ├── layout.tsx           # Layout raíz
│   ├── page.tsx             # Landing page
│   └── globals.css          # Estilos globales
├── components/              # Componentes React
│   ├── auth/               # Componentes de autenticación
│   ├── dashboard/          # Componentes del dashboard
│   ├── landing/            # Componentes de landing
│   ├── layout/             # Componentes de layout
│   ├── lesson/             # Componentes de lecciones
│   ├── settings/           # Componentes de ajustes
│   └── ui/                 # Componentes UI base
├── lib/                     # Librerías y utilidades
│   ├── api-client.ts       # Cliente API
│   ├── api-server.ts       # Funciones del servidor
│   ├── api-types.ts        # Tipos de API
│   ├── contexts/           # Contextos de React
│   ├── hooks/              # Custom hooks
│   ├── database.types.ts   # Tipos de base de datos
│   └── ...
├── public/                  # Archivos estáticos
├── scripts/                 # Scripts de utilidad
├── db/                      # Base de datos (seed, migrations)
└── package.json
```

## Principios de Diseño

### 1. Accesibilidad (WCAG AA)
- Contraste mínimo 4.5:1 para texto pequeño, 3:1 para grande
- Targets mínimo 44x44px (mobile-friendly)
- Keyboard navigation funciona en toda la app
- Atributos ARIA donde sea necesario
- Labels en todos los inputs

**Script de validación:**
```bash
npm run contrast
```

### 2. Responsiveness
Tres breakpoints principales:
- **375px (iPhone SE):** Sin scroll horizontal, botones 44px mín
- **768px (iPad):** Layouts ajustados, spacing correcto
- **1280px (Desktop):** Uso completo del espacio

Usa `clamp()` para responsive font sizing:
```tsx
// En lugar de breakpoints fijos
className="text-[clamp(1rem,1.5rem+1.5vw,2rem)]"
```

### 3. Sistema de Diseño
Todos los colores usan tokens CSS (no hex sueltos):
```tsx
// ✅ Correcto
<div className="bg-primary text-on-primary">

// ❌ Incorrecto
<div className="bg-[#1B4965] text-white">
```

Tokens disponibles en `app/globals.css`:
- Colores: `primary`, `secondary`, `accent`, `success`
- Background: `bg`, `surface`, `surface-sunken`
- Text: `text`, `muted`, `border`
- Estados: `hover:bg-primary-hover`, `focus:border-primary`

### 4. Animaciones
- Fade-in en carga: `animate-fade-in`
- Slide-up: `animate-slide-up`
- Pop: `animate-pop`
- Todas desactivadas con `prefers-reduced-motion`

```tsx
<div className="animate-fade-in">
  Contenido que aparece suavemente
</div>
```

### 5. TypeScript Strict
```bash
npm run typecheck
```

Todo debe estar tipado. Sin `any`.

## Proceso de Desarrollo

### 1. Crear una Rama
```bash
git checkout -b feature/nombre-descriptivo
```

### 2. Hacer Cambios
```bash
npm run dev
```

Visite http://localhost:3000 para ver los cambios en tiempo real.

### 3. Verificar Calidad

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Contrast checking
npm run contrast

# Build de producción
npm run build
```

Todos deben pasar sin errores.

### 4. Crear Commit

```bash
git add .
git commit -m "feat: descripción breve de los cambios"
```

Formato de commit:
- `feat:` Nueva feature
- `fix:` Corrección de bug
- `refactor:` Cambios sin afectar comportamiento
- `docs:` Cambios en documentación
- `test:` Cambios en tests
- `perf:` Mejoras de performance

### 5. Hacer Pull Request

Push a tu rama:
```bash
git push origin feature/nombre-descriptivo
```

Crea un PR en GitHub con descripción clara de:
- Qué cambió
- Por qué cambió
- Cómo probarlo

## Testing Manual

### Rutas Principales (Verificar que cargan)
- [ ] `/` (landing) - sin sesión
- [ ] `/login` - sin sesión
- [ ] `/signup` - sin sesión
- [ ] `/dashboard` - con sesión
- [ ] `/lesson/1` a `/lesson/30` - con sesión
- [ ] `/achievements` - con sesión
- [ ] `/settings` - con sesión

### Flujos Principales
- [ ] Signup → Login → Dashboard
- [ ] Completar lección → XP se suma
- [ ] Racha aumenta después de lección
- [ ] Insignia se desbloquea
- [ ] Cambiar tema/idioma/fuente persiste

### Responsiveness
- [ ] 375px: Sin scroll horizontal
- [ ] 768px: Layouts ajustados
- [ ] 1280px: Uso completo del espacio

### Performance
- [ ] Landing carga en <3s
- [ ] Dashboard carga en <2s
- [ ] Lección carga en <1s

### Navegadores
- [ ] Chrome latest
- [ ] Firefox latest
- [ ] Safari latest
- [ ] Mobile (Safari iOS, Chrome Android)

## Componentes Comunes

### Button
```tsx
import { Button } from "@/components/ui/Button";

<Button variant="primary" size="md" fullWidth>
  Click me
</Button>
```

Variantes: `primary`, `secondary`, `accent`, `outline`, `ghost`
Tamaños: `sm` (36px), `md` (44px), `lg` (52px)

### Input
```tsx
import { Input } from "@/components/ui/Input";

<Input
  label="Email"
  type="email"
  placeholder="tu@email.com"
  hint="Usaremos esto para tu cuenta"
  error={errors.email}
/>
```

### Select
```tsx
import { Select } from "@/components/ui/Select";

<Select
  label="Idioma"
  options={[
    { value: "es", label: "Español" },
    { value: "en", label: "English" },
  ]}
  value={language}
  onChange={(e) => setLanguage(e.target.value)}
/>
```

### Card
```tsx
import { Card } from "@/components/ui/Card";

<Card padding="lg">
  <h2>Contenido</h2>
</Card>
```

## Contextos Disponibles

### useAuth()
```tsx
const { user, isAuthenticated, login, signup, logout } = useAuth();
```

### useUser()
```tsx
const { user, stats, isLoading, error, refetchStats } = useUser();
```

### usePreferences()
```tsx
const { preferences, setTheme, setFontSize, setLanguage, setSound, setNotifications } = usePreferences();
```

## Base de Datos

La base de datos usa Supabase. Las migraciones están en `db/seed.ts`.

Para ver las tablas:
```bash
npm run db:seed
```

## Debugging

### Console Errors
Verifica que no haya errores en la consola del navegador (F12).

### Network Requests
Usa DevTools → Network para verificar que las API calls funcionan.

### React DevTools
Instala React DevTools para inspeccionar componentes y contextos.

## Preguntas?

Revisa la documentación en el proyecto o abre una issue en GitHub.

¡Gracias por contribuir a Sefardlab!
