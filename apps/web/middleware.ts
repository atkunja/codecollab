// apps/web/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  // Always create a response first (the helper mutates cookies on it)
  const res = NextResponse.next();

  // Refresh session if needed; this sets/updates auth cookies
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Allow unauthenticated access to these paths (adjust to your app):
  const isPublic =
    pathname.startsWith("/auth") ||           // your auth routes (e.g., /auth/callback, /auth/confirm)
    pathname.startsWith("/api/auth") ||       // any custom auth APIs
    pathname.startsWith("/_next/") ||         // Next.js internals
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public") ||
    pathname === "/login";                    // your login page

  // If not signed in and trying to access a protected path, redirect to /login
  if (!session && !isPublic) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Optional: send them back after login
    loginUrl.searchParams.set("redirectTo", pathname || "/");
    return NextResponse.redirect(loginUrl);
  }

  // If signed in and hitting /login, bounce to home (optional)
  if (session && pathname === "/login") {
    const home = req.nextUrl.clone();
    home.pathname = "/";
    return NextResponse.redirect(home);
  }

  return res;
}

// Apply middleware to everything except static files by default.
// We’ll filter further inside with isPublic above.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
