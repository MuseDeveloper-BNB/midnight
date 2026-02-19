'use server';

import { revalidatePath } from 'next/cache';
import { contentService } from '@/services/content/content.service';
import { moderationService } from '@/services/moderation/moderation.service';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';

const publishSchema = z.object({
  id: z.string().uuid(),
});

function formDataToPayload(fd: FormData): { id: string } {
  const id = fd.get('id');
  return { id: typeof id === 'string' ? id : '' };
}

export async function publishContentAction(data: FormData | { id: string }) {
  const user = await requireRole(['EDITOR', 'ADMIN']);
  const raw = data instanceof FormData ? formDataToPayload(data) : data;
  const parsed = publishSchema.parse(raw);
  await contentService.publishContent(parsed.id);
  await moderationService.logModerationAction({
    action: 'PUBLISH_CONTENT',
    targetType: 'CONTENT',
    targetId: parsed.id,
    moderatorId: user.id,
    details: { newStatus: 'PUBLISHED' },
  });
  revalidatePath('/news');
  revalidatePath('/blog');
  revalidatePath('/');
  revalidatePath(`/admin/content/${parsed.id}`);
  revalidatePath('/admin-news');
  revalidatePath('/admin-blogs');
}
