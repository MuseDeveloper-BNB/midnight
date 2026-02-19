import { hash, compare } from 'bcryptjs';
import { db } from '@/lib/db';
import { errors } from '@/utils/errors';

export class AuthService {
  async register(data: { email: string; password: string; name?: string }) {
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw errors.badRequest('Email already exists');
    }

    const password = await hash(data.password, 10);
    return db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password,
        role: 'MEMBER',
        provider: 'EMAIL',
      },
    });
  }

  async login(data: { email: string; password: string }) {
    const user = await db.user.findUnique({ where: { email: data.email } });
    if (!user || !user.password || !user.active) {
      throw errors.forbidden();
    }

    const valid = await compare(data.password, user.password);
    if (!valid) {
      throw errors.forbidden();
    }

    return user;
  }
}

export const authService = new AuthService();
