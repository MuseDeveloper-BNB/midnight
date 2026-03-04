'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { contentService } from '@/services/content/content.service';
import { moderationService } from '@/services/moderation/moderation.service';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';

const unpublishSchema = z.object({
  id: z.string().uuid(),
  returnTo: z.string().optional(),
});

function formDataToPayload(fd: FormData): { id: string; returnTo?: string } {
  const id = fd.get('id');
  const returnTo = fd.get('returnTo');
  return {
    id: typeof id === 'string' ? id : '',
    returnTo: typeof returnTo === 'string' && returnTo ? returnTo : undefined,
  };
}

export async function unpublishContentAction(data: FormData | { id: string; returnTo?: string }) {
  const user = await requireRole(['EDITOR', 'ADMIN']);
  const raw = data instanceof FormData ? formDataToPayload(data) : data;
  const parsed = unpublishSchema.parse(raw);
  await contentService.unpublishContent(parsed.id);
  await moderationService.logModerationAction({
    action: 'UNPUBLISH_CONTENT',
    targetType: 'CONTENT',
    targetId: parsed.id,
    moderatorId: user.id,
    details: { newStatus: 'DRAFT' },
  });
  revalidatePath('/news');
  revalidatePath('/blog');
  revalidatePath('/');
  revalidatePath(`/admin/content/${parsed.id}`);
  revalidatePath('/admin-news');
  revalidatePath('/admin-news/archived');
  revalidatePath('/admin-blogs');
  revalidatePath('/admin-blogs/archived');
  const path = parsed.returnTo ?? `/admin/content/${parsed.id}`;
  redirect(`${path}?success=unpublished`);
}
