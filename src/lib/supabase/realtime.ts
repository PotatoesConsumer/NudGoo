"use client";

/**
 * Typed helpers for Supabase Realtime (Postgres Changes).
 *
 * `subscribeToTable` wires a postgres_changes subscription to strongly-typed
 * callbacks so consumers never touch the loosely-typed payload directly. It
 * returns an unsubscribe function for clean teardown in `useEffect`.
 */

import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";

import type { Database } from "@/types/database.types";
import type { TypedSupabaseClient } from "./client";

type PublicTable = keyof Database["public"]["Tables"];
type RowOf<T extends PublicTable> = Database["public"]["Tables"][T]["Row"];

export interface TableSubscriptionHandlers<T extends PublicTable> {
  onInsert?: (row: RowOf<T>) => void;
  onUpdate?: (row: RowOf<T>, oldRow: Partial<RowOf<T>>) => void;
  onDelete?: (oldRow: Partial<RowOf<T>>) => void;
  /** Fired for every change after the specific handler above runs. */
  onAny?: (payload: RealtimePostgresChangesPayload<RowOf<T>>) => void;
}

export interface SubscribeOptions {
  /** Restrict to rows where `column=eq.value`, e.g. `trip_id=eq.<uuid>`. */
  filter?: string;
  /** Channel name; defaults to a stable name derived from the table. */
  channelName?: string;
}

/**
 * Subscribe to inserts/updates/deletes on a single public table.
 * Returns a cleanup function that removes the channel.
 */
export function subscribeToTable<T extends PublicTable>(
  client: TypedSupabaseClient,
  table: T,
  handlers: TableSubscriptionHandlers<T>,
  options: SubscribeOptions = {},
): () => void {
  const channelName =
    options.channelName ?? `realtime:public:${table}:${options.filter ?? "*"}`;

  const channel: RealtimeChannel = client
    .channel(channelName)
    .on(
      // The generic overload of `.on` isn't precise enough for our row type,
      // so we annotate the payload explicitly below.
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        ...(options.filter ? { filter: options.filter } : {}),
      },
      (payload: RealtimePostgresChangesPayload<RowOf<T>>) => {
        switch (payload.eventType) {
          case "INSERT":
            handlers.onInsert?.(payload.new);
            break;
          case "UPDATE":
            handlers.onUpdate?.(payload.new, payload.old);
            break;
          case "DELETE":
            handlers.onDelete?.(payload.old);
            break;
        }
        handlers.onAny?.(payload);
      },
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
