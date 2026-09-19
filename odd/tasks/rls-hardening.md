# RLS Hardening — permisos por rol, invitaciones acotadas y expiración

## Objetivo

Cerrar los huecos de seguridad RLS detectados en la revisión (bloque 1 de prioridad):

1. `invitations_read_all` expone todos los emails a cualquiera (incl. anónimos).
2. Escalada de privilegios: cualquier miembro (hasta viewer) puede invitar como admin.
3. `is_project_member` es `security definer` sin `set search_path`.
4. `tasks_update_members` permite a cualquier miembro cambiar `created_by`, `project_id`, `deleted_at`; un `viewer` puede editar tareas.

## Decisiones de producto (confirmadas por el usuario)

- **Invitaciones**: solo `owner` y `admin` invitan; pueden otorgar `member` o `viewer`, nunca `admin` (solo el `owner` crea admins).
- **Expiración**: las invitaciones expiran a los 7 días (`expires_at`); el RPC de aceptación rechaza vencidas y las marca como `expired`.
- **Roles por proyecto** (desde `project_members.role`, no el global de `profiles`):
  - `viewer`: solo lectura.
  - `member`: crea/edita tareas y sprints; no puede reasignar `created_by` ni mover entre proyectos.
  - `admin`: además edita el proyecto (status/progress/archivar).
  - `owner`: control total + gestiona miembros.

## Alcance

- `supabase/migrations/008_harden_rls.sql` (migración incremental, no se tocan las 001-007).
- `src/types/models.ts`: `members[].role` en `ProjectWithMembers`.
- `src/services/invitationService.ts`: `getInvitation` → query directa con sesión, `get_invitation_public` RPC para anónimos.
- Gating de UI mínimo: `ProjectsView` (menú de acciones solo owner/admin), `KanbanView` y `TasksView` (acciones create/edit solo para member+).

## Fuera de alcance

- Gating fino de UI por rol (más allá de lo mínimo: la DB ya rechaza; la UX se pule en otra iteración).
- `profiles_select_authenticated using (true)` (exposición de nombres/avatars, no emails; se deja por diseño de "team display").
- Realtime / caché (bloques 5-7 de la revisión).

## Verificación

No hay Docker ni token de Supabase en máquina → no se puede aplicar la migración localmente.

- SQL: revisión manual + chequeo estructural contra las migraciones existentes.
- TS: `npx tsc --noEmit` + `npx vitest run`.
- Cuando exista acceso: `supabase db push` y probar el flujo invitar→aceptar y los roles viewer/member en el kanban.

## Commits

1. `fix(rls): harden row-level security and invitation expiry` — `13b99a4` (migración 008).
2. `fix(rls): gate UI actions by project role and route guest invitations through public RPC` — `e55c553` (types, service, vistas).
3. `chore: stop tracking tsconfig build artifact` — `52f859b` (tsconfig.tsbuildinfo fuera del índice).
4. `docs(odd): record rls-hardening commit identities` — `67cdc39`.
5. `fix(rls): revoke leftover service_role execute grants on RPCs` — `885a73b` (migración 009, aplicada pendiente).

## Estado final

- PR #9 (`fix/rls-hardening` → `main`) mergeado el 2026-09-19, merge commit `2c3cfda4`. Rama contenida en `origin/main`.
- Migraciones 008 y 009 aplicadas y verificadas en la base real.
- Pendientes fuera de alcance (próxima iteración): gating fino de UI por rol, revisar `profiles_select_authenticated`, bloques 5-7 (realtime/caché).
