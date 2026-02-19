import { db } from '@/lib/db';
import { ContentStatus } from '@prisma/client';
import { errors } from '@/utils/errors';

const DEFAULT_PAGE_SIZE = 15;

export type SavedListItem = {
  id: string;
  contentId: string;
  createdAt: Date;
  content: {
    id: string;
    title: string;
    type: string;
    slug: string;
    status: string;
    publishedAt: Date | null;
  } | null;
};

export type SavedListPage = {
  items: SavedListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export class SavedService {
  async save(userId: string, contentId: string): Promise<void> {
    const content = await db.content.findUnique({
      where: { id: contentId },
      select: { id: true, status: true },
    });
    if (!content) {
      throw errors.notFound();
    }
    if (content.status !== ContentStatus.PUBLISHED) {
      throw errors.badRequest('Only published articles can be saved.');
    }

    try {
      await db.savedItem.create({
        data: { userId, contentId },
      });
    } catch (e: unknown) {
      const prisma = e as { code?: string };
      if (prisma.code === 'P2002') {
        return;
      }
      throw e;
    }
  }

  async unsave(userId: string, contentId: string): Promise<void> {
    await db.savedItem.deleteMany({
      where: { userId, contentId },
    });
  }

  async listSaved(
    userId: string,
    opts: { page?: number; pageSize?: number } = {}
  ): Promise<SavedListPage> {
    const page = Math.max(1, opts.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, opts.pageSize ?? DEFAULT_PAGE_SIZE));
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      db.savedItem.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          content: {
            select: { id: true, title: true, type: true, slug: true, status: true, publishedAt: true },
          },
        },
      }),
      db.savedItem.count({ where: { userId } }),
    ]);

    return {
      items: items.map((s) => ({
        id: s.id,
        contentId: s.contentId,
        createdAt: s.createdAt,
        content: s.content,
      })),
      total,
      page,
      pageSize,
    };
  }

  async isSaved(userId: string, contentId: string): Promise<boolean> {
    const item = await db.savedItem.findUnique({
      where: { userId_contentId: { userId, contentId } },
    });
    return !!item;
  }
}

export const savedService = new SavedService();
