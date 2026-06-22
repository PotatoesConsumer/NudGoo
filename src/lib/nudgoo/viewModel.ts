import type { ChangeEvent, PointerEvent } from "react";

import {
  fmtTime,
  FRIENDS,
  PERIODS,
  pips,
  RANKBG,
  REACTS,
  SM,
  DARK_VARS,
} from "./data";
import type { ChatMsg, State } from "./types";
import type { AuthApi } from "./useAuth";
import type { GroupDataApi, RsvpStatus } from "./useGroupData";
import type { ChatApi } from "./useChat";
import { env } from "@/lib/env";

/** Avatar palette used to give real members a stable colour from their id. */
const AVATAR_COLORS = [
  "#3B5BDB", "#E8590C", "#2F9E44", "#C2255C",
  "#6741D9", "#0C8599", "#F59F00", "#212529",
];
export const colorForId = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length]!;
};
const initialOf = (name: string): string => (name.trim()[0] || "?").toUpperCase();

/** Everything the hook hands the pure view-model builder. */
export interface NudGooApi {
  auth: AuthApi;
  group: GroupDataApi;
  chat: ChatApi;
  setState: (u: Partial<State> | ((p: State) => Partial<State>)) => void;
  show: (msg: string) => void;
  createHangout: () => void;
  updateHangout: () => void;
  setTripRsvp: (rsvp: RsvpStatus) => void;
  submitDateOption: () => void;
  toggleBill: () => void;
  setTreasurer: (uid: string) => void;
  saveBillTotal: () => void;
  toggleBillPaid: () => void;
  addAlbumPhoto: (file: File) => void;
  t0: number | null;
  evId: string;
  setMsgRef: (el: HTMLDivElement | null) => void;
  setInpRef: (el: HTMLInputElement | null) => void;
  openEvent: (id: string) => void;
  doAuth: () => void;
  googleAuth: () => void;
  doCreateGroup: () => void;
  doOnbJoin: () => void;
  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  switchGroup: (id: string) => void;
  doJoin: () => void;
  saveEdit: () => void;
  savePw: () => void;
  saveGName: () => void;
  setGroupField: (field: "name" | "color" | "emoji", val: string) => void;
  saveNick: () => void;
  voteMute: (id: string) => void;
  toggleRule: (id: string) => void;
  castVote: (id: string) => void;
  cycle: (id: string) => void;
  sendPhotoFile: (file: File) => void;
  sendGifFile: (file: File) => void;
  sendGifUrl: (url: string, label: string) => void;
  sendLocation: () => void;
  rollDice: () => void;
  drawCard: () => void;
  toggleChatMute: () => void;
  sendText: () => void;
  setPollOpt: (i: number, val: string) => void;
  removePollOpt: (i: number) => void;
  sendPoll: () => void;
  reactFromMenu: (emoji: string) => void;
  react: (msgId: string, emoji: string) => void;
  votePoll: (msgId: string, optionId: string) => void;
  startLongPress: (id: string) => void;
  cancelLongPress: () => void;
  menuAction: (action: string) => void;
  saveEditMsg: () => void;
  openProfilePopup: (id: string) => void;
  mentionInChat: () => void;
  msgPointerDown: (e: PointerEvent) => void;
  msgPointerMove: (e: PointerEvent) => void;
  msgPointerUp: (e: PointerEvent) => void;
  spinWheel: () => void;
  setWheelOption: (i: number, val: string) => void;
  removeWheelOption: (i: number) => void;
  addWheelOption: () => void;
  addEveryoneToWheel: () => void;
  editTrip: () => void;
  saveTripEdit: () => void;
  startAddRule: () => void;
  commitRule: () => void;
  holdRuleStart: (id: string) => void;
  holdRuleEnd: () => void;
  logout: () => void;
  leaveGroup: () => void;
  createNewGroup: () => void;
}

const val = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): string => e.target.value;

const previewOf = (m: ChatMsg | null | undefined): string =>
  !m
    ? ""
    : m.type === "text"
      ? m.text || ""
      : m.type === "photo"
        ? "📷 Photo"
        : m.type === "gif"
          ? "GIF"
          : m.type === "location"
            ? "📍 " + (m.place || "")
            : "";

export function buildViewModel(s: State, api: NudGooApi) {
  const { setState, show } = api;
  const auth = api.auth;
  const myId = auth.session?.user.id ?? null;
  const realName = auth.profile?.display_name || s.profile.name || "there";
  const realEmail = auth.session?.user.email || s.profile.email || "";
  const isAdmin = auth.profile?.role === "admin";
  const nowMs = s.now || api.t0 || 0;

  // ── real trips / hangouts (from Supabase) ──
  const memberById = new Map(auth.members.map((m) => [m.id, m]));
  const TRIP_STATUS: Record<string, { label: string; bg: string; fg: string; tint: string }> = {
    proposed: { label: "Proposed", bg: "var(--warning-bg)", fg: "#7A4900", tint: "var(--warning-bg)" },
    planning: { label: "Planning", bg: "var(--warning-bg)", fg: "#7A4900", tint: "var(--primary-surface)" },
    confirmed: { label: "Confirmed", bg: "var(--profit-surface)", fg: "var(--profit-deep)", tint: "var(--profit-surface)" },
    completed: { label: "Done", bg: "var(--surface-overlay)", fg: "var(--ink-secondary)", tint: "var(--surface-raised)" },
    cancelled: { label: "Cancelled", bg: "var(--error-bg)", fg: "var(--error)", tint: "var(--error-bg)" },
  };
  const goingCountFor = (tripId: string) =>
    api.group.participants.filter((p) => p.trip_id === tripId && p.rsvp === "going").length;
  const mapTrip = (t: GroupDataApi["trips"][number]) => {
    const st = TRIP_STATUS[t.status] ?? TRIP_STATUS.planning!;
    const going = goingCountFor(t.id);
    return {
      id: t.id, name: t.title, emoji: t.emoji || "🗺️", tint: st.tint,
      sub: t.destination, status: st.label, statusBg: st.bg, statusFg: st.fg,
      meta: `${t.destination} · ${going} going`,
      dates: t.start_date || "Date TBD", place: t.destination,
      transport: t.transport || "—", notes: t.notes || t.description || "No notes yet",
      goingCount: going,
    };
  };
  const vmTrips = api.group.trips.map(mapTrip);
  const selTrip = api.group.trips.find((t) => t.id === s.selectedTrip) || api.group.trips[0] || null;
  const tripDetailReal = selTrip ? mapTrip(selTrip) : null;
  const tripCanEdit = selTrip ? selTrip.created_by === myId || isAdmin : false;
  // ── bill splitting (real) ──
  const memberCount = auth.members.length;
  const billEnabled = !!selTrip?.bill_split_enabled;
  const billTotalAmt = selTrip?.total_amount ?? 0;
  const billShareAmt = memberCount > 0 && billTotalAmt > 0 ? Math.ceil(billTotalAmt / memberCount) : 0;
  const treasurerM = selTrip?.treasurer_id ? memberById.get(selTrip.treasurer_id) : undefined;
  const myBillPaid = selTrip ? !!api.group.billPayments.find((b) => b.trip_id === selTrip.id && b.user_id === myId)?.paid : false;
  const billPaidCount = selTrip ? api.group.billPayments.filter((b) => b.trip_id === selTrip.id && b.paid).length : 0;
  // ── trip album (real, ephemeral) ──
  const tripPhotoList = selTrip ? api.group.tripPhotos.filter((p) => p.trip_id === selTrip.id) : [];
  const myRsvp = selTrip
    ? api.group.participants.find((p) => p.trip_id === selTrip.id && p.user_id === myId)?.rsvp ?? null
    : null;
  const goingAvatars = selTrip
    ? api.group.participants
        .filter((p) => p.trip_id === selTrip.id && p.rsvp === "going")
        .map((p) => {
          const m = memberById.get(p.user_id);
          return { initial: m ? initialOf(m.display_name) : "?", bg: colorForId(p.user_id) };
        })
    : [];
  const TRIP_FALLBACK = {
    id: "", name: "", emoji: "🗺️", tint: "var(--surface-raised)", sub: "", status: "",
    statusBg: "var(--surface-overlay)", statusFg: "var(--ink-secondary)", meta: "",
    dates: "", place: "", transport: "", notes: "", goingCount: 0,
  };

  const tab = s.tab;
  const TH = s.lang === "th";
  const titles = TH
    ? { calendar: "นัดเจอ", trip: "ทริป", chat: "แชทกลุ่ม", board: "อันดับแก๊ง", game: "เกม" }
    : { calendar: "Hangouts", trip: "Trip", chat: "Group Chat", board: "Gang Board", game: "Board Games" };
  const navLabels = TH
    ? { cal: "ปฏิทิน", chat: "แชท", trip: "ทริป", game: "เกม", board: "อันดับ" }
    : { cal: "Calendar", chat: "Chat", trip: "Trip", game: "Games", board: "Ranks" };
  const dark = s.theme === "dark";
  const themeVars = dark ? DARK_VARS : "";

  // Spinner wheel — user-written custom options (not tied to members).
  const wheelItems = s.wheelOptions.map((o) => o.trim()).filter(Boolean);
  const wheelHasItems = wheelItems.length > 0;
  const wheelSeg = 360 / Math.max(1, wheelItems.length);
  const wheelGradient = wheelHasItems
    ? "conic-gradient(" + wheelItems.map((_, i) => `${AVATAR_COLORS[i % AVATAR_COLORS.length]} ${i * wheelSeg}deg ${(i + 1) * wheelSeg}deg`).join(",") + ")"
    : "var(--surface-overlay)";
  const wheelSegments = wheelItems.map((t, i) => ({
    id: String(i),
    initial: t.length > 7 ? t.slice(0, 6) + "…" : t,
    color: AVATAR_COLORS[i % AVATAR_COLORS.length]!,
    mid: i * wheelSeg + wheelSeg / 2,
  }));

  // bottom nav
  const navItem = (id: string, on: string, off: string) =>
    tab === id ? { icon: on, color: "var(--primary)" } : { icon: off, color: "var(--ink-tertiary)" };
  const nav = {
    cal: navItem("calendar", "ph-fill ph-calendar-blank", "ph ph-calendar-blank"),
    chat: navItem("chat", "ph-fill ph-chat-circle-dots", "ph ph-chat-circle-dots"),
    trip: navItem("trip", "ph-fill ph-airplane-tilt", "ph ph-airplane-tilt"),
    game: navItem("game", "ph-fill ph-game-controller", "ph ph-game-controller"),
    board: navItem("board", "ph-fill ph-trophy", "ph ph-trophy"),
  };

  // calendar — real month grid derived from the clock + an offset for prev/next
  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DOW3 = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const baseDate = nowMs ? new Date(nowMs) : new Date(2026, 5, 17);
  const viewDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + s.calOffset, 1);
  const vYear = viewDate.getFullYear();
  const vMonth = viewDate.getMonth();
  const isCurrentMonth = vYear === baseDate.getFullYear() && vMonth === baseDate.getMonth();
  const todayDate = baseDate.getDate();
  const firstDow = viewDate.getDay();
  const daysInMonth = new Date(vYear, vMonth + 1, 0).getDate();
  // map trips with a date in the displayed month → day number
  const tripByDay = new Map<number, string>();
  for (const t of api.group.trips) {
    if (!t.start_date) continue;
    const parts = t.start_date.split("-").map(Number);
    if (parts[0] === vYear && parts[1] === vMonth + 1) tripByDay.set(parts[2]!, t.id);
  }
  type Day = { n: number | string; empty: boolean; bg: string; fg: string; dot: string; ring: string; cursor: string; onClick: () => void };
  const days: Day[] = [];
  for (let i = 0; i < firstDow; i++) days.push({ empty: true, n: "", bg: "transparent", fg: "transparent", dot: "transparent", ring: "none", cursor: "default", onClick: () => {} });
  for (let n = 1; n <= daysInMonth; n++) {
    const isToday = isCurrentMonth && n === todayDate;
    const tripId = tripByDay.get(n);
    days.push({
      n,
      empty: false,
      bg: isToday ? "var(--primary)" : "transparent",
      fg: isToday ? "#fff" : "var(--ink)",
      dot: tripId ? "var(--primary)" : "transparent",
      ring: "none",
      cursor: tripId ? "pointer" : "default",
      onClick: tripId ? () => setState({ tab: "trip", tripView: "detail", selectedTrip: tripId }) : () => {},
    });
  }
  const calMonthLabel = MONTHS[vMonth] + " " + vYear;
  const calPlannedLabel = `${api.group.trips.length} hangout${api.group.trips.length === 1 ? "" : "s"} planned`;
  // upcoming hangouts list — real trips, dated ones first (ascending)
  const calUpcoming = api.group.trips
    .map((t) => {
      const st = TRIP_STATUS[t.status] ?? TRIP_STATUS.planning!;
      const d = t.start_date ? new Date(t.start_date + "T00:00:00") : null;
      return {
        key: t.id, id: t.id, emoji: t.emoji || "🗺️", title: t.title,
        hasDate: !!d,
        dd: d ? d.getDate() : "–",
        wk: d ? DOW3[d.getDay()]! : "TBD",
        sortKey: d ? d.getTime() : Number.MAX_SAFE_INTEGER,
        sub: t.destination && t.destination !== "TBD" ? t.destination : "Date being planned",
        statusLabel: st.label, statusBg: st.bg, statusFg: st.fg, tintBg: st.tint,
        onTap: () => setState({ tab: "trip", tripView: "detail", selectedTrip: t.id }),
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey);

  // events
  const EV: Record<string, { emoji: string; tintBg: string; title: string; when: string; where: string; statusLabel: string; statusBg: string; statusFg: string; statusIcon: string }> = {
    bowling: { emoji: "🎳", tintBg: "var(--primary-surface)", title: "Bowling Night", when: "Sat 20 Jun 2026 · 19:00", where: "Blu-O Bowling, Ratchayothin", statusLabel: "Confirmed", statusBg: "var(--profit-surface)", statusFg: "var(--profit-deep)", statusIcon: "ph-fill ph-check-circle" },
    trip: { emoji: "🚗", tintBg: "var(--warning-bg)", title: "Hua Hin Road Trip", when: "Late June · date being voted", where: "Hua Hin (3hr drive)", statusLabel: "Voting open", statusBg: "var(--warning-bg)", statusFg: "#7A4900", statusIcon: "ph-fill ph-chart-bar" },
  };
  const ev = EV[s.sheet === "event" ? api.evId || "bowling" : "bowling"]!;

  // rsvp list
  const rsvpList = FRIENDS.map((f) => {
    const st = s.rsvp[f.id] ?? "pending";
    const m = SM[st];
    return { id: f.id, name: f.name, initial: f.initial, bg: f.bg, statusLabel: m.label, pillBg: m.bg, pillFg: m.fg, pillIcon: m.icon, youTag: f.id === "you" ? "(you)" : "", canChange: f.id === "you", onChange: () => api.cycle(f.id) };
  });
  const cnt = (k: string) => FRIENDS.filter((f) => s.rsvp[f.id] === k).length;
  const rsvpSummary = `${cnt("going")} going · ${cnt("pending")} pending · ${cnt("no")} out`;

  // ── date voting (real, per selected trip) ──
  const blind = !!selTrip?.blind_vote;
  const tripDateOpts = selTrip ? api.group.dateOptions.filter((o) => o.trip_id === selTrip.id) : [];
  const dateVotersOf = (optId: string) => api.group.dateVotes.filter((dv) => dv.option_id === optId).map((dv) => dv.user_id);
  const voteMax = Math.max(0, ...tripDateOpts.map((o) => dateVotersOf(o.id).length));
  const voteOptions = tripDateOpts.map((o) => {
    const voters = dateVotersOf(o.id);
    const c = voters.length;
    const leader = !blind && c > 0 && c === voteMax;
    const mine = !!myId && voters.includes(myId);
    const d = o.option_date ? new Date(o.option_date + "T00:00:00") : null;
    return {
      id: o.id, label: o.label,
      sub: d ? `${DOW3[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]!.slice(0, 3)}` : o.subtitle || "Flexible",
      count: c, pct: blind ? 0 : Math.round((c / Math.max(1, auth.members.length)) * 100), leader, mine,
      crown: leader ? "👑" : "",
      barFill: leader ? "var(--primary)" : "var(--primary-muted)",
      cardBg: mine ? "var(--primary-surface)" : "var(--canvas)",
      cardBorder: mine ? "1.5px solid var(--primary)" : "1px solid var(--hairline)",
      voteLabel: mine ? "Your pick" : "Vote",
      voteIcon: mine ? "ph-fill ph-check-circle" : "ph ph-hand-pointing",
      voteBg: mine ? "var(--primary)" : "var(--surface-raised)",
      voteFg: mine ? "#fff" : "var(--ink-secondary)",
      countLabel: blind ? "Hidden" : `${c} vote${c === 1 ? "" : "s"}`,
      avatars: blind ? [] : voters.slice(0, 5).map((vid) => { const m = memberById.get(vid); return { initial: m ? initialOf(m.display_name) : "?", bg: m?.avatar_color || colorForId(vid) }; }),
      onVote: () => { if (selTrip) void api.group.voteDate(selTrip.id, o.id); },
      canRemove: tripCanEdit,
      onRemove: () => void api.group.removeDateOption(o.id),
    };
  });
  const votedIds = new Set<string>();
  tripDateOpts.forEach((o) => dateVotersOf(o.id).forEach((v) => votedIds.add(v)));
  const votedCount = votedIds.size;

  // ── chat screen (real messages) ──
  const baseElapsed = api.t0 ? (s.now - api.t0) / 1000 : 0;
  const allMsgs = api.chat.messages;
  const msgById = (id: string | null) => (id ? allMsgs.find((x) => x.id === id) : undefined);
  const who = (id: string): { name: string; initial: string; bg: string } => {
    if (id === myId) {
      return { name: realName, initial: initialOf(realName), bg: auth.profile?.avatar_color || colorForId(id) };
    }
    const m = memberById.get(id);
    return m
      ? { name: m.display_name, initial: initialOf(m.display_name), bg: m.avatar_color || colorForId(id) }
      : { name: "Member", initial: "?", bg: colorForId(id) };
  };
  const nameOf = (m: ChatMsg | null | undefined): string =>
    !m ? "" : m.from === myId ? "You" : who(m.from).name;
  const buildMsg = (m: ChatMsg) => {
    const f = who(m.from);
    const mine = m.from === myId;
    const rep = m.replyTo ? msgById(m.replyTo) : null;
    const rx = m.reactions || {};
    const reactionChips = Object.keys(rx)
      .filter((e) => (rx[e]?.length ?? 0) > 0)
      .map((e) => {
        const arr = rx[e] ?? [];
        const mineReacted = !!myId && arr.includes(myId);
        return {
          key: m.id + e, emoji: e, count: arr.length,
          bg: mineReacted ? "var(--primary-surface)" : "var(--surface-overlay)",
          border: mineReacted ? "1px solid var(--primary-muted)" : "1px solid transparent",
          fg: mineReacted ? "var(--primary-deep)" : "var(--ink-secondary)",
          onTap: () => api.react(m.id, e),
        };
      });
    const o = {
      id: m.id, mine, name: f.name, initial: f.initial, bg: f.bg, time: m.time || "",
      justify: mine ? "flex-end" : "flex-start", align: mine ? "flex-end" : "flex-start",
      showAvatar: !mine, showName: !mine,
      isText: m.type === "text", isPhotoActive: false, isPhotoExpired: false,
      text: m.text || "", edited: !!m.edited, editedTag: m.edited ? " (edited)" : "",
      bubbleBg: mine ? "var(--primary)" : "var(--surface-card)",
      bubbleFg: mine ? "#fff" : "var(--ink)",
      bubbleBorder: mine ? "none" : "1px solid var(--hairline)",
      radius: mine ? "16px 16px 5px 16px" : "5px 16px 16px 16px",
      tint: "#3B5BDB", countdown: "", imageUrl: m.imageUrl || "",
      isGif: m.type === "gif", gifLabel: m.label || "", gifC1: m.c1 || "#3B5BDB", gifC2: m.c2 || "#6741D9", gifUrl: m.url || "",
      isLocation: m.type === "location", place: m.place || "", addr: m.addr || "", locUrl: m.url || "",
      isPinned: !!m.pinned,
      avatarTap: mine ? () => {} : () => api.openProfilePopup(m.from),
      nameTap: mine ? () => {} : () => api.openProfilePopup(m.from),
      onPressStart: () => api.startLongPress(m.id),
      onPressEnd: () => api.cancelLongPress(),
      hasReply: !!rep,
      replyName: nameOf(rep),
      replyText: previewOf(rep),
      replyBarColor: mine ? "rgba(255,255,255,.6)" : "var(--primary)",
      replyTextColor: mine ? "rgba(255,255,255,.85)" : "var(--ink-secondary)",
      reactionChips, hasReactions: reactionChips.length > 0,
      isPoll: m.type === "poll", pollQuestion: m.question || "",
      pollTotalLabel: "", pollOptions: [] as Array<{ key: string; text: string; count: number; pct: number; barW: string; barBg: string; rowBg: string; border: string; check: string; checkColor: string; onTap: () => void }>,
    };
    if (m.type === "poll" && m.options) {
      const total = m.options.reduce((s2, op) => s2 + op.v.length, 0);
      o.pollTotalLabel = total === 1 ? "1 vote" : total + " votes";
      o.pollOptions = m.options.map((op, idx) => {
        const voted = !!myId && op.v.includes(myId);
        const pct = total > 0 ? Math.round((op.v.length / total) * 100) : 0;
        const optionId = op.id ?? "";
        return {
          key: m.id + "-" + idx, text: op.t, count: op.v.length, pct, barW: pct + "%",
          barBg: voted ? "var(--primary)" : "var(--primary-muted)",
          rowBg: voted ? "var(--primary-surface)" : "var(--surface-raised)",
          border: voted ? "1.5px solid var(--primary)" : "1.5px solid transparent",
          check: voted ? "ph-fill ph-check-circle" : "ph ph-circle",
          checkColor: voted ? "var(--primary)" : "var(--ink-disabled)",
          onTap: () => api.votePoll(m.id, optionId),
        };
      });
    }
    if (m.type === "photo") {
      const elapsed = m._t0 ? (s.now - m._t0) / 1000 : baseElapsed;
      const remaining = (m.dur ?? 0) < 0 ? -1 : (m.dur ?? 0) - elapsed;
      const expired = remaining <= 0;
      o.isPhotoActive = !expired;
      o.isPhotoExpired = expired;
      o.tint = m.tint || f.bg;
      o.countdown = expired ? "" : fmtTime(remaining);
    }
    return o;
  };
  const chatMsgs = allMsgs.map(buildMsg);
  const pinnedMsg = allMsgs.find((m) => m.pinned) ?? null;
  const pinnedText = previewOf(pinnedMsg);
  const replyMsg = msgById(s.replyToId) ?? null;
  const replyingName = replyMsg ? (replyMsg.from === myId ? "yourself" : who(replyMsg.from).name) : "";
  const replyingText = previewOf(replyMsg);
  const menuMsg = msgById(s.msgMenu) ?? null;
  const menuMine = menuMsg ? menuMsg.from === myId : false;
  const menuText = previewOf(menuMsg);
  const ppId = s.profilePopup;
  const ppF = ppId ? who(ppId) : null;
  const ppMutes = ppId ? api.group.muteVotes.filter((mv) => mv.target_id === ppId).length : 0;
  const ppVoted = ppId ? !!myId && api.group.muteVotes.some((mv) => mv.target_id === ppId && mv.voter_id === myId) : false;
  // members muted by majority vote → shown in the chat banner
  const muteThreshold = Math.max(1, Math.ceil(auth.members.length / 2));
  const mutedList = auth.members.filter(
    (m) => api.group.muteVotes.filter((mv) => mv.target_id === m.id).length >= muteThreshold,
  );

  const sharedLinks = allMsgs
    .filter((m) => m.type === "location" || (m.type === "text" && /https?:\/\/|www\.|\.com|maps\.google/i.test(m.text || "")))
    .map((m) => ({
      id: m.id, isLoc: m.type === "location",
      title: m.type === "location" ? m.place || "" : (m.text?.match(/https?:\/\/\S+|www\.\S+|\S+\.com\S*/i) || [""])[0],
      sub: m.type === "location" ? m.addr || "" : nameOf(m) + " · " + (m.time || ""),
    }));
  const q = s.chatSearch.trim().toLowerCase();
  const searchResults = q
    ? allMsgs
        .filter((m) => (m.text || "").toLowerCase().includes(q) || (m.place || "").toLowerCase().includes(q))
        .map((m) => { const w = who(m.from); return { id: m.id, name: nameOf(m), initial: w.initial, bg: w.bg, time: m.time || "", text: m.type === "text" ? m.text || "" : m.type === "photo" ? "📷 Photo" : m.type === "gif" ? "GIF" : "📍 " + (m.place || "") }; })
    : [];

  // ── leaderboard ──
  const period = s.boardPeriod || "all";
  const periodLabel = { week: "This week", month: "This month", year: "This year", all: "All time" }[period];
  const periodPills = PERIODS.map((p) => ({
    id: p.id, label: p.label, active: period === p.id,
    bg: period === p.id ? "var(--primary)" : "var(--surface-raised)",
    fg: period === p.id ? "#fff" : "var(--ink-secondary)",
    onTap: () => setState({ boardPeriod: p.id }),
  }));
  const bt = (["game", "late"] as const).includes(s.boardTab) ? s.boardTab : "game";
  const BOARD_META = {
    game: { seg: "Board Game", emoji: "🎲", title: "Board Game Scores", unit: "pts", caption: "Top of the board 🎲", step: 5 },
    late: { seg: "Most Late", emoji: "⏰", title: "Most Late to Hangouts", unit: "min", caption: "Always fashionably late ⏰", step: 1 },
  } as const;
  const def = BOARD_META[bt];
  const segs = (["game", "late"] as const).map((k) => ({
    id: k, label: BOARD_META[k].seg, emoji: BOARD_META[k].emoji, active: bt === k,
    bg: bt === k ? "var(--canvas)" : "transparent",
    fg: bt === k ? "var(--primary)" : "var(--ink-tertiary)",
    shadow: bt === k ? "0 1px 3px rgba(0,0,0,.12)" : "none",
    onTap: () => setState({ boardTab: k }),
  }));
  // Aggregate real point_events by member for the chosen category + period window.
  const WINDOW_DAYS: Record<string, number> = { week: 7, month: 30, year: 365, all: 0 };
  const cutoff = nowMs && WINDOW_DAYS[period] ? nowMs - WINDOW_DAYS[period] * 86400000 : 0;
  const sumFor = (uid: string) =>
    api.group.pointEvents
      .filter((e) => e.user_id === uid && e.category === bt && (cutoff === 0 || new Date(e.created_at).getTime() >= cutoff))
      .reduce((a, e) => a + e.points, 0);
  const ranked = auth.members
    .map((m) => ({
      id: m.id,
      name: m.id === myId ? realName + " (you)" : m.display_name,
      initial: initialOf(m.display_name),
      bg: m.avatar_color || colorForId(m.id),
      value: sumFor(m.id),
    }))
    .sort((a, b) => b.value - a.value);
  const awardCtl = (uid: string) => ({
    canAward: isAdmin,
    addPts: () => void api.group.awardPoints(uid, bt, def.step, bt === "game" ? "Board game points" : "Late to hangout"),
    subPts: () => void api.group.awardPoints(uid, bt, -def.step, "Adjustment"),
  });
  const top = ranked[0];
  const champion = top
    ? { name: top.name, initial: top.initial, bg: top.bg, value: top.value, unit: def.unit, caption: def.caption, emoji: def.emoji, ...awardCtl(top.id) }
    : { name: "—", initial: "?", bg: "var(--surface-overlay)", value: 0, unit: def.unit, caption: "No scores yet", emoji: def.emoji, canAward: false, addPts: () => {}, subPts: () => {} };
  const boardRows = ranked.slice(1).map((r, i) => {
    const rank = i + 2;
    return { rank, name: r.name, initial: r.initial, bg: r.bg, value: r.value, unit: def.unit, isMe: r.id === myId, rowBg: r.id === myId ? "var(--primary-surface)" : "transparent", medalBg: RANKBG[rank - 1] || "var(--rank-other)", ...awardCtl(r.id) };
  });

  const group = s.groups.find((g) => g.id === s.activeGroup) || s.groups[0]!;

  return {
    screenTitle: titles[tab as keyof typeof titles] ?? "",
    themeVars,
    // ── auth / onboarding ──
    isAuth: s.screen === "auth", isOnboard: s.screen === "onboard", inApp: s.screen === "app" && s.account === "approved",
    isWaiting: s.screen === "waiting" || (s.screen === "app" && s.account !== "approved"),
    // ── real auth status (drives splash + form feedback) ──
    authReady: auth.ready, authBusy: auth.busy,
    authError: auth.error, authNotice: auth.notice,
    isRejected: s.account === "rejected",
    isLogin: s.authMode === "login", isRegister: s.authMode === "register",
    authTagline: "Plans, polls & group chaos — sorted.",
    loginTabBg: s.authMode === "login" ? "var(--canvas)" : "transparent",
    loginTabFg: s.authMode === "login" ? "var(--primary)" : "var(--ink-tertiary)",
    loginTabShadow: s.authMode === "login" ? "0 1px 3px rgba(0,0,0,.12)" : "none",
    regTabBg: s.authMode === "register" ? "var(--canvas)" : "transparent",
    regTabFg: s.authMode === "register" ? "var(--primary)" : "var(--ink-tertiary)",
    regTabShadow: s.authMode === "register" ? "0 1px 3px rgba(0,0,0,.12)" : "none",
    setLogin: () => { auth.clearAuthMsg(); setState({ authMode: "login" }); },
    setRegister: () => { auth.clearAuthMsg(); setState({ authMode: "register" }); },
    toggleAuthMode: () => { auth.clearAuthMsg(); setState((p) => ({ authMode: p.authMode === "login" ? "register" : "login" })); },
    authUser: s.authUser, authPass: s.authPass, authName: s.authName,
    onAuthUser: (e: ChangeEvent<HTMLInputElement>) => setState({ authUser: val(e) }),
    onAuthPass: (e: ChangeEvent<HTMLInputElement>) => setState({ authPass: val(e) }),
    onAuthName: (e: ChangeEvent<HTMLInputElement>) => setState({ authName: val(e) }),
    authCta: s.authMode === "login" ? "Log in" : "Create account",
    authSwitchText: s.authMode === "login" ? "New here?" : "Already have an account?",
    authSwitchCta: s.authMode === "login" ? "Create one" : "Log in",
    doAuth: () => api.doAuth(), googleAuth: () => api.googleAuth(),
    forgotPassword: () => {
      const email = s.authUser.trim();
      if (!email) { api.show("Enter your email above first"); return; }
      auth.clearAuthMsg();
      void auth.resetPasswordEmail(email);
    },
    onboardChoose: s.onboardStep === "choose", onboardCreate: s.onboardStep === "create", onboardJoin: s.onboardStep === "join",
    authNameOrUser: realName,
    chooseCreate: () => setState({ onboardStep: "create" }),
    chooseJoin: () => setState({ onboardStep: "join" }),
    backChoose: () => setState({ onboardStep: "choose" }),
    newGroupName: s.newGroupName, newGroupEmoji: s.newGroupEmoji,
    onNewGroupName: (e: ChangeEvent<HTMLInputElement>) => setState({ newGroupName: val(e) }),
    ngEmojiChoices: ["🎉", "🍻", "🏖️", "🎮", "🎓", "💼", "🏀", "🎤", "🧗"].map((em) => ({
      em, sel: em === s.newGroupEmoji,
      bg: em === s.newGroupEmoji ? "var(--primary-surface)" : "var(--surface-raised)",
      border: em === s.newGroupEmoji ? "1.5px solid var(--primary)" : "1px solid var(--hairline)",
      onTap: () => setState({ newGroupEmoji: em }),
    })),
    createReady: s.newGroupName.trim().length >= 2,
    createBtnBg: s.newGroupName.trim().length >= 2 ? "var(--primary)" : "var(--surface-overlay)",
    createBtnFg: s.newGroupName.trim().length >= 2 ? "#fff" : "var(--ink-disabled)",
    doCreateGroup: () => api.doCreateGroup(),
    onbJoinCode: s.joinCode, onObJoinCode: (e: ChangeEvent<HTMLInputElement>) => setState({ joinCode: val(e) }),
    onbJoinReady: s.joinCode.trim().length >= 4,
    onbJoinBtnBg: s.joinCode.trim().length >= 4 ? "var(--primary)" : "var(--surface-overlay)",
    onbJoinBtnFg: s.joinCode.trim().length >= 4 ? "#fff" : "var(--ink-disabled)",
    doOnbJoin: () => api.doOnbJoin(),
    // ── waiting ──
    waitingGroupName: (s.groups.find((g) => g.id === s.activeGroup) || s.groups[0] || { name: "the group" }).name,
    waitingName: realName,
    backToAuth: () => api.logout(),
    // ── admin ──
    isAdmin,
    pendingRequests: auth.pendingMembers.map((p) => ({
      id: p.id,
      name: p.display_name,
      username: p.display_name.replace(/\s+/g, "").toLowerCase(),
      initial: initialOf(p.display_name),
      bg: colorForId(p.id),
      onApprove: () => api.approveRequest(p.id),
      onReject: () => api.rejectRequest(p.id),
    })),
    pendingCount: auth.pendingMembers.length,
    hasPending: auth.pendingMembers.length > 0,
    noPending: auth.pendingMembers.length === 0,
    // ── invite ──
    isInviteSheet: s.sheet === "invite",
    openInvite: () => setState({ sheet: "invite" }),
    inviteLink: env.siteUrl,
    inviteCode: api.group.inviteCode || "······",
    hasInviteCode: api.group.inviteCode.length > 0,
    copyInvite: () => {
      const code = api.group.inviteCode;
      const text = code ? `Join my NudGoo group! Code: ${code} · ${env.siteUrl}` : env.siteUrl;
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        void navigator.clipboard.writeText(text);
        show("📋 Invite copied");
      }
    },
    copyInviteCode: () => {
      const code = api.group.inviteCode;
      if (code && typeof navigator !== "undefined" && navigator.clipboard) {
        void navigator.clipboard.writeText(code);
        show("📋 Code copied");
      }
    },
    // ── notifications ──
    isNotifsSheet: s.sheet === "notifs",
    openNotifs: () => setState({ sheet: "notifs" }),
    closeNotifs: () => setState({ sheet: null }),
    notifCount: isAdmin ? auth.pendingMembers.length : 0,
    hasNotifs: isAdmin && auth.pendingMembers.length > 0,
    notifIsAdmin: isAdmin,
    themeLight: !dark, themeDark: dark,
    setLight: () => setState({ theme: "light" }), setDark: () => setState({ theme: "dark" }),
    // ── language ──
    navLabels, langEN: s.lang === "en", langTH: s.lang === "th",
    setLangEN: () => { setState({ lang: "en" }); show("Language: English"); },
    setLangTH: () => { setState({ lang: "th" }); show("ภาษา: ไทย"); },
    enTabBg: s.lang === "en" ? "var(--canvas)" : "transparent", enTabFg: s.lang === "en" ? "var(--primary)" : "var(--ink-tertiary)", enTabShadow: s.lang === "en" ? "0 1px 3px rgba(0,0,0,.12)" : "none",
    thTabBg: s.lang === "th" ? "var(--canvas)" : "transparent", thTabFg: s.lang === "th" ? "var(--primary)" : "var(--ink-tertiary)", thTabShadow: s.lang === "th" ? "0 1px 3px rgba(0,0,0,.12)" : "none",
    lightTabBg: !dark ? "var(--canvas)" : "transparent", lightTabFg: !dark ? "var(--primary)" : "var(--ink-tertiary)", lightTabShadow: !dark ? "0 1px 3px rgba(0,0,0,.12)" : "none",
    darkTabBg: dark ? "var(--surface-card)" : "transparent", darkTabFg: dark ? "var(--primary-light)" : "var(--ink-tertiary)", darkTabShadow: dark ? "0 1px 3px rgba(0,0,0,.3)" : "none",
    isCalendar: tab === "calendar", isTrip: tab === "trip", isChat: tab === "chat", isBoard: tab === "board", isGame: tab === "game",
    isChatInfo: tab === "chatinfo", showChatInfoBtn: tab === "chat",
    openChatInfo: () => setState({ tab: "chatinfo", chatSearch: "" }), backFromChatInfo: () => setState({ tab: "chat" }),
    nav, days,
    calMonthLabel, calPlannedLabel, calUpcoming,
    hasUpcoming: calUpcoming.length > 0, noUpcoming: calUpcoming.length === 0,
    prevMonth: () => setState((p) => ({ calOffset: p.calOffset - 1 })),
    nextMonth: () => setState((p) => ({ calOffset: p.calOffset + 1 })),
    goCalendar: () => setState({ tab: "calendar" }), goTrip: () => setState({ tab: "trip" }),
    goChat: () => setState({ tab: "chat" }), goBoard: () => setState({ tab: "board" }), goGame: () => setState({ tab: "game" }),
    openAdd: () => setState({ sheet: "add", tripEditing: false }), openBowling: () => api.openEvent("bowling"),
    openTrip: () => setState({ tab: "trip", tripView: "detail", selectedTrip: "huahin" }),
    sheetOpen: !!s.sheet, isEventSheet: s.sheet === "event", isAddSheet: s.sheet === "add",
    isGroupsSheet: s.sheet === "groups", isJoinSheet: s.sheet === "join",
    closeSheet: () => setState({ sheet: null, tripEditing: false }),
    group: { ...group, members: auth.members.length || 1 }, groupCount: s.groups.length,
    openGroups: () => setState({ sheet: "groups" }),
    groupList: s.groups.map((g) => ({
      id: g.id, name: g.name, emoji: g.emoji, color: g.color, members: `${g.members} members`,
      active: g.id === s.activeGroup, inactive: g.id !== s.activeGroup,
      rowBg: g.id === s.activeGroup ? "var(--primary-surface)" : "transparent",
      rowBorder: g.id === s.activeGroup ? "1.5px solid var(--primary)" : "1px solid var(--hairline)",
      showUnread: g.unread > 0 && g.id !== s.activeGroup, unread: g.unread,
      onTap: () => api.switchGroup(g.id),
      onBox: g.id === s.activeGroup ? () => setState({ tab: "groupsettings", sheet: null }) : () => api.switchGroup(g.id),
    })),
    openJoin: () => setState({ sheet: "join", joinCode: "" }),
    createNewGroup: () => api.createNewGroup(),
    logout: () => api.logout(),
    leaveGroup: () => api.leaveGroup(),
    joinCode: s.joinCode,
    onJoinCode: (e: ChangeEvent<HTMLInputElement>) => setState({ joinCode: val(e) }),
    doJoin: () => api.doJoin(),
    joinBtnBg: s.joinCode.trim().length >= 4 ? "var(--primary)" : "var(--surface-overlay)",
    joinBtnFg: s.joinCode.trim().length >= 4 ? "#fff" : "var(--ink-disabled)",
    // ── profile ──
    isProfile: tab === "profile",
    showGroupSwitcher: ["calendar", "trip", "chat", "board", "game"].includes(tab),
    openProfile: () => setState({ tab: "profile" }), backFromProfile: () => setState({ tab: "calendar" }),
    meColor: auth.profile?.avatar_color || s.profile.color, meGlyph: auth.profile?.avatar_emoji || initialOf(realName),
    meName: realName, meUsername: "@" + (auth.profile?.username || realName.replace(/\s+/g, "").toLowerCase()), meEmail: realEmail, mePhone: auth.profile?.phone || "",
    myQrSaved: s.myQrSaved, myQrUnsaved: !s.myQrSaved, meQrHandle: "081-234-5678",
    saveMyQr: () => { setState({ myQrSaved: true }); show("✅ PromptPay QR saved"); },
    removeMyQr: () => { setState({ myQrSaved: false }); show("QR removed"); },
    avatarBtnRing: tab === "profile" ? "2px solid var(--primary)" : "2px solid transparent",
    editingName: s.editField === "name", editingUsername: s.editField === "username",
    editingNameOff: s.editField !== "name", editingUsernameOff: s.editField !== "username",
    editingPhone: s.editField === "phone", editingPhoneOff: s.editField !== "phone",
    startEditPhone: () => setState({ editField: "phone", editValue: auth.profile?.phone || "" }),
    editValue: s.editValue,
    onEditInput: (e: ChangeEvent<HTMLInputElement>) => setState({ editValue: val(e) }),
    startEditName: () => setState({ editField: "name", editValue: realName }),
    startEditUsername: () => setState({ editField: "username", editValue: auth.profile?.username || "" }),
    saveEdit: () => api.saveEdit(), cancelEdit: () => setState({ editField: null }),
    avatarPicker: s.avatarPicker,
    openAvatarPicker: () => setState({ avatarPicker: true }), closeAvatarPicker: () => setState({ avatarPicker: false }),
    colorSwatches: ["#3B5BDB", "#E8590C", "#2F9E44", "#C2255C", "#6741D9", "#0C8599", "#F59F00", "#212529"].map((c) => ({
      c, sel: c === s.profile.color, ring: c === s.profile.color ? "0 0 0 3px var(--canvas),0 0 0 5px " + c : "none",
      onTap: () => setState((p) => ({ profile: { ...p.profile, color: c } })),
    })),
    emojiChoices: ["", "😎", "🦄", "🐱", "🔥", "🎸", "🏀", "🍜", "👾"].map((em) => ({
      em, label: em || "Aa", sel: em === s.profile.emoji,
      bg: em === s.profile.emoji ? "var(--primary-surface)" : "var(--surface-raised)",
      border: em === s.profile.emoji ? "1.5px solid var(--primary)" : "1px solid var(--hairline)",
      onTap: () => setState((p) => ({ profile: { ...p.profile, emoji: em } })),
    })),
    isPwSheet: s.sheet === "pw",
    openPw: () => setState({ sheet: "pw", pw: { cur: "", next: "", confirm: "" } }),
    pwCur: s.pw.cur, pwNext: s.pw.next, pwConfirm: s.pw.confirm,
    onPwCur: (e: ChangeEvent<HTMLInputElement>) => setState((p) => ({ pw: { ...p.pw, cur: val(e) } })),
    onPwNext: (e: ChangeEvent<HTMLInputElement>) => setState((p) => ({ pw: { ...p.pw, next: val(e) } })),
    onPwConfirm: (e: ChangeEvent<HTMLInputElement>) => setState((p) => ({ pw: { ...p.pw, confirm: val(e) } })),
    pwHint: s.pw.confirm.length > 0 && s.pw.next !== s.pw.confirm ? "Passwords don't match" : s.pw.next.length > 0 && s.pw.next.length < 6 ? "At least 6 characters" : "",
    pwBtnBg: s.pw.cur.length > 0 && s.pw.next.length >= 6 && s.pw.next === s.pw.confirm ? "var(--primary)" : "var(--surface-overlay)",
    pwBtnFg: s.pw.cur.length > 0 && s.pw.next.length >= 6 && s.pw.next === s.pw.confirm ? "#fff" : "var(--ink-disabled)",
    savePw: () => api.savePw(),
    // ── group settings ──
    isGroupSettings: tab === "groupsettings",
    openGroupSettings: () => setState({ tab: "groupsettings", sheet: null }),
    backFromGS: () => setState({ tab: "calendar" }),
    gsName: group.name, gsEmoji: group.emoji, gsColor: group.color, gsMemberCount: auth.members.length,
    editingGName: s.gEdit === "gname", editingGNameOff: s.gEdit !== "gname",
    startEditGName: () => setState({ gEdit: "gname", editValue: group.name }),
    saveGName: () => api.saveGName(),
    groupPicker: s.groupPicker,
    toggleGroupPicker: () => setState((p) => ({ groupPicker: !p.groupPicker })),
    gColorSwatches: ["#3B5BDB", "#E8590C", "#2F9E44", "#C2255C", "#6741D9", "#0C8599", "#F59F00", "#212529"].map((c) => ({
      c, ring: c === group.color ? "0 0 0 3px var(--canvas),0 0 0 5px " + c : "none",
      onTap: () => api.setGroupField("color", c),
    })),
    gEmojiChoices: ["🎉", "🎓", "💼", "🧧", "🍻", "🏖️", "🎮", "🏀", "🎤"].map((em) => ({
      em, sel: em === group.emoji,
      bg: em === group.emoji ? "var(--primary-surface)" : "var(--surface-raised)",
      border: em === group.emoji ? "1.5px solid var(--primary)" : "1px solid var(--hairline)",
      onTap: () => api.setGroupField("emoji", em),
    })),
    editingNick: s.gEdit === "nick", editingNickOff: s.gEdit !== "nick", nickname: auth.profile?.nickname || realName,
    startEditNick: () => setState({ gEdit: "nick", editValue: auth.profile?.nickname || realName }),
    saveNick: () => api.saveNick(),
    members: auth.members.map((m) => {
      const me = m.id === myId;
      const votes = api.group.muteVotes.filter((mv) => mv.target_id === m.id).length;
      const iVoted = !!myId && api.group.muteVotes.some((mv) => mv.target_id === m.id && mv.voter_id === myId);
      const roleLabel = m.role === "admin" ? "Admin" : "Member";
      return {
        id: m.id, name: me ? m.display_name + " (you)" : m.display_name,
        initial: initialOf(m.display_name), bg: colorForId(m.id),
        role: me ? "You · " + roleLabel : roleLabel,
        muteLabel: votes === 1 ? "1 mute vote" : votes + " mute votes", canMute: !me,
        muteBtnBg: iVoted ? "var(--error)" : "var(--surface-raised)", muteBtnFg: iVoted ? "#fff" : "var(--ink-secondary)",
        muteBtnLabel: iVoted ? "Muted" : "Mute", muteBtnIcon: iVoted ? "ph-fill ph-microphone-slash" : "ph ph-microphone-slash",
        onMute: () => api.voteMute(m.id),
      };
    }),
    rules: api.group.rules.map((r) => ({
      id: r.id, text: r.body, on: r.enabled,
      track: r.enabled ? "var(--primary)" : "var(--hairline-strong)", knob: r.enabled ? "20px" : "0px",
      textColor: r.enabled ? "var(--ink)" : "var(--ink-tertiary)", onToggle: () => api.toggleRule(r.id),
      onHoldStart: () => api.holdRuleStart(r.id), onHoldEnd: () => api.holdRuleEnd(),
    })),
    addingRule: s.addingRule, newRule: s.newRule,
    onNewRule: (e: ChangeEvent<HTMLInputElement>) => setState({ newRule: val(e) }),
    startAddRule: () => api.startAddRule(),
    commitRule: () => api.commitRule(),
    ev, rsvpList, rsvpSummary,
    rem3dTrack: s.rem3d ? "var(--primary)" : "var(--hairline-strong)", rem3dKnob: s.rem3d ? "20px" : "0px",
    rem24hTrack: s.rem24h ? "var(--primary)" : "var(--hairline-strong)", rem24hKnob: s.rem24h ? "20px" : "0px",
    toggle3d: () => setState((p) => ({ rem3d: !p.rem3d })), toggle24h: () => setState((p) => ({ rem24h: !p.rem24h })),
    voteOptions, votedCount,
    // ── trip hub (real hangouts) ──
    tripIsList: s.tripView === "list",
    tripIsDetail: s.tripView === "detail" && !!tripDetailReal,
    tripList: vmTrips.map((t) => ({ ...t, onTap: () => setState({ tripView: "detail", selectedTrip: t.id }) })),
    hasTrips: vmTrips.length > 0, noTrips: vmTrips.length === 0,
    backToTripList: () => setState({ tripView: "list" }),
    tripDetail: tripDetailReal ?? TRIP_FALLBACK,
    tripCanEdit,
    groupMemberCount: auth.members.length,
    // trip edit (pencil) — edits the real trip name
    tripEditing: s.tripEditing, tripNameDraft: s.tripNameDraft,
    onTripNameDraft: (e: ChangeEvent<HTMLInputElement>) => setState({ tripNameDraft: val(e) }),
    editTrip: () => api.editTrip(),
    addSheetTitle: s.tripEditing ? "Edit hangout" : "New hangout",
    addSheetCta: s.tripEditing ? "Save changes" : "Create hangout",
    onAddSubmit: s.tripEditing ? () => api.updateHangout() : () => api.createHangout(),
    // new-hangout composer (real form)
    hangoutTitle: s.hangout.title, hangoutDest: s.hangout.dest, hangoutDate: s.hangout.date, hangoutNotes: s.hangout.notes, hangoutEmoji: s.hangout.emoji, hangoutTransport: s.hangout.transport,
    onHangoutTitle: (e: ChangeEvent<HTMLInputElement>) => setState((p) => ({ hangout: { ...p.hangout, title: val(e) } })),
    onHangoutDest: (e: ChangeEvent<HTMLInputElement>) => setState((p) => ({ hangout: { ...p.hangout, dest: val(e) } })),
    onHangoutDate: (e: ChangeEvent<HTMLInputElement>) => setState((p) => ({ hangout: { ...p.hangout, date: val(e) } })),
    onHangoutTransport: (e: ChangeEvent<HTMLInputElement>) => setState((p) => ({ hangout: { ...p.hangout, transport: val(e) } })),
    onHangoutNotes: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setState((p) => ({ hangout: { ...p.hangout, notes: val(e) } })),
    hangoutEmojiChoices: ["🗺️", "🏖️", "🏔️", "🎉", "🍜", "🎳", "🎤", "⛺", "🚗", "✈️"].map((em) => ({
      em, sel: em === s.hangout.emoji,
      bg: em === s.hangout.emoji ? "var(--primary-surface)" : "var(--surface-raised)",
      border: em === s.hangout.emoji ? "1.5px solid var(--primary)" : "1px solid var(--hairline)",
      onTap: () => setState((p) => ({ hangout: { ...p.hangout, emoji: em } })),
    })),
    // RSVP (real)
    tripGoing: goingAvatars,
    tripMyRsvp: myRsvp,
    rsvpButtons: (["going", "maybe", "declined"] as const).map((r) => {
      const activeBg = r === "going" ? "var(--profit)" : r === "maybe" ? "var(--warning)" : "var(--error)";
      const active = myRsvp === r;
      return {
        id: r, label: r === "going" ? "Going" : r === "maybe" ? "Maybe" : "Can't",
        active,
        bg: active ? activeBg : "var(--surface-raised)",
        fg: active ? "#fff" : "var(--ink-secondary)",
        icon: r === "going" ? "ph-fill ph-check-circle" : r === "maybe" ? "ph-fill ph-question" : "ph-fill ph-x-circle",
        onTap: () => api.setTripRsvp(r),
      };
    }),
    // all trip sub-features are live now
    tripShowAlbum: !!tripDetailReal, tripShowVoting: !!tripDetailReal, tripShowBill: !!tripDetailReal, showTripHistory: false,
    voteCanEdit: tripCanEdit,
    voteAddLabel: s.dateOptLabel, voteAddDate: s.dateOptDate,
    onVoteAddLabel: (e: ChangeEvent<HTMLInputElement>) => setState({ dateOptLabel: val(e) }),
    onVoteAddDate: (e: ChangeEvent<HTMLInputElement>) => setState({ dateOptDate: val(e) }),
    submitDateOption: () => api.submitDateOption(),
    voteAddReady: s.dateOptLabel.trim().length > 0,
    blindVoteOn: blind,
    albumCount: tripPhotoList.length,
    tripAlbum: tripPhotoList.map((p) => {
      const m = memberById.get(p.user_id);
      const hoursLeft = p.expires_at ? Math.max(0, (new Date(p.expires_at).getTime() - nowMs) / 3600000) : 48;
      const soon = hoursLeft <= 6;
      return {
        key: p.id, imageUrl: p.image_url || "",
        byInitial: m ? initialOf(m.display_name) : "?", byBg: m?.avatar_color || colorForId(p.user_id),
        expiry: hoursLeft >= 24 ? Math.round((hoursLeft / 24) * 10) / 10 + "d left" : Math.ceil(hoursLeft) + "h left",
        expBg: soon ? "rgba(201,42,42,.85)" : "rgba(0,0,0,.6)",
      };
    }),
    addAlbumPhoto: (file: File) => api.addAlbumPhoto(file),
    tripHistory: [] as Array<{ key: string; name: string; emoji: string; date: string; place: string; cost: string; joinedCount: number; joinedAvatars: Array<{ key: string; initial: string; bg: string }> }>,
    tripIsHistory: false,
    openTripHistory: () => setState({ tripView: "history" }),
    backFromHistory: () => setState({ tripView: "list" }),
    // ── attachment menu ──
    attachMenu: s.attachMenu,
    toggleAttach: () => setState((p) => ({ attachMenu: !p.attachMenu })),
    attachIcon: s.attachMenu ? "ph-bold ph-x" : "ph-bold ph-plus",
    closeAttach: () => setState({ attachMenu: false }),
    openGif: () => setState({ attachMenu: false, sheet: "gif" }),
    sendPhotoFile: (file: File) => api.sendPhotoFile(file),
    sendGifFile: (file: File) => api.sendGifFile(file),
    sendGifUrl: (url: string, label: string) => api.sendGifUrl(url, label),
    giphyKey: env.giphyKey,
    pickLocation: () => { setState({ attachMenu: false }); api.sendLocation(); },
    pickPoll: () => setState({ attachMenu: false, sheet: "poll", pollQ: "", pollOpts: ["", ""] }),
    // ── bill splitting (real) ──
    billCanEdit: tripCanEdit,
    billEnabled,
    billTrack: billEnabled ? "var(--primary)" : "var(--hairline-strong)", billKnob: billEnabled ? "20px" : "0px",
    toggleBill: () => api.toggleBill(),
    billHasTotal: billTotalAmt > 0,
    billTotalLabel: billTotalAmt.toLocaleString(),
    billShareLabel: billShareAmt.toLocaleString(),
    billSplitWays: memberCount,
    billTotalDraft: s.billTotalDraft,
    onBillTotalDraft: (e: ChangeEvent<HTMLInputElement>) => setState({ billTotalDraft: val(e) }),
    saveBillTotal: () => api.saveBillTotal(),
    billTotalReady: s.billTotalDraft.replace(/[^0-9]/g, "").length > 0,
    hasTreasurer: !!treasurerM,
    treasurerName: treasurerM ? (treasurerM.id === myId ? realName : treasurerM.display_name) : "",
    treasurerInitial: treasurerM ? initialOf(treasurerM.display_name) : "?",
    treasurerColor: treasurerM?.avatar_color || "var(--ink-tertiary)",
    treasurerPromptpay: treasurerM?.promptpay_handle || "",
    treasurerChoices: auth.members.map((m) => ({
      id: m.id, name: m.id === myId ? "You" : m.display_name.length > 8 ? m.display_name.slice(0, 8) + "…" : m.display_name,
      initial: initialOf(m.display_name), color: m.avatar_color || colorForId(m.id), sel: m.id === selTrip?.treasurer_id,
      bg: m.id === selTrip?.treasurer_id ? "var(--primary-surface)" : "var(--canvas)",
      border: m.id === selTrip?.treasurer_id ? "1.5px solid var(--primary)" : "1px solid var(--hairline)",
      fg: m.id === selTrip?.treasurer_id ? "var(--primary)" : "var(--ink)",
      onPick: () => api.setTreasurer(m.id),
    })),
    billPaidLabel: `${billPaidCount} of ${memberCount} paid`,
    myBillPaid,
    togglePaid: () => api.toggleBillPaid(),
    payBtnLabel: myBillPaid ? "Paid ✓" : "Mark as paid",
    payBtnBg: myBillPaid ? "var(--profit)" : "var(--primary)",
    payBtnIcon: myBillPaid ? "ph-fill ph-check-circle" : "ph-fill ph-check",
    // ── games ──
    gameIsDice: s.gameMode === "dice", gameIsCard: s.gameMode === "card", gameIsWheel: s.gameMode === "wheel",
    setDiceMode: () => setState({ gameMode: "dice" }), setCardMode: () => setState({ gameMode: "card" }), setWheelMode: () => setState({ gameMode: "wheel" }),
    wheelModeBg: s.gameMode === "wheel" ? "var(--canvas)" : "transparent", wheelModeFg: s.gameMode === "wheel" ? "var(--primary)" : "var(--ink-tertiary)", wheelModeShadow: s.gameMode === "wheel" ? "0 1px 3px rgba(0,0,0,.12)" : "none",
    wheelGradient, wheelSegments, wheelAngle: s.wheelAngle, wheelSpinning: s.wheelSpinning,
    wheelTransition: s.wheelSpinning ? "transform 3.4s cubic-bezier(.17,.67,.16,.99)" : "none",
    wheelResult: s.wheelResult, hasWheelResult: !!s.wheelResult && !s.wheelSpinning,
    spinWheel: () => api.spinWheel(),
    wheelCanSpin: wheelItems.length >= 2 && !s.wheelSpinning,
    wheelHasItems,
    wheelOptionRows: s.wheelOptions.map((optVal, i) => ({
      key: "wo" + i, val: optVal, idx: i,
      onInput: (e: ChangeEvent<HTMLInputElement>) => api.setWheelOption(i, val(e)),
      canRemove: s.wheelOptions.length > 2,
      onRemove: () => api.removeWheelOption(i),
    })),
    addWheelOption: () => api.addWheelOption(),
    canAddWheelOption: s.wheelOptions.length < 10,
    addEveryoneToWheel: () => api.addEveryoneToWheel(),
    diceModeBg: s.gameMode === "dice" ? "var(--canvas)" : "transparent", diceModeFg: s.gameMode === "dice" ? "var(--primary)" : "var(--ink-tertiary)", diceModeShadow: s.gameMode === "dice" ? "0 1px 3px rgba(0,0,0,.12)" : "none",
    cardModeBg: s.gameMode === "card" ? "var(--canvas)" : "transparent", cardModeFg: s.gameMode === "card" ? "var(--primary)" : "var(--ink-tertiary)", cardModeShadow: s.gameMode === "card" ? "0 1px 3px rgba(0,0,0,.12)" : "none",
    dice1Pips: pips(s.dice1), dice2Pips: pips(s.dice2),
    diceTotal: s.dice1 + s.dice2, rolling: s.rolling,
    rollDice: () => api.rollDice(), diceSpin: s.rolling ? "rollSpin .5s ease-in-out" : "none",
    cardLabel: s.drawnCard ? s.drawnCard.label : "", cardEmoji: s.drawnCard ? s.drawnCard.emoji : "🃏", cardColor: s.drawnCard ? s.drawnCard.color : "var(--ink-tertiary)",
    drawCard: () => api.drawCard(),
    // ── chat mute ──
    chatMuted: s.chatMuted, toggleChatMute: () => api.toggleChatMute(),
    muteBtnBg: s.chatMuted ? "var(--warning-bg)" : "var(--surface-raised)",
    muteBtnFg: s.chatMuted ? "#7A4900" : "var(--ink-secondary)",
    muteBtnIcon2: s.chatMuted ? "ph-fill ph-bell-slash" : "ph ph-bell",
    chatMsgs, draft: s.draft,
    mutedMembers: mutedList.map((m) => ({ key: m.id, initial: initialOf(m.display_name), bg: m.avatar_color || colorForId(m.id), name: m.id === myId ? realName : m.display_name })),
    hasMuted: mutedList.length > 0,
    mutedSummary: (() => { const ns = mutedList.map((m) => (m.id === myId ? realName : m.display_name)); if (ns.length === 0) return ""; if (ns.length === 1) return ns[0] + " is muted"; if (ns.length === 2) return ns[0] + " & " + ns[1] + " are muted"; return ns[0] + " & " + (ns.length - 1) + " others are muted"; })(),
    pollQ: s.pollQ,
    pollOpts: s.pollOpts.map((t, i) => ({ key: "po" + i, val: t, idx: i, onInput: (e: ChangeEvent<HTMLInputElement>) => api.setPollOpt(i, val(e)), canRemove: s.pollOpts.length > 2, onRemove: () => api.removePollOpt(i) })),
    onPollQ: (e: ChangeEvent<HTMLInputElement>) => setState({ pollQ: val(e) }),
    addPollOpt: () => setState((p) => ({ pollOpts: [...p.pollOpts, ""] })),
    canAddPollOpt: s.pollOpts.length < 5,
    sendPoll: () => api.sendPoll(),
    reactPalette: REACTS.map((e) => ({ key: "rp" + e, emoji: e, onTap: () => api.reactFromMenu(e) })),
    msgRef: api.setMsgRef, inputRef: api.setInpRef,
    onDraft: (e: ChangeEvent<HTMLInputElement>) => setState({ draft: val(e) }),
    onSend: () => api.sendText(),
    isGifSheet: s.sheet === "gif", isPollSheet: s.sheet === "poll",
    pollDisabled: !(s.pollQ.trim().length > 0 && s.pollOpts.filter((o) => o.trim()).length >= 2),
    pollBtnBg: s.pollQ.trim().length > 0 && s.pollOpts.filter((o) => o.trim()).length >= 2 ? "var(--primary)" : "var(--ink-disabled)",
    peekX: s.peekX, peekTransition: s.dragging ? "none" : "transform .26s cubic-bezier(.16,1,.3,1)",
    onMsgPointerDown: (e: PointerEvent) => api.msgPointerDown(e),
    onMsgPointerMove: (e: PointerEvent) => api.msgPointerMove(e),
    onMsgPointerUp: (e: PointerEvent) => api.msgPointerUp(e),
    hasPinned: !!pinnedMsg, pinnedText, unpin: () => { if (pinnedMsg) void api.chat.togglePin(pinnedMsg.id); },
    isReplying: !!replyMsg, replyingName, replyingText, cancelReply: () => setState({ replyToId: null }),
    isMsgMenu: !!s.msgMenu, menuMine, menuText, menuIsText: menuMsg ? menuMsg.type === "text" : false,
    closeMsgMenu: () => setState({ msgMenu: null }),
    menuReply: () => api.menuAction("reply"), menuPin: () => api.menuAction("pin"), menuCopy: () => api.menuAction("copy"),
    menuEdit: () => api.menuAction("edit"), menuDelete: () => api.menuAction("delete"),
    menuPinLabel: menuMsg && menuMsg.pinned ? "Unpin" : "Pin",
    isEditMsg: !!s.editMsgId, editMsgText: s.editMsgText,
    onEditMsg: (e: ChangeEvent<HTMLInputElement>) => setState({ editMsgText: val(e) }),
    saveEditMsg: () => api.saveEditMsg(), cancelEditMsg: () => setState({ editMsgId: null, editMsgText: "" }),
    isProfilePopup: !!ppF, ppName: ppF ? ppF.name : "", ppInitial: ppF ? ppF.initial : "", ppColor: ppF ? ppF.bg : "#3B5BDB",
    ppMuteLabel: ppMutes === 1 ? "1 mute vote" : ppMutes + " mute votes", ppVoted,
    ppVoteBg: ppVoted ? "var(--error)" : "var(--surface-raised)", ppVoteFg: ppVoted ? "#fff" : "var(--ink)",
    ppVoteText: ppVoted ? "Remove mute vote" : "Vote to mute",
    ppVoteIcon: ppVoted ? "ph-fill ph-microphone-slash" : "ph ph-microphone-slash",
    closeProfilePopup: () => setState({ profilePopup: null }),
    ppDoMute: () => { if (s.profilePopup) api.voteMute(s.profilePopup); },
    ppMention: () => api.mentionInChat(),
    chatSearch: s.chatSearch, onChatSearch: (e: ChangeEvent<HTMLInputElement>) => setState({ chatSearch: val(e) }),
    hasSearch: q.length > 0, searchResults, searchCount: searchResults.length,
    sharedLinks, linkCount: sharedLinks.length, hasLinks: sharedLinks.length > 0,
    segs, periodPills, boardTitle: def.title, boardSub: periodLabel, champion, boardRows,
    toast: s.toast,
    stop: (e: { stopPropagation?: () => void }) => { if (e && e.stopPropagation) e.stopPropagation(); },
  };
}

export type VM = ReturnType<typeof buildViewModel>;
