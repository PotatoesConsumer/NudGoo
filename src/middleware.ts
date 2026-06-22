import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { env, isSupabaseConfigured } from "@/lib/env";

/**
 * Keeps the Supabase auth session fresh on every request by reading the auth
 * cookies, refreshing the token if needed, and writing the rotated cookies
 * back onto the response. This is the supported `@supabase/ssr` pattern for the
 * Next.js App Router — without it, server-side reads would see a stale session.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Before Supabase is configured there are no auth cookies to refresh.
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Touch the user to trigger a token refresh + cookie rotation when due.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Run on every route except Next internals and static/PWA assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
