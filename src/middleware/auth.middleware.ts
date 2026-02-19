import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function getRoleFromRequest(request: NextRequest) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  
  // NextAuth v5 uses different cookie names
  // Try with secureCookie option based on environment
  const secureCookie = process.env.NODE_ENV === 'production';
  
  const token = await getToken({ 
    req: request, 
    secret,
    secureCookie,
    cookieName: secureCookie ? '__Secure-authjs.session-token' : 'authjs.session-token',
  });
  
  return (token?.role as string | undefined) ?? null;
}
