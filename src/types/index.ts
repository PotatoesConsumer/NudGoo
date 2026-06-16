/**
 * Domain types for NudGoo.
 *
 * These are friendly aliases over the raw database row types, plus the
 * "joined" shapes that the UI actually renders (e.g. a message with its
 * author profile attached). Keeping these in one place means components
 * never import from `database.types.ts` directly.
 */

import type { Tables, Enums } from "./database.types";

/* ── Row aliases ─────────────────────────────────────────────────────── */

export type Profile = Tables<"profiles">;
export type Message = Tables<"messages">;
export type Trip = Tables<"trips">;
export type TripParticipant = Tables<"trip_participants">;
export type GameSession = Tables<"game_sessions">;
export type GameSignup = Tables<"game_signups">;
export type PointEvent = Tables<"point_events">;

/* ── Enum aliases ────────────────────────────────────────────────────── */

export type UserRole = Enums<"user_role">;
export type MemberStatus = Enums<"member_status">;
export type RsvpStatus = Enums<"rsvp_status">;
export type TripStatus = Enums<"trip_status">;
export type SessionStatus = Enums<"session_status">;

/* ── A lightweight author shape used across feeds ────────────────────── */

export type Author = Pick<Profile, "id" | "display_name" | "avatar_url">;

/* ── Joined / composite shapes rendered by components ────────────────── */

export interface MessageWithAuthor extends Message {
  author: Author | null;
}

export interface TripWithMeta extends Trip {
  organizer: Author | null;
  goingCount: number;
  maybeCount: number;
}

export interface GameSessionWithMeta extends GameSession {
  host: Author | null;
  signupCount: number;
}

/** A single ranked entry on the leaderboard. */
export interface LeaderboardEntry {
  profile: Author;
  points: number;
  rank: number;
}

/**
 * A unified item in the admin approval queue. The queue blends two kinds of
 * pending things: members awaiting access, and proposed trips/games awaiting
 * a green light.
 */
export type ApprovalKind = "member" | "trip" | "game";

export interface ApprovalItem {
  id: string;
  kind: ApprovalKind;
  title: string;
  subtitle: string;
  requestedBy: Author | null;
  requestedAt: string;
}

/* ── Navigation ──────────────────────────────────────────────────────── */

export type AppRoute =
  | "/"
  | "/chat"
  | "/trips"
  | "/games"
  | "/leaderboard"
  | "/admin";
