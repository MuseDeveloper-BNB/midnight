'use server';

import { requireRole } from '@/lib/permissions';
import { profileService } from '@/services/profile/profile.service';
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '@/utils/rate-limit';
import { profileUpdateSchema } from '@/utils/validation';
import { AppError } from '@/utils/errors';

export type UpdateProfileInput = { name?: string; email?: string };

export async function updateProfileAction(formData: unknown): Promise<{
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

  const { allowed, message } = checkRateLimit(userId, 'profile-update');
  if (!allowed) {
    return { success: false, error: message ?? RATE_LIMIT_MESSAGE };
  }

  const data =
    formData instanceof FormData
      ? {
          name: (formData.get('name') as string | null) ?? undefined,
          email: (formData.get('email') as string | null) ?? undefined,
        }
      : (formData as UpdateProfileInput);

  const parsed = profileUpdateSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.errors.map((e) => e.message).join('; ');
    return { success: false, error: msg };
  }

  try {
    await profileService.updateProfile(userId, parsed.data);
    return { success: true };
  } catch (e) {
    if (e instanceof AppError) {
      return { success: false, error: e.message };
    }
    throw e;
  }
}
