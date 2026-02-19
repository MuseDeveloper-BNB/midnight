'use server';

import { adminService } from '@/services/admin/admin.service';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';

const querySchema = z.object({
  id: z.string().uuid(),
});

export async function getUserAction(data: unknown) {
  await requireRole(['ADMIN']);
  const parsed = querySchema.parse(data);
  const user = await adminService.getUser(parsed.id);
  return { success: true, user };
}
