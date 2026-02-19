'use server';

import { adminService } from '@/services/admin/admin.service';
import { requireRole } from '@/lib/permissions';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
  role: z.string().optional(),
  active: z.boolean().optional(),
  search: z.string().optional(),
});

export async function getUsersAction(data: unknown) {
  await requireRole(['ADMIN']);
  const parsed = querySchema.parse(data ?? {});
  const users = await adminService.getUsers(parsed);
  return { success: true, users };
}
