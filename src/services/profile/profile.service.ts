import { db } from '@/lib/db';
import { CommentStatus } from '@prisma/client';
import { profileUpdateSchema } from '@/utils/validation';
import { errors } from '@/utils/errors';
import type { z } from 'zod';

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

const DEFAULT_PAGE_SIZE = 15;

export type CommentsPage = {
  items: Array<{
    id: string;
    body: string;
    createdAt: Date;
    content: {
      id: string;
      title: string;
      type: string;
      slug: string;
      status: string;
      publishedAt: Date | null;
    } | null;
  }>;
  total: number;
  page: number;
  pageSize: number;
};

export class ProfileService {
  async getCommentsByUserId(
    userId: string,
    opts: { page?: number; pageSize?: number } = {}
  ): Promise<CommentsPage> {
    const page = Math.max(1, opts.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, opts.pageSize ?? DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      db.comment.findMany({
        where: {
          authorId: userId,
          status: CommentStatus.VISIBLE,
          deletedAt: null,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          content: {
            select: { id: true, title: true, type: true, slug: true, status: true, publishedAt: true },
          },
        },
      }),
      db.comment.count({
        where: {
          authorId: userId,
          status: CommentStatus.VISIBLE,
          deletedAt: null,
        },
      }),
    ]);

    return { items, total, page, pageSize };
  }

  async updateProfile(
    userId: string,
    data: { name?: string; email?: string }
  ): Promise<{ id: string; name: string | null; email: string }> {
    const parsed = profileUpdateSchema.safeParse(data);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      throw errors.badRequest(msg);
    }
    const { name, email } = parsed.data;

    if (email !== undefined) {
      const existing = await db.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (existing) {
        throw errors.badRequest('Email already in use');
      }
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
      },
    });
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
    };
  }
}

export const profileService = new ProfileService();
