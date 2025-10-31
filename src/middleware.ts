import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Get the path
  const path = req.nextUrl.pathname;

  // Allow setup routes without authentication (client will verify session)
  if (path.startsWith("/setup/")) {
    return res;
  }

  // Check if this is an admin route
  const adminRouteMatch = path.match(/^\/([^/]+)\/admin(\/.*)?$/);

  if (adminRouteMatch) {
    const tenantSlug = adminRouteMatch[1];

    // Check for Supabase auth token in cookies
    const authToken = req.cookies.get("sb-access-token")?.value ||
                     req.cookies.get("sb-auth-token")?.value ||
                     req.cookies.get(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`)?.value;

    // If no auth token, redirect to login
    if (!authToken) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }

    // Note: Full access check and tenant validation happens on the client
    // This middleware provides basic auth protection
    // The admin pages will verify tenant access using RPC calls
  }

  // Allow auth routes without authentication
  if (path.startsWith("/auth/") || path.startsWith("/api/auth/")) {
    return res;
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
