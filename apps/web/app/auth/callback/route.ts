// apps/web/app/auth/callback/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // After OAuth, Supabase sets the session cookie on your domain (via middleware + helper)
  // We just forward users where they wanted to go.
  const url = new URL(req.url);
  const redirectTo = url.searchParams.get("redirectTo") ?? "/";
  return NextResponse.redirect(new URL(redirectTo, url.origin));
}
