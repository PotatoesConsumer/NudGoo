"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

import { CARDS, CYCLE, FRIENDS, INITIAL_STATE, SM } from "./data";
import type { State } from "./types";
import { useAuth } from "./useAuth";
import { useChat } from "./useChat";
import { useGroupData } from "./useGroupData";
import { buildViewModel, type NudGooApi, type VM } from "./viewModel";

export function useNudGoo(): { state: State; vm: VM } {
  const auth = useAuth();
  const approved = auth.profile?.status === "approved";
  const userId = auth.session?.user.id ?? null;
  const group = useGroupData(approved, userId);
  const chat = useChat(approved, userId);
  const [state, setStateRaw] = useState<State>(INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  const authRef = useRef(auth);
  authRef.current = auth;
  const groupRef = useRef(group);
  groupRef.current = group;
  const chatRef = useRef(chat);
  chatRef.current = chat;

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

  // ── Drive the screen from real auth state ──────────────────────────────────
  // We only force a screen change when the auth "signature" changes (sign in /
  // out, membership status, or whether the group has a founder yet) so the user
  // can still navigate freely within a given state (e.g. onboard ↔ waiting).
  const authSigRef = useRef<string>("");
  useEffect(() => {
    if (!auth.ready) return;
    const sig = !auth.session
      ? "out"
      : !auth.profile
        ? "loading"
        : `${auth.profile.status}:${auth.profile.status === "pending" ? auth.groupClaimed : ""}`;
    if (sig === authSigRef.current) return;
    authSigRef.current = sig;

    if (!auth.session) {
      setState({ screen: "auth", account: "approved", authUser: "", authPass: "", authName: "" });
      return;
    }
    if (!auth.profile) return; // session present, profile still loading

    const st = auth.profile.status;
    if (st === "approved") {
      setState({ screen: "app", account: "approved", tab: "calendar", sheet: null });
    } else if (st === "rejected") {
      setState({ screen: "waiting", account: "rejected" });
    } else if (auth.groupClaimed === false) {
      setState({ screen: "onboard", account: "pending", onboardStep: "choose" });
    } else {
      setState({ screen: "waiting", account: "pending" });
    }
  }, [auth.ready, auth.session, auth.profile, auth.groupClaimed, setState]);

  // ── Persist UI preferences (theme + language) across sessions ──────────────
  useEffect(() => {
    try {
      const t = localStorage.getItem("ng_theme");
      const l = localStorage.getItem("ng_lang");
      const patch: Partial<State> = {};
      if (t === "light" || t === "dark") patch.theme = t;
      if (l === "en" || l === "th") patch.lang = l;
      if (Object.keys(patch).length) setState(patch);
    } catch {
      // localStorage unavailable (SSR / privacy mode) — fall back to defaults.
    }
  }, [setState]);

  useEffect(() => {
    try {
      localStorage.setItem("ng_theme", state.theme);
    } catch {
      /* ignore */
    }
  }, [state.theme]);

  useEffect(() => {
    try {
      localStorage.setItem("ng_lang", state.lang);
    } catch {
      /* ignore */
    }
  }, [state.lang]);

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

  // keep the latest message in view after a new one arrives
  useEffect(() => {
    if (msgEl.current) {
      msgEl.current.scrollTop = msgEl.current.scrollHeight;
    }
  }, [chat.messages.length]);

  const react = useCallback((msgId: string, emoji: string) => {
    void chatRef.current.react(msgId, emoji);
  }, []);

  const voteMute = useCallback(
    (id: string) => {
      const uid = authRef.current.session?.user.id;
      const member = authRef.current.members.find((m) => m.id === id);
      const had = groupRef.current.muteVotes.some((mv) => mv.target_id === id && mv.voter_id === uid);
      void groupRef.current.toggleMute(id);
      const name = member?.display_name ?? "member";
      show(had ? `Removed mute vote for ${name}` : `🔇 Voted to mute ${name}`);
    },
    [show],
  );

  const api: NudGooApi = {
    auth,
    group,
    chat,
    setState,
    show,
    createHangout: () => {
      const h = stateRef.current.hangout;
      const title = h.title.trim();
      if (title.length < 2) {
        show("Give your hangout a name first");
        return;
      }
      void groupRef.current
        .createTrip({
          title,
          destination: h.dest.trim(),
          emoji: h.emoji || "🗺️",
          startDate: h.date.trim() || null,
          notes: h.notes.trim() || null,
          transport: h.transport.trim() || null,
        })
        .then((id) => {
          if (id) {
            setState({
              sheet: null,
              tab: "trip",
              tripView: "detail",
              selectedTrip: id,
              hangout: { title: "", dest: "", date: "", notes: "", emoji: "🗺️", transport: "" },
            });
            show("🎉 Hangout created");
          } else {
            show("Couldn't create hangout");
          }
        });
    },
    updateHangout: () => {
      const h = stateRef.current.hangout;
      const id = stateRef.current.selectedTrip;
      const title = h.title.trim();
      if (!id || title.length < 2) {
        show("Give your hangout a name first");
        return;
      }
      void groupRef.current.updateTrip(id, {
        title,
        destination: h.dest.trim(),
        emoji: h.emoji || "🗺️",
        startDate: h.date.trim() || null,
        notes: h.notes.trim() || null,
        transport: h.transport.trim() || null,
      });
      setState({ sheet: null, tripEditing: false });
      show("Hangout updated");
    },
    setTripRsvp: (rsvp) => {
      const id = stateRef.current.selectedTrip;
      if (id) void groupRef.current.setRsvp(id, rsvp);
    },
    submitDateOption: () => {
      const id = stateRef.current.selectedTrip;
      const label = stateRef.current.dateOptLabel.trim();
      if (!id || !label) return;
      void groupRef.current.addDateOption(id, label, stateRef.current.dateOptDate.trim() || null);
      setState({ dateOptLabel: "", dateOptDate: "" });
      show("Date option added");
    },
    toggleBill: () => {
      const t = groupRef.current.trips.find((x) => x.id === stateRef.current.selectedTrip);
      if (!t) return;
      void groupRef.current.setBill(t.id, { enabled: !t.bill_split_enabled, total: t.total_amount, treasurerId: t.treasurer_id });
    },
    setTreasurer: (uid) => {
      const t = groupRef.current.trips.find((x) => x.id === stateRef.current.selectedTrip);
      if (!t) return;
      void groupRef.current.setBill(t.id, { enabled: true, total: t.total_amount, treasurerId: uid });
    },
    saveBillTotal: () => {
      const t = groupRef.current.trips.find((x) => x.id === stateRef.current.selectedTrip);
      if (!t) return;
      const amt = parseInt(stateRef.current.billTotalDraft.replace(/[^0-9]/g, ""), 10);
      void groupRef.current.setBill(t.id, { enabled: true, total: Number.isFinite(amt) ? amt : null, treasurerId: t.treasurer_id });
      setState({ billTotalDraft: "" });
      show("Bill amount set");
    },
    toggleBillPaid: () => {
      const id = stateRef.current.selectedTrip;
      if (!id) return;
      const uid = authRef.current.session?.user.id;
      const paid = groupRef.current.billPayments.find((b) => b.trip_id === id && b.user_id === uid)?.paid ?? false;
      void groupRef.current.setBillPaid(id, !paid);
    },
    addAlbumPhoto: (file) => {
      const id = stateRef.current.selectedTrip;
      if (!id) return;
      show("📸 Uploading photo…");
      void groupRef.current.addTripPhoto(id, file);
    },
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
      const { authMode, authUser, authPass, authName } = stateRef.current;
      const email = authUser.trim();
      const password = authPass;
      if (!email || !password) return;
      if (authMode === "register") void authRef.current.signUpEmail(email, password, authName.trim());
      else void authRef.current.signInEmail(email, password);
    },
    googleAuth: () => void authRef.current.signInGoogle(),
    doCreateGroup: () => {
      const name = stateRef.current.newGroupName.trim();
      if (name.length < 2) return;
      const emoji = stateRef.current.newGroupEmoji;
      // Name/emoji are local chrome; membership is claimed server-side.
      setState((p) => ({
        groups: p.groups.map((g) => (g.id === p.activeGroup ? { ...g, name, emoji } : g)),
        newGroupName: "",
      }));
      void authRef.current.claimGroup();
      show(`Created ${name} ${emoji}`);
    },
    doOnbJoin: () => {
      const code = stateRef.current.joinCode.trim();
      if (code.length < 4) return;
      // Verify the invite code, then become a pending member awaiting approval.
      void authRef.current.validateJoinCode(code).then((ok) => {
        if (ok) {
          setState({ screen: "waiting", account: "pending", joinCode: "" });
          show("🎉 Request sent — waiting for an admin to approve you");
        } else {
          show("Invalid invite code");
        }
      });
    },
    approveRequest: (id) => {
      void authRef.current.approveMember(id);
      show("✅ Member approved");
    },
    rejectRequest: (id) => {
      void authRef.current.rejectMember(id);
      show("Request rejected");
    },
    switchGroup: (id) => {
      const g = stateRef.current.groups.find((x) => x.id === id);
      setState({ activeGroup: id, sheet: null, tab: "calendar" });
      if (g) show(`Switched to ${g.name} ${g.emoji}`);
    },
    doJoin: () => {
      const code = stateRef.current.joinCode.trim();
      if (code.length < 4) return;
      void authRef.current.validateJoinCode(code).then((ok) => {
        if (ok) {
          setState({ sheet: null, joinCode: "" });
          show("🎉 Code accepted! Ask an admin to approve you");
        } else {
          show("Invalid invite code");
        }
      });
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
      // persist to DB
      if (f === "name") void authRef.current.updateDisplayName(v);
      else if (f === "username") void authRef.current.updateProfileFields({ username: v });
      else if (f === "phone") void authRef.current.updateProfileFields({ phone: v });
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
      void authRef.current.updateProfileFields({ nickname: v });
      show("Nickname updated");
    },
    voteMute,
    toggleRule: (id) => {
      const r = groupRef.current.rules.find((x) => x.id === id);
      if (r) void groupRef.current.setRuleEnabled(id, !r.enabled);
    },
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
    sendPhotoFile: (file) => {
      setState({ attachMenu: false });
      show("📸 Uploading photo…");
      void chatRef.current.sendPhotoFile(file);
    },
    sendGifFile: (file) => {
      setState({ attachMenu: false, sheet: null });
      show("🖼️ Uploading…");
      void chatRef.current.sendGifFile(file);
    },
    sendGifUrl: (url, label) => {
      setState({ sheet: null });
      void chatRef.current.sendGifUrl(url, label);
    },
    sendLocation: () => {
      setState({ sheet: null, attachMenu: false });
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        show("Location isn't supported on this device");
        return;
      }
      show("📍 Getting your location…");
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const url = `https://maps.google.com/?q=${lat},${lng}`;
          void chatRef.current.sendLocation("My location", `${lat.toFixed(5)}, ${lng.toFixed(5)}`, url);
        },
        () => show("Couldn't get your location — check permissions"),
        { enableHighAccuracy: true, timeout: 10000 },
      );
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
      const replyTo = stateRef.current.replyToId;
      setState({ draft: "", replyToId: null });
      void chatRef.current.sendText(t, replyTo);
    },
    setPollOpt: (i, v) => setState((p) => { const o = [...p.pollOpts]; o[i] = v; return { pollOpts: o }; }),
    removePollOpt: (i) => setState((p) => ({ pollOpts: p.pollOpts.filter((_, idx) => idx !== i) })),
    sendPoll: () => {
      const qq = stateRef.current.pollQ.trim();
      const opts = stateRef.current.pollOpts.map((o) => o.trim()).filter(Boolean);
      if (!qq || opts.length < 2) return;
      setState({ sheet: null, pollQ: "", pollOpts: ["", ""] });
      void chatRef.current.sendPoll(qq, opts);
      show("📊 Poll posted");
    },
    react,
    reactFromMenu: (emoji) => {
      const id = stateRef.current.msgMenu;
      setState({ msgMenu: null });
      if (id) react(id, emoji);
    },
    votePoll: (_msgId, optionId) => {
      void chatRef.current.votePoll(_msgId, optionId);
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
      const m = chatRef.current.messages.find((x) => x.id === id);
      if (!m || !id) {
        setState({ msgMenu: null });
        return;
      }
      if (action === "reply") setState({ replyToId: id, msgMenu: null });
      else if (action === "pin") {
        const wasPinned = !!m.pinned;
        void chatRef.current.togglePin(id);
        setState({ msgMenu: null });
        show(wasPinned ? "Unpinned" : "📌 Pinned message");
      } else if (action === "copy") {
        if (typeof navigator !== "undefined" && navigator.clipboard && m.text) void navigator.clipboard.writeText(m.text);
        setState({ msgMenu: null });
        show("Copied to clipboard");
      } else if (action === "edit") setState({ editMsgId: id, editMsgText: m.text || "", msgMenu: null });
      else if (action === "delete") {
        void chatRef.current.deleteMessage(id);
        setState({ msgMenu: null });
        show("Message deleted");
      }
    },
    saveEditMsg: () => {
      const t = stateRef.current.editMsgText.trim();
      const id = stateRef.current.editMsgId;
      if (!t || !id) {
        setState({ editMsgId: null });
        return;
      }
      void chatRef.current.editMessage(id, t);
      setState({ editMsgId: null, editMsgText: "" });
      show("Message edited");
    },
    openProfilePopup: (id) => {
      if (lpTimer.current) clearTimeout(lpTimer.current);
      setState({ profilePopup: id });
    },
    mentionInChat: () => {
      const id = stateRef.current.profilePopup;
      const member = authRef.current.members.find((x) => x.id === id);
      const name = member?.display_name;
      if (!name) return;
      setState((p) => ({ draft: (p.draft ? p.draft.replace(/\s*$/, " ") : "") + "@" + name + " ", profilePopup: null }));
      show(`Mentioning ${name}`);
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
      if (stateRef.current.wheelOptions.map((o) => o.trim()).filter(Boolean).length < 2) {
        show("Add at least 2 options to spin");
        return;
      }
      const turns = 1440 + Math.floor(Math.random() * 360);
      setState((p) => ({ wheelSpinning: true, wheelResult: null, wheelAngle: p.wheelAngle + turns }));
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => {
        const items = stateRef.current.wheelOptions.map((o) => o.trim()).filter(Boolean);
        if (items.length < 2) {
          setState({ wheelSpinning: false });
          return;
        }
        const angle = stateRef.current.wheelAngle;
        const pos = (360 - (angle % 360)) % 360;
        const seg = 360 / items.length;
        const idx = Math.floor(pos / seg) % items.length;
        const pick = items[idx]!;
        setState({ wheelSpinning: false, wheelResult: pick });
        show(`🎡 The wheel picked ${pick}!`);
      }, 3500);
    },
    setWheelOption: (i, val) => setState((p) => { const o = [...p.wheelOptions]; o[i] = val; return { wheelOptions: o }; }),
    removeWheelOption: (i) => setState((p) => ({ wheelOptions: p.wheelOptions.filter((_, idx) => idx !== i) })),
    addWheelOption: () => setState((p) => ({ wheelOptions: [...p.wheelOptions, ""] })),
    addEveryoneToWheel: () => {
      const names = authRef.current.members.map((m) => m.display_name);
      setState((p) => {
        const existing = new Set(p.wheelOptions.map((o) => o.trim()));
        const toAdd = names.filter((n) => !existing.has(n));
        const kept = p.wheelOptions.filter((o) => o.trim());
        return { wheelOptions: [...kept, ...toAdd] };
      });
      show("Added everyone in the group");
    },
    editTrip: () => {
      const id = stateRef.current.selectedTrip;
      const t = groupRef.current.trips.find((x) => x.id === id);
      if (!t) return;
      setState({
        sheet: "add",
        tripEditing: true,
        hangout: {
          title: t.title,
          dest: t.destination === "TBD" ? "" : t.destination,
          date: t.start_date || "",
          notes: t.notes || "",
          emoji: t.emoji || "🗺️",
          transport: t.transport || "",
        },
      });
    },
    saveTripEdit: () => {
      const name = stateRef.current.tripNameDraft.trim();
      const id = stateRef.current.selectedTrip;
      if (name && id) void groupRef.current.renameTrip(id, name);
      setState({ sheet: null, tripEditing: false });
      if (name && id) show("Trip updated");
    },
    startAddRule: () => setState({ addingRule: true, newRule: "" }),
    commitRule: () => {
      const t = stateRef.current.newRule.trim();
      setState({ addingRule: false, newRule: "" });
      if (!t) return;
      void groupRef.current.addRule(t);
      show("Rule added");
    },
    holdRuleStart: (id) => {
      if (ruleHoldTimer.current) clearTimeout(ruleHoldTimer.current);
      ruleHoldTimer.current = setTimeout(() => {
        void groupRef.current.removeRule(id);
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
      setState({ authMode: "login", sheet: null, authUser: "", authPass: "", authName: "" });
      void authRef.current.signOut(); // the auth-sync effect returns us to the auth screen
    },
    leaveGroup: () => {
      // Single-group model: leaving the group means signing out of the app.
      setState({ sheet: null });
      void authRef.current.signOut();
    },
    createNewGroup: () => {
      setState({ screen: "onboard", onboardStep: "create", sheet: null, newGroupName: "", newGroupEmoji: "🎉" });
    },
  };

  return { state, vm: buildViewModel(state, api) };
}
