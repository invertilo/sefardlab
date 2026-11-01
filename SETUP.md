# Guía de Configuración

Instrucciones paso a paso para configurar Sefardlab localmente.

## Requisitos

- **Node.js 18+** (recomendado 20+)
- **npm** o **yarn**
- **Git**
- **Cuenta de Supabase** (gratuita en supabase.com)

## Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/yourusername/sefardlab-nextjs.git
cd sefardlab-nextjs
```

## Paso 2: Instalar Dependencias

```bash
npm install
```

O con yarn:
```bash
yarn install
```

## Paso 3: Configurar Supabase

### 3.1 Crear un Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión o crea una cuenta
3. Crea un nuevo proyecto
4. Anota tu **Project URL** y **Anon Key**

### 3.2 Crear Tablas

Ejecuta las migraciones SQL en Supabase:

```sql
-- Users table (automático con Auth)
-- Solo necesitas habilitar Email auth en Authentication → Providers

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  language TEXT DEFAULT 'es',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create progress table
CREATE TABLE progress (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT now(),
  xp_earned INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Create achievements table
CREATE TABLE achievements (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  unlocked_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for users to access their own data
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can read own progress"
  ON progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own achievements"
  ON achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 3.3 Crear Variables de Entorno

Copia `.env.local.example` a `.env.local`:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Obtén estos valores de:
- Supabase Dashboard → Settings → API
- Project URL: la URL del proyecto
- Anon Key: bajo "Project API keys" → "anon (public)"

## Paso 4: Ejecutar en Desarrollo

```bash
npm run dev
```

La app estará disponible en [http://localhost:3000](http://localhost:3000)

## Paso 5: Verificar que Todo Funciona

### 5.1 Type Check
```bash
npm run typecheck
```

Debe completar sin errores.

### 5.2 Linting
```bash
npm run lint
```

Debe completar sin errores o warnings.

### 5.3 Build
```bash
npm run build
```

Debe completar sin errores.

### 5.4 Contrast Check
```bash
npm run contrast
```

Todos los colores deben pasar WCAG AA.

## Paso 6: Testing Manual

### Crear una Cuenta
1. Ve a http://localhost:3000
2. Click en "Comenzar mi reto"
3. Completa el signup
4. Verifica el email en Supabase (en desarrollo, puedes saltarte)

### Acceder al Dashboard
1. Login con tu cuenta
2. Deberías ver el dashboard con XP = 0
3. Completa una lección
4. Verifica que XP aumentó

### Cambiar Ajustes
1. Ve a http://localhost:3000/settings
2. Cambia el tema a "Oscuro"
3. Recarga la página
4. El tema debe estar guardado

## Estructura de Carpetas Importantes

```
sefardlab-nextjs/
├── app/                    # Next.js App Router
│   ├── (app)/             # Rutas protegidas
│   │   ├── dashboard/
│   │   ├── lesson/
│   │   ├── achievements/
│   │   └── settings/
│   ├── (auth)/            # Rutas públicas
│   ├── api/               # API routes
│   └── globals.css        # Design tokens
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   └── ...               # Componentes por página
├── lib/                   # Lógica compartida
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── api-client.ts     # Cliente de API
│   └── ...
├── public/               # Archivos estáticos
└── scripts/              # Scripts de utilidad
```

## Variables de Entorno

Ver `.env.local.example` para la lista completa:

```env
# Supabase (requerido)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Opcional: para desarrollo
NODE_ENV=development
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start

# Type checking
npm run typecheck

# Linting
npm run lint

# Verificar contraste de colores
npm run contrast

# Seed base de datos
npm run db:seed
```

## Troubleshooting

### "Module not found: @/lib/..."
Asegúrate de que el import es relativo a la raíz del proyecto. Verifica el `jsconfig.json` o `tsconfig.json`.

### "Supabase connection failed"
- Verifica que `NEXT_PUBLIC_SUPABASE_URL` es correcto
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` es correcto
- Verifica que el proyecto de Supabase está activo

### "Auth user is null"
- Asegúrate de haber habilitado Email auth en Supabase
- Verifica que las tablas de auth están creadas
- Limpia localStorage y vuelve a intentar

### "Contraste falla"
- Ejecuta `npm run contrast -- --help` para debug
- Verifica los tokens de color en `app/globals.css`

## Despliegue

### Vercel (Recomendado)

1. Push a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa el repositorio
4. Agrega variables de entorno
5. Deploy automático

```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

### Otras Plataformas

La app es una Next.js estándar con SSR. Funciona en:
- Netlify
- Railway
- Fly.io
- Docker
- etc.

## Proxies

El proyecto usa un proxy en `proxy.ts` para redirigir:
- `/dashboard` → `/login` si no hay sesión
- Otros redireccionamientos según la lógica del negocio

Ver `proxy.ts` para detalles.

## Performance

Optimizaciones incluidas:
- Next.js Image Optimization
- Font swapping para Google Fonts
- CSS animations respetan `prefers-reduced-motion`
- Lazy loading de componentes
- Code splitting automático

Verifica con:
```bash
npm run build
# Revisa el output para tamaños de bundle
```

## Contribuyendo

Lee [CONTRIBUTING.md](./CONTRIBUTING.md) para cómo contribuir al proyecto.

## Soporte

Si tienes problemas:
1. Revisa la documentación
2. Abre una issue en GitHub
3. Contacta al equipo

¡Bienvenido a Sefardlab!
