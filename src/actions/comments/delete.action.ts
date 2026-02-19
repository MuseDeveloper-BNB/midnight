'use server';

import { commentsService } from '@/services/comments/comments.service';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';

const deleteSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteCommentAction(data: unknown) {
  const user = await requireRole(['MEMBER', 'EDITOR', 'ADMIN']);
  const parsed = deleteSchema.parse(data);
  await commentsService.deleteComment(parsed.id, user.id);
  return { success: true };
}
