# HEat - Plataforma de Pedidos de Comida

Plataforma web para pedidos de arepas, perros calientes y hamburguesas con estética gummy y colores vibrantes.

## Stack Tecnológico

- **Frontend**: Nuxt 3 + Vue 3 + TypeScript
- **Styling**: UnoCSS
- **Animaciones**: GSAP
- **Auth**: Supabase Auth (Google OAuth + Phone)
- **Database**: Supabase PostgreSQL
- **Realtime**: Supabase Realtime
- **PWA**: @vite-pwa/nuxt

## Requisitos

- Node.js 18+
- Una cuenta de Supabase

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
NUXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Configuración de Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ve a SQL Editor y ejecuta los archivos en orden:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_products.sql`

3. Configura la autenticación:
   - Ve a Authentication > Providers
   - Habilita Google OAuth
   - Configura las URL de redirect

### 3. Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview producción
npm run preview
```

## Estructura del Proyecto

```
app/
├── features/           # Módulos por feature (screaming architecture)
│   ├── home/          # Catálogo de productos
│   ├── cart/          # Carrito de compras
│   ├── orders/        # Historial de pedidos
│   ├── announcements/ # Avisos y promociones
│   ├── user/          # Perfil de usuario
│   └── auth/          # Autenticación
├── shared/            # Componentes y utilidades compartidas
│   ├── components/
│   │   ├── layout/   # AppHeader, SideNav, BottomNav, Footer
│   │   └── ui/       # GummyButton, GummyCard, etc.
│   ├── styles/       # theme.css
│   └── utils/
├── pages/             # Rutas de la aplicación
├── layouts/           # Layouts de Nuxt
└── plugins/           # Plugins de Nuxt
```

## Características

- **Diseño Gummy**: Estética suave, redondeada y 3D
- **Responsive**: Navegación lateral en desktop, inferior en mobile
- **PWA**: Instalable y funciona offline
- **Configurador de Productos**: Personaliza tus pedidos con animaciones
- **Realtime**: Estado de pedidos en tiempo real
- **Auth**: Login con Google o teléfono

## Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Orange | #FF6B35 | Primario |
| Orange Light | #FFAB40 | Gradiente |
| Cyan | #00D9FF | Acento |
| White | #FFFEFA | Fondo |

## Desarrollo

```bash
# Linting
npm run lint

# Type check
npm run typecheck
```

## Licencia

Privado
