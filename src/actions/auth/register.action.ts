'use server';

import { redirect } from 'next/navigation';
import { authService } from '@/services/auth/auth.service';
import { registerSchema } from '@/utils/validation';

export async function registerAction(formData: FormData): Promise<void> {
  const data = {
    email: formData.get('email') ?? '',
    password: formData.get('password') ?? '',
    name: (formData.get('name') as string)?.trim() || undefined,
  };
  const parsed = registerSchema.parse(data);
  await authService.register(parsed);
  redirect('/admin');
}
