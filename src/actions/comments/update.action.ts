'use server';

import { commentsService } from '@/services/comments/comments.service';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';

const updateSchema = z.object({
  id: z.string().uuid(),
  body: z.string().min(1).max(5000),
});

export async function updateCommentAction(data: unknown) {
  const user = await requireRole(['MEMBER', 'EDITOR', 'ADMIN']);
  const parsed = updateSchema.parse(data);
  const comment = await commentsService.updateComment(parsed.id, parsed.body, user.id);
  return { success: true, comment };
}
