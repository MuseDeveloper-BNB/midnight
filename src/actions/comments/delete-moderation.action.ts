'use server';

import { revalidatePath } from 'next/cache';
import { moderationService } from '@/services/moderation/moderation.service';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';

const deleteSchema = z.object({
  id: z.string().uuid(),
  returnTo: z.string().optional(),
});

function formDataToPayload(fd: FormData): { id: string; returnTo?: string } {
  const id = fd.get('id');
  const returnTo = fd.get('returnTo');
  return {
    id: typeof id === 'string' ? id : '',
    returnTo: typeof returnTo === 'string' && returnTo.trim() ? returnTo.trim() : undefined,
  };
}

export async function deleteCommentModerationAction(
  data: FormData | { id: string; returnTo?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireRole(['EDITOR', 'ADMIN']);
    if (!user?.id) return { success: false, error: 'Unauthorized.' };

    const raw = data instanceof FormData ? formDataToPayload(data) : data;
    const parsed = deleteSchema.safeParse(raw);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      return { success: false, error: msg || 'Invalid input.' };
    }

    await moderationService.deleteCommentModeration(parsed.data.id, user.id);

    if (parsed.data.returnTo) revalidatePath(parsed.data.returnTo);
    else {
      revalidatePath('/news');
      revalidatePath('/blog');
    }
    return { success: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Failed to delete comment.';
    return { success: false, error: msg };
  }
}

/** Use as form action. Returns void; throws on error. */
export async function deleteCommentModerationFormAction(fd: FormData): Promise<void> {
  const res = await deleteCommentModerationAction(fd);
  if (!res.success) throw new Error(res.error ?? 'Failed to delete comment.');
}
