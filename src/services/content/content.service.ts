import { db } from '@/lib/db';
import type { ContentStatus, ContentType } from '@/types';
import { generateSlug } from '@/utils/slug';

export class ContentService {
  /** Publish DRAFT content whose scheduledPublishAt is due. Run before listing published content. */
  async publishDueContent(): Promise<void> {
    const now = new Date();
    const due = await db.content.findMany({
      where: {
        status: 'DRAFT' as ContentStatus,
        scheduledPublishAt: { lte: now, not: null },
      },
      select: { id: true, scheduledPublishAt: true },
    });
    for (const c of due) {
      const at = c.scheduledPublishAt ?? now;
      await db.content.update({
        where: { id: c.id },
        data: {
          status: 'PUBLISHED' as ContentStatus,
          publishedAt: at,
          scheduledPublishAt: null,
        },
      });
    }
  }

  async getPublishedContent(options: {
    type?: ContentType;
    limit?: number;
    offset?: number;
    sort?: 'newest' | 'oldest';
  }) {
    await this.publishDueContent();
    const { type, limit = 20, offset = 0, sort = 'newest' } = options;
    const orderBy = sort === 'oldest' ? { publishedAt: 'asc' as const } : { publishedAt: 'desc' as const };

    return db.content.findMany({
      where: {
        status: 'PUBLISHED' as ContentStatus,
        type: type ?? undefined,
      },
      orderBy,
      take: limit,
      skip: offset,
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });
  }

  async getContentBySlug(slug: string) {
    await this.publishDueContent();
    return db.content.findFirst({
      where: {
        slug,
        status: 'PUBLISHED' as ContentStatus,
      },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });
  }

  async getContentByType(type: ContentType) {
    return db.content.findMany({
      where: {
        type,
        status: 'PUBLISHED' as ContentStatus,
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  async createContent(
    data: {
      type: ContentType;
      title: string;
      body: string;
      slug?: string;
      imageUrl?: string | null;
      blogAuthor?: string;
      publishNow?: boolean;
      scheduledPublishAt?: Date;
      publishedAt?: Date;
    },
    authorId: string
  ) {
    const slug = data.slug ?? generateSlug(data.title);
    const now = new Date();
    const status: ContentStatus = data.publishNow ? ('PUBLISHED' as ContentStatus) : ('DRAFT' as ContentStatus);
    const publishedAt = data.publishNow
      ? (data.publishedAt ?? now)
      : null;
    const scheduledPublishAt = !data.publishNow && data.scheduledPublishAt ? data.scheduledPublishAt : null;

    return db.content.create({
      data: {
        type: data.type,
        title: data.title,
        body: data.body,
        slug,
        imageUrl: data.imageUrl ?? null,
        blogAuthor: data.blogAuthor ?? null,
        status,
        authorId,
        publishedAt,
        scheduledPublishAt,
      },
    });
  }

  async updateContent(
    id: string,
    data: { title?: string; body?: string; slug?: string; blogAuthor?: string | null; imageUrl?: string | null; publishedAt?: Date },
    actorId: string,
    options?: { allowAdminOverride?: boolean }
  ) {
    const content = await db.content.findUnique({ where: { id } });
    if (!content) {
      return null;
    }
    const isAuthor = content.authorId === actorId;
    if (!isAuthor && !options?.allowAdminOverride) {
      return null;
    }
    return db.content.update({
      where: { id },
      data,
    });
  }

  async publishContent(id: string) {
    return db.content.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    });
  }

  async unpublishContent(id: string) {
    return db.content.update({
      where: { id },
      data: { status: 'DRAFT' },
    });
  }

  async archiveContent(id: string) {
    return db.content.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  async getContentByAuthorId(authorId: string) {
    return db.content.findMany({
      where: { authorId },
      orderBy: { updatedAt: 'desc' },
    });
  }
}

export const contentService = new ContentService();
