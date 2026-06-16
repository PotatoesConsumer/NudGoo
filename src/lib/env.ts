/**
 * Centralised, validated access to public environment variables.
 *
 * We read the two public Supabase values once and expose an
 * `isSupabaseConfigured` flag so the UI can degrade gracefully (showing
 * seeded demo data) before a real Supabase project is connected. This lets
 * the app run end-to-end with `npm run dev` immediately after cloning.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

export const env = {
  supabaseUrl: url,
  supabaseAnonKey: anonKey,
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "http://localhost:3000",
} as const;

/**
 * True only when both required Supabase values look real (non-empty and not
 * the placeholder from `.env.local.example`).
 */
export const isSupabaseConfigured: boolean =
  url.length > 0 &&
  anonKey.length > 0 &&
  !url.includes("YOUR-PROJECT-ref") &&
  anonKey !== "your-anon-public-key";
