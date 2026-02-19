import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRoleFromRequest } from '@/middleware/auth.middleware';

export async function requireRouteRole(request: NextRequest, allowedRoles: string[]) {
  const role = await getRoleFromRequest(request);
  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}
