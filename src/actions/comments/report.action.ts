'use server';

import { db } from '@/lib/db';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';
import { errors } from '@/utils/errors';

const reportSchema = z.object({
  commentId: z.string().uuid(),
  reason: z.string().max(1000).optional(),
});

export async function reportCommentAction(data: unknown) {
  const user = await requireRole(['MEMBER', 'EDITOR', 'ADMIN']);
  const parsed = reportSchema.parse(data);

  const comment = await db.comment.findUnique({ where: { id: parsed.commentId } });
  if (!comment) {
    throw errors.notFound();
  }
  if (comment.authorId === user.id) {
    throw errors.forbidden();
  }

  const report = await db.report.create({
    data: {
      commentId: parsed.commentId,
      reporterId: user.id,
      reason: parsed.reason,
    },
  });

  return { success: true, report };
}
