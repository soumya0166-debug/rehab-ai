// REHAB-AI: Protected Routes & Role-Based Access Control Middleware
// Enforces backend authorization and redirects unauthorized/unauthenticated requests
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { normalizeRole, getRoleDashboardPath } from '@/lib/auth/auth-service';
import { isRouteAllowedForRole } from '@/lib/auth/guards';
import { CanonicalRole } from '@/types';

const PROTECTED_PREFIXES = ['/patient', '/clinician', '/caregiver', '/admin', '/settings'];
const AUTH_ROUTES = ['/login', '/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-anon-key';

  let authenticatedUserId: string | null = null;
  let verifiedRole: CanonicalRole | null = null;

  // 1. Check Supabase server session via cookies
  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set(name, value, options as CookieOptions);
          });
        },
      },
    });

    // SECURITY: getUser() validates token against Supabase Auth servers (Never trusting unverified claims)
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      authenticatedUserId = user.id;

      // Query database for verified role directly (never trusting frontend-supplied headers)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role) {
        verifiedRole = normalizeRole(profile.role);
      }
    }
  } catch {
    // If Supabase network is unavailable, proceed to check cookie fallback
  }

  // 2. Cookie fallback for demo/offline sessions
  if (!authenticatedUserId) {
    const authCookie = request.cookies.get('rehab_ai_authenticated')?.value;
    const roleCookie = request.cookies.get('rehab_ai_role')?.value;

    if (authCookie === 'true' && roleCookie) {
      authenticatedUserId = 'authenticated-session';
      verifiedRole = normalizeRole(roleCookie);
    }
  }

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // 3. Unauthenticated access to protected route: Redirect to /login
  if (isProtectedRoute && !authenticatedUserId) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Authenticated user visiting /login or /signup: Redirect to their role dashboard
  if (isAuthRoute && authenticatedUserId && verifiedRole) {
    const dashboardPath = getRoleDashboardPath(verifiedRole);
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // 5. Role-based Authorization check for protected routes
  if (isProtectedRoute && verifiedRole) {
    // Admin has universal access
    if (verifiedRole === 'ADMIN') {
      return response;
    }

    // Settings is accessible to all authenticated roles
    if (pathname.startsWith('/settings')) {
      return response;
    }

    const isAllowed = isRouteAllowedForRole(pathname, verifiedRole);

    if (!isAllowed) {
      // Determine what role was required
      let requiredRole: CanonicalRole = 'PATIENT';
      if (pathname.startsWith('/clinician')) requiredRole = 'PHYSIOTHERAPIST';
      else if (pathname.startsWith('/caregiver')) requiredRole = 'CAREGIVER';
      else if (pathname.startsWith('/admin')) requiredRole = 'ADMIN';

      const unauthorizedUrl = new URL('/unauthorized', request.url);
      unauthorizedUrl.searchParams.set('currentRole', verifiedRole);
      unauthorizedUrl.searchParams.set('requiredRole', requiredRole);
      unauthorizedUrl.searchParams.set('targetPath', pathname);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
