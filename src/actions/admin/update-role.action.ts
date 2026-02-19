'use server';

import { revalidatePath } from 'next/cache';
import { adminService } from '@/services/admin/admin.service';
import { moderationService } from '@/services/moderation/moderation.service';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';

const schema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['MEMBER', 'EDITOR', 'ADMIN']),
});

function formDataToPayload(fd: FormData): { userId: string; role: string } {
  const userId = fd.get('userId');
  const role = fd.get('role');
  return {
    userId: typeof userId === 'string' ? userId : '',
    role: typeof role === 'string' ? role : '',
  };
}

const SESSION_INVALID =
  'Your session user no longer exists in the database. Please sign out and sign in again.';

export async function updateUserRoleAction(
  data: FormData | { userId: string; role: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await requireRole(['ADMIN']);
    if (!actor?.id) return { success: false, error: 'Unauthorized.' };

    try {
      await adminService.getUser(actor.id);
    } catch (e) {
      if (e instanceof Error && e.message === 'Not found')
        return { success: false, error: SESSION_INVALID };
      throw e;
    }

    const raw = data instanceof FormData ? formDataToPayload(data) : data;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      return { success: false, error: msg || 'Invalid input.' };
    }

    const existing = await adminService.getUser(parsed.data.userId);
    await adminService.updateUserRole(
      parsed.data.userId,
      parsed.data.role,
      actor.id
    );

    await moderationService.logModerationAction({
      action: 'CHANGE_ROLE',
      targetType: 'USER',
      targetId: parsed.data.userId,
      moderatorId: actor.id,
      details: { from: existing.role, to: parsed.data.role },
    });

    revalidatePath('/users');
    revalidatePath(`/users/${parsed.data.userId}`);
    revalidatePath('/moderation-history');
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to update role.';
    return { success: false, error: msg };
  }
}

/** Use as form action. Returns void; throws on error. */
export async function updateUserRoleFormAction(fd: FormData): Promise<void> {
  const res = await updateUserRoleAction(fd);
  if (!res.success) throw new Error(res.error ?? 'Failed to update role.');
}
