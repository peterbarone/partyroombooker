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
    // Let the client handle auth verification to avoid false negatives when
    // using localStorage sessions (no cookies available in middleware).
    return res;
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
