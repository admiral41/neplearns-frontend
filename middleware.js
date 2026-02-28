/**
 * Next.js Middleware for Route Protection
 * Handles authentication and authorization at the edge
 */

import { NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/student-dashboard',
  '/instructor-dashboard',
  '/admin-dashboard',
  '/announcements',
];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/student-registration', '/instructor-application'];

// Public routes (accessible without auth)
const publicRoutes = [
  '/',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/unauthorized',
  '/terms',
  '/privacy',
  '/about',
  '/contact',
  '/courses',
];

/**
 * Check if a path matches a route pattern
 */
function matchesRoute(pathname, routes) {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Get user data from cookie (basic parsing, no JWT verification at edge)
 * Full verification happens server-side
 */
function getTokenFromCookie(request) {
  return request.cookies.get('access_token')?.value;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = getTokenFromCookie(request);

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/fonts') ||
    pathname.includes('.') // Static files like .js, .css, .ico, etc.
  ) {
    return NextResponse.next();
  }

  // Check if it's a protected route
  const isProtectedRoute = matchesRoute(pathname, protectedRoutes);
  const isAuthRoute = matchesRoute(pathname, authRoutes);
  const isPublicRoute = matchesRoute(pathname, publicRoutes);

  // If protected route and no token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and trying to access auth routes (login, register), let client handle redirect
  // The login page has logic to redirect authenticated users to their appropriate dashboard
  // We can't determine roles from JWT at edge without secret, so let client handle it
  if (token && isAuthRoute) {
    // Allow the request - client-side will handle role-based redirect
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
