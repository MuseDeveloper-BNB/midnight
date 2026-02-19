import { db } from '@/lib/db';
import { sanitizeHtml } from '@/utils/sanitization';
import { errors } from '@/utils/errors';

export class CommentsService {
  async createComment(data: { contentId: string; body: string }, authorId: string) {
    const content = await db.content.findFirst({
      where: { id: data.contentId, status: 'PUBLISHED' },
    });
    if (!content) {
      throw errors.notFound();
    }

    return db.comment.create({
      data: {
        body: sanitizeHtml(data.body),
        contentId: data.contentId,
        authorId,
        status: 'VISIBLE',
      },
    });
  }

  async updateComment(id: string, body: string, authorId: string) {
    const comment = await db.comment.findUnique({ where: { id } });
    if (!comment) {
      throw errors.notFound();
    }
    if (comment.authorId != authorId) {
      throw errors.forbidden();
    }

    return db.comment.update({
      where: { id },
      data: { body: sanitizeHtml(body) },
    });
  }

  async deleteComment(id: string, authorId: string) {
    const comment = await db.comment.findUnique({ where: { id } });
    if (!comment) {
      throw errors.notFound();
    }
    if (comment.authorId != authorId) {
      throw errors.forbidden();
    }

    return db.comment.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'DELETED' },
    });
  }

  async getCommentsByContentId(contentId: string) {
    return db.comment.findMany({
      where: {
        contentId,
        status: 'VISIBLE',
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });
  }
}

export const commentsService = new CommentsService();
