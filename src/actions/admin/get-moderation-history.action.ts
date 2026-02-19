'use server';

import { adminService } from '@/services/admin/admin.service';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';

const schema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
  moderatorId: z.string().uuid().optional(),
  action: z.string().optional(),
  targetType: z.string().optional(),
});

export async function getModerationHistoryAction(data: unknown) {
  await requireRole(['ADMIN']);
  const parsed = schema.parse(data ?? {});
  const logs = await adminService.getModerationHistory(parsed);
  return { success: true, logs };
}
