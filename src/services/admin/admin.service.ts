import { db } from '@/lib/db';
import { errors } from '@/utils/errors';
import type { UserRole, ModerationAction, ModerationTargetType } from '@prisma/client';

export class AdminService {
  async getUsers(params: {
    limit?: number;
    offset?: number;
    role?: string;
    active?: boolean;
    search?: string;
  }) {
    const { limit = 50, offset = 0, role, active, search } = params;
    return db.user.findMany({
      where: {
        role: role ? (role as UserRole) : undefined,
        active: typeof active === 'boolean' ? active : undefined,
        OR: search
          ? [
              { email: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      skip: offset,
      take: limit,
    });
  }

  async getUser(id: string) {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        authoredContent: true,
        comments: true,
      },
    });
    if (!user) {
      throw errors.notFound();
    }
    return user;
  }

  async updateUserRole(userId: string, role: string, actorId: string) {
    if (userId === actorId) {
      throw errors.forbidden();
    }
    return db.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
  }

  async deactivateUser(userId: string, actorId: string) {
    if (userId === actorId) {
      throw errors.forbidden();
    }
    return db.user.update({
      where: { id: userId },
      data: { active: false },
    });
  }

  async activateUser(userId: string) {
    return db.user.update({
      where: { id: userId },
      data: { active: true },
    });
  }

  async getModerationHistory(params: {
    limit?: number;
    offset?: number;
    moderatorId?: string;
    action?: string;
    targetType?: string;
  }) {
    const { limit = 50, offset = 0, moderatorId, action, targetType } = params;
    return db.moderationLog.findMany({
      where: {
        moderatorId: moderatorId ?? undefined,
        action: action ? (action as ModerationAction) : undefined,
        targetType: targetType ? (targetType as ModerationTargetType) : undefined,
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const adminService = new AdminService();
