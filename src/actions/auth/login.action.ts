'use server';

import { signIn } from '@/lib/auth';
import { loginSchema } from '@/utils/validation';
import { AuthError } from 'next-auth';

export async function loginAction(formData: unknown) {
  const data = formData instanceof FormData
    ? { email: formData.get('email') ?? '', password: formData.get('password') ?? '' }
    : formData;
  const parsed = loginSchema.parse(data);
  
  try {
    await signIn('credentials', {
      email: parsed.email,
      password: parsed.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Invalid email or password.' };
    }
    throw error;
  }
}
