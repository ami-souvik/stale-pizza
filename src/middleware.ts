import { NextRequest, NextResponse } from "next/server";

/**
 * Public paths that do NOT require authentication
 */
const PUBLIC_PATHS = [
  "/",
  "/pricing",
  "/features",
  "/templates",
  "/login",
  "/signup",
];

/**
 * Paths that should always be public (prefix match)
 */
const PUBLIC_PREFIXES = [
  "/share",        // public app viewer
  "/api/auth",     // auth callbacks
  "/guest",        // guest forms
];

/**
 * Simple auth check.
 * For now we rely on a session cookie.
 * Later this can be replaced with JWT / NextAuth / custom token logic.
 */
function isAuthenticated(request: NextRequest) {
  // Example: session cookie set after login
  // console.log('cookies', request.cookies);
  // const session = request.cookies.get("csrftoken");
  // return Boolean(session?.value);
  return true; // Skipping server-side check as we use localStorage for now
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  // Store the full pathname in a custom header
  requestHeaders.set('x-pathname', request.nextUrl.pathname);

  // ✅ Allow public prefix routes
  if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // ✅ Allow exact public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 🔐 Protect dashboard routes
  if (!isAuthenticated(request)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    }
  });
}

/**
 * Apply middleware only to relevant paths
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};