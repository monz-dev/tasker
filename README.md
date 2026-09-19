# Tasker - Gestión de Proyectos Ágiles

Tasker es una aplicación web moderna para la gestión de proyectos, tareas y sprints. Diseñada para equipos ágiles, utiliza React, Zustand y Supabase para ofrecer una experiencia de usuario rápida, fluida y con datos persistentes en tiempo real.

## Inicio Rápido (Quick Path)

Sigue estos pasos para levantar el entorno de desarrollo local:

1. **Instalar dependencias**:

   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   Copia el archivo de ejemplo y agrega tus credenciales de Supabase:

   ```bash
   cp .env.example .env
   # Edita .env y completa NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

3. **Ejecutar el servidor de desarrollo**:

   ```bash
   npm run dev
   ```

4. **Verificar**:
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Características Principales (Details)

| Módulo | Descripción |
| -------- | ------------- |
| **Dashboard** | Resumen del estado de los proyectos y tareas pendientes. |
| **Proyectos** | Creación y administración de espacios de trabajo colaborativos. |
| **Kanban** | Tablero visual de columnas para el seguimiento del flujo de tareas. |
| **Agile Sprints** | Gestión del Product Backlog, planificación de Sprints y estimación de puntos. |
| **Timeline** | Vista de cronograma orientada a monitorear fechas límite y progreso. |
| **Colaboración** | Invitaciones por email a proyectos con roles (owner/member). |
| **Auto-logout** | Cierre de sesión automático por inactividad, con sincronización entre pestañas. |

## Stack Tecnológico

- **Frontend**: Next.js (App Router), React 19, TypeScript.
- **Diseño y Estilos**: Tailwind CSS v4.
- **Manejo de Estado**: Zustand 5 (Store modular en `useAppStore`).
- **Backend / Base de Datos**: Supabase (PostgreSQL, Autenticación, Políticas RLS, Realtime).
- **Iconografía**: Lucide React.
- **Testing**: Vitest + Testing Library.

## Scripts

| Comando | Descripción |
| --------- | ------------- |
| `npm run dev` | Servidor de desarrollo en [localhost:3000](http://localhost:3000). |
| `npm run build` | Build de producción (Next.js). |
| `npm start` | Servidor de producción tras el build. |
| `npm run lint` | Linting del proyecto. |
| `npm test` | Ejecuta los tests con Vitest. |
| `npm run test:watch` | Tests en modo watch. |

## Base de Datos (Supabase)

Las migraciones SQL están en `supabase/migrations/` y se aplican en orden numerado:

| Migración | Contenido |
| ----------- | ----------- |
| `001_profiles.sql` | Perfiles de usuario. |
| `002_projects.sql` | Proyectos. |
| `003_tasks.sql` | Tareas. |
| `004_activity_log.sql` | Registro de actividad. |
| `005_dashboard_views.sql` | Vistas del dashboard. |
| `006_sprints.sql` | Sprints ágiles. |
| `007_collaboration.sql` | Colaboración e invitaciones. |

Toda entidad nueva debe incluir su migración y políticas **RLS** (Row Level Security).

## Despliegue en Producción (Vercel)

El proyecto incluye un `vercel.json` con `"framework": "nextjs"`.

1. Conecta tu repositorio de GitHub en el panel de Vercel.
2. Vercel detectará automáticamente el framework como Next.js (usará `npm run build`).
3. **Crítico**: Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en la sección *Environment Variables* de Vercel antes de desplegar.

## Arquitectura

```
src/
├── app/          # Páginas y rutas (App Router de Next.js)
├── components/   # Vistas y componentes de UI
├── hooks/        # Hooks personalizados (autenticación)
├── lib/          # Clientes de Supabase (client/server) y utilidades
├── services/     # Capa de comunicación con el backend
├── store/        # Stores de Zustand
├── types/        # Modelos y tipos de dominio
└── __tests__/    # Tests (Vitest + Testing Library)
```

## Checklist de Contribución

Si vas a extender el proyecto o agregar funcionalidades:

- [ ] Verifica que tu código compila sin errores ejecutando `npm run lint`.
- [ ] Si agregas una tabla a la base de datos, incluye su archivo de migración en `supabase/migrations/`.
- [ ] Asegúrate de configurar políticas **RLS** (Row Level Security) en Supabase para cualquier entidad nueva.
- [ ] Mantén la separación de responsabilidades: los componentes de UI interactúan con `useAppStore`, y el store se comunica con el backend a través de los servicios en `src/services/`.
- [ ] Agrega o actualiza tests en `src/__tests__/` y verifica que pasen con `npm test`.
