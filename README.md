<div align="center">

<!-- FOTO DEL DESARROLLADOR -->
<img src="https://github.com/invertilo.png?size=200" alt="Vinicius Salazar" width="200" height="200" style="border-radius: 50%; border: 4px solid #1B4965; margin: 20px 0;" />

# Sefardlab 📚

### Aprende a LEER hebreo en 30 días

[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/invertilo/sefardlab)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/invertilo/sefardlab?style=social)](https://github.com/invertilo/sefardlab)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/invertilo/sefardlab/pulls)

**Una aplicación web moderna para aprender a leer hebreo desde español en solo 30 días.**

[🌐 Visita la App](#) • [📖 Documentación](#) • [🐛 Reportar Bug](#) • [💡 Sugerir Feature](#)

</div>

---

## ✨ Características

<div align="center">

| 🔤 | 📖 | ⚡ | 🎯 |
|---|---|---|---|
| **Alfabeto en 7 días** | **Lectura fluida** | **Gamificación** | **30 días garantizados** |
| Aprende todas las letras hebreas | Textos narrativos completos | Puntos, racha, insignias | Currículo comprobado |

</div>

### 🎮 Sistema de Gamificación
- 🔥 **Racha diaria** con multiplicadores (hasta 1.5x)
- ⭐ **Sistema de XP** (20 pts/lección, 100 pts/semana)
- 🏆 **12 insignias desbloqueables** desde "Primer Alef" a "Maestro"
- 📊 **Dashboard con estadísticas** (velocidad, comprensión, progreso)

### 🗓️ Currículo de 30 Días

**Semana 1:** Alfabeto hebreo (22 letras)  
**Semana 2:** 100+ palabras comunes  
**Semana 3:** Lectura de frases y oraciones  
**Semana 4:** Textos fluidos (80+ palabras/min)  

### 🎨 Diseño Profesional
- Interfaz minimalista y moderna
- Tema claro/oscuro automático
- Totalmente responsivo (móvil, tablet, desktop)
- Paleta heredada de la cultura sefardí

---

## 🚀 Tecnología

```
Frontend:
- Next.js 16+ (React 19, TypeScript)
- Tailwind CSS + CSS Modules
- Components: Button, Card, Badge, Input, Select

Backend & Base de Datos:
- Supabase (PostgreSQL)
- Supabase Auth (Email + Google OAuth)

Estado:
- React Context
- TanStack Query (SWR)

Hosting:
- Vercel
- Dominio personalizado
```

---

## 📦 Instalación

### Requisitos
- Node.js 18+
- npm o yarn

### Setup Local

```bash
# Clonar repositorio
git clone https://github.com/invertilo/sefardlab.git
cd sefardlab

# Instalar dependencias
npm install

# Variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tus credenciales Supabase

# Ejecutar en desarrollo
npm run dev

# Abre http://localhost:3000
```

### Configurar Supabase

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Ejecutar migraciones SQL desde `db/migrations/001_init.sql`
4. Copiar keys a `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

**Ver [SUPABASE_SETUP.md](SUPABASE_SETUP.md) para instrucciones detalladas.**

---

## 📁 Estructura del Proyecto

```
sefardlab-nextjs/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── lesson/[id]/page.tsx
│   │   ├── profile/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── lessons/
│   │   ├── progress/
│   │   └── achievements/
│   ├── globals.css
│   └── providers.tsx
├── components/
│   ├── ui/                     # Button, Card, Badge, Input, Select
│   ├── lesson/                 # LessonCard, ExerciseComponent
│   ├── dashboard/              # ProgressBar, Streak, XPBar
│   ├── layout/                 # Header, Footer, Sidebar
│   ├── auth/                   # LoginForm, SignupForm
│   └── landing/                # Hero, Features, Stats
├── lib/
│   ├── supabase.ts            # Cliente Supabase
│   ├── hooks/                 # useAuth, useProgress, useUser
│   ├── utils.ts               # Utilidades
│   ├── validation.ts          # Zod schemas
│   └── constants.ts           # Datos de lecciones (30 días)
├── public/
│   ├── logo.png               # Logo profesional
│   └── icons/                 # SVG icons (book, star, fire, etc)
├── db/
│   ├── migrations/            # SQL migrations
│   ├── seed.json              # Datos de 30 lecciones
│   └── seed.ts                # Script para insertar datos
├── .env.local.example
└── package.json
```

---

## 🎯 Roadmap

- [x] Landing page profesional
- [x] Design system Tailwind
- [x] Estructura Next.js
- [x] Sistema de autenticación Supabase
- [x] Base de datos PostgreSQL
- [ ] Dashboard con progreso real
- [ ] Componentes de lección interactivos
- [ ] Sistema de audio/pronunciación
- [ ] Exportar progreso (PDF)
- [ ] Modo offline
- [ ] App móvil (React Native)
- [ ] Comunidad y foros
- [ ] Certificado digital

---

## 🤝 Contribuir

¡Estamos abiertos a nuevas ideas y mejoras! Si tienes una idea para mejorar Sefardlab, ¡queremos escucharla!

### Cómo contribuir:

1. **Fork** el repositorio
   ```bash
   git clone https://github.com/invertilo/sefardlab.git
   ```

2. Crea una rama para tu feature
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. Commit tus cambios
   ```bash
   git commit -m 'Add amazing feature'
   ```

4. Push a la rama
   ```bash
   git push origin feature/amazing-feature
   ```

5. Abre un **Pull Request** con descripción clara de los cambios

### Áreas donde necesitamos ayuda:
- 🎨 **UI/UX Improvements** - Diseño y usabilidad
- 🔊 **Audio System** - Pronunciación y listening
- 📱 **Mobile App** - Versión nativa iOS/Android
- 🌍 **Traducciones** - Interfaz en otros idiomas
- 📚 **Contenido** - Nuevas lecciones y material educativo
- 🐛 **Testing & QA** - Pruebas y reportes de bugs
- 📖 **Documentación** - Mejoras en docs y guías

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para guía completa de contribución.

---

## 📄 Licencia

Este proyecto es **Open Source** bajo la licencia **MIT**.

Esto significa que puedes:
- ✅ Usar el código libremente
- ✅ Modificar y distribuir
- ✅ Usar en proyectos comerciales

Ver [LICENSE](LICENSE) para más detalles.

---

## 👨‍💻 Desarrollador Principal

**Vinicius Salazar**
- 🐙 GitHub: [@invertilo](https://github.com/invertilo)
- 📧 Email: [vipasa.gbc@gmail.com](mailto:vipasa.gbc@gmail.com)
- 💼 LinkedIn: [/in/invertilo](https://linkedin.com/in/invertilo)

---

## 🙏 Agradecimientos

- Diseño inspirado en la cultura sefardí y hebraica
- Comunidad global de educación en línea
- Todos los **contribuidores** que mejoran el proyecto
- La comunidad hispanohablante que quiere aprender hebreo

---

## 📞 Contacto & Soporte

- 🐛 [Reportar Bug](https://github.com/invertilo/sefardlab/issues/new?labels=bug)
- 💡 [Solicitar Feature](https://github.com/invertilo/sefardlab/issues/new?labels=enhancement)
- 💬 [Diskusiones](https://github.com/invertilo/sefardlab/discussions)
- 📧 Email: vipasa.gbc@gmail.com

---

## 📊 Estadísticas del Proyecto

- **Lenguaje:** TypeScript
- **Licencia:** MIT
- **Última Actualización:** 2026
- **Estado:** 🟢 En Desarrollo Activo

---

<div align="center">

### ⭐ ¡Apoya el proyecto!

Si te gusta Sefardlab, dale una estrella en GitHub. Significa mucho para nosotros.

---

Hecho con ❤️ para la comunidad hispanohablante  
que quiere aprender a leer hebreo

**"Del español al hebreo en 30 días"**

</div>
