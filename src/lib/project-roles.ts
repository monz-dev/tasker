import type { ProjectWithMembers } from '@/types/models';

export type ProjectRole = 'owner' | 'admin' | 'member' | 'viewer';

const EDIT_TASK_ROLES: ReadonlySet<string> = new Set(['owner', 'admin', 'member']);

/**
 * Returns the current user's role within a project, derived from the
 * membership list returned by the API. `null` when the user is not a
 * member or the project is unknown.
 */
export function getMyRole(
  project: ProjectWithMembers | undefined | null,
  userId: string | undefined
): ProjectRole | null {
  if (!project || !userId) return null;
  const member = project.members.find((m) => m.user_id === userId);
  return member ? (member.role as ProjectRole) : null;
}

/** owner / admin / member can create and edit tasks. */
export function canEditTasks(role: ProjectRole | null): boolean {
  return role !== null && EDIT_TASK_ROLES.has(role);
}

/** owner / admin can manage the project (status, archive, invite). */
export function canManageProject(role: ProjectRole | null): boolean {
  return role === 'owner' || role === 'admin';
}