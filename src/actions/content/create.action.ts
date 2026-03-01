'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { contentService } from '@/services/content/content.service';
import { moderationService } from '@/services/moderation/moderation.service';
import { requireRole } from '@/lib/permissions';
import { contentSchema } from '@/utils/validation';
import { sanitizeHtml } from '@/utils/sanitization';
import { AppError } from '@/utils/errors';
import { saveUploadedImage } from '@/lib/upload';

function formDataToPayload(fd: FormData) {
  const publishNowRaw = fd.get('publishNow');
  const raw = fd.get('scheduledPublishAt');
  const blogAuthorRaw = fd.get('blogAuthor');
  const publishNowFlag =
    publishNowRaw === 'on' || publishNowRaw === 'true' || publishNowRaw === '1';
  const hasSchedule = Boolean(raw && typeof raw === 'string' && raw.trim());

  return {
    type: fd.get('type') ?? 'NEWS',
    title: (fd.get('title') as string | null) ?? '',
    body: (fd.get('body') as string | null) ?? '',
    slug: (fd.get('slug') as string | null) || undefined,
    blogAuthor:
      typeof blogAuthorRaw === 'string' && blogAuthorRaw.trim() ? blogAuthorRaw.trim() : undefined,
    // Safety fallback: if form does not send publishNow and no schedule is set, publish immediately.
    publishNow: publishNowFlag || (!publishNowFlag && !hasSchedule),
    scheduledPublishAt:
      raw && typeof raw === 'string' && raw.trim()
        ? (raw.trim() as string)
        : undefined,
  };
}

export async function createContentAction(
  data: FormData
): Promise<{ success: boolean; error?: string }> {
  let user: { id: string };
  try {
    user = await requireRole(['EDITOR', 'ADMIN']);
  } catch {
    return { success: false, error: 'Unauthorized.' };
  }
  const userId = user.id;
  if (!userId) return { success: false, error: 'Unauthorized.' };

  const payload: Record<string, unknown> = { ...formDataToPayload(data) };
  const file = data.get('image');
  if (file && file instanceof File && file.size > 0) {
    const result = await saveUploadedImage(file);
    if ('error' in result) {
      return { success: false, error: result.error };
    }
    payload.imageUrl = result.imageUrl;
  }

  const parsed = contentSchema.safeParse(payload);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join('; ');
    return { success: false, error: msg || 'Invalid input.' };
  }

  const body =
    parsed.data.type === 'BLOG' ? sanitizeHtml(parsed.data.body) : parsed.data.body;

  try {
    const content = await contentService.createContent(
      {
        type: parsed.data.type as 'NEWS' | 'BLOG',
        title: parsed.data.title,
        body,
        slug: parsed.data.slug,
        imageUrl: parsed.data.imageUrl,
        blogAuthor: parsed.data.blogAuthor,
        publishNow: parsed.data.publishNow ?? false,
        scheduledPublishAt: parsed.data.scheduledPublishAt,
      },
      userId
    );

    if (parsed.data.publishNow) {
      await moderationService.logModerationAction({
        action: 'PUBLISH_CONTENT',
        targetType: 'CONTENT',
        targetId: content.id,
        moderatorId: userId,
        details: { slug: content.slug, type: content.type },
      });
    }

    revalidatePath('/admin-dashboard');
    revalidatePath('/moderation-history');
    revalidatePath('/');
    revalidatePath('/news');
    revalidatePath('/blog');
    return { success: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { success: false, error: 'Slug already exists. Choose a different slug.' };
    }
    if (e instanceof AppError) {
      return { success: false, error: e.message };
    }
    throw e;
  }
}
