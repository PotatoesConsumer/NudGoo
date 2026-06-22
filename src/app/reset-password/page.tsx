"use client";

/**
 * Password-reset landing page.
 *
 * The reset email links to `/auth/callback?next=/reset-password`, which
 * exchanges the recovery code for a session and bounces here. With that
 * (short-lived) session in place the user can set a new password via
 * `auth.updateUser`. If someone lands here without a valid recovery session
 * (e.g. an expired link) we say so instead of showing a dead form.
 */

import Link from "next/link";
import { useEffect, useState } from "react";

import { css } from "@/lib/nudgoo/css";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const field =
  "display:flex;align-items:center;height:52px;padding:0 16px;border-radius:13px;background:var(--surface-raised);margin-bottom:11px";
const input =
  "flex:1;border:0;background:transparent;outline:0;font-family:'Sarabun',sans-serif;font-size:14.5px;color:var(--ink)";

type Phase = "checking" | "ready" | "saving" | "done" | "invalid";

export default function ResetPasswordPage() {
  const supabase = getSupabaseBrowserClient();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setPhase("invalid");
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setPhase(data.session ? "ready" : "invalid");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) setPhase((p) => (p === "checking" || p === "invalid" ? "ready" : p));
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const submit = async () => {
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (!supabase) return;
    setPhase("saving");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setPhase("ready");
      return;
    }
    setPhase("done");
    setTimeout(() => {
      window.location.href = "/";
    }, 1600);
  };

  return (
    <div style={css("min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--canvas);padding:24px")}>
      <div style={css("width:100%;max-width:360px;display:flex;flex-direction:column")}>
        <div style={css("display:flex;flex-direction:column;align-items:center;text-align:center;margin-bottom:26px")}>
          <div style={css("width:64px;height:64px;border-radius:20px;background:var(--primary);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 26px rgba(59,91,219,.4);margin-bottom:16px")}>
            <i className="ph-fill ph-lock-key" style={css("font-size:32px;color:#fff")} />
          </div>
          <div style={css("font-family:Trirong,serif;font-weight:600;font-size:24px;color:var(--ink)")}>Set a new password</div>
        </div>

        {phase === "checking" && (
          <div style={css("text-align:center;color:var(--ink-tertiary);font-size:14px")}>Checking your link…</div>
        )}

        {phase === "invalid" && (
          <div style={css("display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center")}>
            <div style={css("font-size:14px;color:var(--ink-secondary);line-height:1.55")}>This reset link is invalid or has expired. Request a new one from the login screen.</div>
            <Link href="/" style={css("text-decoration:none;background:var(--primary);color:#fff;font-weight:700;font-size:14.5px;font-family:'Sarabun',sans-serif;padding:13px 22px;border-radius:13px")}>Back to login</Link>
          </div>
        )}

        {phase === "done" && (
          <div style={css("display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center")}>
            <i className="ph-fill ph-check-circle" style={css("font-size:44px;color:var(--profit)")} />
            <div style={css("font-size:14.5px;color:var(--ink-secondary)")}>Password updated! Taking you back in…</div>
          </div>
        )}

        {(phase === "ready" || phase === "saving") && (
          <>
            <div style={css(field)}>
              <i className="ph ph-lock-key" style={css("font-size:18px;color:var(--ink-tertiary);margin-right:10px")} />
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="New password" style={css(input)} />
            </div>
            <div style={css(field)}>
              <i className="ph ph-check" style={css("font-size:18px;color:var(--ink-tertiary);margin-right:10px")} />
              <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" placeholder="Confirm new password" style={css(input)} />
            </div>
            {error && (
              <div style={css("display:flex;align-items:center;gap:8px;background:var(--error-bg);color:var(--error);font-size:12.5px;font-weight:600;padding:10px 13px;border-radius:11px;margin:6px 0 4px")}>
                <i className="ph-fill ph-warning-circle" style={css("font-size:16px")} /> {error}
              </div>
            )}
            <button
              onClick={submit}
              disabled={phase === "saving"}
              style={css(`width:100%;height:52px;border-radius:13px;border:0;background:var(--primary);color:#fff;font-weight:700;font-size:15.5px;font-family:'Sarabun',sans-serif;margin-top:8px;cursor:${phase === "saving" ? "default" : "pointer"};opacity:${phase === "saving" ? ".7" : "1"}`)}
            >
              {phase === "saving" ? "Saving…" : "Update password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
