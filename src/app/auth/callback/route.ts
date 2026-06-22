import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth / magic-link redirect target. Supabase sends the browser here with a
 * `?code=...`; we exchange it for a session (which sets the auth cookies) and
 * then bounce back into the app.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await getSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Something went wrong — return to the app with an error flag the UI can show.
  return NextResponse.redirect(`${origin}/?auth_error=oauth`);
}
