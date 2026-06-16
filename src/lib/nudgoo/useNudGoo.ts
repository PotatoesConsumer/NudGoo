"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

import { CARDS, CYCLE, FRIENDS, INITIAL_STATE, SM } from "./data";
import type { ChatMsg, State } from "./types";
import { buildViewModel, type NudGooApi, type VM } from "./viewModel";

const pad = (n: number) => String(n).padStart(2, "0");

export function useNudGoo(): { state: State; vm: VM } {
  const [state, setStateRaw] = useState<State>(INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  const setState = useCallback(
    (u: Partial<State> | ((p: State) => Partial<State>)) => {
      setStateRaw((p) => ({ ...p, ...(typeof u === "function" ? u(p) : u) }));
    },
    [],
  );

  // instance refs (mirror the design's `this._*`)
  const t0 = useRef<number | null>(null);
  const msgEl = useRef<HTMLDivElement | null>(null);
  const inpEl = useRef<HTMLInputElement | null>(null);
  const evId = useRef<string>("bowling");
  const stick = useRef(false);
  const lpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ruleHoldTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sx = useRef<number | null>(null);
  const sy = useRef<number | null>(null);

  const show = useCallback(
    (msg: string) => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setState({ toast: msg });
      toastTimer.current = setTimeout(() => setState({ toast: null }), 1900);
    },
    [setState],
  );

  // clock for ephemeral-photo countdowns
  useEffect(() => {
    t0.current = Date.now();
    setState({ now: Date.now() });
    const iv = setInterval(() => setState({ now: Date.now() }), 1000);
    return () => {
      clearInterval(iv);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [setState]);

  // keep the latest message in view after a new one is pushed
  useEffect(() => {
    if (stick.current && msgEl.current) {
      msgEl.current.scrollTop = msgEl.current.scrollHeight;
      stick.current = false;
    }
  }, [state.msgs]);

  const nowTime = () => {
    const d = new Date();
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  };

  const pushMsg = useCallback(
    (extra: Partial<ChatMsg> & { type: ChatMsg["type"] }) => {
      stick.current = true;
      setState((p) => {
        const replyTo = p.replyToId;
        const msg: ChatMsg = {
          id: Date.now(),
          from: "you",
          time: nowTime(),
          ...(replyTo ? { replyTo } : {}),
          ...extra,
        };
        return {
          msgs: [...p.msgs, msg],
          replyToId: null,
          draft: extra.type === "text" ? "" : p.draft,
        };
      });
    },
    [setState],
  );

  const react = useCallback(
    (msgId: number, emoji: string) => {
      setState((p) => ({
        msgs: p.msgs.map((m) => {
          if (m.id !== msgId) return m;
          const rx: Record<string, string[]> = { ...(m.reactions || {}) };
          const arr = [...(rx[emoji] || [])];
          const i = arr.indexOf("you");
          if (i >= 0) arr.splice(i, 1);
          else arr.push("you");
          if (arr.length) rx[emoji] = arr;
          else delete rx[emoji];
          return { ...m, reactions: rx };
        }),
      }));
    },
    [setState],
  );

  const voteMute = useCallback(
    (id: string) => {
      const had = stateRef.current.myMutes.includes(id);
      setState((p) => {
        const has = p.myMutes.includes(id);
        const votes = { ...p.muteVotes, [id]: Math.max(0, (p.muteVotes[id] || 0) + (has ? -1 : 1)) };
        return { myMutes: has ? p.myMutes.filter((x) => x !== id) : [...p.myMutes, id], muteVotes: votes };
      });
      const f = FRIENDS.find((x) => x.id === id);
      show(had ? `Removed mute vote for ${f?.name}` : `🔇 Voted to mute ${f?.name}`);
    },
    [setState, show],
  );

  const api: NudGooApi = {
    setState,
    show,
    t0: t0.current,
    evId: evId.current,
    setMsgRef: (el) => {
      msgEl.current = el;
    },
    setInpRef: (el) => {
      inpEl.current = el;
    },
    openEvent: (id) => {
      evId.current = id;
      setState({ sheet: "event" });
    },
    doAuth: () => {
      if (stateRef.current.authMode === "register") setState({ screen: "waiting", account: "pending" });
      else setState({ screen: "onboard", onboardStep: "choose", account: "approved" });
    },
    googleAuth: () =>
      setState({ screen: "onboard", onboardStep: "choose", account: "approved", authUser: stateRef.current.authUser || "you@gmail.com" }),
    doCreateGroup: () => {
      const name = stateRef.current.newGroupName.trim();
      if (name.length < 2) return;
      const id = "g" + Date.now();
      const emoji = stateRef.current.newGroupEmoji;
      setState((p) => ({
        groups: [{ id, name, emoji: p.newGroupEmoji, color: "#3B5BDB", members: 1, unread: 0 }, ...p.groups],
        activeGroup: id, screen: "app", tab: "calendar", account: "approved", newGroupName: "",
      }));
      show(`Created ${name} ${emoji}`);
    },
    doOnbJoin: () => {
      if (stateRef.current.joinCode.trim().length < 4) return;
      setState({ screen: "waiting", account: "pending", joinCode: "" });
    },
    approveRequest: (id) => {
      const r = stateRef.current.joinRequests.find((x) => x.id === id);
      setState((p) => ({ joinRequests: p.joinRequests.filter((x) => x.id !== id) }));
      if (r) show(`✅ Approved ${r.name}`);
    },
    rejectRequest: (id) => {
      const r = stateRef.current.joinRequests.find((x) => x.id === id);
      setState((p) => ({ joinRequests: p.joinRequests.filter((x) => x.id !== id) }));
      if (r) show(`Rejected ${r.name}`);
    },
    switchGroup: (id) => {
      const g = stateRef.current.groups.find((x) => x.id === id);
      setState({ activeGroup: id, sheet: null, tab: "calendar" });
      if (g) show(`Switched to ${g.name} ${g.emoji}`);
    },
    doJoin: () => {
      if (stateRef.current.joinCode.trim().length < 4) return;
      setState({ sheet: null, joinCode: "" });
      show("🎉 Joined! Ask the gang to confirm you");
    },
    saveEdit: () => {
      const f = stateRef.current.editField;
      let v = stateRef.current.editValue.trim();
      if (!f || !v) {
        setState({ editField: null });
        return;
      }
      if (f === "username") v = v.replace(/^@/, "").replace(/\s+/g, "_").toLowerCase();
      setState((p) => ({ profile: { ...p.profile, [f]: v }, editField: null }));
      show(f === "name" ? "Name updated" : f === "username" ? "Username updated" : "Phone number updated");
    },
    savePw: () => {
      const { cur, next, confirm } = stateRef.current.pw;
      if (!(cur && next.length >= 6 && next === confirm)) return;
      setState({ sheet: null, pw: { cur: "", next: "", confirm: "" } });
      show("🔒 Password changed");
    },
    setGroupField: (field, val) => {
      setState((p) => ({ groups: p.groups.map((g) => (g.id === p.activeGroup ? { ...g, [field]: val } : g)) }));
    },
    saveGName: () => {
      const v = stateRef.current.editValue.trim();
      if (!v) {
        setState({ gEdit: null });
        return;
      }
      setState((p) => ({ groups: p.groups.map((g) => (g.id === p.activeGroup ? { ...g, name: v } : g)), gEdit: null }));
      show("Group name updated");
    },
    saveNick: () => {
      const v = stateRef.current.editValue.trim() || stateRef.current.nickname;
      setState({ nickname: v, gEdit: null });
      show("Nickname updated");
    },
    voteMute,
    toggleRule: (id) => setState((p) => ({ rules: p.rules.map((r) => (r.id === id ? { ...r, on: !r.on } : r)) })),
    castVote: (id) => {
      const labels: Record<string, string> = { sat20: "This Saturday", sun28: "Next Sunday", fri26: "Fri after work" };
      const cancel = stateRef.current.myVote === id;
      setState({ myVote: cancel ? null : id });
      show(cancel ? "Vote cancelled" : `You voted: ${labels[id]}`);
    },
    cycle: (id) => {
      const cur = stateRef.current.rsvp[id] ?? "pending";
      const next = CYCLE[(CYCLE.indexOf(cur) + 1) % 3]!;
      setState((p) => ({ rsvp: { ...p.rsvp, [id]: next } }));
      const f = FRIENDS.find((x) => x.id === id);
      show(`${f?.name === "You" ? "You" : f?.name} → ${SM[next].label}`);
    },
    sendPhoto: () => {
      pushMsg({ type: "photo", dur: 86400, _t0: Date.now(), tint: "#6741D9" });
      show("📸 Photo sent · self-destructs in 24h");
    },
    sendLocation: () => {
      setState({ sheet: null });
      pushMsg({ type: "location", place: "Current location", addr: "Pinned on the map", url: "https://maps.google.com/?q=current" });
      show("📍 Location shared");
    },
    sendGif: (g) => {
      setState({ sheet: null });
      pushMsg({ type: "gif", label: g.label, c1: g.c1, c2: g.c2 });
    },
    rollDice: () => {
      if (stateRef.current.rolling) return;
      setState({ rolling: true });
      if (rollTimer.current) clearTimeout(rollTimer.current);
      rollTimer.current = setTimeout(() => {
        const d1 = 1 + Math.floor(Math.random() * 6);
        const d2 = 1 + Math.floor(Math.random() * 6);
        setState({ dice1: d1, dice2: d2, rolling: false });
        show(`🎲 You rolled ${d1 + d2}!`);
      }, 500);
    },
    drawCard: () => {
      const c = CARDS[Math.floor(Math.random() * CARDS.length)]!;
      setState({ drawnCard: c });
      show(`🃏 Drew: ${c.label}`);
    },
    toggleChatMute: () => {
      const muted = stateRef.current.chatMuted;
      setState({ chatMuted: !muted });
      show(muted ? "🔔 Chat unmuted" : "🔕 Chat muted");
    },
    sendText: () => {
      const t = stateRef.current.draft.trim();
      if (!t) return;
      pushMsg({ type: "text", text: t });
    },
    setPollOpt: (i, v) => setState((p) => { const o = [...p.pollOpts]; o[i] = v; return { pollOpts: o }; }),
    removePollOpt: (i) => setState((p) => ({ pollOpts: p.pollOpts.filter((_, idx) => idx !== i) })),
    sendPoll: () => {
      const qq = stateRef.current.pollQ.trim();
      const opts = stateRef.current.pollOpts.map((o) => o.trim()).filter(Boolean);
      if (!qq || opts.length < 2) return;
      setState({ sheet: null });
      pushMsg({ type: "poll", question: qq, options: opts.map((t) => ({ t, v: [] })) });
      show("📊 Poll posted");
    },
    react,
    reactFromMenu: (emoji) => {
      const id = stateRef.current.msgMenu;
      setState({ msgMenu: null });
      if (id) react(id, emoji);
    },
    votePoll: (msgId, optIdx) => {
      setState((p) => ({
        msgs: p.msgs.map((m) => {
          if (m.id !== msgId || m.type !== "poll" || !m.options) return m;
          const options = m.options.map((op, idx) => {
            const v = op.v.filter((x) => x !== "you");
            if (idx === optIdx && !op.v.includes("you")) v.push("you");
            return { ...op, v };
          });
          return { ...m, options };
        }),
      }));
    },
    startLongPress: (id) => {
      if (lpTimer.current) clearTimeout(lpTimer.current);
      lpTimer.current = setTimeout(() => {
        setState({ msgMenu: id });
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
      }, 420);
    },
    cancelLongPress: () => {
      if (lpTimer.current) {
        clearTimeout(lpTimer.current);
        lpTimer.current = null;
      }
    },
    menuAction: (action) => {
      const id = stateRef.current.msgMenu;
      const m = stateRef.current.msgs.find((x) => x.id === id);
      if (!m) {
        setState({ msgMenu: null });
        return;
      }
      if (action === "reply") setState({ replyToId: id, msgMenu: null });
      else if (action === "pin") {
        const wasPinned = stateRef.current.pinnedId === id;
        setState((p) => ({ pinnedId: p.pinnedId === id ? null : id, msgMenu: null }));
        show(wasPinned ? "Unpinned" : "📌 Pinned message");
      } else if (action === "copy") {
        setState({ msgMenu: null });
        show("Copied to clipboard");
      } else if (action === "edit") setState({ editMsgId: id, editMsgText: m.text || "", msgMenu: null });
      else if (action === "delete") {
        setState((p) => ({ msgs: p.msgs.filter((x) => x.id !== id), msgMenu: null, pinnedId: p.pinnedId === id ? null : p.pinnedId }));
        show("Message deleted");
      }
    },
    saveEditMsg: () => {
      const t = stateRef.current.editMsgText.trim();
      const id = stateRef.current.editMsgId;
      if (!t) {
        setState({ editMsgId: null });
        return;
      }
      setState((p) => ({ msgs: p.msgs.map((m) => (m.id === id ? { ...m, text: t, edited: true } : m)), editMsgId: null, editMsgText: "" }));
      show("Message edited");
    },
    openProfilePopup: (id) => {
      if (lpTimer.current) clearTimeout(lpTimer.current);
      setState({ profilePopup: id });
    },
    mentionInChat: () => {
      const id = stateRef.current.profilePopup;
      const f = FRIENDS.find((x) => x.id === id);
      if (!f) return;
      setState((p) => ({ draft: (p.draft ? p.draft.replace(/\s*$/, " ") : "") + "@" + f.name + " ", profilePopup: null }));
      show(`Mentioning ${f.name}`);
      if (inpEl.current) inpEl.current.focus();
    },
    msgPointerDown: (e: PointerEvent) => {
      sx.current = e.clientX;
      sy.current = e.clientY;
      setState({ dragging: true });
    },
    msgPointerMove: (e: PointerEvent) => {
      if (sx.current == null || sy.current == null) return;
      const dx = e.clientX - sx.current;
      const dy = e.clientY - sy.current;
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (dx < 0) setState({ peekX: Math.max(dx, -64) });
    },
    msgPointerUp: () => {
      sx.current = null;
      setState({ dragging: false, peekX: 0 });
    },
    spinWheel: () => {
      if (stateRef.current.wheelSpinning) return;
      const turns = 1440 + Math.floor(Math.random() * 360);
      setState((p) => ({ wheelSpinning: true, wheelResult: null, wheelAngle: p.wheelAngle + turns }));
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => {
        const angle = stateRef.current.wheelAngle;
        const pos = (360 - (angle % 360)) % 360;
        const idx = Math.floor(pos / 60) % FRIENDS.length;
        const f = FRIENDS[idx]!;
        setState({ wheelSpinning: false, wheelResult: f.name });
        show(`🎡 The wheel picked ${f.name}!`);
      }, 3500);
    },
    editTrip: () => {
      const id = stateRef.current.selectedTrip;
      const t = stateRef.current.trips.find((x) => x.id === id) ?? stateRef.current.trips[0];
      setState({ sheet: "add", tripEditing: true, tripNameDraft: t ? t.name : "" });
    },
    saveTripEdit: () => {
      const name = stateRef.current.tripNameDraft.trim();
      const id = stateRef.current.selectedTrip;
      if (name) {
        setState((p) => ({ trips: p.trips.map((t) => (t.id === id ? { ...t, name } : t)), sheet: null, tripEditing: false }));
        show("Trip updated");
      } else {
        setState({ sheet: null, tripEditing: false });
      }
    },
    startAddRule: () => setState({ addingRule: true, newRule: "" }),
    commitRule: () => {
      const t = stateRef.current.newRule.trim();
      if (!t) {
        setState({ addingRule: false, newRule: "" });
        return;
      }
      setState((p) => ({ rules: [...p.rules, { id: "r" + Date.now(), text: t, on: true }], addingRule: false, newRule: "" }));
      show("Rule added");
    },
    holdRuleStart: (id) => {
      if (ruleHoldTimer.current) clearTimeout(ruleHoldTimer.current);
      ruleHoldTimer.current = setTimeout(() => {
        setState((p) => ({ rules: p.rules.filter((r) => r.id !== id) }));
        show("Rule removed");
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(12);
      }, 550);
    },
    holdRuleEnd: () => {
      if (ruleHoldTimer.current) {
        clearTimeout(ruleHoldTimer.current);
        ruleHoldTimer.current = null;
      }
    },
    logout: () => {
      setState({ screen: "auth", authMode: "login", account: "approved", sheet: null, tab: "calendar", authUser: "", authPass: "", authName: "" });
    },
    leaveGroup: () => {
      const cur = stateRef.current.activeGroup;
      const rest = stateRef.current.groups.filter((g) => g.id !== cur);
      const left = stateRef.current.groups.find((g) => g.id === cur);
      if (rest.length) {
        setState({ groups: rest, activeGroup: rest[0]!.id, tab: "calendar", sheet: null });
        show(`Left ${left ? left.name : "group"}`);
      } else {
        setState({ screen: "onboard", onboardStep: "choose", sheet: null });
      }
    },
    createNewGroup: () => {
      setState({ screen: "onboard", onboardStep: "create", sheet: null, newGroupName: "", newGroupEmoji: "🎉" });
    },
  };

  return { state, vm: buildViewModel(state, api) };
}
