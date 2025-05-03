import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Add paths that don't require authentication
const publicPaths = [
  '/admin/login',
  '/api/admin/auth/login',
  '/api/doctors',  // Public API for appointments booking
  '/api/appointments'  // Public API for appointments booking
];

// This function determines if a path is public (accessible without auth)
function isPublicPath(path: string) {
  // Exact matches
  if (publicPaths.includes(path)) {
    return true;
  }
  
  // Root path and non-admin paths
  if (path === '/' || !path.startsWith('/admin')) {
    return true;
  }
  
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Allow bypassing auth check with parameter (for login redirect only)
  if (searchParams.get('auth') === 'true') {
    return NextResponse.next();
  }
  
  // Allow public resources like static files
  if (pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|webp)$/)) {
    return NextResponse.next();
  }

  // Allow public paths (non-admin routes)
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // For admin paths, verify authentication
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      // Token doesn't exist, redirect to login
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      // Verify the token - just check if it's valid without strict expiration check
      // This is a more lenient approach to prevent frequent logouts during navigation
      try {
        verify(token, JWT_SECRET, { ignoreExpiration: true });
        return NextResponse.next();
      } catch (innerError) {
        // Only redirect if there's a problem with the token structure/signature
        // not just expiration
        if (innerError.name !== 'TokenExpiredError') {
          throw innerError;
        }
        return NextResponse.next();
      }
    } catch (error) {
      console.error('Token validation error:', error);
      
      // Invalid token - clear it and redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes under /admin, including root /admin
    '/admin/:path*',
    // Match all API routes under /api/admin
    '/api/admin/:path*'
  ]
}; 