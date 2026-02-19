'use server';

import { requireRole } from '@/lib/permissions';
import { savedService } from '@/services/saved/saved.service';
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '@/utils/rate-limit';
import { z } from 'zod';
import { AppError } from '@/utils/errors';

const schema = z.object({ contentId: z.string().uuid() });

export async function saveContentAction(formData: unknown): Promise<{
  success: boolean;
  error?: string;
}> {
  let actor: { id?: string };
  try {
    actor = await requireRole(['MEMBER', 'EDITOR', 'ADMIN']);
  } catch {
    return { success: false, error: 'Unauthorized' };
  }
  const userId = actor.id;
  if (!userId) {
    return { success: false, error: 'Unauthorized' };
  }

  const { allowed, message } = checkRateLimit(userId, 'save');
  if (!allowed) {
    return { success: false, error: message ?? RATE_LIMIT_MESSAGE };
  }

  const data = formData instanceof FormData
    ? { contentId: formData.get('contentId') as string | null }
    : (formData as { contentId?: string });
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join('; ');
    return { success: false, error: msg || 'Invalid content ID' };
  }

  try {
    await savedService.save(userId, parsed.data.contentId);
    return { success: true };
  } catch (e) {
    if (e instanceof AppError) {
      return { success: false, error: e.message };
    }
    throw e;
  }
}
