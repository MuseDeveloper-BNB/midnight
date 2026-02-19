import { auth } from '@/lib/auth';

export const PERMISSIONS = {
  MEMBER: [
    'read:content',
    'create:comment',
    'edit:own:comment',
    'delete:own:comment',
    'report:comment',
    'edit:own:profile',
    'read:own:comments',
    'save:content',
  ],
  EDITOR: [
    'read:content',
    'create:comment',
    'edit:own:comment',
    'delete:own:comment',
    'report:comment',
    'create:content',
    'edit:content',
    'publish:content',
    'archive:content',
    'moderate:comments',
  ],
  ADMIN: [
    'read:content',
    'create:comment',
    'edit:own:comment',
    'delete:own:comment',
    'report:comment',
    'create:content',
    'edit:content',
    'publish:content',
    'archive:content',
    'moderate:comments',
    'manage:users',
    'view:audit',
  ],
} as const;

export type UserRole = keyof typeof PERMISSIONS;

export async function requireRole(allowedRoles: UserRole[]): Promise<{ id: string; role: UserRole }> {
  const session = await auth();
  const role = session?.user?.role as UserRole | undefined;
  const userId = session?.user?.id;

  if (!role || !allowedRoles.includes(role) || !userId) {
    throw new Error('Unauthorized');
  }

  return { id: userId, role };
}
