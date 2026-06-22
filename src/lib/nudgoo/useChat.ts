"use client";

/**
 * Live group chat backed by Supabase.
 *
 * Assembles the loosely-stored chat rows (messages + reactions + poll options /
 * votes) into the rich `ChatMsg` shape the view-model already renders, and
 * keeps it live by refetching on any Realtime change to those tables. Text,
 * photos (placeholder tints), GIFs, locations and polls are all persisted;
 * reactions, replies, edits, deletes and pins map onto real columns/tables.
 */

import { useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { subscribeToTable } from "@/lib/supabase/realtime";
import type { Tables, Json } from "@/types/database.types";
import type { ChatMsg, MsgType } from "./types";

type MessageRow = Tables<"messages">;
type ReactionRow = Tables<"message_reactions">;
type PollOptionRow = Tables<"poll_options">;
type PollVoteRow = Tables<"poll_votes">;

const pad = (n: number) => String(n).padStart(2, "0");
const hhmm = (iso: string) => {
  const d = new Date(iso);
  return pad(d.getHours()) + ":" + pad(d.getMinutes());
};

export interface ChatApi {
  messages: ChatMsg[];
  loading: boolean;
  sendText: (content: string, replyTo: string | null) => Promise<void>;
  sendPhotoFile: (file: File) => Promise<void>;
  sendGifFile: (file: File) => Promise<void>;
  sendGifUrl: (url: string, label: string) => Promise<void>;
  sendLocation: (place: string, addr: string, url: string) => Promise<void>;
  sendPoll: (question: string, options: string[]) => Promise<void>;
  react: (messageId: string, emoji: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  togglePin: (messageId: string) => Promise<void>;
  votePoll: (messageId: string, optionId: string) => Promise<void>;
}

interface MetaShape {
  tint?: string;
  dur?: number;
  image_url?: string;
  label?: string;
  c1?: string;
  c2?: string;
  place?: string;
  addr?: string;
  url?: string;
  question?: string;
}

export function useChat(enabled: boolean, userId: string | null): ChatApi {
  const supabase = getSupabaseBrowserClient();
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [reactions, setReactions] = useState<ReactionRow[]>([]);
  const [pollOptions, setPollOptions] = useState<PollOptionRow[]>([]);
  const [pollVotes, setPollVotes] = useState<PollVoteRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshRows = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
    if (data) setRows(data);
  }, [supabase]);
  const refreshReactions = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("message_reactions").select("*");
    if (data) setReactions(data);
  }, [supabase]);
  const refreshPollOptions = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("poll_options").select("*").order("idx", { ascending: true });
    if (data) setPollOptions(data);
  }, [supabase]);
  const refreshPollVotes = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("poll_votes").select("*");
    if (data) setPollVotes(data);
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !enabled) {
      setRows([]);
      setReactions([]);
      setPollOptions([]);
      setPollVotes([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    void Promise.all([refreshRows(), refreshReactions(), refreshPollOptions(), refreshPollVotes()]).then(() => {
      if (active) setLoading(false);
    });
    const offs = [
      subscribeToTable(supabase, "messages", { onAny: () => void refreshRows() }, { channelName: "chat-messages" }),
      subscribeToTable(supabase, "message_reactions", { onAny: () => void refreshReactions() }, { channelName: "chat-reactions" }),
      subscribeToTable(supabase, "poll_options", { onAny: () => void refreshPollOptions() }, { channelName: "chat-poll-options" }),
      subscribeToTable(supabase, "poll_votes", { onAny: () => void refreshPollVotes() }, { channelName: "chat-poll-votes" }),
    ];
    return () => {
      active = false;
      offs.forEach((off) => off());
    };
  }, [supabase, enabled, refreshRows, refreshReactions, refreshPollOptions, refreshPollVotes]);

  // ── Assemble the rich ChatMsg list the view-model renders ──────────────────
  const messages: ChatMsg[] = rows.map((m) => {
    const meta = (m.meta as MetaShape | null) ?? {};
    const rx: Record<string, string[]> = {};
    for (const r of reactions) {
      if (r.message_id !== m.id) continue;
      (rx[r.emoji] ??= []).push(r.user_id);
    }
    const msg: ChatMsg = {
      id: m.id,
      from: m.user_id,
      type: (m.type as MsgType) || "text",
      time: hhmm(m.created_at),
      text: m.content || "",
      edited: m.edited,
      pinned: m.pinned,
      reactions: rx,
      _t0: new Date(m.created_at).getTime(),
      ...(m.reply_to ? { replyTo: m.reply_to } : {}),
      ...(meta.tint ? { tint: meta.tint } : {}),
      ...(meta.image_url ? { imageUrl: meta.image_url } : {}),
      ...(typeof meta.dur === "number" ? { dur: meta.dur } : {}),
      ...(meta.label ? { label: meta.label } : {}),
      ...(meta.c1 ? { c1: meta.c1 } : {}),
      ...(meta.c2 ? { c2: meta.c2 } : {}),
      ...(meta.place ? { place: meta.place } : {}),
      ...(meta.addr ? { addr: meta.addr } : {}),
      ...(meta.url ? { url: meta.url } : {}),
      ...(meta.question ? { question: meta.question } : {}),
    };
    if (msg.type === "poll") {
      msg.options = pollOptions
        .filter((o) => o.message_id === m.id)
        .map((o) => ({
          id: o.id,
          t: o.label,
          v: pollVotes.filter((pv) => pv.option_id === o.id).map((pv) => pv.user_id),
        }));
    }
    return msg;
  });

  // ── Actions ────────────────────────────────────────────────────────────────
  const insertMessage = useCallback(
    async (type: MsgType, content: string, meta: MetaShape | null, replyTo: string | null): Promise<string | null> => {
      if (!supabase || !userId) return null;
      const { data, error } = await supabase
        .from("messages")
        .insert({ user_id: userId, content, type, meta: (meta as Json) ?? null, reply_to: replyTo })
        .select("id")
        .single();
      if (error || !data) return null;
      void refreshRows();
      return data.id;
    },
    [supabase, userId, refreshRows],
  );

  const sendText = useCallback(
    async (content: string, replyTo: string | null) => {
      const t = content.trim();
      if (t) await insertMessage("text", t, null, replyTo);
    },
    [insertMessage],
  );

  const uploadTo = useCallback(
    async (file: File): Promise<string | null> => {
      if (!supabase || !userId) return null;
      const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("chat-media")
        .upload(path, file, { contentType: file.type || "image/png", upsert: false });
      if (error) return null;
      return supabase.storage.from("chat-media").getPublicUrl(path).data.publicUrl;
    },
    [supabase, userId],
  );

  const sendPhotoFile = useCallback(
    async (file: File) => {
      const url = await uploadTo(file);
      if (url) await insertMessage("photo", "", { image_url: url, dur: 86400 }, null);
    },
    [uploadTo, insertMessage],
  );

  const sendGifFile = useCallback(
    async (file: File) => {
      const url = await uploadTo(file);
      if (url) await insertMessage("gif", "", { url, label: "" }, null);
    },
    [uploadTo, insertMessage],
  );

  const sendGifUrl = useCallback(
    async (url: string, label: string) => {
      if (!url) return;
      await insertMessage("gif", "", { url, label }, null);
    },
    [insertMessage],
  );

  const sendLocation = useCallback(
    async (place: string, addr: string, url: string) => {
      await insertMessage("location", "", { place, addr, url }, null);
    },
    [insertMessage],
  );

  const sendPoll = useCallback(
    async (question: string, options: string[]) => {
      if (!supabase || !userId) return;
      const clean = options.map((o) => o.trim()).filter(Boolean);
      if (!question.trim() || clean.length < 2) return;
      const id = await insertMessage("poll", question.trim(), { question: question.trim() }, null);
      if (!id) return;
      await supabase.from("poll_options").insert(clean.map((label, idx) => ({ message_id: id, label, idx })));
      void refreshPollOptions();
    },
    [supabase, userId, insertMessage, refreshPollOptions],
  );

  const react = useCallback(
    async (messageId: string, emoji: string) => {
      if (!supabase || !userId) return;
      const mine = reactions.some((r) => r.message_id === messageId && r.user_id === userId && r.emoji === emoji);
      if (mine) {
        await supabase.from("message_reactions").delete().match({ message_id: messageId, user_id: userId, emoji });
      } else {
        await supabase.from("message_reactions").insert({ message_id: messageId, user_id: userId, emoji });
      }
      void refreshReactions();
    },
    [supabase, userId, reactions, refreshReactions],
  );

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      if (!supabase) return;
      const t = content.trim();
      if (!t) return;
      await supabase.from("messages").update({ content: t, edited: true }).eq("id", messageId);
      void refreshRows();
    },
    [supabase, refreshRows],
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!supabase) return;
      await supabase.from("messages").delete().eq("id", messageId);
      void refreshRows();
    },
    [supabase, refreshRows],
  );

  const togglePin = useCallback(
    async (messageId: string) => {
      if (!supabase) return;
      const target = rows.find((m) => m.id === messageId);
      const willPin = !(target?.pinned ?? false);
      // Keep a single pinned message: clear others first.
      if (willPin) {
        const others = rows.filter((m) => m.pinned && m.id !== messageId).map((m) => m.id);
        if (others.length) await supabase.from("messages").update({ pinned: false }).in("id", others);
      }
      await supabase.from("messages").update({ pinned: willPin }).eq("id", messageId);
      void refreshRows();
    },
    [supabase, rows, refreshRows],
  );

  const votePoll = useCallback(
    async (messageId: string, optionId: string) => {
      if (!supabase || !userId) return;
      const siblingIds = pollOptions.filter((o) => o.message_id === messageId).map((o) => o.id);
      const already = pollVotes.some((pv) => pv.option_id === optionId && pv.user_id === userId);
      // Clear any existing vote in this poll (single choice).
      if (siblingIds.length) await supabase.from("poll_votes").delete().eq("user_id", userId).in("option_id", siblingIds);
      if (!already) await supabase.from("poll_votes").insert({ option_id: optionId, user_id: userId });
      void refreshPollVotes();
    },
    [supabase, userId, pollOptions, pollVotes, refreshPollVotes],
  );

  return {
    messages,
    loading,
    sendText,
    sendPhotoFile,
    sendGifFile,
    sendGifUrl,
    sendLocation,
    sendPoll,
    react,
    editMessage,
    deleteMessage,
    togglePin,
    votePoll,
  };
}
