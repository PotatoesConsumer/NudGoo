import type { ChangeEvent, PointerEvent } from "react";

import {
  ALBUM,
  BOARD_DEFS,
  fmtTime,
  FRIENDS,
  GIFS,
  PERIODS,
  PF,
  pips,
  RANKBG,
  REACTS,
  SM,
  TRIP_HISTORY,
  DARK_VARS,
} from "./data";
import type { ChatMsg, Friend, State } from "./types";

/** Everything the hook hands the pure view-model builder. */
export interface NudGooApi {
  setState: (u: Partial<State> | ((p: State) => Partial<State>)) => void;
  show: (msg: string) => void;
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
  sendPhoto: () => void;
  sendLocation: () => void;
  sendGif: (g: { label: string; c1: string; c2: string }) => void;
  rollDice: () => void;
  drawCard: () => void;
  toggleChatMute: () => void;
  sendText: () => void;
  setPollOpt: (i: number, val: string) => void;
  removePollOpt: (i: number) => void;
  sendPoll: () => void;
  reactFromMenu: (emoji: string) => void;
  react: (msgId: number, emoji: string) => void;
  votePoll: (msgId: number, optIdx: number) => void;
  startLongPress: (id: number) => void;
  cancelLongPress: () => void;
  menuAction: (action: string) => void;
  saveEditMsg: () => void;
  openProfilePopup: (id: string) => void;
  mentionInChat: () => void;
  msgPointerDown: (e: PointerEvent) => void;
  msgPointerMove: (e: PointerEvent) => void;
  msgPointerUp: (e: PointerEvent) => void;
  spinWheel: () => void;
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

const FMAP: Record<string, Friend> = Object.fromEntries(
  FRIENDS.map((f) => [f.id, f]),
);
const fOf = (id: string): Friend => FMAP[id] ?? FRIENDS[0]!;
const val = (e: ChangeEvent<HTMLInputElement>): string => e.target.value;

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

  const treasurerF = fOf(s.treasurer);
  const treasurerHasQR = treasurerF.id === "you" ? s.myQrSaved : treasurerF.hasQR;
  const seedStr = treasurerF.id;
  let hsh = 0;
  for (let i = 0; i < seedStr.length; i++) hsh = (hsh * 31 + seedStr.charCodeAt(i)) >>> 0;
  const qrSeed: Array<{ cells: Array<{ color: string }> }> = [];
  for (let r = 0; r < 11; r++) {
    const cells: Array<{ color: string }> = [];
    for (let c = 0; c < 11; c++) {
      const v = ((hsh >> ((r * 11 + c) % 31)) ^ (r * 7 + c * 13)) & 1;
      cells.push({ color: v === 1 ? "#212529" : "#fff" });
    }
    qrSeed.push({ cells });
  }
  const wheelGradient =
    "conic-gradient(" + FRIENDS.map((f, i) => `${f.bg} ${i * 60}deg ${(i + 1) * 60}deg`).join(",") + ")";
  const wheelSegments = FRIENDS.map((f, i) => ({ id: f.id, initial: f.initial, color: f.bg, mid: i * 60 + 30 }));

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

  // calendar days (June 2026, June 1 = Monday → Sunday-first offset 1)
  const events: Record<number, string> = { 13: "var(--ink-disabled)", 20: "var(--primary)", 27: "var(--warning)" };
  type Day = { n: number | string; empty: boolean; bg: string; fg: string; dot: string; ring: string; cursor: string; onClick: () => void };
  const days: Day[] = [{ empty: true, n: "", bg: "transparent", fg: "transparent", dot: "transparent", ring: "none", cursor: "default", onClick: () => {} }];
  for (let n = 1; n <= 30; n++) {
    const today = n === 15;
    const has = events[n];
    days.push({
      n,
      empty: false,
      bg: today ? "var(--primary)" : "transparent",
      fg: today ? "#fff" : "var(--ink)",
      dot: has || "transparent",
      ring: "none",
      cursor: n === 20 || n === 27 ? "pointer" : "default",
      onClick: n === 20 ? () => api.openEvent("bowling") : n === 27 ? () => api.openEvent("trip") : () => {},
    });
  }

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

  // ── vote screen ──
  const VOPTS = [
    { id: "sat20", label: "This Saturday", sub: "20 Jun · evening" },
    { id: "sun28", label: "Next Sunday", sub: "28 Jun · all day" },
    { id: "fri26", label: "Fri after work", sub: "26 Jun · 18:00" },
  ];
  const merged = (id: string): string[] => [...(s.votes[id] ?? []), ...(s.myVote === id ? ["you"] : [])];
  const counts = VOPTS.map((o) => merged(o.id).length);
  const maxC = Math.max(...counts, 0);
  const blind = s.blindVote; // hide who voted & tallies until voting closes
  const voteOptions = VOPTS.map((o) => {
    const voters = merged(o.id);
    const c = voters.length;
    const leader = !blind && c > 0 && c === maxC;
    const mine = s.myVote === o.id;
    return {
      id: o.id, label: o.label, sub: o.sub, count: c, pct: blind ? 0 : Math.round((c / 6) * 100), leader, mine,
      crown: leader ? "👑" : "",
      barFill: leader ? "var(--primary)" : "var(--primary-muted)",
      cardBg: mine ? "var(--primary-surface)" : "var(--canvas)",
      cardBorder: mine ? "1.5px solid var(--primary)" : "1px solid var(--hairline)",
      voteLabel: mine ? "Your pick" : "Vote",
      voteIcon: mine ? "ph-fill ph-check-circle" : "ph ph-hand-pointing",
      voteBg: mine ? "var(--primary)" : "var(--surface-raised)",
      voteFg: mine ? "#fff" : "var(--ink-secondary)",
      countLabel: blind ? "Hidden" : `${c} vote${c === 1 ? "" : "s"}`,
      avatars: blind ? [] : voters.slice(0, 5).map((vid) => ({ initial: fOf(vid).initial, bg: fOf(vid).bg })),
      onVote: () => api.castVote(o.id),
    };
  });
  const votedIds = new Set<string>();
  VOPTS.forEach((o) => merged(o.id).forEach((v) => votedIds.add(v)));
  const votedCount = votedIds.size;

  // ── chat screen ──
  const baseElapsed = api.t0 ? (s.now - api.t0) / 1000 : 0;
  const allMsgs = s.msgs;
  const msgById = (id: number) => allMsgs.find((x) => x.id === id);
  const buildMsg = (m: ChatMsg) => {
    const f = fOf(m.from);
    const mine = m.from === "you";
    const rep = m.replyTo ? msgById(m.replyTo) : null;
    const rx = m.reactions || {};
    const reactionChips = Object.keys(rx)
      .filter((e) => (rx[e]?.length ?? 0) > 0)
      .map((e) => {
        const arr = rx[e] ?? [];
        const mineReacted = arr.includes("you");
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
      tint: "#3B5BDB", countdown: "",
      isGif: m.type === "gif", gifLabel: m.label || "", gifC1: m.c1 || "#3B5BDB", gifC2: m.c2 || "#6741D9",
      isLocation: m.type === "location", place: m.place || "", addr: m.addr || "",
      isPinned: m.id === s.pinnedId,
      avatarTap: mine ? () => {} : () => api.openProfilePopup(m.from),
      nameTap: mine ? () => {} : () => api.openProfilePopup(m.from),
      onPressStart: () => api.startLongPress(m.id),
      onPressEnd: () => api.cancelLongPress(),
      hasReply: !!rep,
      replyName: rep ? (rep.from === "you" ? "You" : fOf(rep.from).name) : "",
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
        const voted = op.v.includes("you");
        const pct = total > 0 ? Math.round((op.v.length / total) * 100) : 0;
        return {
          key: m.id + "-" + idx, text: op.t, count: op.v.length, pct, barW: pct + "%",
          barBg: voted ? "var(--primary)" : "var(--primary-muted)",
          rowBg: voted ? "var(--primary-surface)" : "var(--surface-raised)",
          border: voted ? "1.5px solid var(--primary)" : "1.5px solid transparent",
          check: voted ? "ph-fill ph-check-circle" : "ph ph-circle",
          checkColor: voted ? "var(--primary)" : "var(--ink-disabled)",
          onTap: () => api.votePoll(m.id, idx),
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
  const pinnedMsg = s.pinnedId ? msgById(s.pinnedId) : null;
  const pinnedText = previewOf(pinnedMsg);
  const replyMsg = s.replyToId ? msgById(s.replyToId) : null;
  const replyingName = replyMsg ? (replyMsg.from === "you" ? "yourself" : fOf(replyMsg.from).name) : "";
  const replyingText = previewOf(replyMsg);
  const menuMsg = s.msgMenu ? msgById(s.msgMenu) : null;
  const menuMine = menuMsg ? menuMsg.from === "you" : false;
  const menuText = previewOf(menuMsg);
  const ppF = s.profilePopup ? fOf(s.profilePopup) : null;
  const ppMutes = ppF ? s.muteVotes[ppF.id] || 0 : 0;
  const ppVoted = ppF ? s.myMutes.includes(ppF.id) : false;

  const sharedLinks = allMsgs
    .filter((m) => m.type === "location" || (m.type === "text" && /https?:\/\/|www\.|\.com|maps\.google/i.test(m.text || "")))
    .map((m) => ({
      id: m.id, isLoc: m.type === "location",
      title: m.type === "location" ? m.place || "" : (m.text?.match(/https?:\/\/\S+|www\.\S+|\S+\.com\S*/i) || [""])[0],
      sub: m.type === "location" ? m.addr || "" : (m.from === "you" ? "You" : fOf(m.from).name) + " · " + (m.time || ""),
    }));
  const q = s.chatSearch.trim().toLowerCase();
  const searchResults = q
    ? allMsgs
        .filter((m) => (m.text || "").toLowerCase().includes(q) || (m.place || "").toLowerCase().includes(q))
        .map((m) => ({ id: m.id, name: m.from === "you" ? "You" : fOf(m.from).name, initial: fOf(m.from).initial, bg: fOf(m.from).bg, time: m.time || "", text: m.type === "text" ? m.text || "" : m.type === "photo" ? "📷 Photo" : m.type === "gif" ? "GIF" : "📍 " + (m.place || "") }))
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
  const def = BOARD_DEFS[bt];
  const scaledRows = def.base.map(([id, v]) => [id, Math.max(1, Math.round(v * PF[period]))] as [string, number]).sort((a, b) => b[1] - a[1]);
  const segs = (["game", "late"] as const).map((k) => ({
    id: k, label: BOARD_DEFS[k].seg, emoji: BOARD_DEFS[k].emoji, active: bt === k,
    bg: bt === k ? "var(--canvas)" : "transparent",
    fg: bt === k ? "var(--primary)" : "var(--ink-tertiary)",
    shadow: bt === k ? "0 1px 3px rgba(0,0,0,.12)" : "none",
    onTap: () => setState({ boardTab: k }),
  }));
  const champRow = scaledRows[0]!;
  const champF = fOf(champRow[0]);
  const champion = { name: champF.name, initial: champF.initial, bg: champF.bg, value: champRow[1], unit: def.unit, caption: def.caption, emoji: def.emoji };
  const boardRows = scaledRows.slice(1).map((r, i) => {
    const rank = i + 2;
    const ff = fOf(r[0]);
    return { rank, name: ff.name, initial: ff.initial, bg: ff.bg, value: r[1], unit: def.unit, isMe: r[0] === "you", rowBg: r[0] === "you" ? "var(--primary-surface)" : "transparent", medalBg: RANKBG[rank - 1] || "var(--rank-other)" };
  });

  const group = s.groups.find((g) => g.id === s.activeGroup) || s.groups[0]!;

  return {
    screenTitle: titles[tab as keyof typeof titles] ?? "",
    themeVars,
    // ── auth / onboarding ──
    isAuth: s.screen === "auth", isOnboard: s.screen === "onboard", inApp: s.screen === "app" && s.account === "approved",
    isWaiting: s.screen === "waiting" || (s.screen === "app" && s.account !== "approved"),
    isLogin: s.authMode === "login", isRegister: s.authMode === "register",
    authTagline: "Plans, polls & group chaos — sorted.",
    loginTabBg: s.authMode === "login" ? "var(--canvas)" : "transparent",
    loginTabFg: s.authMode === "login" ? "var(--primary)" : "var(--ink-tertiary)",
    loginTabShadow: s.authMode === "login" ? "0 1px 3px rgba(0,0,0,.12)" : "none",
    regTabBg: s.authMode === "register" ? "var(--canvas)" : "transparent",
    regTabFg: s.authMode === "register" ? "var(--primary)" : "var(--ink-tertiary)",
    regTabShadow: s.authMode === "register" ? "0 1px 3px rgba(0,0,0,.12)" : "none",
    setLogin: () => setState({ authMode: "login" }),
    setRegister: () => setState({ authMode: "register" }),
    toggleAuthMode: () => setState((p) => ({ authMode: p.authMode === "login" ? "register" : "login" })),
    authUser: s.authUser, authPass: s.authPass, authName: s.authName,
    onAuthUser: (e: ChangeEvent<HTMLInputElement>) => setState({ authUser: val(e) }),
    onAuthPass: (e: ChangeEvent<HTMLInputElement>) => setState({ authPass: val(e) }),
    onAuthName: (e: ChangeEvent<HTMLInputElement>) => setState({ authName: val(e) }),
    authCta: s.authMode === "login" ? "Log in" : "Create account",
    authSwitchText: s.authMode === "login" ? "New here?" : "Already have an account?",
    authSwitchCta: s.authMode === "login" ? "Create one" : "Log in",
    doAuth: () => api.doAuth(), googleAuth: () => api.googleAuth(),
    onboardChoose: s.onboardStep === "choose", onboardCreate: s.onboardStep === "create", onboardJoin: s.onboardStep === "join",
    authNameOrUser: s.authName.trim() || s.authUser.split("@")[0] || "there",
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
    waitingName: s.profile.name || "there",
    simulateApproval: () => { setState({ account: "approved", screen: "app", tab: "calendar" }); show("🎉 You're approved! Welcome in"); },
    backToAuth: () => setState({ screen: "auth", account: "approved" }),
    // ── admin ──
    isAdmin: s.isCreator,
    pendingRequests: s.joinRequests.map((r) => ({ ...r, onApprove: () => api.approveRequest(r.id), onReject: () => api.rejectRequest(r.id) })),
    pendingCount: s.joinRequests.length, hasPending: s.joinRequests.length > 0, noPending: s.joinRequests.length === 0,
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
    goCalendar: () => setState({ tab: "calendar" }), goTrip: () => setState({ tab: "trip" }),
    goChat: () => setState({ tab: "chat" }), goBoard: () => setState({ tab: "board" }), goGame: () => setState({ tab: "game" }),
    openAdd: () => setState({ sheet: "add", tripEditing: false }), openBowling: () => api.openEvent("bowling"),
    openTrip: () => setState({ tab: "trip", tripView: "detail", selectedTrip: "huahin" }),
    sheetOpen: !!s.sheet, isEventSheet: s.sheet === "event", isAddSheet: s.sheet === "add",
    isGroupsSheet: s.sheet === "groups", isJoinSheet: s.sheet === "join",
    closeSheet: () => setState({ sheet: null, tripEditing: false }),
    group, groupCount: s.groups.length,
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
    meColor: s.profile.color, meGlyph: s.profile.emoji || (s.profile.name.trim()[0] || "?").toUpperCase(),
    meName: s.profile.name, meUsername: "@" + s.profile.username, meEmail: s.profile.email, mePhone: s.profile.phone,
    myQrSaved: s.myQrSaved, myQrUnsaved: !s.myQrSaved, meQrHandle: "081-234-5678",
    saveMyQr: () => { setState({ myQrSaved: true }); show("✅ PromptPay QR saved"); },
    removeMyQr: () => { setState({ myQrSaved: false }); show("QR removed"); },
    avatarBtnRing: tab === "profile" ? "2px solid var(--primary)" : "2px solid transparent",
    editingName: s.editField === "name", editingUsername: s.editField === "username",
    editingNameOff: s.editField !== "name", editingUsernameOff: s.editField !== "username",
    editingPhone: s.editField === "phone", editingPhoneOff: s.editField !== "phone",
    startEditPhone: () => setState({ editField: "phone", editValue: s.profile.phone }),
    editValue: s.editValue,
    onEditInput: (e: ChangeEvent<HTMLInputElement>) => setState({ editValue: val(e) }),
    startEditName: () => setState({ editField: "name", editValue: s.profile.name }),
    startEditUsername: () => setState({ editField: "username", editValue: s.profile.username }),
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
    gsName: group.name, gsEmoji: group.emoji, gsColor: group.color, gsMemberCount: FRIENDS.length,
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
    editingNick: s.gEdit === "nick", editingNickOff: s.gEdit !== "nick", nickname: s.nickname,
    startEditNick: () => setState({ gEdit: "nick", editValue: s.nickname }),
    saveNick: () => api.saveNick(),
    members: FRIENDS.map((f, i) => {
      const me = f.id === "you";
      const votes = s.muteVotes[f.id] || 0;
      const iVoted = s.myMutes.includes(f.id);
      return {
        id: f.id, name: me ? s.nickname + " (you)" : f.name, initial: f.initial, bg: f.bg,
        role: i === 0 ? "You · Admin" : i === 1 ? "Admin" : "Member",
        muteLabel: votes === 1 ? "1 mute vote" : votes + " mute votes", canMute: !me,
        muteBtnBg: iVoted ? "var(--error)" : "var(--surface-raised)", muteBtnFg: iVoted ? "#fff" : "var(--ink-secondary)",
        muteBtnLabel: iVoted ? "Muted" : "Mute", muteBtnIcon: iVoted ? "ph-fill ph-microphone-slash" : "ph ph-microphone-slash",
        onMute: () => api.voteMute(f.id),
      };
    }),
    rules: s.rules.map((r) => ({
      id: r.id, text: r.text, on: r.on,
      track: r.on ? "var(--primary)" : "var(--hairline-strong)", knob: r.on ? "20px" : "0px",
      textColor: r.on ? "var(--ink)" : "var(--ink-tertiary)", onToggle: () => api.toggleRule(r.id),
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
    // ── trip hub ──
    tripIsList: s.tripView === "list", tripIsDetail: s.tripView === "detail",
    tripList: s.trips.map((t) => ({ ...t, onTap: () => setState({ tripView: "detail", selectedTrip: t.id }) })),
    hasTrips: s.trips.length > 0, noTrips: s.trips.length === 0,
    backToTripList: () => setState({ tripView: "list" }),
    tripDetail: s.trips.find((t) => t.id === s.selectedTrip) || s.trips[0]!,
    // trip edit (pencil) — edits the real trip name
    tripEditing: s.tripEditing, tripNameDraft: s.tripNameDraft,
    onTripNameDraft: (e: ChangeEvent<HTMLInputElement>) => setState({ tripNameDraft: val(e) }),
    editTrip: () => api.editTrip(),
    addSheetTitle: s.tripEditing ? "Edit trip" : "New hangout",
    addSheetCta: s.tripEditing ? "Save changes" : "Create & notify gang",
    onAddSubmit: s.tripEditing ? () => api.saveTripEdit() : () => setState({ sheet: null, tripEditing: false }),
    tripGoing: FRIENDS.slice(1, 5).map((f) => ({ initial: f.initial, bg: f.bg })),
    tripAlbum: ALBUM.map((a) => {
      const f = fOf(a.from);
      const h = a.hoursLeft;
      const soon = h <= 6;
      return { key: a.id, tint: a.tint, byInitial: f.initial, byBg: f.bg, expiry: h >= 24 ? Math.round((h / 24) * 10) / 10 + "d left" : h + "h left", expBg: soon ? "rgba(201,42,42,.85)" : "rgba(0,0,0,.6)" };
    }),
    albumCount: ALBUM.length,
    addAlbumPhoto: () => show("📸 Photo added to trip album · expires in 2 days"),
    tripHistory: TRIP_HISTORY.map((t) => ({ key: t.id, name: t.name, emoji: t.emoji, date: t.date, place: t.place, cost: t.cost, joinedCount: t.joined.length, joinedAvatars: t.joined.slice(0, 5).map((id) => ({ key: t.id + id, initial: fOf(id).initial, bg: fOf(id).bg })), onTap: () => show(t.name + " · " + t.date) })),
    tripIsHistory: s.tripView === "history",
    openTripHistory: () => setState({ tripView: "history" }),
    backFromHistory: () => setState({ tripView: "list" }),
    // ── attachment menu ──
    attachMenu: s.attachMenu,
    toggleAttach: () => setState((p) => ({ attachMenu: !p.attachMenu })),
    attachIcon: s.attachMenu ? "ph-bold ph-x" : "ph-bold ph-plus",
    pickCamera: () => { setState({ attachMenu: false }); api.sendPhoto(); },
    pickGif: () => setState({ attachMenu: false, sheet: "gif" }),
    pickLocation: () => { setState({ attachMenu: false }); api.sendLocation(); },
    pickPoll: () => setState({ attachMenu: false, sheet: "poll", pollQ: "", pollOpts: ["", ""] }),
    isCreator: s.isCreator, billSplitEnabled: s.billSplitEnabled, billSplitDisabled: !s.billSplitEnabled,
    toggleBillSplit: () => setState((p) => ({ billSplitEnabled: !p.billSplitEnabled })),
    billTrack: s.billSplitEnabled ? "var(--primary)" : "var(--hairline-strong)", billKnob: s.billSplitEnabled ? "20px" : "0px",
    blindVote: s.blindVote, blindVoteOn: s.blindVote,
    toggleBlindVote: () => setState((p) => ({ blindVote: !p.blindVote })),
    blindTrack: s.blindVote ? "var(--primary)" : "var(--hairline-strong)", blindKnob: s.blindVote ? "20px" : "0px",
    treasurerChoices: FRIENDS.map((f) => ({
      id: f.id, name: (() => { const n = f.id === "you" ? "You" : f.name; return n.length > 5 ? n.slice(0, 5) + "**" : n; })(), initial: f.initial, color: f.bg, sel: f.id === s.treasurer,
      bg: f.id === s.treasurer ? "var(--primary-surface)" : "var(--canvas)",
      border: f.id === s.treasurer ? "1.5px solid var(--primary)" : "1px solid var(--hairline)",
      fg: f.id === s.treasurer ? "var(--primary)" : "var(--ink)",
      onPick: () => setState({ treasurer: f.id }),
    })),
    billTotal: "3,600", billShare: "600",
    billCollector: treasurerF.id === "you" ? "You" : treasurerF.name,
    billCollectorHandle: "PromptPay · " + treasurerF.handle,
    treasurerInitial: treasurerF.initial, treasurerColor: treasurerF.bg,
    treasurerHasQR, treasurerNoQR: !treasurerHasQR, qrSeedRows: qrSeed,
    billPaid: s.billPaid, billSlipUploaded: s.billSlipUploaded,
    confirmPay: () => setState({ billPaid: true }), uploadSlip: () => setState({ billSlipUploaded: true }),
    payBtnLabel: s.billPaid ? "Payment confirmed" : "Confirm payment",
    payBtnBg: s.billPaid ? "var(--profit)" : "var(--primary)",
    payBtnIcon: s.billPaid ? "ph-fill ph-check-circle" : "ph-fill ph-check",
    slipLabel: s.billSlipUploaded ? "Slip attached ✓" : "Attach slip (optional)",
    // ── games ──
    gameIsDice: s.gameMode === "dice", gameIsCard: s.gameMode === "card", gameIsWheel: s.gameMode === "wheel",
    setDiceMode: () => setState({ gameMode: "dice" }), setCardMode: () => setState({ gameMode: "card" }), setWheelMode: () => setState({ gameMode: "wheel" }),
    wheelModeBg: s.gameMode === "wheel" ? "var(--canvas)" : "transparent", wheelModeFg: s.gameMode === "wheel" ? "var(--primary)" : "var(--ink-tertiary)", wheelModeShadow: s.gameMode === "wheel" ? "0 1px 3px rgba(0,0,0,.12)" : "none",
    wheelGradient, wheelSegments, wheelAngle: s.wheelAngle, wheelSpinning: s.wheelSpinning,
    wheelTransition: s.wheelSpinning ? "transform 3.4s cubic-bezier(.17,.67,.16,.99)" : "none",
    wheelResult: s.wheelResult, hasWheelResult: !!s.wheelResult && !s.wheelSpinning,
    spinWheel: () => api.spinWheel(),
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
    mutedMembers: s.mutedIds.map((id) => ({ key: id, initial: fOf(id).initial, bg: fOf(id).bg, name: id === "you" ? s.nickname : fOf(id).name })),
    hasMuted: s.mutedIds.length > 0,
    mutedSummary: (() => { const ns = s.mutedIds.map((id) => (id === "you" ? s.nickname : fOf(id).name)); if (ns.length === 0) return ""; if (ns.length === 1) return ns[0] + " is muted"; if (ns.length === 2) return ns[0] + " & " + ns[1] + " are muted"; return ns[0] + " & " + (ns.length - 1) + " others are muted"; })(),
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
    gifGrid: GIFS.map((g) => ({ id: g.id, label: g.label, c1: g.c1, c2: g.c2, onTap: () => api.sendGif(g) })),
    peekX: s.peekX, peekTransition: s.dragging ? "none" : "transform .26s cubic-bezier(.16,1,.3,1)",
    onMsgPointerDown: (e: PointerEvent) => api.msgPointerDown(e),
    onMsgPointerMove: (e: PointerEvent) => api.msgPointerMove(e),
    onMsgPointerUp: (e: PointerEvent) => api.msgPointerUp(e),
    hasPinned: !!pinnedMsg, pinnedText, unpin: () => setState({ pinnedId: null }),
    isReplying: !!replyMsg, replyingName, replyingText, cancelReply: () => setState({ replyToId: null }),
    isMsgMenu: !!s.msgMenu, menuMine, menuText,
    closeMsgMenu: () => setState({ msgMenu: null }),
    menuReply: () => api.menuAction("reply"), menuPin: () => api.menuAction("pin"), menuCopy: () => api.menuAction("copy"),
    menuEdit: () => api.menuAction("edit"), menuDelete: () => api.menuAction("delete"),
    menuPinLabel: menuMsg && menuMsg.id === s.pinnedId ? "Unpin" : "Pin",
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
