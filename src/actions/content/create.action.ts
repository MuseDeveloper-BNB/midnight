'use server';

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { contentService } from '@/services/content/content.service';
import { moderationService } from '@/services/moderation/moderation.service';
import { requireRole } from '@/lib/permissions';
import { contentSchema } from '@/utils/validation';
import { sanitizeHtml } from '@/utils/sanitization';
import { AppError } from '@/utils/errors';

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

function formDataToPayload(fd: FormData) {
  const publishNow = fd.get('publishNow');
  const raw = fd.get('scheduledPublishAt');
  return {
    type: fd.get('type') ?? 'NEWS',
    title: (fd.get('title') as string | null) ?? '',
    body: (fd.get('body') as string | null) ?? '',
    slug: (fd.get('slug') as string | null) || undefined,
    publishNow: publishNow === 'on' || publishNow === 'true' || publishNow === '1',
    scheduledPublishAt:
      raw && typeof raw === 'string' && raw.trim()
        ? (raw.trim() as string)
        : undefined,
  };
}

async function saveUploadedImage(file: File): Promise<{ imageUrl: string } | { error: string }> {
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    return { error: 'Invalid image type. Use JPEG, PNG, WebP or GIF.' };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { error: 'Image must be 5MB or less.' };
  }
  const name = `${randomUUID()}${ext}`;
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });
  const filePath = path.join(uploadsDir, name);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);
  return { imageUrl: `/uploads/${name}` };
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
    if (e instanceof AppError) {
      return { success: false, error: e.message };
    }
    throw e;
  }
}
