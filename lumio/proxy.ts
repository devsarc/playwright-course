import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { NextResponse, type NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig);

const SUPPORTED_LOCALES = ['en', 'fr'];
const DEFAULT_LOCALE = 'en';

// /explore is intentionally absent — it's the public community projects page
const PROTECTED_PATHS = ['/dashboard', '/onboarding', '/admin', '/projects', '/chat'];
const PROTECTED_API = ['/api/workspaces', '/api/projects', '/api/tasks', '/api/notifications'];

export default auth((req: NextRequest & { auth: unknown }) => {
  const pathname = req.nextUrl.pathname;
  const isAuthenticated = !!(req as { auth: unknown }).auth;

  const needsAuth =
    PROTECTED_PATHS.some((p) => pathname.includes(p)) ||
    PROTECTED_API.some((p) => pathname.startsWith(p));

  if (needsAuth && !isAuthenticated) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Set locale cookie for i18n without URL rewrites (pages live at root, not /[locale]/)
  const response = NextResponse.next();
  if (!pathname.startsWith('/api/')) {
    const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value;
    const locale = SUPPORTED_LOCALES.includes(cookieLocale ?? '') ? cookieLocale! : DEFAULT_LOCALE;
    response.cookies.set('NEXT_LOCALE', locale, { maxAge: 60 * 60 * 24 * 365 });
  }
  return response;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)'],
};
