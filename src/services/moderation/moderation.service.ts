import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';

export class ModerationService {
  async logModerationAction(data: {
    action: string;
    targetType: string;
    targetId: string;
    moderatorId: string;
    details?: Record<string, unknown>;
  }) {
    return db.moderationLog.create({
      data: {
        action: data.action as any,
        targetType: data.targetType as any,
        targetId: data.targetId,
        moderatorId: data.moderatorId,
        details: data.details as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async hideComment(commentId: string, moderatorId: string) {
    const comment = await db.comment.update({
      where: { id: commentId },
      data: { status: 'HIDDEN' },
    });

    await this.logModerationAction({
      action: 'HIDE_COMMENT',
      targetType: 'COMMENT',
      targetId: commentId,
      moderatorId,
    });

    return comment;
  }

  async deleteCommentModeration(commentId: string, moderatorId: string) {
    const comment = await db.comment.update({
      where: { id: commentId },
      data: { status: 'DELETED', deletedAt: new Date() },
    });

    await this.logModerationAction({
      action: 'DELETE_COMMENT',
      targetType: 'COMMENT',
      targetId: commentId,
      moderatorId,
    });

    return comment;
  }
}

export const moderationService = new ModerationService();
