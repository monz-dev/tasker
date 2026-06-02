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
   # Edita .env y completa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
   ```

3. **Ejecutar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

4. **Verificar**: 
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Características Principales (Details)

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Resumen del estado de los proyectos y tareas pendientes. |
| **Proyectos** | Creación y administración de espacios de trabajo colaborativos. |
| **Kanban** | Tablero visual de columnas para el seguimiento del flujo de tareas. |
| **Agile Sprints** | Gestión del Product Backlog, planificación de Sprints y estimación de puntos. |
| **Timeline** | Vista de cronograma orientada a monitorear fechas límite y progreso. |

## Stack Tecnológico

- **Frontend Core**: React 19, TypeScript, Vite.
- **Diseño y Estilos**: Tailwind CSS v4.
- **Manejo de Estado**: Zustand (Store modular en `useAppStore`).
- **Backend / Base de Datos**: Supabase (PostgreSQL, Autenticación, Políticas RLS).
- **Iconografía**: Lucide React.

## Despliegue en Producción (Vercel)

El proyecto incluye un archivo `vercel.json` optimizado para aplicaciones de una sola página (SPA).

1. Conecta tu repositorio de GitHub en el panel de Vercel.
2. Vercel detectará automáticamente el framework como Vite (usará `npm run build` y la carpeta `dist`).
3. **Crítico**: Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en la sección *Environment Variables* de Vercel antes de desplegar.

## Checklist de Contribución

Si vas a extender el proyecto o agregar funcionalidades:

- [ ] Verifica que tu código compila sin errores ejecutando `npm run lint`.
- [ ] Si agregas una tabla a la base de datos, incluye su archivo de migración en `supabase/migrations/`.
- [ ] Asegúrate de configurar políticas **RLS** (Row Level Security) en Supabase para cualquier entidad nueva.
- [ ] Mantén la separación de responsabilidades: los componentes de UI interactúan con `useAppStore`, y el store se comunica con el backend a través de los servicios en `src/services/`.
