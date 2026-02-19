import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// Define which roles can access which routes
const routePermissions: Record<string, string[]> = {
  '/admin-dashboard': ['EDITOR', 'ADMIN'],
  '/admin': ['EDITOR', 'ADMIN'],
  '/users': ['ADMIN'],
  '/moderation-history': ['EDITOR', 'ADMIN'],
  '/admin-news': ['EDITOR', 'ADMIN'],
  '/admin-blogs': ['EDITOR', 'ADMIN'],
  '/editor': ['EDITOR', 'ADMIN'],
  '/content': ['EDITOR', 'ADMIN'],
  '/member': ['MEMBER', 'EDITOR', 'ADMIN'],
  '/profile': ['MEMBER', 'EDITOR', 'ADMIN'],
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Admin login page is public
  if (pathname === '/admin') {
    return NextResponse.next();
  }

  // Find matching route permission
  let allowedRoles: string[] | undefined;
  for (const [route, roles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      allowedRoles = roles;
      break;
    }
  }

  // If no permission rules for this route, allow access
  if (!allowedRoles) {
    return NextResponse.next();
  }

  // If not logged in, redirect to admin login
  if (!session?.user) {
    const loginUrl = new URL('/admin', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check if user has required role
  const userRole = (session.user as { role?: string }).role;
  if (!userRole || !allowedRoles.includes(userRole)) {
    // User is logged in but doesn't have permission
    const redirectUrl = new URL('/admin-dashboard', req.url);
    redirectUrl.searchParams.set('error', 'unauthorized');
    redirectUrl.searchParams.set('message', 'Only administrators can access this page');
    return NextResponse.redirect(redirectUrl);
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/admin-dashboard/:path*',
    '/admin/:path*',
    '/admin-news/:path*',
    '/admin-blogs/:path*',
    '/users/:path*',
    '/moderation-history/:path*',
    '/editor/:path*',
    '/content/:path*',
    '/member/:path*',
    '/profile/:path*',
  ],
};
