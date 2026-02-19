'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { loginAction } from '@/actions/auth/login.action';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/admin-dashboard';
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result.success) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError(result.error ?? 'Invalid credentials.');
      }
    });
  }

  return (
    <>
      <h1>Admin</h1>
      <p className="auth-subtitle">Sign in with your admin credentials.</p>
      {error && <p className="auth-error">{error}</p>}
      <form action={handleSubmit}>
        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="e.g. admin@midnight.local"
        />
        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          minLength={8}
        />
        <button type="submit" disabled={isPending}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <div className="auth-footer">
        <p className="auth-footer__back">
          <Link href="/">← Back to home</Link>
        </p>
      </div>
    </>
  );
}
