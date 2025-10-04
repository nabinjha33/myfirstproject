import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define protected dealer routes
const isProtectedDealerRoute = createRouteMatcher([
  '/dealer/catalog(.*)',
  '/dealer/order-cart(.*)',
  '/dealer/my-orders(.*)',
  '/dealer/shipments(.*)',
  '/dealer/profile(.*)',
]);

// Define admin routes
const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
]);

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/products(.*)',
  '/brands(.*)',
  '/categories(.*)',
  '/about',
  '/contact',
  '/dealer-login',
  '/dealer-application',
  '/admin-login',
  '/admin-setup',
  '/admin-setup-simple',
  '/admin-setup-final',
  '/admin-debug',
  '/access-denied',
  '/api/webhooks(.*)',
  '/api/dealers(.*)',
  '/api/admin(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect dealer routes
  if (isProtectedDealerRoute(req)) {
    if (!userId) {
      // Redirect to dealer login if not authenticated
      const loginUrl = new URL('/dealer-login', req.url);
      loginUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // User is authenticated, allow access
    return NextResponse.next();
  }

  // Protect admin routes
  if (isAdminRoute(req)) {
    if (!userId) {
      const loginUrl = new URL('/admin-login', req.url);
      loginUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    // Skip middleware admin check - let the admin layout handle it
    // This allows us to use the more reliable email-based lookup in the client
    return NextResponse.next();
  }

  // Default behavior for other routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
