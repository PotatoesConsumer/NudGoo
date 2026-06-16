import "server-only";

/**
 * Server-side Supabase client for the App Router (Server Components, Route
 * Handlers, and Server Actions). It reads and writes the auth cookies so
 * sessions survive across requests.
 *
 * Note: `cookies()` is read-only inside Server Components. The try/catch in
 * `setAll` swallows the resulting error there — cookie writes only happen
 * from Server Actions / Route Handlers, which is the supported pattern.
 */

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/types/database.types";
import type { TypedSupabaseClient } from "./client";

export async function getSupabaseServerClient(): Promise<TypedSupabaseClient | null> {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options: CookieOptions;
        }>,
      ) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — safe to ignore. Session refresh
          // is handled by middleware / route handlers where writes succeed.
        }
      },
    },
  });
}
