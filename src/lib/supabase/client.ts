"use client";

/**
 * Browser-side Supabase client.
 *
 * Built on `@supabase/ssr` so auth state is shared with the server via
 * cookies. Realtime is enabled with a modest event throttle that is plenty
 * for a friends-group app while staying comfortably inside Supabase's free
 * tier limits.
 *
 * The client is created lazily and memoised: there should only ever be one
 * Realtime websocket per browser tab.
 */

import { createBrowserClient } from "@supabase/ssr";

import { env, isSupabaseConfigured } from "@/lib/env";
import type { Database } from "@/types/database.types";

/**
 * Derived from the SSR factory's return type so it always matches the exact
 * `SupabaseClient` generic shape that `@supabase/ssr` produces — avoiding
 * arity mismatches with the standalone `@supabase/supabase-js` types.
 */
export type TypedSupabaseClient = ReturnType<
  typeof createBrowserClient<Database>
>;

let browserClient: TypedSupabaseClient | null = null;

/**
 * Returns the singleton browser client, or `null` when Supabase is not yet
 * configured (so callers can fall back to demo data without throwing).
 */
export function getSupabaseBrowserClient(): TypedSupabaseClient | null {
  if (!isSupabaseConfigured) return null;

  if (!browserClient) {
    browserClient = createBrowserClient<Database>(
      env.supabaseUrl,
      env.supabaseAnonKey,
      {
        realtime: {
          params: { eventsPerSecond: 10 },
        },
      },
    );
  }

  return browserClient;
}
