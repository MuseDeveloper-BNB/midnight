'use server';

import { commentsService } from '@/services/comments/comments.service';
import { commentSchema } from '@/utils/validation';
import { requireRole } from '@/lib/permissions';
import { AppError } from '@/utils/errors';

export async function createCommentAction(
  data: FormData | { body: string; contentId: string }
): Promise<{ success: boolean; error?: string }> {
  let user: { id?: string };
  try {
    user = await requireRole(['MEMBER', 'EDITOR', 'ADMIN']);
  } catch {
    return { success: false, error: 'Please sign in to comment.' };
  }
  const userId = user.id;
  if (!userId) {
    return { success: false, error: 'Please sign in to comment.' };
  }

  const payload =
    data instanceof FormData
      ? {
          body: (data.get('body') as string | null) ?? '',
          contentId: (data.get('contentId') as string | null) ?? '',
        }
      : data;

  const parsed = commentSchema.safeParse(payload);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join('; ');
    return { success: false, error: msg || 'Invalid comment.' };
  }

  try {
    await commentsService.createComment(parsed.data, userId);
    return { success: true };
  } catch (e) {
    if (e instanceof AppError) {
      return { success: false, error: e.message };
    }
    throw e;
  }
}
