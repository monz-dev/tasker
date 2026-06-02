# Prompt Maestro --- App Web de Administración de Proyectos de Software

## Objetivo

Actúa como un Senior Product Designer + Senior Software Architect +
Senior Full Stack Engineer especializado en SaaS modernos, PWAs y
aplicaciones escalables.

Diseña y construye una aplicación web moderna para administración de
proyectos de software enfocada en equipos pequeños y medianos.

Prioridades:

-   Organización
-   Seguimiento
-   Colaboración
-   Simplicidad extrema
-   Fácil despliegue
-   Mantenimiento sencillo

------------------------------------------------------------------------

# Stack Tecnológico Obligatorio

## Frontend

-   Next.js App Router
-   TypeScript estricto
-   React Server Components
-   TailwindCSS
-   Arquitectura modular

## Backend

-   Supabase
-   Server Actions
-   API Routes únicamente cuando sea necesario

## Base de Datos

-   Supabase PostgreSQL
-   RLS obligatorio
-   Auditoría mínima
-   Relaciones normalizadas

## Deploy

-   Optimizado para Vercel
-   Variables mínimas
-   Preview deployments
-   Serverless friendly

## PWA

-   Instalable
-   Offline básico
-   Cache inteligente
-   Service Worker

------------------------------------------------------------------------

# Principios de Diseño

-   Mobile-first
-   Minimalista
-   Vanguardista
-   Intuitiva
-   Accesible
-   Baja carga cognitiva
-   Profesional

Priorizar:

-   claridad
-   simplicidad
-   productividad
-   velocidad

------------------------------------------------------------------------

# Estilo Visual

Usar:

-   superficies suaves
-   sombras ligeras
-   espacios amplios
-   microinteracciones discretas

Evitar:

-   gradientes agresivos
-   glassmorphism excesivo
-   neomorphism
-   interfaces saturadas

------------------------------------------------------------------------

# Paleta Recomendada

Fondos:

-   warm white
-   stone
-   off-white
-   gray suave

Acentos:

-   verde salvia
-   azul petróleo
-   terracota suave
-   ámbar tenue

Evitar:

-   azules saturados
-   morados intensos

------------------------------------------------------------------------

# Funcionalidades

## Dashboard

-   proyectos activos
-   tareas pendientes
-   actividad reciente
-   progreso
-   widgets reorganizables

## Gestión de Proyectos

-   CRUD
-   responsables
-   estados
-   clientes
-   etiquetas
-   fechas objetivo

## Gestión de Tareas

-   CRUD completo
-   subtareas
-   checklist
-   dependencias
-   comentarios
-   adjuntos
-   tracking tiempo

## Kanban

-   drag and drop
-   columnas configurables
-   filtros
-   swimlanes

## To-do Personal

-   hoy
-   favoritos
-   inbox
-   tareas rápidas

## Timeline / Gantt

-   dependencias
-   drag and drop
-   zoom
-   ruta crítica

## Agile

-   backlog
-   sprints
-   story points
-   velocity

## Colaboración

-   comentarios
-   menciones
-   historial
-   notificaciones

## Productividad

-   pomodoro
-   estadísticas
-   objetivos

## Reportes

-   productividad
-   avance
-   tiempos
-   riesgos

------------------------------------------------------------------------

# Arquitectura UI

## Navegación móvil

-   bottom navigation

## Navegación escritorio

-   sidebar colapsable

## Secciones

-   Dashboard
-   Proyectos
-   Tareas
-   Kanban
-   Timeline
-   Mi Trabajo
-   Reportes
-   Configuración

Profundidad máxima:

-   2 niveles

------------------------------------------------------------------------

# Restricciones UX

-   máximo 3 clics
-   usable desde 360px
-   usable con una mano
-   shortcuts obligatorios
-   minimizar modales
-   máximo 5--7 focos visuales por pantalla

------------------------------------------------------------------------

# Restricciones Diseño

-   máximo 2 tipografías
-   máximo 8 tamaños tipográficos
-   tokens obligatorios
-   animaciones \<200ms
-   no depender solo del color

------------------------------------------------------------------------

# Restricciones Técnicas

-   TypeScript estricto
-   ESLint
-   reusable components
-   separación UI / dominio / datos
-   evitar sobreingeniería

------------------------------------------------------------------------

# Restricciones Rendimiento

Objetivos:

-   Lighthouse \> 90
-   lazy loading
-   virtualización
-   bundle pequeño
-   pocas dependencias

Compatible con:

-   dispositivos gama media-baja

------------------------------------------------------------------------

# Restricciones PWA

-   offline básico
-   sync diferido
-   cache inteligente
-   manejo conflictos

------------------------------------------------------------------------

# Restricciones DB

Toda tabla incluye:

-   id
-   created_at
-   updated_at
-   created_by
-   updated_by
-   deleted_at

Requisitos:

-   soft delete
-   índices
-   multiusuario
-   RLS

------------------------------------------------------------------------

# Restricciones Escalabilidad

Preparado para:

-   multitenancy
-   i18n
-   permisos granulares
-   crecimiento modular

------------------------------------------------------------------------

# Restricciones Deploy

Optimizar específicamente para:

## Vercel

-   serverless friendly
-   edge compatible
-   preview deployments

## Supabase

-   auth
-   storage
-   postgres
-   realtime opcional

Evitar:

-   infraestructura compleja
-   servidores dedicados

------------------------------------------------------------------------

# Estructura Carpetas

/app\
/components\
/features\
/lib\
/hooks\
/services\
/types\
/store\
/styles\
/public\
/supabase\
/tests

Arquitectura: Feature-first.

------------------------------------------------------------------------

# Entregables Requeridos

1.  Arquitectura completa
2.  Modelo ER
3.  SQL Supabase
4.  Estructura carpetas
5.  Permisos
6.  User flows
7.  Wireframes
8.  Component library
9.  MVP
10. Roadmap
11. Deploy strategy
12. Variables entorno
13. Riesgos técnicos
14. Testing
15. Caching

------------------------------------------------------------------------

# Reglas de Decisión

1.  Elegir la solución más simple
2.  Elegir la más mantenible
3.  Elegir la más rápida
4.  Reducir complejidad operativa

Priorizar siempre:

simplicidad \> complejidad\
velocidad \> funciones extra\
claridad \> efectos visuales\
mantenibilidad \> arquitectura excesiva
