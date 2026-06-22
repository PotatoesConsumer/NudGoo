"use client";

/**
 * Real Supabase auth + membership state for NudGoo.
 *
 * Owns everything that depends on the signed-in user: the auth session, the
 * user's `profiles` row (which carries their membership `status` and `role`),
 * whether the single group has a founder yet, and — for admins — the list of
 * members awaiting approval. It exposes plain actions (sign up / in / out,
 * claim the group, approve/reject members) that the app's view-model calls.
 *
 * Live updates: the hook subscribes to Realtime changes on the user's own
 * profile (so an admin's approval flips them into the app instantly) and, for
 * admins, on all profiles (so the pending-requests list stays current).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { env, isSupabaseConfigured } from "@/lib/env";
import type { Tables, TablesUpdate } from "@/types/database.types";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { subscribeToTable } from "@/lib/supabase/realtime";

export type ProfileRow = Tables<"profiles">;

export interface AuthApi {
  /** Becomes true once the initial session + profile lookup has settled. */
  ready: boolean;
  session: Session | null;
  profile: ProfileRow | null;
  /** null until known; true once a founder (approved admin) exists. */
  groupClaimed: boolean | null;
  /** Profiles awaiting approval — only populated for admins. */
  pendingMembers: ProfileRow[];
  /** All approved members of the group (visible to approved members). */
  members: ProfileRow[];
  busy: boolean;
  error: string | null;
  notice: string | null;
  signUpEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  resetPasswordEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  claimGroup: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  updateProfileFields: (patch: TablesUpdate<"profiles">) => Promise<void>;
  approveMember: (id: string) => Promise<void>;
  rejectMember: (id: string) => Promise<void>;
  validateJoinCode: (code: string) => Promise<boolean>;
  clearAuthMsg: () => void;
}

const friendlyError = (message: string): string => {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "Wrong email or password.";
  if (m.includes("already registered")) return "That email already has an account — log in instead.";
  if (m.includes("password should be")) return "Password must be at least 6 characters.";
  if (m.includes("email not confirmed")) return "Please confirm your email first — check your inbox.";
  return message;
};

export function useAuth(): AuthApi {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [groupClaimed, setGroupClaimed] = useState<boolean | null>(null);
  const [pendingMembers, setPendingMembers] = useState<ProfileRow[]>([]);
  const [members, setMembers] = useState<ProfileRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Stable refs the callbacks/effects read without re-subscribing.
  const profileRef = useRef<ProfileRow | null>(null);
  profileRef.current = profile;

  const supabase = getSupabaseBrowserClient();

  const clearAuthMsg = useCallback(() => {
    setError(null);
    setNotice(null);
  }, []);

  const validateJoinCode = useCallback(
    async (code: string): Promise<boolean> => {
      if (!supabase) return false;
      const { data } = await supabase.rpc("join_code_valid", { code });
      return data === true;
    },
    [supabase],
  );

  /** Fetch the caller's profile, retrying briefly while the signup trigger
   *  catches up (the row is created by a DB trigger on auth.users insert). */
  const loadProfile = useCallback(
    async (uid: string): Promise<ProfileRow | null> => {
      if (!supabase) return null;
      for (let attempt = 0; attempt < 5; attempt++) {
        const { data, error: err } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", uid)
          .maybeSingle();
        if (err) break;
        if (data) return data;
        await new Promise((r) => setTimeout(r, 400));
      }
      return null;
    },
    [supabase],
  );

  const refreshGroupClaimed = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.rpc("group_claimed");
    if (typeof data === "boolean") setGroupClaimed(data);
  }, [supabase]);

  const refreshPending = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (data) setPendingMembers(data);
  }, [supabase]);

  const refreshMembers = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: true });
    if (data) setMembers(data);
  }, [supabase]);

  // ── Initial session + auth-state subscription ──────────────────────────────
  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    let active = true;

    const resolve = async (sess: Session | null) => {
      if (!active) return;
      setSession(sess);
      if (sess?.user) {
        const p = await loadProfile(sess.user.id);
        if (!active) return;
        setProfile(p);
      } else {
        setProfile(null);
        setPendingMembers([]);
      }
      void refreshGroupClaimed();
      if (active) setReady(true);
    };

    void supabase.auth.getSession().then(({ data }) => resolve(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      void resolve(sess);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase, loadProfile, refreshGroupClaimed]);

  // ── Live: own profile row (status/role/points changes) ─────────────────────
  useEffect(() => {
    if (!supabase || !session?.user) return;
    const uid = session.user.id;
    return subscribeToTable(
      supabase,
      "profiles",
      {
        onUpdate: (row) => {
          if (row.id === uid) setProfile(row);
        },
      },
      { filter: `id=eq.${uid}`, channelName: `self-profile:${uid}` },
    );
  }, [supabase, session?.user?.id]);

  // ── Admins: keep the pending-approval list live ────────────────────────────
  const isApprovedAdmin = profile?.role === "admin" && profile?.status === "approved";
  useEffect(() => {
    if (!supabase || !isApprovedAdmin) {
      setPendingMembers([]);
      return;
    }
    void refreshPending();
    return subscribeToTable(
      supabase,
      "profiles",
      { onAny: () => void refreshPending() },
      { channelName: "admin-pending-profiles" },
    );
  }, [supabase, isApprovedAdmin, refreshPending]);

  // ── Approved members roster (visible once you're approved) ─────────────────
  const isApproved = profile?.status === "approved";
  useEffect(() => {
    if (!supabase || !isApproved) {
      setMembers([]);
      return;
    }
    void refreshMembers();
    return subscribeToTable(
      supabase,
      "profiles",
      { onAny: () => void refreshMembers() },
      { channelName: "approved-members-roster" },
    );
  }, [supabase, isApproved, refreshMembers]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const run = useCallback(
    async (fn: () => Promise<void>) => {
      setBusy(true);
      setError(null);
      setNotice(null);
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? friendlyError(e.message) : "Something went wrong.");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const signUpEmail = useCallback(
    (email: string, password: string, displayName: string) =>
      run(async () => {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split("@")[0] },
            emailRedirectTo: `${env.siteUrl}/auth/callback`,
          },
        });
        if (err) throw err;
        // Email-confirmation projects return no session until the link is used.
        if (!data.session) {
          setNotice("Check your inbox to confirm your email, then log in.");
        }
      }),
    [run, supabase],
  );

  const signInEmail = useCallback(
    (email: string, password: string) =>
      run(async () => {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }),
    [run, supabase],
  );

  const signInGoogle = useCallback(
    () =>
      run(async () => {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { error: err } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${env.siteUrl}/auth/callback` },
        });
        if (err) throw err;
      }),
    [run, supabase],
  );

  const resetPasswordEmail = useCallback(
    (email: string) =>
      run(async () => {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${env.siteUrl}/auth/callback?next=/reset-password`,
        });
        if (err) throw err;
        setNotice("Password reset link sent — check your inbox.");
      }),
    [run, supabase],
  );

  const signOut = useCallback(
    () =>
      run(async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        setProfile(null);
        setPendingMembers([]);
      }),
    [run, supabase],
  );

  const claimGroup = useCallback(
    () =>
      run(async () => {
        if (!supabase || !session?.user) throw new Error("Not signed in.");
        const { data, error: err } = await supabase.rpc("claim_group");
        if (err) throw err;
        if (data === false) {
          // Someone else already founded the group — fall back to waiting.
          setNotice("This group already has an admin — your request is pending approval.");
          void refreshGroupClaimed();
          return;
        }
        const p = await loadProfile(session.user.id);
        if (p) setProfile(p);
        void refreshGroupClaimed();
      }),
    [run, supabase, session?.user, loadProfile, refreshGroupClaimed],
  );

  const updateDisplayName = useCallback(
    (name: string) =>
      run(async () => {
        if (!supabase || !session?.user) throw new Error("Not signed in.");
        const trimmed = name.trim();
        if (!trimmed) return;
        const { data, error: err } = await supabase
          .from("profiles")
          .update({ display_name: trimmed })
          .eq("id", session.user.id)
          .select("*")
          .single();
        if (err) throw err;
        setProfile(data);
      }),
    [run, supabase, session?.user],
  );

  const updateProfileFields = useCallback(
    (patch: TablesUpdate<"profiles">) =>
      run(async () => {
        if (!supabase || !session?.user) throw new Error("Not signed in.");
        const { data, error: err } = await supabase
          .from("profiles")
          .update(patch)
          .eq("id", session.user.id)
          .select("*")
          .single();
        if (err) throw err;
        setProfile(data);
      }),
    [run, supabase, session?.user],
  );

  const approveMember = useCallback(
    (id: string) =>
      run(async () => {
        if (!supabase) return;
        const { error: err } = await supabase
          .from("profiles")
          .update({ status: "approved" })
          .eq("id", id);
        if (err) throw err;
        void refreshPending();
      }),
    [run, supabase, refreshPending],
  );

  const rejectMember = useCallback(
    (id: string) =>
      run(async () => {
        if (!supabase) return;
        const { error: err } = await supabase
          .from("profiles")
          .update({ status: "rejected" })
          .eq("id", id);
        if (err) throw err;
        void refreshPending();
      }),
    [run, supabase, refreshPending],
  );

  return {
    ready: isSupabaseConfigured ? ready : true,
    session,
    profile,
    groupClaimed,
    pendingMembers,
    members,
    busy,
    error,
    notice,
    signUpEmail,
    signInEmail,
    signInGoogle,
    resetPasswordEmail,
    signOut,
    claimGroup,
    updateDisplayName,
    updateProfileFields,
    approveMember,
    rejectMember,
    validateJoinCode,
    clearAuthMsg,
  };
}
