# Testing Checklist - Fase 5

Guía completa para testing manual de Sefardlab.

## Checklist de Rutas

### Landing Page (/)
- [ ] Carga sin errores
- [ ] Hero section visible y responsive
- [ ] Botón "Comenzar mi reto" funciona
- [ ] Botón "Probar una lección" navega a demo
- [ ] Links de navegación funciona
- [ ] Footer visible
- [ ] Responsive en 375px, 768px, 1280px

### Auth Pages

#### Login (/login)
- [ ] Carga sin errores
- [ ] Formulario campos requeridos
- [ ] Validación email funciona
- [ ] Validación contraseña funciona
- [ ] Login correcto redirige a /dashboard
- [ ] Error login muestra mensaje claro
- [ ] Link a signup funciona
- [ ] Responsive en 375px, 768px, 1280px

#### Signup (/signup)
- [ ] Carga sin errores
- [ ] Formulario campos requeridos
- [ ] Validación email funciona
- [ ] Validación contraseña funciona
- [ ] Password confirmation funciona
- [ ] Signup exitoso redirige a /dashboard
- [ ] Duplicar email muestra error
- [ ] Link a login funciona
- [ ] Responsive en 375px, 768px, 1280px

### App Pages (con sesión)

#### Dashboard (/dashboard)
- [ ] Carga sin errores
- [ ] Muestra nombre del usuario
- [ ] Muestra XP correcto
- [ ] Muestra racha correcta
- [ ] Muestra 3 insignias recientes
- [ ] Mostrar todas insignias funciona
- [ ] Card "Siguiente lección" aparece
- [ ] Calendario de actividad visible
- [ ] Botón "Ir a lección" funciona
- [ ] Responsive en 375px, 768px, 1280px

#### Lección (/lesson/1 - /lesson/30)
- [ ] Carga sin errores
- [ ] Muestra contenido de lección
- [ ] Botón "Completar" funciona
- [ ] Completar suma XP (100)
- [ ] Racha aumenta si es primer día
- [ ] Redirige a siguiente lección
- [ ] Lecciones 1-7 son Alfabeto
- [ ] Lecciones 8-15 son Palabras
- [ ] Lecciones 16-23 son Frases
- [ ] Lecciones 24-30 son Lectura
- [ ] Responsive en 375px, 768px, 1280px

#### Achievements (/achievements)
- [ ] Carga sin errores
- [ ] Muestra todas insignias
- [ ] Insignias desbloqueadas tienen check
- [ ] Insignias bloqueadas muestran requisitos
- [ ] Click en insignia muestra detalles
- [ ] Scroll funciona si hay muchas
- [ ] Responsive en 375px, 768px, 1280px

#### Settings (/settings) - NUEVA
- [ ] Carga sin errores
- [ ] Tema "Claro" aplica tema claro
- [ ] Tema "Oscuro" aplica tema oscuro
- [ ] Tema "Sistema" respeta preferencia del SO
- [ ] Tema persiste después de recargar
- [ ] Tamaño "Pequeño" aplica font-size: 14px
- [ ] Tamaño "Normal" aplica font-size: 16px
- [ ] Tamaño "Grande" aplica font-size: 18px
- [ ] Tamaño persiste después de recargar
- [ ] Idioma "Español" funciona
- [ ] Idioma "English" (si está implementado)
- [ ] Idioma "עברית" (si está implementado)
- [ ] Toggle Sonido activa/desactiva
- [ ] Toggle Notificaciones activa/desactiva
- [ ] Botón "Salir" logout funciona
- [ ] Después de logout va a /login
- [ ] Responsive en 375px, 768px, 1280px

### Navigation

- [ ] Header sticks to top en scroll
- [ ] Logo navega a /dashboard (autenticado)
- [ ] Logo navega a / (no autenticado)
- [ ] Botones de navegación trabajan
- [ ] Active state correcto en nav
- [ ] Settings button lleva a /settings
- [ ] Logout button funciona

## Flujos Principales

### Signup → Login → Dashboard
- [ ] 1. Ve a / (landing)
- [ ] 2. Click "Comenzar mi reto"
- [ ] 3. Completa formulario signup
- [ ] 4. Recibe confirmación
- [ ] 5. Login con credenciales
- [ ] 6. Llega a /dashboard
- [ ] 7. Dashboard muestra datos correctos

### Completar Lección
- [ ] 1. Ve a /dashboard
- [ ] 2. XP inicial = 0
- [ ] 3. Click en lección
- [ ] 4. Carga contenido
- [ ] 5. Click "Completar"
- [ ] 6. XP aumenta a 100
- [ ] 7. Redirige a siguiente lección
- [ ] 8. Dashboard actualiza XP

### Racha y Actividad
- [ ] 1. Completa una lección hoy
- [ ] 2. Racha = 1
- [ ] 3. Vuelve mañana, completa lección
- [ ] 4. Racha = 2
- [ ] 5. Si faltas un día, racha = 0
- [ ] 6. Calendario muestra puntos verdes

### Insignias Desbloquearse
- [ ] 1. Completa 7 lecciones
- [ ] 2. Insignia "Principiante" se desbloquea
- [ ] 3. Aparece en achievements
- [ ] 4. Notification (si está habilitada)

### Cambiar Tema Persiste
- [ ] 1. Ve a /settings
- [ ] 2. Selecciona "Oscuro"
- [ ] 3. Tema cambia a oscuro
- [ ] 4. Recarga página (Cmd+R)
- [ ] 5. Tema sigue siendo oscuro
- [ ] 6. Ve a otra página (/dashboard)
- [ ] 7. Tema oscuro mantiene

### Cambiar Idioma (si está implementado)
- [ ] 1. Ve a /settings
- [ ] 2. Selecciona idioma
- [ ] 3. Interfaz cambia idioma
- [ ] 4. Persiste después de recargar

## Responsiveness Testing

### 375px (iPhone SE)
#### Todos los elementos
- [ ] No hay scroll horizontal
- [ ] Botones ≥ 44x44px
- [ ] Touch targets espaciados
- [ ] Texto legible sin zoom
- [ ] Imágenes caben en pantalla
- [ ] Forms usan full width

#### Páginas específicas
- [ ] Landing: Stack vertical
- [ ] Login/Signup: Formularios full width
- [ ] Dashboard: Stats en column
- [ ] Lección: Contenido full width
- [ ] Achievements: Grid 1 columna
- [ ] Settings: Cards full width

### 768px (iPad)
#### Todos los elementos
- [ ] Layouts ajustados
- [ ] Spacing correcto
- [ ] Dos columnas donde sea apropiado
- [ ] Imágenes escaladas correctamente
- [ ] Navegación visible

#### Páginas específicas
- [ ] Landing: Dos columnas hero + demo
- [ ] Dashboard: Stats 2x2 grid
- [ ] Achievements: Grid 2 columnas
- [ ] Settings: Máximo 2 columnas

### 1280px (Desktop)
#### Todos los elementos
- [ ] Máximo ancho 1280px (centrado)
- [ ] Spacing generoso
- [ ] Hover effects visibles
- [ ] Uso completo del espacio

## Accesibilidad (WCAG AA)

### Contraste
- [ ] Ejecutar: `npm run contrast`
- [ ] Todos los textos ≥ 4.5:1 (pequeño)
- [ ] Todos UI elements ≥ 3:1 (grande)

### Keyboard Navigation
- [ ] Tab navega por inputs
- [ ] Shift+Tab va atrás
- [ ] Enter activa botones
- [ ] Space activa checkboxes
- [ ] Escape cierra modales (si hay)
- [ ] Focus visible (outline)

### Screen Reader
- [ ] Heading hierarchy correcto (h1, h2, h3)
- [ ] Links tienen textos descriptivos
- [ ] Buttons tienen aria-labels
- [ ] Images tienen alt text
- [ ] Form inputs tienen labels
- [ ] Arrowless (aria-hidden) para decoración

### Labels y ARIA
- [ ] Todos los inputs tienen <label>
- [ ] Radios tienen fieldset
- [ ] Checkboxes tienen label
- [ ] Errores tienen aria-invalid
- [ ] Help text tiene aria-describedby

## Performance

### Loading Times
- [ ] Landing carga en <3s (usando DevTools)
- [ ] Dashboard carga en <2s
- [ ] Lección carga en <1s
- [ ] Settings carga en <1s

### Web Vitals
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

### Imágenes
- [ ] Todas optimizadas (no >500KB)
- [ ] Formatos modernos (webp)
- [ ] Lazy loading aplicado

## Console y Errores

### Errors
- [ ] No hay errores en console (F12)
- [ ] No hay warnings en console
- [ ] No hay errores de red 4xx/5xx

### Warnings Permitidos
- [ ] React StrictMode warnings en dev (esperado)
- [ ] Warnings de CSS (revisados)

## Navegadores

### Chrome (Latest)
- [ ] Todas las rutas cargan
- [ ] No hay errores
- [ ] Responsive funciona
- [ ] DevTools sin warnings

### Firefox (Latest)
- [ ] Todas las rutas cargan
- [ ] No hay errores
- [ ] Responsive funciona
- [ ] Console sin warnings

### Safari (Latest)
- [ ] Todas las rutas cargan
- [ ] No hay errores
- [ ] Responsive funciona
- [ ] Web Inspector sin warnings

### Mobile
- [ ] iOS Safari (iPhone)
- [ ] Chrome Android
- [ ] Ambos usan viewport correcto
- [ ] Touch funciona
- [ ] 44px buttons son tapeable

## Animaciones

### Verificar Animaciones Existen
- [ ] Hero fade-in al cargar landing
- [ ] XP counter en dashboard anima
- [ ] Insignia pop-in al desbloquear
- [ ] Transiciones suaves al cambiar página

### Verificar Respeto a Preferencias
- [ ] `prefers-reduced-motion: reduce` desactiva animaciones
- [ ] Prueba: DevTools → Rendering → Emulate CSS media feature
- [ ] Página debe funcionar sin animaciones

## Build y Deployment

### Local Build
- [ ] `npm run build` sin errores
- [ ] `npm run build` sin warnings
- [ ] Build completa en < 2 minutos
- [ ] Output muestra todas las rutas

### Production Build Test
- [ ] `npm start` inicia servidor
- [ ] Todas las rutas accesibles
- [ ] Datos cargan correctamente
- [ ] No hay errores en console

## Edge Cases

### Sin Sesión
- [ ] /dashboard redirige a /login
- [ ] /lesson/1 redirige a /login
- [ ] /achievements redirige a /login
- [ ] /settings redirige a /login

### Sin Conexión (Offline)
- [ ] Página muestra error graceful
- [ ] Botones deshabilitados
- [ ] Mensaje de retry aparece

### Datos Vacíos
- [ ] Sin lecciones completadas: Dashboard show "Comienza tu primer reto"
- [ ] Sin insignias: Achievements muestra "Sin insignias aún"

### Errores de API
- [ ] Error al cargar lecciones muestra "Algo salió mal"
- [ ] Error al login muestra mensaje claro
- [ ] Retry button funciona

## Checklist Final

- [ ] Todas las rutas cargan sin errores
- [ ] Todos los flujos funcionan
- [ ] Responsive en 375px, 768px, 1280px
- [ ] Accesibilidad WCAG AA (npm run contrast)
- [ ] Keyboard navigation funciona
- [ ] Animaciones funcionan y respetan preferencias
- [ ] Performance aceptable
- [ ] Sin console errors/warnings
- [ ] Todos los navegadores funcionan
- [ ] Edge cases manejan correctamente
- [ ] Documentation complete
- [ ] `npm run build` pasa
- [ ] `npm run lint` pasa
- [ ] `npm run typecheck` pasa

## Reporte de Errores

Si encuentras un error:

1. **Describe el problema**
   - URL donde ocurre
   - Pasos para reproducir
   - Resultado esperado vs actual

2. **Información del sistema**
   - Navegador y versión
   - Sistema operativo
   - Resolución de pantalla

3. **Console output**
   - Abre DevTools (F12)
   - Console tab
   - Captura screenshot de errores

4. **Abre issue en GitHub**
   - Título descriptivo
   - Descripción clara
   - Screenshots/videos si es posible

---

**Actualizado:** 2026-11-01
