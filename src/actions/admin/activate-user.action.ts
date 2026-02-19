'use server';

import { revalidatePath } from 'next/cache';
import { adminService } from '@/services/admin/admin.service';
import { moderationService } from '@/services/moderation/moderation.service';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';

const schema = z.object({
  userId: z.string().uuid(),
});

function formDataToPayload(fd: FormData): { userId: string } {
  const userId = fd.get('userId');
  return { userId: typeof userId === 'string' ? userId : '' };
}

const SESSION_INVALID =
  'Your session user no longer exists in the database. Please sign out and sign in again.';

export async function activateUserAction(
  data: FormData | { userId: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await requireRole(['EDITOR', 'ADMIN']);
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

    await adminService.activateUser(parsed.data.userId);
    await moderationService.logModerationAction({
      action: 'ACTIVATE_USER',
      targetType: 'USER',
      targetId: parsed.data.userId,
      moderatorId: actor.id,
    });

    revalidatePath('/users');
    revalidatePath(`/users/${parsed.data.userId}`);
    revalidatePath('/moderation-history');
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to activate user.';
    return { success: false, error: msg };
  }
}

/** Use as form action. Returns void; throws on error. */
export async function activateUserFormAction(fd: FormData): Promise<void> {
  const res = await activateUserAction(fd);
  if (!res.success) throw new Error(res.error ?? 'Failed to activate user.');
}
