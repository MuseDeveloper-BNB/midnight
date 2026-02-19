'use server';

import { revalidatePath } from 'next/cache';
import { contentService } from '@/services/content/content.service';
import { moderationService } from '@/services/moderation/moderation.service';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';

const archiveSchema = z.object({
  id: z.string().uuid(),
});

function formDataToPayload(fd: FormData): { id: string } {
  const id = fd.get('id');
  return { id: typeof id === 'string' ? id : '' };
}

export async function archiveContentAction(data: FormData | { id: string }) {
  const user = await requireRole(['EDITOR', 'ADMIN']);
  const raw = data instanceof FormData ? formDataToPayload(data) : data;
  const parsed = archiveSchema.parse(raw);
  await contentService.archiveContent(parsed.id);
  await moderationService.logModerationAction({
    action: 'ARCHIVE_CONTENT',
    targetType: 'CONTENT',
    targetId: parsed.id,
    moderatorId: user.id,
    details: { newStatus: 'ARCHIVED' },
  });
  revalidatePath('/news');
  revalidatePath('/blog');
  revalidatePath('/');
  revalidatePath(`/admin/content/${parsed.id}`);
  revalidatePath('/admin-news');
  revalidatePath('/admin-blogs');
}
