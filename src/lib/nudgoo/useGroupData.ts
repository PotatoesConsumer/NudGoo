"use client";

/**
 * Live group data backed by Supabase — the real records behind the app's
 * feature tabs. This first slice owns trips/hangouts and their RSVPs; chat,
 * date voting, bills, album, leaderboard and rules hang off the same pattern
 * and get wired in here over subsequent passes.
 *
 * Everything refetches on the relevant Realtime change so two devices stay in
 * sync. Only enabled once the user is an approved member (RLS would block the
 * reads otherwise).
 */

import { useCallback, useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { subscribeToTable } from "@/lib/supabase/realtime";
import type { Tables } from "@/types/database.types";

export type TripRow = Tables<"trips">;
export type TripParticipantRow = Tables<"trip_participants">;
export type PointEventRow = Tables<"point_events">;
export type GroupRuleRow = Tables<"group_rules">;
export type MuteVoteRow = Tables<"mute_votes">;
export type DateOptionRow = Tables<"trip_date_options">;
export type DateVoteRow = Tables<"trip_date_votes">;
export type BillPaymentRow = Tables<"bill_payments">;
export type TripPhotoRow = Tables<"trip_photos">;

export interface BillConfig {
  enabled: boolean;
  total: number | null;
  treasurerId: string | null;
}
export type RsvpStatus = "going" | "maybe" | "declined";
export type PointCategory = "game" | "late";

export interface NewTripInput {
  title: string;
  destination: string;
  emoji: string;
  startDate: string | null;
  notes: string | null;
  transport: string | null;
}

export interface UpdateTripInput {
  title: string;
  destination: string;
  emoji: string;
  startDate: string | null;
  notes: string | null;
  transport: string | null;
}

export interface GroupDataApi {
  trips: TripRow[];
  participants: TripParticipantRow[];
  pointEvents: PointEventRow[];
  rules: GroupRuleRow[];
  muteVotes: MuteVoteRow[];
  dateOptions: DateOptionRow[];
  dateVotes: DateVoteRow[];
  billPayments: BillPaymentRow[];
  tripPhotos: TripPhotoRow[];
  loading: boolean;
  inviteCode: string;
  createTrip: (input: NewTripInput) => Promise<string | null>;
  updateTrip: (tripId: string, input: UpdateTripInput) => Promise<void>;
  setRsvp: (tripId: string, rsvp: RsvpStatus) => Promise<void>;
  renameTrip: (tripId: string, title: string) => Promise<void>;
  awardPoints: (userId: string, category: PointCategory, points: number, reason: string) => Promise<void>;
  addRule: (body: string) => Promise<void>;
  setRuleEnabled: (id: string, enabled: boolean) => Promise<void>;
  removeRule: (id: string) => Promise<void>;
  toggleMute: (targetId: string) => Promise<void>;
  addDateOption: (tripId: string, label: string, optionDate: string | null) => Promise<void>;
  voteDate: (tripId: string, optionId: string) => Promise<void>;
  removeDateOption: (optionId: string) => Promise<void>;
  setBill: (tripId: string, cfg: BillConfig) => Promise<void>;
  setBillPaid: (tripId: string, paid: boolean) => Promise<void>;
  addTripPhoto: (tripId: string, file: File) => Promise<void>;
}

export function useGroupData(enabled: boolean, userId: string | null): GroupDataApi {
  const supabase = getSupabaseBrowserClient();
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [participants, setParticipants] = useState<TripParticipantRow[]>([]);
  const [inviteCode, setInviteCode] = useState("");
  const [pointEvents, setPointEvents] = useState<PointEventRow[]>([]);
  const [rules, setRules] = useState<GroupRuleRow[]>([]);
  const [muteVotes, setMuteVotes] = useState<MuteVoteRow[]>([]);
  const [dateOptions, setDateOptions] = useState<DateOptionRow[]>([]);
  const [dateVotes, setDateVotes] = useState<DateVoteRow[]>([]);
  const [billPayments, setBillPayments] = useState<BillPaymentRow[]>([]);
  const [tripPhotos, setTripPhotos] = useState<TripPhotoRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTrips = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTrips(data);
  }, [supabase]);

  const refreshParticipants = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("trip_participants").select("*");
    if (data) setParticipants(data);
  }, [supabase]);

  const refreshInviteCode = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("group_meta").select("invite_code").eq("id", 1).maybeSingle();
    if (data) setInviteCode(data.invite_code);
  }, [supabase]);

  const refreshPoints = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("point_events").select("*").order("created_at", { ascending: false });
    if (data) setPointEvents(data);
  }, [supabase]);

  const refreshRules = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("group_rules").select("*").order("created_at", { ascending: true });
    if (data) setRules(data);
  }, [supabase]);

  const refreshMutes = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("mute_votes").select("*");
    if (data) setMuteVotes(data);
  }, [supabase]);

  const refreshDateOptions = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("trip_date_options").select("*").order("created_at", { ascending: true });
    if (data) setDateOptions(data);
  }, [supabase]);

  const refreshDateVotes = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("trip_date_votes").select("*");
    if (data) setDateVotes(data);
  }, [supabase]);

  const refreshBillPayments = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("bill_payments").select("*");
    if (data) setBillPayments(data);
  }, [supabase]);

  const refreshTripPhotos = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("trip_photos").select("*").order("created_at", { ascending: false });
    if (data) setTripPhotos(data);
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !enabled) {
      setTrips([]);
      setParticipants([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    void Promise.all([refreshTrips(), refreshParticipants(), refreshInviteCode(), refreshPoints(), refreshRules(), refreshMutes(), refreshDateOptions(), refreshDateVotes(), refreshBillPayments(), refreshTripPhotos()]).then(() => {
      if (active) setLoading(false);
    });

    const offTrips = subscribeToTable(
      supabase,
      "trips",
      { onAny: () => void refreshTrips() },
      { channelName: "trips-feed" },
    );
    const offParts = subscribeToTable(
      supabase,
      "trip_participants",
      { onAny: () => void refreshParticipants() },
      { channelName: "trip-participants-feed" },
    );
    const offMeta = subscribeToTable(
      supabase,
      "group_meta",
      { onAny: () => void refreshInviteCode() },
      { channelName: "group-meta-feed" },
    );
    const offPoints = subscribeToTable(
      supabase,
      "point_events",
      { onAny: () => void refreshPoints() },
      { channelName: "point-events-feed" },
    );
    const offRules = subscribeToTable(
      supabase,
      "group_rules",
      { onAny: () => void refreshRules() },
      { channelName: "group-rules-feed" },
    );
    const offMutes = subscribeToTable(
      supabase,
      "mute_votes",
      { onAny: () => void refreshMutes() },
      { channelName: "mute-votes-feed" },
    );
    const offDateOpts = subscribeToTable(
      supabase,
      "trip_date_options",
      { onAny: () => void refreshDateOptions() },
      { channelName: "date-options-feed" },
    );
    const offDateVotes = subscribeToTable(
      supabase,
      "trip_date_votes",
      { onAny: () => void refreshDateVotes() },
      { channelName: "date-votes-feed" },
    );
    const offBills = subscribeToTable(
      supabase,
      "bill_payments",
      { onAny: () => void refreshBillPayments() },
      { channelName: "bill-payments-feed" },
    );
    const offPhotos = subscribeToTable(
      supabase,
      "trip_photos",
      { onAny: () => void refreshTripPhotos() },
      { channelName: "trip-photos-feed" },
    );
    return () => {
      active = false;
      offTrips();
      offParts();
      offMeta();
      offPoints();
      offRules();
      offMutes();
      offDateOpts();
      offDateVotes();
      offBills();
      offPhotos();
    };
  }, [supabase, enabled, refreshTrips, refreshParticipants, refreshInviteCode, refreshPoints, refreshRules, refreshMutes, refreshDateOptions, refreshDateVotes, refreshBillPayments, refreshTripPhotos]);

  const createTrip = useCallback(
    async (input: NewTripInput): Promise<string | null> => {
      if (!supabase || !userId) return null;
      const { data, error } = await supabase
        .from("trips")
        .insert({
          title: input.title,
          destination: input.destination || "TBD",
          emoji: input.emoji,
          start_date: input.startDate,
          notes: input.notes,
          transport: input.transport,
          status: "planning",
          created_by: userId,
        })
        .select("id")
        .single();
      if (error || !data) return null;
      // Creator is going by default.
      await supabase
        .from("trip_participants")
        .upsert({ trip_id: data.id, user_id: userId, rsvp: "going" });
      void refreshTrips();
      void refreshParticipants();
      return data.id;
    },
    [supabase, userId, refreshTrips, refreshParticipants],
  );

  const updateTrip = useCallback(
    async (tripId: string, input: UpdateTripInput) => {
      if (!supabase) return;
      await supabase
        .from("trips")
        .update({
          title: input.title,
          destination: input.destination || "TBD",
          emoji: input.emoji,
          start_date: input.startDate,
          notes: input.notes,
          transport: input.transport,
        })
        .eq("id", tripId);
      void refreshTrips();
    },
    [supabase, refreshTrips],
  );

  const setRsvp = useCallback(
    async (tripId: string, rsvp: RsvpStatus) => {
      if (!supabase || !userId) return;
      await supabase
        .from("trip_participants")
        .upsert({ trip_id: tripId, user_id: userId, rsvp });
      void refreshParticipants();
    },
    [supabase, userId, refreshParticipants],
  );

  const renameTrip = useCallback(
    async (tripId: string, title: string) => {
      if (!supabase) return;
      await supabase.from("trips").update({ title }).eq("id", tripId);
      void refreshTrips();
    },
    [supabase, refreshTrips],
  );

  const awardPoints = useCallback(
    async (uid: string, category: PointCategory, points: number, reason: string) => {
      if (!supabase || !points) return;
      await supabase.from("point_events").insert({ user_id: uid, category, points, reason });
      void refreshPoints();
    },
    [supabase, refreshPoints],
  );

  const addRule = useCallback(
    async (body: string) => {
      if (!supabase || !userId) return;
      const t = body.trim();
      if (!t) return;
      await supabase.from("group_rules").insert({ body: t, created_by: userId });
      void refreshRules();
    },
    [supabase, userId, refreshRules],
  );

  const setRuleEnabled = useCallback(
    async (id: string, enabled: boolean) => {
      if (!supabase) return;
      await supabase.from("group_rules").update({ enabled }).eq("id", id);
      void refreshRules();
    },
    [supabase, refreshRules],
  );

  const removeRule = useCallback(
    async (id: string) => {
      if (!supabase) return;
      await supabase.from("group_rules").delete().eq("id", id);
      void refreshRules();
    },
    [supabase, refreshRules],
  );

  const toggleMute = useCallback(
    async (targetId: string) => {
      if (!supabase || !userId) return;
      const mine = muteVotes.some((mv) => mv.target_id === targetId && mv.voter_id === userId);
      if (mine) {
        await supabase.from("mute_votes").delete().match({ target_id: targetId, voter_id: userId });
      } else {
        await supabase.from("mute_votes").insert({ target_id: targetId, voter_id: userId });
      }
      void refreshMutes();
    },
    [supabase, userId, muteVotes, refreshMutes],
  );

  const addDateOption = useCallback(
    async (tripId: string, label: string, optionDate: string | null) => {
      if (!supabase) return;
      const t = label.trim();
      if (!t) return;
      await supabase.from("trip_date_options").insert({ trip_id: tripId, label: t, option_date: optionDate });
      void refreshDateOptions();
    },
    [supabase, refreshDateOptions],
  );

  const voteDate = useCallback(
    async (tripId: string, optionId: string) => {
      if (!supabase || !userId) return;
      const siblingIds = dateOptions.filter((o) => o.trip_id === tripId).map((o) => o.id);
      const already = dateVotes.some((dv) => dv.option_id === optionId && dv.user_id === userId);
      if (siblingIds.length) await supabase.from("trip_date_votes").delete().eq("user_id", userId).in("option_id", siblingIds);
      if (!already) await supabase.from("trip_date_votes").insert({ option_id: optionId, trip_id: tripId, user_id: userId });
      void refreshDateVotes();
    },
    [supabase, userId, dateOptions, dateVotes, refreshDateVotes],
  );

  const removeDateOption = useCallback(
    async (optionId: string) => {
      if (!supabase) return;
      await supabase.from("trip_date_options").delete().eq("id", optionId);
      void refreshDateOptions();
    },
    [supabase, refreshDateOptions],
  );

  const setBill = useCallback(
    async (tripId: string, cfg: BillConfig) => {
      if (!supabase) return;
      await supabase
        .from("trips")
        .update({ bill_split_enabled: cfg.enabled, total_amount: cfg.total, treasurer_id: cfg.treasurerId })
        .eq("id", tripId);
      void refreshTrips();
    },
    [supabase, refreshTrips],
  );

  const setBillPaid = useCallback(
    async (tripId: string, paid: boolean) => {
      if (!supabase || !userId) return;
      await supabase.from("bill_payments").upsert({ trip_id: tripId, user_id: userId, paid, updated_at: new Date().toISOString() });
      void refreshBillPayments();
    },
    [supabase, userId, refreshBillPayments],
  );

  const addTripPhoto = useCallback(
    async (tripId: string, file: File) => {
      if (!supabase || !userId) return;
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `trip-photos/${tripId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const up = await supabase.storage.from("chat-media").upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
      if (up.error) return;
      const url = supabase.storage.from("chat-media").getPublicUrl(path).data.publicUrl;
      const expires = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(); // auto-expire after 2 days
      await supabase.from("trip_photos").insert({ trip_id: tripId, user_id: userId, image_url: url, expires_at: expires });
      void refreshTripPhotos();
    },
    [supabase, userId, refreshTripPhotos],
  );

  return { trips, participants, pointEvents, rules, muteVotes, dateOptions, dateVotes, billPayments, tripPhotos, loading, inviteCode, createTrip, updateTrip, setRsvp, renameTrip, awardPoints, addRule, setRuleEnabled, removeRule, toggleMute, addDateOption, voteDate, removeDateOption, setBill, setBillPaid, addTripPhoto };
}
