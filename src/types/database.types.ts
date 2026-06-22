/**
 * Database types for NudGoo.
 *
 * This file mirrors the shape produced by the Supabase CLI
 * (`supabase gen types typescript`). It is hand-authored here so the project
 * is fully typed before a Supabase project exists. Once you provision the
 * database with `supabase/schema.sql`, you can regenerate this file with:
 *
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts
 *
 * Keep the enums and table shapes here in sync with `supabase/schema.sql`.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          role: Database["public"]["Enums"]["user_role"];
          status: Database["public"]["Enums"]["member_status"];
          points: number;
          created_at: string;
          username: string | null;
          phone: string | null;
          nickname: string | null;
          avatar_color: string;
          avatar_emoji: string | null;
          promptpay_handle: string | null;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["member_status"];
          points?: number;
          created_at?: string;
          username?: string | null;
          phone?: string | null;
          nickname?: string | null;
          avatar_color?: string;
          avatar_emoji?: string | null;
          promptpay_handle?: string | null;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          status?: Database["public"]["Enums"]["member_status"];
          points?: number;
          created_at?: string;
          username?: string | null;
          phone?: string | null;
          nickname?: string | null;
          avatar_color?: string;
          avatar_emoji?: string | null;
          promptpay_handle?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          created_at: string;
          type: string;
          reply_to: string | null;
          edited: boolean;
          pinned: boolean;
          meta: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content?: string;
          created_at?: string;
          type?: string;
          reply_to?: string | null;
          edited?: boolean;
          pinned?: boolean;
          meta?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
          type?: string;
          reply_to?: string | null;
          edited?: boolean;
          pinned?: boolean;
          meta?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trips: {
        Row: {
          id: string;
          title: string;
          destination: string;
          description: string | null;
          start_date: string | null;
          end_date: string | null;
          cover_url: string | null;
          status: Database["public"]["Enums"]["trip_status"];
          created_by: string;
          created_at: string;
          emoji: string;
          transport: string | null;
          notes: string | null;
          blind_vote: boolean;
          bill_split_enabled: boolean;
          treasurer_id: string | null;
          total_amount: number | null;
        };
        Insert: {
          id?: string;
          title: string;
          destination: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          cover_url?: string | null;
          status?: Database["public"]["Enums"]["trip_status"];
          created_by: string;
          created_at?: string;
          emoji?: string;
          transport?: string | null;
          notes?: string | null;
          blind_vote?: boolean;
          bill_split_enabled?: boolean;
          treasurer_id?: string | null;
          total_amount?: number | null;
        };
        Update: {
          id?: string;
          title?: string;
          destination?: string;
          description?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          cover_url?: string | null;
          status?: Database["public"]["Enums"]["trip_status"];
          created_by?: string;
          created_at?: string;
          emoji?: string;
          transport?: string | null;
          notes?: string | null;
          blind_vote?: boolean;
          bill_split_enabled?: boolean;
          treasurer_id?: string | null;
          total_amount?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "trips_created_by_fkey";
            columns: ["created_by"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trip_participants: {
        Row: {
          trip_id: string;
          user_id: string;
          rsvp: Database["public"]["Enums"]["rsvp_status"];
          created_at: string;
        };
        Insert: {
          trip_id: string;
          user_id: string;
          rsvp?: Database["public"]["Enums"]["rsvp_status"];
          created_at?: string;
        };
        Update: {
          trip_id?: string;
          user_id?: string;
          rsvp?: Database["public"]["Enums"]["rsvp_status"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "trip_participants_trip_id_fkey";
            columns: ["trip_id"];
            referencedRelation: "trips";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "trip_participants_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      game_sessions: {
        Row: {
          id: string;
          game_name: string;
          description: string | null;
          host_id: string;
          location: string | null;
          scheduled_at: string | null;
          max_players: number | null;
          status: Database["public"]["Enums"]["session_status"];
          created_at: string;
        };
        Insert: {
          id?: string;
          game_name: string;
          description?: string | null;
          host_id: string;
          location?: string | null;
          scheduled_at?: string | null;
          max_players?: number | null;
          status?: Database["public"]["Enums"]["session_status"];
          created_at?: string;
        };
        Update: {
          id?: string;
          game_name?: string;
          description?: string | null;
          host_id?: string;
          location?: string | null;
          scheduled_at?: string | null;
          max_players?: number | null;
          status?: Database["public"]["Enums"]["session_status"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "game_sessions_host_id_fkey";
            columns: ["host_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      game_signups: {
        Row: {
          session_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          session_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          session_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "game_signups_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "game_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "game_signups_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      point_events: {
        Row: {
          id: string;
          user_id: string;
          points: number;
          reason: string;
          created_at: string;
          category: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          points: number;
          reason: string;
          created_at?: string;
          category?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          points?: number;
          reason?: string;
          created_at?: string;
          category?: string;
        };
        Relationships: [
          {
            foreignKeyName: "point_events_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      trip_date_options: {
        Row: { id: string; trip_id: string; label: string; subtitle: string | null; option_date: string | null; created_at: string };
        Insert: { id?: string; trip_id: string; label: string; subtitle?: string | null; option_date?: string | null; created_at?: string };
        Update: { id?: string; trip_id?: string; label?: string; subtitle?: string | null; option_date?: string | null; created_at?: string };
        Relationships: [];
      };
      trip_date_votes: {
        Row: { option_id: string; trip_id: string; user_id: string; created_at: string };
        Insert: { option_id: string; trip_id: string; user_id: string; created_at?: string };
        Update: { option_id?: string; trip_id?: string; user_id?: string; created_at?: string };
        Relationships: [];
      };
      trip_photos: {
        Row: { id: string; trip_id: string; user_id: string; image_url: string | null; tint: string | null; expires_at: string | null; created_at: string };
        Insert: { id?: string; trip_id: string; user_id: string; image_url?: string | null; tint?: string | null; expires_at?: string | null; created_at?: string };
        Update: { id?: string; trip_id?: string; user_id?: string; image_url?: string | null; tint?: string | null; expires_at?: string | null; created_at?: string };
        Relationships: [];
      };
      bill_payments: {
        Row: { trip_id: string; user_id: string; paid: boolean; slip_url: string | null; updated_at: string };
        Insert: { trip_id: string; user_id: string; paid?: boolean; slip_url?: string | null; updated_at?: string };
        Update: { trip_id?: string; user_id?: string; paid?: boolean; slip_url?: string | null; updated_at?: string };
        Relationships: [];
      };
      message_reactions: {
        Row: { message_id: string; user_id: string; emoji: string; created_at: string };
        Insert: { message_id: string; user_id: string; emoji: string; created_at?: string };
        Update: { message_id?: string; user_id?: string; emoji?: string; created_at?: string };
        Relationships: [];
      };
      poll_options: {
        Row: { id: string; message_id: string; label: string; idx: number; created_at: string };
        Insert: { id?: string; message_id: string; label: string; idx?: number; created_at?: string };
        Update: { id?: string; message_id?: string; label?: string; idx?: number; created_at?: string };
        Relationships: [];
      };
      poll_votes: {
        Row: { option_id: string; user_id: string; created_at: string };
        Insert: { option_id: string; user_id: string; created_at?: string };
        Update: { option_id?: string; user_id?: string; created_at?: string };
        Relationships: [];
      };
      group_rules: {
        Row: { id: string; body: string; enabled: boolean; created_by: string | null; created_at: string };
        Insert: { id?: string; body: string; enabled?: boolean; created_by?: string | null; created_at?: string };
        Update: { id?: string; body?: string; enabled?: boolean; created_by?: string | null; created_at?: string };
        Relationships: [];
      };
      mute_votes: {
        Row: { target_id: string; voter_id: string; created_at: string };
        Insert: { target_id: string; voter_id: string; created_at?: string };
        Update: { target_id?: string; voter_id?: string; created_at?: string };
        Relationships: [];
      };
      group_meta: {
        Row: { id: number; invite_code: string; created_at: string };
        Insert: { id?: number; invite_code?: string; created_at?: string };
        Update: { id?: number; invite_code?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      group_claimed: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      claim_group: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      join_code_valid: {
        Args: { code: string };
        Returns: boolean;
      };
      is_member: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: "member" | "admin";
      member_status: "pending" | "approved" | "rejected";
      rsvp_status: "going" | "maybe" | "declined";
      trip_status:
        | "proposed"
        | "planning"
        | "confirmed"
        | "completed"
        | "cancelled";
      session_status: "proposed" | "scheduled" | "completed" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

/* ── Convenience helpers ─────────────────────────────────────────────── */

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];

export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];
