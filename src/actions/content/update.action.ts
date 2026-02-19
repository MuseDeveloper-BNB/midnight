'use server';

import { revalidatePath } from 'next/cache';
import { contentService } from '@/services/content/content.service';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';
import { sanitizeHtml } from '@/utils/sanitization';

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
  body: z.string().min(1).optional(),
  slug: z.string().min(1).max(255).optional(),
});

function formDataToPayload(fd: FormData): { id: string; title?: string; body?: string; slug?: string } {
  const id = fd.get('id');
  const title = fd.get('title');
  const body = fd.get('body');
  const slug = fd.get('slug');
  return {
    id: typeof id === 'string' ? id : '',
    title: typeof title === 'string' && title.trim() ? title.trim() : undefined,
    body: typeof body === 'string' && body.trim() ? body.trim() : undefined,
    slug: typeof slug === 'string' && slug.trim() ? slug.trim() : undefined,
  };
}

export async function updateContentAction(
  data: FormData | { id: string; title?: string; body?: string; slug?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireRole(['EDITOR', 'ADMIN']);
    const raw = data instanceof FormData ? formDataToPayload(data) : data;
    const parsed = updateSchema.safeParse(raw);
    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ');
      return { success: false, error: msg || 'Invalid input.' };
    }
    const body = parsed.data.body ? sanitizeHtml(parsed.data.body) : undefined;
    const allowAdminOverride = (user as { role?: string }).role === 'ADMIN';
    const content = await contentService.updateContent(
      parsed.data.id,
      { title: parsed.data.title, body, slug: parsed.data.slug },
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
    const msg = e instanceof Error ? e.message : 'Failed to update content.';
    return { success: false, error: msg };
  }
}

/** Use as form action. Returns void; throws on error. */
export async function updateContentFormAction(fd: FormData): Promise<void> {
  const res = await updateContentAction(fd);
  if (!res.success) throw new Error(res.error ?? 'Failed to update content.');
}
