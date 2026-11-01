# Configurar Supabase para Sefardlab

Guía paso a paso para conectar la app con una base de datos Supabase (Fase 2: auth + datos).
Tiempo estimado: 10 minutos.

## 1. Crear el proyecto

1. Entra en [supabase.com](https://supabase.com) → **New project**.
2. Elige nombre (p. ej. `sefardlab`), una contraseña de base de datos segura y la región más cercana a tus usuarios (p. ej. `West EU`).
3. Espera a que termine de aprovisionarse (1–2 minutos).

## 2. Copiar URL y claves

En **Project Settings → API** (o el botón **Connect → App Frameworks → Next.js**):

| Variable | Dónde está | ¿Pública? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` key (o la nueva *publishable key* `sb_publishable_…`) | Sí, protegida por RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (o *secret key* `sb_secret_…`) | **No.** Solo para el seed |

```bash
cp .env.local.example .env.local
# y rellena los tres valores
```

`.env.local` está en `.gitignore`. **Nunca** subas la `service_role` a Git ni le pongas el prefijo `NEXT_PUBLIC_`: salta todas las políticas de seguridad.

## 3. Ejecutar la migración SQL

1. Abre **SQL Editor → New query**.
2. Pega el contenido completo de [`db/migrations/001_init.sql`](db/migrations/001_init.sql) y pulsa **Run**.

Crea:

- Tablas `users`, `lessons`, `progress`, `achievements`.
- **Row Level Security**: cada usuario solo ve y edita sus propios datos; las lecciones son de lectura pública.
- **Permisos por columna**: el cliente no puede escribir `xp_total`, `streak` ni `xp_earned`.
- **Triggers**:
  - `on_auth_user_created`: crea la fila en `public.users` al registrarse (también con Google).
  - `progress_compute_xp`: calcula la XP de cada lección (la fórmula definitiva la fija `002_gamification.sql`).
  - `progress_award_xp`: suma la XP al usuario y actualiza la racha diaria (UTC).

3. Después, pega y ejecuta [`db/migrations/002_gamification.sql`](db/migrations/002_gamification.sql) (fase 4). Añade:
  - Nueva fórmula de XP en `progress_compute_xp`: 10 base + precisión (100% → +30, 80–99% → +20, 60–79% → +10) + lectura rápida ≥ 80 ppm (+10) + bonus de racha al llegar a 7 días (+100) y a 30 días (+200).
  - `lessons.word_count` (columna generada) y `progress.attempts`: palabras leídas, contando repasos (máx. uno por minuto).
  - `progress_unlock_achievements`: desbloquea automáticamente las 12 insignias (`award_achievements`) y da las que correspondan al progreso ya existente.

Comprueba en **Table Editor** que aparecen las cuatro tablas.

## 4. Insertar las 30 lecciones (seed)

**Opción A: script (recomendada).** Requiere `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`:

```bash
npm run db:seed
# ✓ 30 lecciones sincronizadas. Total en la base de datos: 30.
```

**Opción B: sin service key.** Genera el SQL y pégalo en el SQL Editor:

```bash
npm run db:seed -- --sql > db/seed.sql
```

Para validar `db/seed.json` sin tocar la base de datos: `npm run db:seed -- --check`.

El seed es idempotente (upsert por `id`): puedes volver a ejecutarlo tras editar `db/seed.json`.

## 5. Ajustes de Auth

En **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` en desarrollo (tu dominio en producción).
- **Redirect URLs**: añade `http://localhost:3000/auth/callback` (y la de producción).

En **Authentication → Providers → Email**:

- **Confirm email** activado (por defecto): tras registrarse, el usuario ve «revisa tu correo» y entra después de confirmar. El enlace pasa por `/auth/callback` y lo lleva al panel.
- Desactivado (cómodo en desarrollo): el registro inicia sesión al instante y redirige a `/dashboard`.

> El SMTP integrado de Supabase tiene un límite bajo de correos por hora. Para producción configura un SMTP propio en **Authentication → Emails → SMTP Settings**.

## 6. Google OAuth (opcional)

1. En [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials → Create credentials → OAuth client ID** (tipo *Web application*).
2. **Authorized redirect URI**: `https://<tu-proyecto>.supabase.co/auth/v1/callback` (aparece en Supabase al activar Google).
3. En Supabase → **Authentication → Providers → Google**: activa, pega *Client ID* y *Client Secret*.
4. El callback de la app ya existe (`app/auth/callback/route.ts`). Para añadir el botón en el login:

   ```ts
   import { getSupabaseBrowserClient } from "@/lib/supabase";

   await getSupabaseBrowserClient().auth.signInWithOAuth({
     provider: "google",
     options: { redirectTo: `${location.origin}/auth/callback?next=/dashboard` },
   });
   ```

   El trigger usa `full_name` de Google como nombre del perfil.

## 7. Probar

```bash
npm run dev
curl localhost:3000/api/health   # → "supabase": true
```

1. `/signup` → crea una cuenta → redirige a `/dashboard`.
2. Recarga la página: la sesión persiste (cookies `sb-…`).
3. **Salir** en la cabecera → vuelve a `/login`; `/dashboard` redirige a `/login`.
4. Con sesión iniciada: `GET /api/user/stats` devuelve tus estadísticas.

## Referencia de la API

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/auth/signup` | `{ name, email, password, goal?, level? }` → `{ user, session, needsEmailConfirmation }` |
| POST | `/api/auth/login` | `{ email, password }` → `{ user, session }` (y cookies de sesión) |
| POST | `/api/auth/logout` | Cierra la sesión y borra las cookies |
| GET | `/api/auth/me` | `{ user }` de la sesión actual, o `{ user: null }` |
| GET | `/api/lessons` | Resumen de las 30 lecciones. `?full=1` incluye contenido; `?week=1..4` filtra |
| GET | `/api/lessons/[day]` | Lección completa del día 1–30 |
| GET | `/api/progress/[userId]` | Progreso del usuario (`me` o su UUID; solo el propio) |
| POST | `/api/progress/[userId]` | `{ lesson_id, accuracy (0–1), reading_speed? }`. XP solo la primera vez; si se repite, guarda la mejor marca |
| GET | `/api/user/stats` | XP, racha, lecciones completadas, día actual, medias, progreso por semana |

Los errores siempre tienen la forma `{ error: { code, message, fields? } }`, con mensajes en español listos para mostrar.

## Solución de problemas

- **`503 not_configured`**: faltan las variables en `.env.local`. Reinicia `npm run dev` tras editarlo.
- **`relation "public.lessons" does not exist`** en el seed: no se ejecutó la migración (paso 3).
- **`Correo o contraseña incorrectos`** justo tras registrarte: confirma primero el correo (o desactiva *Confirm email*).
- **Usuarios creados antes de la migración** no tienen perfil: la API lo crea automáticamente en el primer login.
