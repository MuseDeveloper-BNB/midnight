'use server';

import { revalidatePath } from 'next/cache';
import { contentService } from '@/services/content/content.service';
import { requireRole } from '@/lib/permissions';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { sanitizeHtml } from '@/utils/sanitization';
import { saveUploadedImage } from '@/lib/upload';

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
  body: z.string().min(1).optional(),
  slug: z.string().min(1).max(255).optional(),
  blogAuthor: z.union([z.string().trim().min(1).max(120), z.null()]).optional(),
  imageUrl: z.union([z.string().min(1).max(2048), z.null()]).optional(),
  removeImage: z.boolean().optional(),
  publishedAt: z
    .string()
    .min(1)
    .optional()
    .transform((v) => (v && v.trim() ? new Date(v.trim()) : undefined))
    .refine((v) => !v || !Number.isNaN(v.getTime()), {
      message: 'Invalid published date.',
    }),
});

function formDataToPayload(fd: FormData): {
  id: string;
  title?: string;
  body?: string;
  slug?: string;
  blogAuthor?: string | null;
  removeImage?: boolean;
  publishedAt?: string;
} {
  const id = fd.get('id');
  const title = fd.get('title');
  const body = fd.get('body');
  const slug = fd.get('slug');
  const blogAuthor = fd.get('blogAuthor');
  const publishedAt = fd.get('publishedAt');
  const removeImage = fd.get('removeImage') === 'on' || fd.get('removeImage') === 'true' || fd.get('removeImage') === '1';
  return {
    id: typeof id === 'string' ? id : '',
    title: typeof title === 'string' && title.trim() ? title.trim() : undefined,
    body: typeof body === 'string' && body.trim() ? body.trim() : undefined,
    slug: typeof slug === 'string' && slug.trim() ? slug.trim() : undefined,
    blogAuthor: typeof blogAuthor === 'string' ? (blogAuthor.trim() ? blogAuthor.trim() : null) : undefined,
    removeImage: removeImage || undefined,
    publishedAt: typeof publishedAt === 'string' && publishedAt.trim() ? publishedAt.trim() : undefined,
  };
}

export async function updateContentAction(
  data: FormData | {
    id: string;
    title?: string;
    body?: string;
    slug?: string;
    blogAuthor?: string | null;
    imageUrl?: string | null;
    removeImage?: boolean;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireRole(['EDITOR', 'ADMIN']);
    let imageUrl: string | null | undefined;

    if (data instanceof FormData) {
      const file = data.get('image');
      const removeImage = data.get('removeImage') === 'on' || data.get('removeImage') === 'true' || data.get('removeImage') === '1';
      if (removeImage) {
        imageUrl = null;
      } else if (file && file instanceof File && file.size > 0) {
        const result = await saveUploadedImage(file);
        if ('error' in result) {
          return { success: false, error: result.error };
        }
        imageUrl = result.imageUrl;
      }
    } else {
      imageUrl = data.imageUrl;
      if (data.removeImage) imageUrl = null;
    }

    const raw = data instanceof FormData ? formDataToPayload(data) : data;
    const parsed = updateSchema.safeParse({ ...raw, imageUrl });
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      return { success: false, error: msg || 'Invalid input.' };
    }
    const body = parsed.data.body ? sanitizeHtml(parsed.data.body) : undefined;
    const allowAdminOverride = (user as { role?: string }).role === 'ADMIN';

    const updateData: Parameters<typeof contentService.updateContent>[1] = {};
    if (parsed.data.title !== undefined) updateData.title = parsed.data.title;
    if (body !== undefined) updateData.body = body;
    if (parsed.data.slug !== undefined) updateData.slug = parsed.data.slug;
    if (parsed.data.blogAuthor !== undefined) updateData.blogAuthor = parsed.data.blogAuthor;
    if (parsed.data.removeImage || imageUrl === null) {
      updateData.imageUrl = null;
    } else if (imageUrl) {
      updateData.imageUrl = imageUrl;
    }
    if (parsed.data.publishedAt !== undefined) {
      updateData.publishedAt = parsed.data.publishedAt;
    }

    const content = await contentService.updateContent(
      parsed.data.id,
      updateData,
      user.id,
      { allowAdminOverride }
    );
    if (!content) return { success: false, error: 'Content not found or you cannot edit it.' };
    revalidatePath('/news');
    revalidatePath('/blog');
    revalidatePath('/');
    revalidatePath(`/admin/content/${parsed.data.id}`);
    revalidatePath('/admin-news');
    revalidatePath('/admin-blogs');
    return { success: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { success: false, error: 'Slug already exists. Choose a different slug.' };
    }
    const msg = e instanceof Error ? e.message : 'Failed to update content.';
    return { success: false, error: msg };
  }
}

/** Use as form action. Returns void; throws on error. */
export async function updateContentFormAction(fd: FormData): Promise<void> {
  const res = await updateContentAction(fd);
  if (!res.success) throw new Error(res.error ?? 'Failed to update content.');
}
