'use server';

import { revalidatePath } from 'next/cache';
import { contentService } from '@/services/content/content.service';
import { moderationService } from '@/services/moderation/moderation.service';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';

const unpublishSchema = z.object({
  id: z.string().uuid(),
});

function formDataToPayload(fd: FormData): { id: string } {
  const id = fd.get('id');
  return { id: typeof id === 'string' ? id : '' };
}

export async function unpublishContentAction(data: FormData | { id: string }) {
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
  revalidatePath('/admin-blogs');
}
